"use strict";

const express = require('express');
const router = express.Router();

const { Tokens, Prices, sequelize } = require('../models');

router.get('/', async (req,res) => {
	const query = 'SELECT * FROM Tokens as t1 inner join Prices as t2 on t1.ticker = t2.ticker Where address is not null';
  let tokens = await sequelize.query(query);
  tokens = tokens[0];
	return res.render('tokens', { tokens, i:1 });
})

module.exports = router;