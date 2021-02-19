const express = require('express')
const { Op } = require('sequelize')

const router = express.Router()

const { Addresses, Tokens } = require('../models')

router.get('/', async (req, res) => {
  let id = 1
  let page = req.query.p || 1
  page = Number(page)
  if (page !== 1) id += (page * 100) - 100

  const count = await Addresses.count({
    where: { [Op.and]: { balance_EXP: { [Op.ne]: null }, balance_EXP: { [Op.ne]: 0 } } },
  })

  const addresses = await Addresses.findAll({
    where: { [Op.and]: { balance_EXP: { [Op.ne]: null }, balance_EXP: { [Op.ne]: 0 } } },
    order: [['balance_EXP', 'DESC']],
    offset: ((100 * page) - 100),
    limit: 100,
  })

  if (count > 1000) {
    var limit = Math.floor(count / 1000) * 10
  } else {
    var limit = 1
  }
  if (page > limit) return res.redirect('/error')

  const { totalSupply } = await Tokens.findOne({
    where: { ticker: 'EXP' },
  })

  return res.render('richlist', {
    count,
    page,
    addresses,
    totalSupply,
    tickerName: 'EXP',
    balanceOf: 'balance_EXP',
    id,
  })
})

router.get('/:tokenName', async (req, res) => {
  let id = 1
  let page = req.query.p || 1
  page = Number(page)
  const { tokenName } = req.params
  if (page !== 1) id += (page * 100) - 100

  const tokensNames = {
    expex: 'balance_PEX',
    tokenlab: 'balance_LAB',
  }
  const tickersName = {
    expex: 'PEX',
    tokenlab: 'LAB',
  }

  const balanceOf = tokensNames[tokenName]

  const count = await Addresses.count({
    where: { [Op.and]: [{ [balanceOf]: { [Op.ne]: null } }, { [balanceOf]: { [Op.ne]: 0 } }] },
  })

  const addresses = await Addresses.findAll({
    where: { [Op.and]: [{ [balanceOf]: { [Op.ne]: null } }, { [balanceOf]: { [Op.ne]: 0 } }] },
    order: [[balanceOf, 'DESC']],
    offset: ((100 * page) - 100),
    limit: 100,
  })
  if (count > 1000) {
    var limit = Math.floor(count / 1000) * 10
  } else {
    var limit = 1
  }
  if (page > limit) return res.redirect('/error')

  const { totalSupply } = await Tokens.findOne({
    where: { ticker: tickersName[tokenName] },
  })

  return res.render('richlist', {
    count,
    page,
    addresses,
    tickerName: tickersName[tokenName],
    balanceOf: `balance_${tickersName[tokenName]}`,
    tokenName,
    totalSupply,
    id,
  })
})

module.exports = router
