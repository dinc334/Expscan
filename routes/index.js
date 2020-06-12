"use strict";

const express = require('express');
const router = express.Router();
const sendNotification = require('../utils/telegramBot');

const { Blocks, Transactions, Prices, Tokens } = require('../models');

const Web3 = require('web3');
const web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider('http://localhost:9656'));

router.get('/', async (req, res) => {
  const ip = req.ip;
  // move to cron and google Analytcs
  if(ip !== '::1') sendNotification(ip); 
  
  try {
    var blocks = await Blocks.findAll({ limit:8, order: [['number','DESC']] });
 } catch(e) {
    sendNotification("Error in index Blocks db");
    console.error(e);
  }
  try {
    var txs = await Transactions.findAll({ limit:8, order: [['blockNumber','DESC']] })
  } catch(e) {
    sendNotification("Error in index Transactions db");
    console.error(e);
  }
  try {
    var price = await Prices.findOne({where: {ticker: 'EXP'}});
  } catch(e) {
    sendNotification("Error in index Prices db");
    console.error(e);
  }
  try {
    var { totalSupply } = await Tokens.findOne({ where: {ticker: 'EXP'}})
  } catch(e) {
    sendNotification("Error in index Tokens db")
    console.error(e)
  }

  if(totalSupply) {
    price.supply = totalSupply;
  }
  try {
    var peers = await web3.eth.net.getPeerCount();
  } catch(e) {
    sendNotification("Error in index Web3 issue");
    console.error(e);
  }
  return res.render('index', { 
  	blocks, txs, price, peers 
  });
});

module.exports = router;
