const express = require('express')
const { Op } = require('sequelize')

const router = express.Router()

const Web3 = require('web3')
const CONFIG = require('../config/config-server.json')

const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider(CONFIG.web3Http))

const {
  Addresses, Transactions, TokensTxs, Prices, Blocks, Contracts,
} = require('../models')

router.get('/:address', async (req, res) => {
  let page = req.query.p || 1
  page = Number(page)
  const address = req.params.address.toLowerCase()

  let priceEXP; let transactions; let minedBlocks; let txsTokens; let balances; let contractInfo
  try {
    balances = await Addresses.findOne({
      attributes: { exclude: ['id', 'last_active'] },
      where: { address },
    })
  } catch (e) {
    console.log('Internal DB error (Addresses)')
  }
  try {
    contractInfo = await Contracts.findOne({
      attributes: { exclude: ['id'] },
      where: { contractAddress: address },
    })
  } catch (e) {
    console.log('Internal DB error (Contracts)')
  }

  let expBalance = await web3.eth.getBalance(address)
  if (expBalance) expBalance /= (10 ** 18)

  let count
  if (balances) count = balances.count
  let limit

  if (count > 1000) {
    limit = Math.floor(count / 1000) * 10
  } else {
    limit = 1
  }

  if (page > limit) return res.render('error')

  try {
    priceEXP = await Prices.findOne({
      attributes: ['price_usd'],
      where: { ticker: 'EXP' },
    })
  } catch (e) {
    console.log('Internal DB eror (Prices)')
  }

  try {
    transactions = await Transactions.findAll({
      where: { [Op.or]: [{ from: address }, { to: address }] },
      order: [['blockNumber', 'DESC']],
      limit: 100,
      offset: ((100 * page) - 100),
      attributes: { exclude: ['id', 'data', 'nonce'] },
    })
  } catch (e) {
    console.log(e)
    return res.render('account', { error: true, reason: 'Invertal Server Issue' })
  }

  try {
    minedBlocks = await Blocks.findAll({
      order: [['number', 'DESC']],
      where: { miner: address },
      limit: 100,
    })
  } catch (e) {
    console.error(e)
    return res.render('account', { error: true, reason: 'Internal Miners db issue' })
  }

  try {
    txsTokens = await TokensTxs.findAll({
      where: { [Op.or]: [{ from: address }, { to: address }] },
      order: [['blockNumber', 'DESC']],
      attributes: { exclude: ['id', 'hash'] },
      limit: 100,
    })
  } catch (e) {
    return res.render('account', { error: true, reason: 'Internal TokensTxs db issue' })
  }

  if (!balances && txsTokens) {
    balances = {
      balance_EXP: 0,
    }
    count = txsTokens.length
  }

  return res.render('account', {
    contractInfo,
    expBalance,
    minedBlocks,
    page,
    account: balances,
    address,
    priceEXP,
    transactions,
    // TO DO: fix txsTokens
    txsTokens,
    count,
  })
})

module.exports = router
