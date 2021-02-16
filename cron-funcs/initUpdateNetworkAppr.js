"use strict"

const cron = require('node-cron')
const moment = require('moment')

const { Blocks, NetworkAppr, sequelize } = require('../models')

// first block timestmap = '1442188848'

async function initNetworkAppr() {
	let diffData = []
	const limit = await getNumberOfDays()
	// from firstBlock to limit
	for(let i = 0; i < limit.days; i++) {
		console.time("Txs")
		console.log("Day, ",i," of ",limit.days)
		const limitDay = moment(limit.firstBlock,"X").add(i,"days").unix()
		const limitDay2 = moment(limit.firstBlock,"X").add(i+1,"days").unix()
		const queryDiff = `SELECT AVG(difficulty) FROM Blocks WHERE timestamp BETWEEN ${limitDay} AND ${limitDay2}`
		const resDiff = await sequelize.query(queryDiff, {
			model: Blocks,
			type: sequelize.QueryTypes.SELECT
		})
		const queryTxFee = `SELECT SUM(gas*gas_price) FROM Transactions WHERE timestamp BETWEEN ${limitDay} AND ${limitDay2}`
		const resTxFee = await sequelize.query(queryTxFee, {
			model: Blocks,
			type: sequelize.QueryTypes.SELECT
		})
		const txsSum = await Blocks.sum('tx_count', {
			where:{timestamp: {$between: [limitDay,limitDay2]}}
		})
		const intAvg = Number(resDiff[0].dataValues.avg).toFixed(0)
		let intFee = (Number(resTxFee[0].dataValues.sum).toFixed(0))/Math.pow(10,18)
		intFee = intFee.toFixed(2)
		console.log(`Diff: ${intAvg};\n TxsFee: ${intFee};\n Txs: ${txsSum}`)

		try {
			await NetworkAppr.create({
				date: limitDay, 
				difficulty: intAvg, 
				txs_fee: intFee,
				txs: txsSum,
			})
			console.log(`Network Approximate Data Written for ${moment()}`)
		} catch(e) {
			console.error(e)
		}
		console.timeEnd("Txs")
	}	
}
initNetworkAppr()

// calc data for the last day
async function updateNetworkAppr() {
	const today = moment().utc().startOf('date').unix()
	const tomorrow = moment().utc().startOf('date').add(1,"days").unix()
	const queryDiff = `SELECT AVG(difficulty) FROM Blocks WHERE timestamp BETWEEN ${today} AND ${tomorrow}`
	const resDiff = await sequelize.query(queryDiff, {
		model: Blocks,
		type: sequelize.QueryTypes.SELECT
	})
	const queryTxFee = `SELECT SUM(gas*gas_price) FROM Transactions WHERE timestamp BETWEEN ${today} AND ${tomorrow}`
	const resTxFee = await sequelize.query(queryTxFee, {
		model: Blocks,
		type: sequelize.QueryTypes.SELECT
	})
	const txsSum = await Blocks.sum('tx_count', {
		where:{timestamp: {$between: [today, tomorrow]}}
	})
	const intAvg = Number(resDiff[0].dataValues.avg).toFixed(0)
	let intFee = (Number(resTxFee[0].dataValues.sum).toFixed(0))/Math.pow(10,18)
	intFee = intFee.toFixed(2)
	try {
		await NetworkAppr.create({
			date: today,
			difficulty: intAvg,
			txs_fee: intFee,
			txs: txsSum
		})
		console.log(`Network Approximate Data Written for ${moment()}`)
	} catch(e) {
		console.error(e)
	}
	
}

//updateNetworkAppr();

// get lowest raw in network table, if init - get first block data
async function getNumberOfDays() {
	// get latest day data from db
	let latestDbRow = await NetworkAppr.max("date")
	if(!latestDbRow) {
		// empty db, get first block timestamp
		console.log("Empty db, start from first block")
		latestDbRow = 1442188848
	}	
	const now = moment()
	const oldestBlockDate = moment(latestDbRow,"X").utc().startOf('date')
	// timestamp 19:38 -> 00:00
	console.log(oldestBlockDate)
	const days = now.diff(oldestBlockDate,"days") 
	return {
		days,
		firstBlock: oldestBlockDate
	}
}

// every day at 00:00
cron.schedule('0 0 0 */1 * * ', async () => {
	await updateNetworkAppr()
})
