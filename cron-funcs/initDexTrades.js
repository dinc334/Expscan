/* eslint-disable no-restricted-syntax */
const Web3 = require('web3')

const web3 = new Web3()
const CONFIG = require('../config/config-server.json')

web3.setProvider(new web3.providers.HttpProvider(CONFIG.web3Http))

const { Transactions } = require('../models')
const decodeTx = require('../utils/decodeTx')

// potenial this is a swap
// '0xe8e3370' - addLiquidity
// '0x38ed173' - swapExactTokensForTokens
// '0x8803dbe' - swapTokensForExactTokens
// '0x2195995' - removeLiquidityWithPermit
// '0xbaa2abd' - removeLiquidity
// '0xb2512df' - swapExactTokensForEXP
// '0x652a4e7' - addLiquidityEXP
// '0xff110a4' - swapEXPForExactTokens
// '0xc7f4a01' - swapExactEXPForTokens
// '0x09850ce' - removeLiquidityEXP
// '0x874ed5c' - removeLiquidityEXPWithPermit
// '0x7298f0e' - swapTokensForExactEXP
// '0x0b44359' - swapExactTokensForEXPSupportingFeeOnTransferTokens

async function initUniswapTxs() {
  // TO DO: add option for several dexes
  const eggswapRouter = '0XFAF3DDCB8D17DB02E08E45F02AFB8D427669D592'
  const allDexTxs = await Transactions.findAll({ where: { to: eggswapRouter.toLowerCase() } })
  for (const dexTrade of allDexTxs) {
    const decodedInfo = await decodeTx(dexTrade.data, eggswapRouter)
    if (decodedInfo.method == 'newMethod') {
      console.log(dexTrade.hash)
    }
    // console.log(dexTrade.hash)

    // console.log(decodedInfo)
  }
}

initUniswapTxs()
