"use strcit"

const request = require('request');
const cron = require('node-cron');
const Web3 = require('web3');

const { Prices, Tokens, Blocks } = require('../models');

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:9656"))

const MARKETCAP = 'https://api.coinmarketcap.com/v1/ticker/';
const GRAVIEXLABBTC = 'https://graviex.net//api/v2/tickers/labbtc.json'
const GRAVIEXLABUSD = 'https://graviex.net//api/v2/tickers/labusdt.json'






async function init() {
	const labPrice = await getLabPrice(); 
	const expPrice = await getExpPrice(); 
	const btcPrice = await getBtcPrice();
	const labUSD = labPrice.priceBTC*btcPrice.priceUSD;
	const allData = [{
		'ticker': 'EXP',
		'price_usd': expPrice.priceUSD,
		'price_btc': expPrice.priceBTC,
		'volume': expPrice.volume,
		'marketcap': expPrice.marketcap,
	}, {
		'ticker': 'BTC',
		'price_btc': 1,
		'price_usd': btcPrice.priceUSD
	}, {
		'ticker': 'LAB',
		'price_btc': labPrice.priceBTC,
		'price_usd': labUSD.toFixed(6)
	}, {
		// for JOIN 2 tables
		'ticker': 'PEX',
		'price_usd': 0,
		'price_btc': 0
	}]
	try {
		await Prices.bulkCreate(allData);
		console.log("Init price-data saved.");
	} catch(e) {
		console.log("Error in initUpdate_Prices");
		console.error(e);
	}
}
//init()
async function mainUpdate() {
	const labPrice = await getLabPrice(); 
	const expPrice = await getExpPrice(); 
	const btcPrice = await getBtcPrice();
	const labUSD = labPrice.priceBTC*btcPrice.priceUSD;
	try {
		await Prices.update({
			price_usd: expPrice.priceUSD,
			price_btc: expPrice.priceBTC,
			volume: expPrice.volume,
			marketcap: expPrice.marketcap,
		}, { where: {'ticker': 'EXP'}});
		// update Expanse total supply

		try {
			// get int total suppl
			const latestBlock = await Blocks.max('number');
			let coinsupply = 800000*8+(latestBlock-800000)*4;
			let premineBalance = await web3.eth.getBalance("0xbb94f0ceb32257275b2a7a9c094c13e469b4563e");
			premineBalance = parseInt(premineBalance/Math.pow(10,18))
			coinsupply = coinsupply + (11000000-premineBalance);
			await Tokens.update({
				totalSupply: parseInt(coinsupply)
			}, { where: {'ticker': 'EXP' }});
		} catch(e) {
			console.log("Error during updating expanse total supply")
			console.log(e)
		}
		await Prices.update({
			price_usd: btcPrice.priceUSD
		}, { where: {'ticker': 'BTC'}});
		await Prices.update({
			price_btc: labPrice.priceBTC,
			price_usd: labUSD.toFixed(6)
		}, { where: {'ticker': 'LAB'}});
		console.log("Prices updated.");
	} catch(e) {
		console.log(e);
		console.log("Error during updating Prices")
	}
	console.log("Update Token Prices")
}

mainUpdate()

function getExpPrice() {
	return new Promise((resolve,reject) => {
		let data = {};
		request(MARKETCAP + 'Expanse', async (error, response, body)=>{
			if(error) return console.log(error);
			try{
				var dataCoin = JSON.parse(body);
			} catch (e) {
				console.log("Api Coinmarket Problem" + e);
				return next(e,null);
			}
			var marketcapInfo = dataCoin[0];
			data.priceUSD  = marketcapInfo['price_usd'];
			data.priceBTC  = marketcapInfo['price_btc'];
			data.volume    = marketcapInfo['24h_volume_usd'];
			data.marketcap = marketcapInfo['market_cap_usd'];
			data.supply    =(Number(marketcapInfo['available_supply'])+9000000);
			resolve(data)	
		})	
	})
}

// combine this function with getExpPrice
function getBtcPrice() {
	return new Promise((resolve, reject) => {
		let data = {};
		request(MARKETCAP + 'Bitcoin', async (error, response, body) => {
			if(error) return console.log(error);
			const dataCoin = JSON.parse(body);
			data.priceUSD = dataCoin[0].price_usd;
			resolve(data);
		})
	})
}

function getLabPrice() {
	return new Promise((resolve,reject) => {
		let data = {};
		request(GRAVIEXLABBTC, async (error, response, body) => {
			if(error) return console.log(error);
			const dataCoin = JSON.parse(body);
			data.priceBTC = dataCoin.ticker.last;
			resolve(data)
		});
	})
}

cron.schedule('0 */1 * * * *',async () => {
	await mainUpdate() 
})
