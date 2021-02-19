const Web3 = require('web3')
const cron = require('node-cron')
const { Op } = require('sequelize')

const { Tokens, TokensTxs, TokensBalances } = require('../models')
const CONFIG = require('../config/config-server.json')

const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider(CONFIG.web3Http))

async function updateTransferAndHolders() {
  const allTokens = await Tokens.findAll()
  allTokens.forEach(async (token) => {
    const tokensTxs = await TokensTxs.count({ where: { token: token.ticker } })
    // TO DO: add this complex query
    const tokenHolders = await TokensBalances.count({})
    await Tokens.update({
      transfers: tokensTxs,
      holder: tokenHolders,
    })
    console.log(`${token.ticker} holder and transfer updated.`)
  })
}

async function getTokenTotalSupply(address) {
  const resCall = await web3.eth.call({
    to: address,
    data: web3.utils.sha3('totalSupply()'),
  })
  const tokenSupply = web3.utils.toBN(resCall).toString() / 10 ** 18
  return tokenSupply
}

async function updateSupplies() {
  const allTokens = await Tokens.findAll({ where: { address: { [Op.ne]: null } } })
  allTokens.forEach(async (token) => {
    const totalSupply = await getTokenTotalSupply(token.address)
    await Tokens.update({ totalSupply: parseInt(totalSupply, 10) },
      { where: { address: token.address } })
  })
}

async function updateTokensInfo() {
  await updateSupplies()
  console.log('Tokens Supplies Updated')
  await updateTransferAndHolders()
  console.log('Tokens Transfers and Holders Updated')
}

updateTokensInfo()

cron.schedule('0 0 */1 * * *', async () => {
  await updateTokensInfo()
})
