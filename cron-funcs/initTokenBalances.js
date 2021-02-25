const Web3 = require('web3')
const { Op } = require('sequelize')

const { Addresses, TokensBalances, Tokens } = require('../models')

const CONFIG = require('../config/config-server.json')

const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider(CONFIG.web3Http))

const contractABI = new web3.eth.Contract(require('../data/ABI644.json'))

function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve() }, ms)
  })
}

function getTokenBalance(address, tokenName, contractAddress, ticker) {
  return new Promise(async (resolve, reject) => {
    await web3.eth.call({
      to: contractAddress,
      data: tokenName.methods.balanceOf(address).encodeABI(),
    }, (err, result) => {
      if (result) {
        const tokens = web3.utils.toBN(result).toString()
        const amount = web3.utils.fromWei(tokens, 'ether')
        if (!amount) return resolve()

        resolve({
          address,
          ticker,
          balance: Number(amount).toFixed(3),
        })
      } else {
        reject(err)
      }
    })
  })
}

async function getAllTokenBalances(address) {
  const allTokens = await Tokens.findAll({ where: { address: { [Op.ne]: null } } })
  const promises = []
  allTokens.forEach((token) => {
    promises.push(getTokenBalance(address, contractABI, token.address, token.ticker))
  })
  const result = await Promise.all(promises)
  return result
}

async function initTokenBalances() {
  const allAddresses = await Addresses.findAll()
  const allTokens = await Tokens.findAll({ where: { address: { [Op.ne]: null } } })
  const allPromises = [] // 315843
  allAddresses.forEach(({ address }) => {
    allTokens.forEach((token) => {
      allAddresses.push(getTokenBalance(address, contractABI, token.address, token.ticker))
    })
  })
  const result = await Promise.all(allPromises)
  console.log(result.length)
  // allAddresses.forEach(async ({ address }) => {
  //   const allBalances = await getAllTokenBalances(address)
  //   console.log(allBalances)
  // })
}

initTokenBalances()
