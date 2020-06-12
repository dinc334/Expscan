"use strict";
 
const express = require('express');
const router = express.Router();
 
const { Addresses, Transactions, TxsTokens, Prices, Blocks } = require('../models');
 
router.get('/:address',async (req, res) => {
  let page = req.query.p || 1;
  page = Number(page);
  const address = req.params.address.toLowerCase();
  let priceEXP, priceLAB, transactions, minedBlocks, txsTokens, balances
  try {
    balances = await Addresses.findOne({
      attributes: { exclude: ['id','last_active']},
      where: { address }
    });
  } catch(e) {
    console.log("Internal DB error (Addresses)")
  }
  const count = balances.count;
  
  if(count > 1000) {
    var limit = Math.floor(count/1000)*10;
  } else {
    var limit = 1;
  }
  
  if(page > limit) return res.render("error");
  
  try {
    priceEXP = await Prices.findOne({
      attributes: ['price_usd'],
      where: {ticker:'EXP'}
    });
  } catch(e) {
    console.log("Internal DB eror (Prices)")
  }
  // TO DO: fix this
  try {
    priceLAB = await Prices.findOne({
      attributes: ['price_usd'],
      where: {ticker:'LAB'}
    });
  } catch(e) {
    console.log("Internal DB eror (Prices)")
  }

  try {
    transactions = await Transactions.findAll({
      where: {$or:[{from:address}, {to:address}]},
      order: [['blockNumber','DESC']],
      limit: 100,
      offset: ((100*page)-100),
      attributes: {exclude: ['id','data','nonce'],}
    });
    
  } catch(e) {
    return res.render('account', {error: true, reason: 'Invertal Server Issue'})
  }

  try {
    minedBlocks = await Blocks.findAll({
      order: [['number', 'DESC']],
      where: { miner: address},
      limit: 100,
    })
  } catch(e) {
    console.error(e)
    return res.render('account', { error: true, reason: 'Internal Miners db issue'});
  }

  try {
    txsTokens = await TxsTokens.findAll({
      where: {$or: [{from: address }, { to: address }]},
      order: [['blockNumber','DESC']],
      attributes: { exclude: ['id','hash'] }
    });
  } catch(e) {
    return res.render('account', {error: true, reason: 'Internal TxsTokens db issue'})
  }

  return res.render('account', {
    minedBlocks,
    page,
    account: balances,
    address,
    priceEXP,
    priceLAB,
    transactions,
    txsTokens,
    count
  });

});
 

 
module.exports = router;
