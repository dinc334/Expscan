"use strict";

const express = require('express');
const router = express.Router();

const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:9657'));

function getPengingTxs() {
	let pendingArray = [];
	const subscription = web3.eth.subscribe('pendingTransactions', async (error, result) => {
    if (!error) {
      const data = await web3.eth.getTransaction(result);
      pendingArray.push(data)
    }
	}).on("data", async (transaction) => {
    const data = await web3.eth.getTransaction(transaction);
		pendingArray.push(data)
	});
	return pendingArray
}
getPengingTxs()

router.get('/', async (req,res) => {
	const pendingTxs = await getPengingTxs();
	return res.render('pending', pendingTxs);
})

module.exports = router;
