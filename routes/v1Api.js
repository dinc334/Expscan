"use strict";
var express = require('express');
var router = express.Router();
const Web3 = require('web3');
const web3 = new Web3();

const { Tokens } = require('../models')

web3.setProvider(new web3.providers.HttpProvider("http://localhost:9656"))
// ERC20 ABI
const ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"}];
// file with list of contract address
const contracts = require('../data/contracts.json');

router.get('/address=:address',async (req,res) => {
	let address = req.params.address;
	if(address.length > 39 && address.substring(0,2) != '0x') {
		address = '0x' + address;
	}
	if(!web3.utils.isAddress(address)) {
		return res.json({error: true, reason: "Invalid address"})
	}
	try {
		var balance = await web3.eth.getBalance(address);
	} catch(e) {
		console.log("Web3 Error")
		console.log(e)
	}
	balance = Number(balance/Math.pow(10,18)).toFixed(4);
	return res.json({response : 'success', address, balance});
})

router.get('/tokenBalance=:address', async (req,res) => {
	let address = req.params.address;
	if(address.length > 39 && address.substring(0,2) != '0x') {
		address = '0x' + address;
	}
	if(!web3.utils.isAddress(address)) {
		return res.json({error: true, reason: "Invalid address"})
	}
	let tokens = [];
	let contractsArr = Object.keys(contracts);
	for(let contract of contractsArr) {
		let Token = new web3.eth.Contract(ABI, contracts[contract].address);
		let balance = await getTokenBalance(address, Token, contracts[contract].address)
		tokens.push({ticker: contracts[contract].ticker, balance: balance})
	}
	return res.json({
		response: "success",
		tokens: tokens
	});
});

router.get('/block=:blockNumber', async (req,res) => {
	let blockNumber = req.params.blockNumber;
	if(!Number(blockNumber)) {
		return res.json({error: true, reason:"Please input number values"})
	}
	try{
		var blockinfo = await web3.eth.getBlock(blockNumber);
	} catch(e) {
		return res.json({error: true, reason:"Some problem with Web3, please try later"})
	}
	if(blockinfo) {
		return res.json({
			response : 'success', 
			miner: blockinfo.miner, 
			difficulty: blockinfo.difficulty,
			hash: blockinfo.hash,
			timestamp: blockinfo.timestamp,
			transactions: blockinfo.transactions
		})
	} else {
		return res.json({
			response: 'error',
			reason: 'No such block'
		})
	}
})

router.get('/hash=:hash', async (req,res) => {
	let hash = req.params.hash;
	if(64 > hash.length) {
		return res.json({error: true, reason: "Please input correct value for hash"})
	} else if(hash.length == 64) hash = '0x' + hash;
	// hash block, hash transactions
	try {
		var hashtx = await web3.eth.getTransaction(hash);
	} catch(e) {
		console.log("Error in Web3 TX Hash")
		console.log(e)
	}
	if(hashtx != null) {
		return res.json({
			response: 'success',
			from: hashtx.from,
			to: hashtx.to,
			value: hashtx.value/Math.pow(10,18)
		})
	}
	try {
		var hashblock = await web3.eth.getBlock(hash);
	} catch(e) {
		console.log("Error in Web3 Get Block")
		console.log(e)
	}
	if(hashblock != null) {
		return res.json({
			response : 'success', 
			miner: hashblock.miner, 
			difficulty: hashblock.difficulty,
			hash: hashblock.hash,
			timestamp: hashblock.timestamp,
			transactions: hashblock.transactions
		});
	}
})

// just like https://dcrstats.com/api/v1/get_stats
router.get('/totalCoins', async (req,res) => {
	try {
		var { totalSupply } = await Tokens.findOne({ where: {ticker: "EXP"}})
	} catch(e) {
		console.log("Error in Tokens db")
		console.log(e);
	}
	return res.json(parseInt(totalSupply))
})


function getTokenBalance(address,tokenName,contractAddress) {
	return new Promise(async (resolve, reject) => {
		await web3.eth.call({
			to: contractAddress,
			data: tokenName.methods.balanceOf(address).encodeABI()
		}, (err,result) => {
			if(result) {
				let tokens = web3.utils.toBN(result).toString();
	  		let amount = web3.utils.fromWei(tokens, 'ether');
	  		resolve(Number(amount).toFixed(3))
			} else {
				reject(err)
			}
		})
	})
}

module.exports = router;

