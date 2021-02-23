const express = require('express')

const router = express.Router()
const { Op } = require('sequelize')

// const Web3 = require('web3')
// const CONFIG = require('../config/config-server.json')
// const web3 = new Web3()
// web3.setProvider(new web3.providers.HttpProvider(CONFIG.web3Http))

const InputDataDecoder = require('ethereum-input-data-decoder')
const {
  Tokens, Transactions, TokensTxs, Prices,
} = require('../models')

async function decodeTx(tx, txInput, contractAddress) {
  const existingToken = await Tokens.findOne({ where: { [Op.and]: { address: contractAddress, type: 'ERC-644' } } })
  let decodedData = {}
  if (!existingToken) {
    // not erc20 or erc644
    const notErcABIs = {
      // might be labLP, eggLP, wagmiLP, prmLP address, etc.
      '0x6680b66406dc1f1bcffdbaca320f9d950e65dba0': 'expSushiRouter',
      '0xfaf3ddcb8d17db02e08e45f02afb8d427669d592': 'expUniRouter',
    }

    const contractABI = require(`../data/${notErcABIs[contractAddress.toLowerCase()]}.json`)
    if (!contractABI) return { error: true, reason: 'Dont have info about this contract' }
    const decoder = new InputDataDecoder(contractABI)
    const decodedObj = decoder.decodeData(txInput)
    // TO DO: move to switch after all method added
    if (decodedObj.method === 'removeLiquidityEXPWithPermit') {
      decodedData = {
        method: 'removeLiquidity',
        tokenAddress: `0x${decodedObj.inputs[0]}`,
        tokenAmount: decodedObj.inputs[2].toString() / (10 ** 18),
        expAmount: decodedObj.inputs[3].toString() / (10 ** 18),
      }
    }
    if (decodedObj.method === 'addLiquidityEXP') {
      decodedData = {
        method: decodedObj.method,
        tokenAddress: `0x${decodedObj.inputs[0]}`,
        tokenAmountMin: decodedObj.inputs[2].toString() / (10 ** 18),
        expAmount: decodedObj.inputs[3].toString() / (10 ** 18),
      }
    }

    if (decodedObj.method === 'swapExactTokensForTokens') {
      // 1000 EGG =>  19.1 LVE (uniswap)
      const tokenIn = `0x${decodedObj.inputs[2][0]}`
      const tokenPath = `0x${decodedObj.inputs[2][2]}`
      decodedData = {
        method: decodedObj.method,
        amountIn: decodedObj.inputs[0].toString() / (10 ** 18),
        amountOut: decodedObj.inputs[1].toString() / (10 ** 18),
        tokenIn,
        tokenPath,
      }
    }

    if (decodedObj.method === 'swapExactTokensForEXP') {
      const tokenAddress = `0x${decodedObj.inputs[2][0]}`
      const swappedTokenInfo = await Tokens.findOne({ where: { address: tokenAddress } })
      decodedData = {
        method: decodedObj.method,
        amountIn: decodedObj.inputs[0].toString() / (10 ** 18),
        amountOutMin: `${decodedObj.inputs[1].toString() / (10 ** 18)} EXP`,
        tokenAddress: tokenAddress.toUpperCase(),
        swappedTokenName: swappedTokenInfo.name,
      }
    }
    if (decodedObj.method === 'deposit') {
      decodedData = {
        method: 'harvest',
        amount: decodedObj.inputs[0].toString(),
        amount1: decodedObj.inputs[1].toString(),
      }
    }
    if (decodedObj.method === 'withdraw') {
      decodedData = {
        method: decodedObj.method,
        amountOut: decodedObj.inputs[1].toString() / (10 ** 18),
      }
    }
  } else {
    // erc20 or erc644
    const contractABI = require('../data/ABI644.json')
    if (!contractABI) return { error: true, reason: 'Dont have info about this contract' }
    const decoder = new InputDataDecoder(contractABI)
    const decodedObj = decoder.decodeData(txInput)
    if (decodedObj.method === 'approve') {
      decodedData = {
        method: decodedObj.method,
        addressDestination: `0x${decodedObj.inputs[0]}`,
      }
    }
  }

  return decodedData
}

router.get('/:tx', async (req, res) => {
  const txHash = req.params.tx
  let error
  let price = 0
  let tx
  let txTokens
  let parsedTx
  try {
    tx = await Transactions.findOne({ where: { hash: txHash } })
  } catch (e) {
    console.log('Cannot get this tx')
    console.log(e)
  }

  if (tx.data !== '0x') {
    parsedTx = await decodeTx(txHash, tx.data, tx.to)
  }

  try {
    price = await Prices.findOne({ where: { ticker: 'EXP' } })
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
    parsedTx,
  })
})

// TO DO: add later with web3 websockets
router.get('/pending', (req, res, next) => {
  const config = req.app.get('config')
  const web3 = new Web3()
  web3.setProvider(config.provider)

  res.render('tx_pending', { txs: [] })
})

module.exports = router
