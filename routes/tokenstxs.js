"use strict";
 
const express = require('express');
const router = express.Router();
 
const { Tokens, TxsTokens } = require('../models');

router.get('/', async (req,res) => {
	let page = req.query.p || 1;
	page = Number(page);
	
	const allTxs = await TxsTokens.count();

	const limit = Math.round(allTxs/1000)*10;
  if(page > limit) return res.redirect("/error");

	const tokensTxs = await TxsTokens.findAll({
		limit: 100, 
		order: [['timestamp','DESC']], 
		offset: ((100*page)-100),
	})
	// make more flex on v2.0
	const labAddr = await Tokens.findOne({where: {ticker: 'LAB' }});
	const pexAddr = await Tokens.findOne({where: {ticker: 'PEX' }});
	if(!page) page = 0; 
	return res.render('tokenstxs', {
		page,
		allTxs,
		tokensTxs,
		labAddr: labAddr.address,
		pexAddr: pexAddr.address
	});
});


module.exports = router;