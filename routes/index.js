const express = require('express')

const router = express.Router()
const Web3 = require('web3')
const sendNotification = require('../utils/telegramBot')

const {
  Blocks, Transactions, Prices, Tokens,
} = require('../models')

const web3 = new Web3()
const CONFIG = require('../config/config-server.json')

web3.setProvider(new web3.providers.HttpProvider(CONFIG.web3Http))

router.get('/', async (req, res) => {
  const { ip } = req
  // move to cron and google Analytcs
  if (ip !== '::1') sendNotification(ip)

  let blocks = []
  try {
    blocks = await Blocks.findAll({ limit: 8, order: [['number', 'DESC']] })
  } catch (e) {
    sendNotification('Error in index Blocks db')
    console.error(e)
  }
  let txs = []
  try {
    txs = await Transactions.findAll({ limit: 8, order: [['blockNumber', 'DESC']] })
  } catch (e) {
    sendNotification('Error in index Transactions db')
    console.error(e)
  }

  let price = {}
  try {
    price = await Prices.findOne({ where: { ticker: 'EXP' } })
  } catch (e) {
    sendNotification('Error in index Prices db')
    console.error(e)
  }

  let tokenData = {}
  try {
    tokenData = await Tokens.findOne({ where: { ticker: 'EXP' } })
  } catch (e) {
    sendNotification('Error in index Tokens db')
    console.error(e)
  }

  if (tokenData) {
    price.supply = tokenData.totalSupply
  }
  let peers = 0
  try {
    peers = await web3.eth.net.getPeerCount()
  } catch (e) {
    sendNotification('Error in index Web3 issue')
    console.error(e)
  }
  return res.render('index', {
    blocks, txs, price, peers,
  })
})

module.exports = router
