const express = require('express')

const router = express.Router()

const {
  Tokens, Transactions, TokensTxs, Prices,
} = require('../models')

router.get('/:tx', async (req, res) => {
  const txHash = req.params.tx
  let error
  let price = 0
  let tx
  let txTokens
  try {
    price = await Prices.findOne({ where: { ticker: 'EXP' } })
    tx = await Transactions.findOne({ where: { hash: txHash } })
    txTokens = await TokensTxs.findOne({ where: { hash: txHash } })
  } catch (e) {
    console.log(e)
    console.log('Error during getting tx details')
  }
  let tokenData
  if (txTokens) {
    tokenData = await Tokens.findOne({ where: { address: tx.to } })
  }
  if (!tx) {
    error = 'Sorry, We are unable to locate this transaction Hash.'
  }
  return res.render('tx', {
    tx: tx || error,
    price,
    txTokens: txTokens || null,
    tokenData: tokenData || null,
  })
})

router.get('/pending', (req, res, next) => {
  const config = req.app.get('config')
  const web3 = new Web3()
  web3.setProvider(config.provider)

  async.waterfall([
    function (callback) {
      web3.parity.pendingTransactions((err, result) => {
        callback(err, result)
      })
    },
  ], (err, txs) => {
    if (err) {
      return next(err)
    }

    res.render('tx_pending', { txs })
  })
})

router.get('/submit', (req, res, next) => {
  res.render('tx_submit', { })
})

router.post('/submit', (req, res, next) => {
  if (!req.body.txHex) {
    return res.render('tx_submit', { message: 'No transaction data specified' })
  }

  const config = req.app.get('config')
  const web3 = new Web3()
  web3.setProvider(config.provider)

  async.waterfall([
    function (callback) {
      web3.eth.sendRawTransaction(req.body.txHex, (err, result) => {
        callback(err, result)
      })
    },
  ], (err, hash) => {
    if (err) {
      res.render('tx_submit', { message: `Error submitting transaction: ${err}` })
    } else {
      res.render('tx_submit', { message: `Transaction submitted. Hash: ${hash}` })
    }
  })
})

router.get('/raw/:tx', (req, res, next) => {
  const config = req.app.get('config')
  const web3 = new Web3()
  web3.setProvider(config.provider)

  async.waterfall([
    function (callback) {
      web3.eth.getTransaction(req.params.tx, (err, result) => {
        callback(err, result)
      })
    }, function (result, callback) {
      web3.trace.replayTransaction(result.hash, ['trace', 'stateDiff', 'vmTrace'], (err, traces) => {
        callback(err, result, traces)
      })
    },
  ], (err, tx, traces) => {
    if (err) {
      return next(err)
    }

    tx.traces = traces

    res.render('tx_raw', { tx })
  })
})

module.exports = router
