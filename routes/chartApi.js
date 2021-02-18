const moment = require('moment')
const express = require('express')
const { Op } = require('sequelize')

const router = express.Router()

const { NetworkAppr } = require('../models')

router.get('/chart/txs7', async (req, res) => {
  const chartData = []
  const today = moment().utc().startOf('date').unix()
  const oldest7 = moment(today, 'X').subtract(7, 'days').unix()
  const txs7Data = await NetworkAppr.findAll({
    attributes: ['date', 'txs'],
    where: { date: { [Op.gt]: oldest7 } },
  })
  if (txs7Data.length > 0) {
    for (const tx7 of txs7Data) {
      chartData.push([tx7.date * 1000, tx7.txs])
    }
  } else {
    return res.json({ success: false, reason: 'No Data for this period' })
  }
  return res.json({ success: true, data: chartData })
})

router.get('/chart/txsall', async (req, res) => {
  const chartData = []
  const txsData = await NetworkAppr.findAll({ attributes: ['date', 'txs'] })
  for (const txData of txsData) {
    chartData.push([txData.date * 1000, txData.txs])
  }
  return res.json({
    success: true,
    data: chartData,
    title: 'Expanse Transaction Chart',
    yAxis: 'Transaction Per Day',
    type: 'Transactions',
  })
})

router.get('/chart/difficulty', async (req, res) => {
  const chartData = []
  const diffData = await NetworkAppr.findAll({ attributes: ['date', 'difficulty'] })
  for (const diff of diffData) {
    chartData.push([diff.date * 1000, Number(diff.difficulty)])
  }
  return res.json({
    success: true,
    data: chartData,
    title: 'Expanse Block Difficulty Growth Chart',
    yAxis: 'Difficulty (TH)',
    type: 'Avg Difficulty',
  })
})

router.get('/chart/fees', async (req, res) => {
  const chartData = []
  const feeData = await NetworkAppr.findAll({ attributes: ['date', 'txs_fee'] })
  for (const fee of feeData) {
    chartData.push([fee.date * 1000, Number(fee.txs_fee)])
  }
  return res.json({
    success: true,
    data: chartData,
    title: 'Expanse Network Transaction Fee',
    yAxis: 'TxFee (EXP)',
    type: 'TxFee (EXP)',
  })
})

module.exports = router
