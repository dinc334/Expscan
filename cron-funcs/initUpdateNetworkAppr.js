/* eslint-disable no-await-in-loop */
const cron = require('node-cron')
const moment = require('moment')
const { Op } = require('sequelize')

const {
  Blocks, Transactions, NetworkAppr, sequelize,
} = require('../models')

// first block timestmap = '1442188848'

// get lowest raw in network table, if init - get first block data
async function getNumberOfDays() {
  // get latest day data from db
  let latestDbRow = await NetworkAppr.max('date')
  if (!latestDbRow) {
    // empty db, get first block timestamp
    console.log('Empty db, start from first block')
    latestDbRow = 1442188848
  }
  const now = moment()
  const oldestBlockDate = moment(latestDbRow, 'X').utc().startOf('date')
  // timestamp 19:38 -> 00:00
  const days = now.diff(oldestBlockDate, 'days')
  return {
    days,
    firstBlock: oldestBlockDate,
  }
}

async function initNetworkAppr() {
  const limit = await getNumberOfDays()
  // from firstBlock to limit
  for (let i = 1; i < limit.days; i++) {
    console.log('Day, ', i, ' of ', limit.days)
    const limitDay = moment(limit.firstBlock, 'X').add(i, 'days').unix()
    const limitDay2 = moment(limit.firstBlock, 'X').add(i + 1, 'days').unix()
    const queryDiff = `SELECT AVG(difficulty) FROM Blocks WHERE timestamp BETWEEN ${limitDay} AND ${limitDay2}`
    const resDiff = await sequelize.query(queryDiff, {
      model: Blocks,
      type: sequelize.QueryTypes.SELECT,
    })

    const queryTxFee = `SELECT SUM(CAST(gas as decimal)*gas_price) FROM Transactions WHERE timestamp BETWEEN ${limitDay} AND ${limitDay2}`
    let resTxFee = {}
    try {
      resTxFee = await sequelize.query(queryTxFee, {
        model: Transactions,
        type: sequelize.QueryTypes.SELECT,
      })
    } catch (e) {
      console.log('Too big gas*gas_price error')
      console.log(e)
    }

    const txsSum = await Blocks.sum('tx_count', {
      where: { timestamp: { [Op.between]: [limitDay, limitDay2] } },
    })
    const intAvg = Number(resDiff[0].dataValues.avg).toFixed(0)
    let intFee = (Number(resTxFee[0].dataValues.sum).toFixed(0)) / (10 ** 18)
    intFee = intFee.toFixed(2)
    console.log(`Diff: ${intAvg};\n TxsFee: ${intFee};\n Txs: ${txsSum}`)

    try {
      await NetworkAppr.create({
        date: limitDay,
        difficulty: intAvg,
        txs_fee: intFee,
        txs: txsSum,
      })
      console.log(`Network Approximate Data Written for ${moment(limitDay * 1000)}`)
    } catch (e) {
      console.error(e)
    }
  }
}

// calc data for the last day
async function updateNetworkAppr() {
  const lastNetworkRow = await NetworkAppr.max('date')
  const yesterday = moment().utc().startOf('date').subtract(1, 'days')
  if (yesterday.unix() !== lastNetworkRow) {
    console.log('Start adding missing rows in UpdateNetowrk')
    await initNetworkAppr()
  }
  console.log('no need to init')
  const today = moment().utc().startOf('date').unix()
  const tomorrow = moment().utc().startOf('date').add(1, 'days')
    .unix()
  const queryDiff = `SELECT AVG(difficulty) FROM Blocks WHERE timestamp BETWEEN ${today} AND ${tomorrow}`
  const resDiff = await sequelize.query(queryDiff, {
    model: Blocks,
    type: sequelize.QueryTypes.SELECT,
  })
  const queryTxFee = `SELECT SUM(CAST(gas as decimal)*gas_price) FROM Transactions WHERE timestamp BETWEEN ${today} AND ${tomorrow}`
  const resTxFee = await sequelize.query(queryTxFee, {
    model: Blocks,
    type: sequelize.QueryTypes.SELECT,
  })
  const txsSum = await Blocks.sum('tx_count', {
    where: { timestamp: { [Op.between]: [today, tomorrow] } },
  })
  const intAvg = Number(resDiff[0].dataValues.avg).toFixed(0)
  let intFee = (Number(resTxFee[0].dataValues.sum).toFixed(0)) / (10 ** 18)
  intFee = intFee.toFixed(2)
  try {
    await NetworkAppr.create({
      date: today,
      difficulty: intAvg,
      txs_fee: intFee,
      txs: txsSum,
    })
    console.log(`Network Approximate Data Written for ${moment()}`)
  } catch (e) {
    console.error(e)
  }
}

updateNetworkAppr()

// every day at 00:00
cron.schedule('0 0 0 */1 * * ', async () => {
  await updateNetworkAppr()
})
