const express = require('express')
const { Op } = require('sequelize')

const router = express.Router()

const { Tokens, Prices, sequelize } = require('../models')

router.get('/', async (req, res) => {
  const query = 'SELECT * FROM Tokens as t1 inner join Prices as t2 on t1.ticker = t2.ticker Where address is not null'
  const tokens = await sequelize.query(query)
  return res.render('tokens', { tokens: tokens[0], i: 1 })
})

module.exports = router
