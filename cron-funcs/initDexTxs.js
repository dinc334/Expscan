const Web3 = require('web3')
const InputDataDecoder = require('ethereum-input-data-decoder')

const web3 = new Web3()
const CONFIG = require('../config/config-server.json')

web3.setProvider(new web3.providers.HttpProvider(CONFIG.web3Http))

const sushiLPABI = require('../data/sushiLPABI.json')

async function initUniswapTxs() {
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
}

initUniswapTxs()

async function initSushiswapTxs() {
  const EXPEXLPpool = '0x6680B66406DC1f1bcFfdbacA320F9D950e65dBA0' // sushiABItest
  const decoder = new InputDataDecoder(sushiLPABI)
  const sushiContract = new web3.eth.Contract(sushiLPABI, EXPEXLPpool)
  const allEvents = await sushiContract.getPastEvents('allEvents', {
    fromBlock: 800000,
    toBlock: 'latest',
  })

  // there are 3 type
  // every LP pool has same ABI, loop all pools and write deposit/withward/EmergencyWithdraw event.

  allEvents.forEach((event) => {
    console.log({
      event: event.event,
    })
  })

  // 0x5312ea8e - emergencywithward
  // 0x441a3e70 - withward
  // 0xe2bbb158 - deposit to contract (LP Staking Pool)
}

async function main() {
  await initUniswapTxs()
  await initSushiswapTxs()
}
