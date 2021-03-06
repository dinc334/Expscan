/* eslint-disable no-restricted-syntax */
const Web3 = require('web3')
const { Op } = require('sequelize')

const web3 = new Web3()
const CONFIG = require('../config/config-server.json')

web3.setProvider(new web3.providers.HttpProvider(CONFIG.web3Http))

const { Transactions, dextrades } = require('../models')
const decodeTx = require('../utils/decodeTx')

async function initUniswapTxs() {
  // TO DO: add option for several dexes
  const eggswapRouter = '0XFAF3DDCB8D17DB02E08E45F02AFB8D427669D592'

  const allDexTxs = await Transactions.findAll({ where: { to: eggswapRouter.toLowerCase() } })
  const dexTradesPromises = []
  for (const dexTrade of allDexTxs) {
    const decodedInfo = await decodeTx(dexTrade, eggswapRouter)
    try {
      if (decodedInfo.method === 'swap' || decodedInfo.method === 'swapEXPForExactTokens') {
        const amountIn = Number(decodedInfo.amountIn)
        const amountOut = Number(decodedInfo.amountOut)
        dexTradesPromises.push(dextrades.create({
          hash_id: dexTrade.id,
          amount_in: amountIn,
          amount_out: amountOut,
          token_in: decodedInfo.tokenIn,
          token_out: decodedInfo.tokenOut,
          swapped_rate: decodedInfo.tokenOut === 'EXP' ? amountOut / amountIn : amountIn / amountOut,
          dex: 'eggswap',
        }))
      }
    } catch (e) {
      console.log('Error during saving')
      console.log(e)
    }
  }
  await Promise.all(dexTradesPromises) // appr 70sec
  console.log('Initial Dex Trades Written')
}

initUniswapTxs()
