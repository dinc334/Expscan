/* eslint-disable no-restricted-syntax */
const express = require('express')
const moment = require('moment')

const router = express.Router()

const { Prices, sequelize, TokensTxs } = require('../models')

router.get('/', async (req, res) => {
  let usdPrice
  const priceInfo = await Prices.findOne({ where: { ticker: 'EXP' } })
  const glExpTransfer = 21000
  const glErc20Transfer = 65000
  const glDexSwap = 200000
  const glRemoveOrAppLp = 175000
  if (priceInfo) usdPrice = priceInfo.price_usd
  const today = moment(Date.now()).unix()
  const twoDaysAgo = moment(Date.now()).subtract(3, 'days').unix()

  // 0 - exp transfer, 1 - erc, 2 - swap, 3 - add/remove
  const byteCodes = ['', '0xa9059', '0x38ed17', '0x652a4']
  const avgValues = []
  for (const code of byteCodes) {
    let query
    if (!code) {
      query = `SELECT AVG(DISTINCT gas) FROM Transactions Where timestamp BETWEEN ${twoDaysAgo} AND ${today}`
    } else {
      query = `SELECT AVG(DISTINCT gas) FROM Transactions Where data LIKE '${code}%' AND timestamp BETWEEN ${twoDaysAgo} AND ${today}`
    }
    const result = await sequelize.query(query)
    avgValues.push(parseInt(result[0][0].avg, 10) / 10 ** 5)
  }

  const txTransfers = await TokensTxs.findAll({ order: [['blockNumber', 'DESC']], limit: 9 })

  return res.render('gastracker', {
    avgValues,
    glExpTransfer,
    glErc20Transfer,
    glDexSwap,
    glRemoveOrAppLp,
    usdPrice: usdPrice || 0,
    txTransfers,
  })
})

module.exports = router
