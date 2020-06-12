"use strict";

const express = require('express');
const router = express.Router();

const { Tokens, Transactions, TxsTokens, Prices } = require('../models');

router.get('/:tx', async (req, res) => {
  let txHash = req.params.tx;
  let error;
  try {
    var price = await Prices.findOne({where: {ticker:'EXP'}})
  } catch(e) {
    console.log(e);
    console.error("Internal DB erorr (Prices)");
  }
  try {
    var tx = await Transactions.findOne({where:{hash: txHash}}) 
  } catch(e) {
    console.log(e);
    console.error("Internal DB error (Transactions)");
  }
  try {
    var txTokens = await TxsTokens.findOne({where: {hash: txHash}})
  } catch(e) {
    console.log(e);
    console.error("Internal DB error (TxsTokens)")
  }
  if (txTokens) {
    try {
      var tokenData = await Tokens.findOne({ where: { address: tx.to }})
    } catch(e) {
      console.log(e);
      console.error("Internal DB error (TxsTokens)")
    }
  }
  if (!tx) {
    error = "Sorry, We are unable to locate this transaction Hash."
  }
  return res.render('tx', {
    tx: tx || error,
    price,
    txTokens: txTokens || null,
    tokenData: tokenData || null
  })

});


router.get('/pending', function(req, res, next) {
  var config = req.app.get('config');  
  var web3 = new Web3();
  web3.setProvider(config.provider);
  
  async.waterfall([
    function(callback) {
      web3.parity.pendingTransactions(function(err, result) {
        callback(err, result);
      });
    }
  ], function(err, txs) {
    if (err) {
      return next(err);
    }
    
    res.render('tx_pending', { txs: txs });
  });
});


router.get('/submit', function(req, res, next) {  
  res.render('tx_submit', { });
});

router.post('/submit', function(req, res, next) {
  if (!req.body.txHex) {
    return res.render('tx_submit', { message: "No transaction data specified"});
  }
  
  var config = req.app.get('config');  
  var web3 = new Web3();
  web3.setProvider(config.provider);
  
  async.waterfall([
    function(callback) {
      web3.eth.sendRawTransaction(req.body.txHex, function(err, result) {
        callback(err, result);
      });
    }
  ], function(err, hash) {
    if (err) {
      res.render('tx_submit', { message: "Error submitting transaction: " + err });
    } else {
      res.render('tx_submit', { message: "Transaction submitted. Hash: " + hash });
    }
  });
});

router.get('/raw/:tx', function(req, res, next) {
  var config = req.app.get('config');  
  var web3 = new Web3();
  web3.setProvider(config.provider);
  
  async.waterfall([
    function(callback) {
      web3.eth.getTransaction(req.params.tx, function(err, result) {
        callback(err, result);
      });
    }, function(result, callback) {
      web3.trace.replayTransaction(result.hash, ["trace", "stateDiff", "vmTrace"], function(err, traces) {
        callback(err, result, traces);
      });
    }
  ], function(err, tx, traces) {
    if (err) {
      return next(err);
    }
    
    tx.traces = traces;

    res.render('tx_raw', { tx: tx });
  });
});

module.exports = router;


