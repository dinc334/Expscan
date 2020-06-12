"use strict";

const express = require('express');
const router = express.Router();

const { Tokens, TxsTokens, Prices, Addresses } = require('../models');

router.get('/:address', async (req,res) => {
	let id = 1;
	let page = req.query.p || 1;
	page = Number(page);

	const address = req.params.address.toLowerCase();
	const tokenData = await Tokens.findOne({ where: { address }});
	if (tokenData) {
		try {
			var tokenPrice = await Prices.findOne({ where: {ticker: tokenData.ticker }});
		} catch(e) {
			console.error(e);
		}
	}
	const txsTokens = await TxsTokens.findAll({ 
		where: {token: tokenData.ticker },
		order: [['timestamp', 'DESC']], 
		offset: ((100*page)-100),
		limit: 100
	});
	
	const typeOfBalance = `balance_${tokenData.ticker}`;

	const addresses = await Addresses.findAll({
    where:  { [typeOfBalance]: {$ne: null}, [typeOfBalance]: {$ne: 0}},
    order: [[typeOfBalance,'DESC']],
    limit: 100,
  });
	const countTxs = await TxsTokens.count({ where: { token: tokenData.ticker }});

  const countHolders = await Addresses.count({
    where: { [typeOfBalance]: {$ne: null}, [typeOfBalance]: {$ne: 0}}
  });

  if (countTxs > 1000) {
    var limit = Math.floor(countTxs/1000)*10;
  } else {
    var limit = 1;
  }
  if (page > limit) return res.redirect("/error");
  
	return res.render('token', {
		page,
		countTxs,
		countHolders,
		addresses,
		typeOfBalance,
		tokenData,
		tokenPrice,
		txsTokens,
		id
	});
});

module.exports = router;

