const express = require('express')

const router = express.Router()

const {
  Contracts, Tokens, Transactions, Prices,
} = require('../models')
const decodeTx = require('../utils/decodeTx')

router.get('/:tx', async (req, res) => {
  const txHash = req.params.tx
  let error
  let price = 0
  let tx
  let parsedTx
  let isContract = false
  try {
    tx = await Transactions.findOne({ where: { hash: txHash.toLowerCase() } })
  } catch (e) {
    console.log('Cannot get this tx')
    console.log(e)
  }
  if (!tx) return

  if (tx.data !== '0x') {
    // HOW TO DETECT ONLY TOKEN CREATION
    const contractInfo = await Contracts.findOne({ where: { hash: txHash.toLowerCase() } })
    if (!contractInfo) {
      parsedTx = await decodeTx(tx, tx.to)
    }
    isContract = true
  }

  try {
    price = await Prices.findOne({ where: { ticker: 'EXP' } })
  } catch (e) {
    console.log(e)
    console.log('Error during getting tx details')
  }
  let tokenData

  if (!tx) {
    error = 'Sorry, We are unable to locate this transaction Hash.'
  }
  let tokenPrice
  const isContractRecive = await Tokens.findOne({ where: { address: tx.to.toLowerCase() } })
  if (isContractRecive) {
    const tokenInfo = await Prices.findOne({ where: { ticker: isContractRecive.ticker } })
    if (tokenInfo) tokenPrice = tokenInfo.price_usd
  }
  res.render('tx', {
    tx: tx || error,
    price,
    tokenData: tokenData || null,
    parsedTx,
    tokenPrice: tokenPrice || null,
    isContract,
  })
})

// TO DO: add later with web3 websockets
router.get('/pending', (req, res, next) => {
  res.render('tx_pending', { txs: [] })
})

module.exports = router
