"use strict"

const Web3 = require('web3');
const cron = require('node-cron');
const InputDataDecoder = require('ethereum-input-data-decoder');
const fs = require("fs");

const web3 = new Web3();
const contracts = require('../data/contracts.json');
const ABI = require('../data/ABI.json');
const getMissingBlocks = require('./parseGexp.js');

const labABI = [{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"getAllowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_val","type":"uint256"}],"name":"decTotalSupply","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_sendTo","type":"address"}],"name":"empty","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_acct","type":"address"},{"name":"_val","type":"uint256"}],"name":"incBalance","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_sender","type":"address"},{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"setApprove","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"modules","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_acct","type":"address"},{"name":"_val","type":"uint256"}],"name":"decBalance","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_acct","type":"address"},{"name":"_set","type":"bool"}],"name":"setModule","outputs":[{"name":"success","type":"bool"},{"name":"module","type":"address"},{"name":"set","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_acct","type":"address"}],"name":"getModule","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferRoot","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"getTotalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"root","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_val","type":"uint256"}],"name":"incTotalSupply","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_acct","type":"address"}],"name":"getBalance","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"decApprove","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_owner","type":"address"},{"name":"_supply","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"Module","type":"address"},{"indexed":true,"name":"Account","type":"address"},{"indexed":false,"name":"Amount","type":"uint256"},{"indexed":false,"name":"Polarity","type":"string"}],"name":"BalanceAdj","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"Module","type":"address"},{"indexed":true,"name":"Set","type":"bool"}],"name":"ModuleSet","type":"event"}];

const { Blocks, Transactions, Addresses, TxsTokens, Contracts, Tokens } = require('../models');

const formatAmount = require('../utils/ethformatter.js').formatAmount;

web3.setProvider(new web3.providers.HttpProvider('http://localhost:9656'));

const decoder = new InputDataDecoder(ABI);

// file with list of contract address
const tokenlab = new web3.eth.Contract(ABI, contracts.tokenlab.address);
const pex = new web3.eth.Contract(ABI, contracts.pex.address);
const tokenlab1 = new web3.eth.Contract(labABI, '0x9c3ef85668f064ed75a707a9fef00ed55bab01f5');

// Dop Info
// 903578 - bug
// 922388 - LAB transfers


// listenBlocks - get all latest blocks

async function main() {
	let data = await web3.eth.getBlock('latest');
	let latestInDbBlock = await Blocks.max('number');

	if(data.number !== latestInDbBlock+1) {
		console.log("Start to catching missing blocks and sync")
		const numberOfMissing = data.number - latestInDbBlock+1;
		console.log(`Number of missing blocks is: ${numberOfMissing}`)
		getMissingBlocks(latestInDbBlock+1, data.number)
		// update balance of missing blocks
		// listenBlocks()
		console.log("All done, know just sync")
		return
	} else {
		console.log("Just sync")
		await listenBlocks()
	}
}

main()
listenBlocks()

async function listenBlocks() {
		let data = await web3.eth.getBlock('latest');
		let latestInDbBlock = await Blocks.max('number');
		if(data.number !== latestInDbBlock) {
		try {
			await Blocks.create({
				number: data.number,
				hash: data.hash,
				extraData: data.extraData,
				difficulty: data.difficulty,
				totalDifficulty: data.totalDifficulty,
				gasLimit: data.gasLimit,
				gasUsed: data.gasUsed,
				tx_count: data.transactions.length,
				miner : data.miner,
				timestamp: data.timestamp,
				size: data.size,
				parentHash: data.parentHash,
				sha3Uncles: data.sha3Uncles,
				nonce: data.nonce
			}, { returning: false});
		} catch(e) {
			console.log('======= Create new Block issue (sync.js)===============');
			console.log(e)
		}
			if(data.transactions.length != 0) {
				let txs = data.transactions;
				for(let tx of txs){
					// current 1 tx
					let transaction = await web3.eth.getTransaction(tx);
					try {
					await Transactions.create({
						blockHash: transaction.blockHash,
						blockNumber: transaction.blockNumber,
						from: transaction.from.toLowerCase(),
						to: transaction.to ? transaction.to.toLowerCase() : await saveContract(tx),
						value: transaction.value,
						gas: transaction.gas,
						gas_price: transaction.gasPrice,
						nonce: transaction.nonce,
						data: transaction.input,
						timestamp: data.timestamp,
						hash: tx
					}, {returning: false})
					} catch(e) {
					
					console.log(e)
					console.log("Error here?")
					}
					// if this tx create new contract, them skip this loop iteration
					if(!transaction.to) continue; 
					if(transaction.input != '0x') {
						// lab transfer
						if(transaction.to.toLowerCase() == contracts.tokenlab.address.toLowerCase()) {
							await createTxsToken(transaction, data.timestamp,'LAB')
						}
						// pex transfer
						if(transaction.to.toLowerCase() == contracts.pex.address.toLowerCase()) {
							await createTxsToken(transaction, data.timestamp, 'PEX');
						}
					} 
					// update Addresses					
					const existsTo = await Addresses.findOne({where: {address : (transaction.to).toLowerCase()}})
					const balanceTo = await web3.eth.getBalance(transaction.to);
					const balanceFrom = await web3.eth.getBalance(transaction.from);
					if(!existsTo) {	
						try {
							await Addresses.create({
								address: (transaction.to).toLowerCase(),
								balance_EXP: formatAmount(balanceTo).split(" ")[0],
								last_active: data.timestamp
							}, { returning: false })
						} catch(e) {
							console.log('======== Create new tx issue (sync.js)=============')
							console.error(e)
						}
					} else {
						try{
							await Addresses.update({
								balance_EXP: formatAmount(balanceTo).split(" ")[0],
								last_active: data.timestamp
							}, {
								where: {address : (transaction.to).toLowerCase()}
							});
							await Addresses.update({
								balance_EXP: formatAmount(balanceFrom).split(" ")[0],
								last_active: data.timestamp
							}, { 
								where: {address: (transaction.from).toLowerCase() }
							});
						} catch(e) {
							console.log('=========== Update old tx issue ============')
							console.error(e)
						}
					}
				}
			}
		console.log(` - New block was added ${data.number}`)
	}
	console.log("---------------Empty call------------")
	setTimeout(listenBlocks, 700)
}


async function createTxsToken(transaction, timestamp, tokenName) {
	const pexAddr = '0x0cc6177ea69b0f1c2415043ac81ccd8f77d0c1a9';
	const labAddr = '0xa887adb722cf15bc1efe3c6a5d879e0482e8d197';
	const result = decoder.decodeData(transaction.input);
	const toAddress = ('0x' + result.inputs[0]).toLowerCase();
	if(result.name == 'transfer') {
		try{
			await TxsTokens.create({
				blockHash: transaction.blockHash,
				blockNumber: transaction.blockNumber,
				from: transaction.from.toLowerCase(),
				to: toAddress,
				value: web3.utils.fromWei(result.inputs[1],'ether'),
				hash: transaction.hash.toLowerCase(),
				token: tokenName,
				timestamp: timestamp,
			}, {returning: false})
			// update sender token balance

			console.log(`--- Write ${tokenName} transfer`)
			if(tokenName == 'LAB') {
				const balanceLAB = await getTokenBalance(transaction.from, tokenlab, labAddr)
				await Addresses.update({
					balance_LAB: balanceLAB
				},{ where: { address: toAddress }});
			} else {
				const balancePEX = await getTokenBalance(transaction.from, pex, pexAddr)
				await Addresses.update({
					balance_PEX: balancePEX
				}, { where: { address: toAddress }});
			} 
		} catch(e) {
			console.log(e)
			console.log("Error write TxToken (sync.js)")
		}
	} 
}

// REFACTOR
// Can i move this func to separete file?
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


async function saveContract(hash) {
	let data = await web3.eth.getTransactionReceipt(hash);
	console.log(data)
	try{
		// test variant
		await Contracts.create({
			hash: hash,
			contractAddress: data.contractAddress.toLowerCase(),
			creator: data.from.toLowerCase()
		}, { returning: false })
		console.log("New contract written")
	} catch(e) {
		console.log(e)
		console.log("Internal DB error (contracts)")
	}
	return data.contractAddress.toLowerCase();
}








// update Total Supply every 10 min
// cron.schedule('0 */10 * * * *',async () => {
// 	console.log(new Date().getMinutes())
// 	await getTotalExp() // update Total Supply every 10 min
// 	// 0.5169572615
// 	// 0.5136815598
// })




// async function tests() {
// 	// let block = await web3.eth.getBlock(903579);
// 	// for(let i = 0; i< block.transactions.length; i++) {
// 	// 	let tx = await web3.eth.getTransaction(block.transactions[i]);
// 	// 	console.log(tx)
// 	// }
// 	let bug = '0x9be1da9eedf254a4940ea0a7e5f1c05e289cc7f63e2d8514e0a319c22c4a5477'
// 	let bugTx = await web3.eth.getTransaction(bug);
// 	let data = bugTx.to ? bugTx.to.toLowerCase() : await saveContract(bug);
// 	console.log(data)
// }	

// tests()
