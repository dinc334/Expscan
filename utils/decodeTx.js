const { Op } = require('sequelize')

const InputDataDecoder = require('ethereum-input-data-decoder')
const e = require('express')
const { Tokens } = require('../models')
const chainIds = require('../data/chainIds.json')

async function decodeTx(txInput, contractAddress) {
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
      contractABI = require(`../data/${typeOfContract}.json`)
    } catch (e) {
      return { erorr: true, reason: 'Cannot find this type of ABI' }
    }
    if (!contractABI) return { error: true, reason: 'Dont have info about this contract' }
    const decoder = new InputDataDecoder(contractABI)
    const decodedObj = decoder.decodeData(txInput)
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
    // swapExactTokensForTokensSupportingFeeOnTransferTokens
    // console.log(decodedObj)
    // if (decodedObj.method === 'swapExactTokensForTokensSupportingFeeOnTransferTokens') {
    //   decodedData = {
    //     method: 'newMethod',
    //   }
    // }
    if (decodedObj.method === 'removeLiquidityEXPWithPermitSupportingFeeOnTransferTokens') {
      console.log(decodedObj)
      decodedData = {
        method: 'removeLiquidityEXPWithPermitSupportingFee',
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
      const pathLength = decodedObj.inputs[2].length
      const tokenIn = `0x${decodedObj.inputs[2][pathLength - 2]}`
      const tokenPath = `0x${decodedObj.inputs[2][pathLength - 1]}`
      decodedData = {
        method: decodedObj.method,
        amountIn: decodedObj.inputs[0].toString() / (10 ** 18),
        amountOut: decodedObj.inputs[1].toString() / (10 ** 18),
        tokenIn: tokenIn || `0x${decodedObj.inputs[2][pathLength]}`,
        tokenPath,
      }
    }
    if (decodedObj.method === 'swapTokensForExactTokens') {
      decodedData = {
        method: decodedObj.method,
        amountOut: decodedObj.inputs[0].toString() / (10 ** 18),
        amountIn: decodedObj.inputs[1].toString() / (10 ** 18),
        tokenIn: `0x${decodedObj.inputs[2][0]}`,
        tokenPath: `0x${decodedObj.inputs[2][1]}`,
      }
    }

    if (decodedObj.method === 'swapExactTokensForEXP') {
      const tokenAddress = `0x${decodedObj.inputs[2][0]}`
      decodedData = {
        method: decodedObj.method,
        amountIn: decodedObj.inputs[0].toString() / (10 ** 18),
        amountOutMin: `${decodedObj.inputs[1].toString() / (10 ** 18)} EXP`,
        tokenAddress,
      }
    }

    if (decodedObj.method === 'swapExactTokensForEXPSupportingFeeOnTransferTokens') {
      decodedData = {
        method: 'swapExactTokensForEXPSupportingFee',
        tokenAddress: `0x${decodedObj.inputs[2][0]}`,
        amountIn: decodedObj.inputs[0].toString() / (10 ** 18),
        amountOutMin: decodedObj.inputs[1].toString() / (10 ** 18),
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

module.exports = decodeTx
