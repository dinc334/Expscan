const express = require('express')
const { Op } = require('sequelize')

const router = express.Router()

const {
  Tokens, TokensTxs, TokensBalances, Prices, sequelize,
} = require('../models')

router.get('/:address', async (req, res) => {
  const id = 1
  let page = req.query.p || 1
  page = Number(page)

  const address = req.params.address.toLowerCase()
  const tokenData = await Tokens.findOne({ where: { address } })

  let tokenPrice = {}

  if (tokenData) {
    try {
      tokenPrice = await Prices.findOne({ where: { ticker: tokenData.ticker } })
    } catch (e) {
      console.error(e)
    }
  }

  const expPrice = await Prices.findOne({ where: { ticker: 'EXP' } })

  const txsTokens = await TokensTxs.findAll({
    where: { token: tokenData.name.toLowerCase() },
    order: [['timestamp', 'DESC']],
    offset: ((100 * page) - 100),
    limit: 100,
  })
  const query = `SELECT * FROM DexTrades INNER JOIN transactions On dextrades.hash_id=transactions.id WHERE token_in='${address}' OR token_out='${address}' ORDER BY transactions.timestamp DESC LIMIT 100`
  const result = await sequelize.query(query)
  const dexTrades = result[0]

  // DO TO: here will be new table TokenBalances
  const addresses = []
  const countTxs = await TokensTxs.count({ where: { token: tokenData.name.toLowerCase() } })

  const countHolders = 100

  if (countTxs > 1000) {
    var limit = Math.floor(countTxs / 1000) * 10
  } else {
    var limit = 1
  }
  if (page > limit) return res.redirect('/error')

  return res.render('token', {
    page,
    countTxs,
    countHolders,
    addresses,
    typeOfBalance: 'test',
    tokenData,
    tokenPrice: tokenPrice || null,
    dexTrades: dexTrades || [],
    expPrice: expPrice.price_usd,
    txsTokens,
    id,
  })
})

module.exports = router
