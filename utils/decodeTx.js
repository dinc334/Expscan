const { Op } = require('sequelize')

const InputDataDecoder = require('ethereum-input-data-decoder')
const { Tokens } = require('../models')
const chainIds = require('../data/chainIds.json')

async function decodeTx(tx, contractAddress) {
  const existingToken = await Tokens.findOne({ where: { [Op.and]: { address: contractAddress, type: 'ERC-644' } } })
  let decodedData = {}
  if (!existingToken) {
    // not erc20 or erc644
    const notErcABIs = {
      '0x6680b66406dc1f1bcffdbaca320f9d950e65dba0': 'expSushiRouter',
      '0xacfe49957b0f794455db556b01ff5943b36b69a9': 'eggMaker',
      '0xfaf3ddcb8d17db02e08e45f02afb8d427669d592': 'expUniRouter',
      '0xfdcdd3ee5d5d99eedb2fcb38927378199e51a4cc': 'bridge',
    }
    const typeOfContract = notErcABIs[contractAddress.toLowerCase()]
    let contractABI = {}
    try {
      contractABI = require(`../data/abis/${typeOfContract}.json`)
    } catch (e) {
      return { erorr: true, reason: 'Cannot find this type of ABI' }
    }
    if (!contractABI) return { error: true, reason: 'Dont have info about this contract' }
    const decoder = new InputDataDecoder(contractABI)
    const decodedObj = decoder.decodeData(tx.data)
    // console.log(decodedObj)
    // TO DO: move to switch after all method added

    // eggMaker
    if (decodedObj.method === 'convert') {
      decodedData = {
        method: decodedObj.method,
        tokenAddressA: `0x${decodedObj.inputs[0]}`,
        tokenAddressB: `0x${decodedObj.inputs[1]}`,
      }
    }

    // expUniRouter
    if (decodedObj.method === 'removeLiquidityEXPWithPermitSupportingFeeOnTransferTokens') {
      // EABN has 6 decimals, lol
      decodedData = {
        method: 'removeLiquidityEXPWithPermitSupportingFee',
        tokenAddress: `0x${decodedObj.inputs[0]}`,
        tokenAmount: decodedObj.inputs[2].toString() / (10 ** 18),
        expAmount: decodedObj.inputs[3].toString() / (10 ** 18),
      }
    }

    if (decodedObj.method === 'removeLiquidityEXP') {
      decodedData = {
        method: 'removeLiquidityEXP',
        tokenAddress: `0x${decodedObj.inputs[0]}`,
        tokenAmount: decodedObj.inputs[2].toString() / (10 ** 18),
        expAmount: decodedObj.inputs[3].toString() / (10 ** 18),
      }
    }
    if (decodedObj.method === 'removeLiquidity') {
      decodedData = {
        method: 'removeLiquidityWithPermit',
        tokenAAddress: `0x${decodedObj.inputs[0]}`,
        tokenBAddress: `0x${decodedObj.inputs[1]}`,
        tokenAAmount: decodedObj.inputs[3].toString() / (10 ** 18),
        tokenBAmount: decodedObj.inputs[4].toString() / (10 ** 18),
      }
    }
    if (decodedObj.method === 'removeLiquidityEXPWithPermit') {
      decodedData = {
        method: 'removeLiquidity',
        tokenAddress: `0x${decodedObj.inputs[0]}`,
        tokenAmount: decodedObj.inputs[2].toString() / (10 ** 18),
        expAmount: decodedObj.inputs[3].toString() / (10 ** 18),
      }
    }

    if (decodedObj.method === 'removeLiquidityWithPermit') {
      // TO DO: inputs[2] - is a liquidity (LP), we can show it
      decodedData = {
        method: decodedObj.method,
        tokenAAddress: `0x${decodedObj.inputs[0]}`,
        tokenBAddress: `0x${decodedObj.inputs[1]}`,
        tokenAAmount: decodedObj.inputs[3].toString() / (10 ** 18),
        tokenBAmount: decodedObj.inputs[4].toString() / (10 ** 18),
      }
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
    if (decodedObj.method === 'swapTokensForExactEXP') {
      decodedData = {
        method: 'swap',
        amountIn: decodedObj.inputs[1].toString() / (10 ** 18),
        amountOut: decodedObj.inputs[0].toString() / (10 ** 18),
        tokenIn: `0x${decodedObj.inputs[2][0]}`,
        tokenOut: `0x${decodedObj.inputs[2][1]}`,
      }
    }
    if (decodedObj.method === 'swapExactEXPForTokens') {
      decodedData = {
        method: 'swap',
        amountIn: tx.value / (10 ** 18),
        amountOut: decodedObj.inputs[0].toString() / (10 ** 18),
        tokenIn: 'EXP',
        tokenOut: `0x${decodedObj.inputs[1][1]}`,
      }
    }
    if (decodedObj.method === 'swapEXPForExactTokens') {
      decodedData = {
        method: decodedObj.method,
        amountIn: tx.value / (10 ** 18),
        amountOut: decodedObj.inputs[0].toString() / (10 ** 18),
        tokenIn: 'EXP',
        pathToken: `0x${decodedObj.inputs[1][0]}`,
        tokenOut: `0x${decodedObj.inputs[1][1]}`,
      }
    }
    if (decodedObj.method === 'swapExactTokensForTokens') {
      const pathLength = decodedObj.inputs[2].length
      const tokenIn = `0x${decodedObj.inputs[2][pathLength - 2]}`
      const tokenOut = `0x${decodedObj.inputs[2][pathLength - 1]}`
      decodedData = {
        method: 'swap',
        amountIn: decodedObj.inputs[0].toString() / (10 ** 18),
        amountOut: decodedObj.inputs[1].toString() / (10 ** 18),
        tokenIn: tokenIn || `0x${decodedObj.inputs[2][pathLength]}`,
        tokenOut,
      }
    }
    if (decodedObj.method === 'swapTokensForExactTokens' || decodedObj.method === 'swapExactTokensForTokensSupportingFeeOnTransferTokens') {
      decodedData = {
        method: 'swap',
        amountIn: decodedObj.inputs[1].toString() / (10 ** 18),
        amountOut: decodedObj.inputs[0].toString() / (10 ** 18),
        tokenIn: `0x${decodedObj.inputs[2][0]}`,
        tokenOut: `0x${decodedObj.inputs[2][1]}`,
      }
    }
    if (decodedObj.method === 'swapExactTokensForEXP') {
      decodedData = {
        method: 'swap',
        amountIn: decodedObj.inputs[0].toString() / (10 ** 18),
        amountOut: `${decodedObj.inputs[1].toString() / (10 ** 18)}`,
        tokenIn: `0x${decodedObj.inputs[2][0]}`,
        tokenOut: 'EXP',
      }
    }
    if (decodedObj.method === 'swapExactTokensForEXPSupportingFeeOnTransferTokens') {
      decodedData = {
        method: 'swap',
        amountIn: decodedObj.inputs[0].toString() / (10 ** 18),
        amountOut: decodedObj.inputs[1].toString() / (10 ** 18),
        tokenIn: `0x${decodedObj.inputs[2][0]}`,
        tokenOut: 'EXP',
      }
    }

    if (decodedObj.method === 'voteProposal') {
      const chainId = decodedObj.inputs[0].toString()
      decodedData = {
        method: decodedObj.method,
        destinationChain: chainIds[chainId] || 'Unrecognized Chain',
      }
    }
    if (decodedObj.method === 'executeProposal') {
      const chainId = decodedObj.inputs[0].toString()
      decodedData = {
        method: decodedObj.method,
        destinationChain: chainIds[chainId] || 'Unrecognized Chain',
      }
    }
    if (decodedObj.method === 'deposit' && typeOfContract === 'bridge') {
      // TO DO: decoded amount of transfered to bridge
      const chainId = decodedObj.inputs[0].toString()
      decodedData = {
        method: 'depositBridge',
        destinationChain: chainIds[chainId] || 'Unrecognized Chain',
      }
    }
    if (decodedObj.method === 'deposit' && typeOfContract !== 'bridge') {
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
    contractABI = require(`../data/abis/${existingToken.ticker.toLowerCase()}ABI.json`)
  } catch (err) {
    // erc 20 or erc644
    contractABI = require('../data/abis/ABI644.json')
  }

  if (!contractABI) return { error: true, reason: 'Dont have info about this contract' }
  const decoder = new InputDataDecoder(contractABI)
  const decodedObj = decoder.decodeData(tx.data)

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

module.exports = decodeTx
