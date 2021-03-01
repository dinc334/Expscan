const express = require('express')

const router = express.Router()
const { Op } = require('sequelize')

const InputDataDecoder = require('ethereum-input-data-decoder')
const {
  Contracts, Tokens, Transactions, Prices,
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
      '0xfdcdd3ee5d5d99eedb2fcb38927378199e51a4cc': 'bridge',
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
    if (decodedObj.method === 'add') {
      console.log('------------------WTF method')
    }
    if (decodedObj.method === 'addLiquidity') {
      decodedData = {
        method: decodedObj.method,
        tokenAAddress: `0x${decodedObj.inputs[0]}`,
        tokenBAddress: `0x${decodedObj.inputs[1]}`,
        tokenAAmount: decodedObj.inputs[2].toString() / (10 ** 18),
        tokenBAmount: decodedObj.inputs[3].toString() / (10 ** 18),
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
    if (decodedObj.method === 'swapExactEXPForTokens') {
      decodedData = {
        method: decodedObj.method,
        amountOut: decodedObj.inputs[0].toString() / (10 ** 18),
        tokenPath: `0x${decodedObj.inputs[1][1]}`,
      }
    }
    if (decodedObj.method === 'swapEXPForExactTokens') {
      decodedData = {
        method: decodedObj.method,
        amountOut: decodedObj.inputs[0].toString() / (10 ** 18),
        pathToken: `0x${decodedObj.inputs[1][0]}`,
        toToken: `0x${decodedObj.inputs[1][1]}`,
      }
    }
    if (decodedObj.method === 'swapExactTokensForTokens') {
      const tokenIn = `0x${decodedObj.inputs[2][0]}`
      const tokenPath = `0x${decodedObj.inputs[2][1]}`
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
  }
  let contractABI
  try {
    // wexp or xegg
    contractABI = require(`../data/${existingToken.ticker.toLowerCase()}ABI.json`)
  } catch (e) {
    // erc 20 or erc644
    contractABI = require('../data/ABI644.json')
  }

  if (!contractABI) return { error: true, reason: 'Dont have info about this contract' }
  const decoder = new InputDataDecoder(contractABI)
  const decodedObj = decoder.decodeData(txInput)

  // for xEgg
  if (decodedObj.method === 'leave') {
    decodedData = {
      method: decodedObj.method,
      amount: decodedObj.inputs[0].toString() / (10 ** 18),
    }
  }

  if (decodedObj.method === 'enter') {
    decodedData = {
      method: decodedObj.method,
      amount: decodedObj.inputs[0].toString() / (10 ** 18),
    }
  }

  // for wexp
  if (decodedObj.method === 'deposit') {
    decodedData = {
      method: 'wrap',
    }
  }
  if (decodedObj.method === 'withdraw') {
    decodedData = {
      method: 'unwrap',
      amount: decodedObj.inputs[0].toString() / (10 ** 18),
    }
  }

  // for erc644
  if (decodedObj.method === 'approve') {
    decodedData = {
      method: decodedObj.method,
      addressDestination: `0x${decodedObj.inputs[0]}`,
    }
  }
  if (decodedObj.method === 'transfer') {
    decodedData = {
      method: decodedObj.method,
      addressDestination: `0x${decodedObj.inputs[0]}`,
      value: decodedObj.inputs[1].toString() / 10 ** 18,
    }
  }

  return decodedData
}

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
      parsedTx = await decodeTx(txHash, tx.data, tx.to)
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
  return res.render('tx', {
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
