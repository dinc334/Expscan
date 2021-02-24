const express = require('express')
const { Op } = require('sequelize')

const router = express.Router()

const {
  Addresses, Transactions, TokensTxs, Prices, Blocks,
} = require('../models')

router.get('/:address', async (req, res) => {
  let page = req.query.p || 1
  page = Number(page)
  const address = req.params.address.toLowerCase()

  let priceEXP; let transactions; let minedBlocks; let txsTokens; let balances
  try {
    balances = await Addresses.findOne({
      attributes: { exclude: ['id', 'last_active'] },
      where: { address },
    })
  } catch (e) {
    console.log('Internal DB error (Addresses)')
  }
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
