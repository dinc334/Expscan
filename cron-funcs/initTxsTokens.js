const Web3 = require('web3')

const { Op } = require('sequelize')
const { Tokens, TokensTxs } = require('../models')

const web3 = new Web3()
const CONFIG = require('../config/config-server.json')

web3.setProvider(new web3.providers.HttpProvider(CONFIG.web3Http))

const ABI = require('../data/abis/ABI.json')
const icoABI = require('../data/abis/icoABI.json')

const BalanceAdj = '0x9c3ef85668f064ed75a707a9fef00ed55bab01f5'

async function getIcoTransfers() {
  const labIco = new web3.eth.Contract(icoABI, BalanceAdj)
  const balanceAdj = await labIco.getPastEvents('BalanceAdj', {
    fromBlock: 750000,
    toBlock: 'latest',
  })
  const balancePlus = []
  const balanceMinus = []
  for (const tx of balanceAdj) {
    const txTime = await web3.eth.getBlock(tx.blockNumber)
    const value = tx.returnValues.Amount / (10 ** 18)
    if (tx.returnValues.Polarity == '+' && value > 1) {
      balancePlus.push({
        blockHash: tx.blockHash,
        blockNumber: tx.blockNumber,
        from: '0x9c3ef85668f064ed75a707a9fef00ed55bab01f5',
        to: tx.returnValues.Account.toLowerCase(),
        value,
        hash: tx.transactionHash,
        token: 'tokenlab',
        timestamp: txTime.timestamp,
      })
    } else if (tx.returnValues.Polarity == '-' && value > 1) {
      balanceMinus.push(tx.transactionHash)
    }
  }
  const icoAdd = balancePlus.filter((item) => balanceMinus.indexOf(item.hash) === -1)
  return icoAdd
}

async function getAllTransfers(abi, token) {
  const allTxs = []
  const tokenName = new web3.eth.Contract(abi, token.address)
  const allTransfers = await tokenName.getPastEvents('Transfer', {
    fromBlock: 800000,
    toBlock: 'latest',
  })
  for (const tx of allTransfers) {
    const txTime = await web3.eth.getBlock(tx.blockNumber)
    const transfer = {
      blockHash: tx.blockHash,
      blockNumber: tx.blockNumber,
      from: tx.returnValues._from.toLowerCase(),
      to: tx.returnValues._to.toLowerCase(),
      value: Number(tx.returnValues._value) / Math.pow(10, 18),
      hash: tx.transactionHash,
      timestamp: txTime.timestamp,
      token: token.name.toLowerCase(),
    }
    allTxs.push(transfer)
  }
  return allTxs
}

async function initTxsTokens() {
  const allTokens = await Tokens.findAll({ where: { type: 'ERC-644' } })

  allTokens.forEach(async (token) => {
    if (token.ticker === 'LAB') {
      const icoTxs = await getIcoTransfers()
      await TokensTxs.bulkCreate(icoTxs)
    }
    const tokenTxs = await getAllTransfers(ABI, token)
    await TokensTxs.bulkCreate(tokenTxs)
    console.log(`${token.ticker} tokens ${tokenTxs.length} transfers saved`)
  })
}

initTxsTokens()
