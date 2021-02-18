const Web3 = require('web3')
const cron = require('node-cron')
const { Op } = require('sequelize')

const { Tokens } = require('../models')
const CONFIG = require('../config/config-server.json')

const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider(CONFIG.web3Http))

async function getTokenTotalSupply(address) {
  const resCall = await web3.eth.call({
    to: address,
    data: web3.utils.sha3('totalSupply()'),
  })
  const tokenSupply = web3.utils.toBN(resCall).toString() / 10 ** 18
  return tokenSupply
}

async function initSupplies() {
  const allTokens = await Tokens.findAll({ where: { address: { [Op.ne]: null } } })
  allTokens.forEach(async (token) => {
    const totalSupply = await getTokenTotalSupply(token.address)
    await Tokens.update({ totalSupply: parseInt(totalSupply, 10) }, { where: { address: token.address } })
  })
  console.log('Tokens Supplies Updated')
}

initSupplies()
