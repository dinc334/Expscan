const rp = require('request-promise')
const cron = require('node-cron')
const Web3 = require('web3')
const { Op } = require('sequelize')

const { Prices, Tokens } = require('../models')
const CONFIG = require('../config/config-server.json')

const web3 = new Web3()

web3.setProvider(new web3.providers.HttpProvider(CONFIG.web3Http))

const APIGEKOEXP = 'https://api.coingecko.com/api/v3/coins/expanse?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false'
const APIGEKOBTC = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'

async function getExpSupply() {
  const latestBlock = await web3.eth.getBlock('latest')
  let coinsupply = 800000 * 8 + (latestBlock.number - 800000) * 4
  let premineBalance = await web3.eth.getBalance('0xbb94f0ceb32257275b2a7a9c094c13e469b4563e')
  premineBalance = parseInt(Number(premineBalance) / 10 ** 18, 10)
  coinsupply += (11000000 - premineBalance)
  return coinsupply
}

async function getExpData() {
  const expSupply = await getExpSupply()
  let expData = await rp(APIGEKOEXP)
  if (!expData) return console.log('Cannot get EXP data')
  expData = JSON.parse(expData)
  const usdPrice = expData.market_data.current_price.usd
  const data = {
    priceUSD: usdPrice,
    priceBTC: expData.market_data.current_price.btc,
    volume: expData.market_data.total_volume.usd,
    marketcap: expSupply * usdPrice,
    supply: expSupply,
  }
  return data
}

async function getBtcPrice() {
  let btcData = await rp(APIGEKOBTC)
  btcData = JSON.parse(btcData)
  if (!btcData) return console.log('Cannot get BTC price')
  return btcData.bitcoin.usd
}

async function updateTokensCaps() {
  const allTokens = await Prices.findAll({ where: { ticker: { [Op.ne]: 'BTC' } } })
  allTokens.forEach(async (token) => {
    const tokenSupply = await Tokens.findOne({ where: { ticker: token.ticker } })
    await Prices.update({
      marketcap:
        (token.price_usd * tokenSupply.totalSupply),
    }, { where: { ticker: token.ticker } })
  })
  console.log('Update Tolen Caps')
}

async function initPrice() {
  const expData = await getExpData()
  const btcPrice = await getBtcPrice()
  const allData = [{
    ticker: 'EXP',
    price_usd: expData.priceUSD,
    price_btc: expData.priceBTC,
    volume: expData.volume,
    marketcap: expData.marketcap,
  }, {
    ticker: 'BTC',
    price_btc: 1,
    price_usd: btcPrice,
  }, {
    ticker: 'LAB',
    price_usd: 0.012,
    price_btc: btcPrice / 0.012,
  }, {
    ticker: 'PEX',
    price_usd: 0.0001,
    price_btc: btcPrice / 0.001,
  }, {
    ticker: 'EGG',
    price_usd: 0.002,
    price_btc: btcPrice / 0.002,
  }, {
    ticker: 'LOVE',
    price_usd: 0.096,
    price_btc: btcPrice / 0.096,
  }, {
    ticker: 'T64',
    price_usd: 174,
    price_btc: btcPrice / 174,
  }, {
    ticker: 'PRM',
    price_usd: 0.0033,
    price_btc: btcPrice / 0.0033,
  }]
  try {
    await Prices.bulkCreate(allData)
    console.log('Initial price-data created')
  } catch (e) {
    console.log('Error in initUpdate_Prices')
    console.error(e)
  }
}

async function mainUpdate() {
  const expPrices = await Prices.findOne({ where: { ticker: 'EXP' } })
  if (!expPrices) {
    initPrice()
    return
  }
  const expData = await getExpData()
  console.log('Update')
  try {
    await Prices.update({
      price_usd: expData.priceUSD,
      price_btc: expData.priceBTC,
      volume: expData.volume,
      marketcap: expData.marketcap,
    }, { where: { ticker: 'EXP' } })
    await Tokens.update({
      totalSupply: expData.supply,
    }, { where: { ticker: 'EXP' } })
    console.log('Prices-data updated.')
    await updateTokensCaps()
  } catch (e) {
    console.log(e)
    console.log('Error during updating Prices')
  }
}

mainUpdate()

cron.schedule('0 */1 * * * *', async () => {
  await mainUpdate()
})
