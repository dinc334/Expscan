const express = require('express')

const router = express.Router()

const { sequelize } = require('../models')

router.get('/', async (req, res) => {
  const query = 'SELECT * FROM Tokens as t1 inner join Prices as t2 on t1.ticker = t2.ticker Where address is not null ORDER BY t2.price_usd DESC'
  const tokens = await sequelize.query(query)

  return res.render('tokens', { tokens: tokens[0], i: 1 })
})

module.exports = router
