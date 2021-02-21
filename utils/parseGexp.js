/* eslint-disable no-await-in-loop */
const Web3 = require('web3')

const web3 = new Web3()

const {
  Blocks, Transactions, Addresses, Contracts,
} = require('../models')

const { formatDB } = require('./ethformatter.js')
const CONFIG = require('../config/config-server.json')

web3.setProvider(new web3.providers.HttpProvider(CONFIG.web3Http))

const ABI = require('../data/ABI644.json')

const tokenlab = new web3.eth.Contract(ABI, '0xa887adb722cf15bc1efe3c6a5d879e0482e8d197')
const pex = new web3.eth.Contract(ABI, '0x0cc6177ea69b0f1c2415043ac81ccd8f77d0c1a9')

async function saveContract(hash) {
  const data = await web3.eth.getTransactionReceipt(hash)
  console.log(data)
  try {
    await Contracts.create({
      hash,
      contractAddress: data.contractAddress.toLowerCase(),
      creator: data.from.toLowerCase(),
    })
    console.log('New contract written')
  } catch (e) {
    console.log(e)
    console.log('Internal DB error (contracts)')
  }
  return data.contractAddress.toLowerCase()
}

async function getMissingBlocks(fromBlock, toBlock) {
  for (let i = fromBlock + 1; i < toBlock; i++) {
    const data = await web3.eth.getBlock(i)
    try {
      await Blocks.create({
        number: data.number,
        hash: data.hash.toLowerCase(),
        extraData: data.extraData,
        difficulty: data.difficulty,
        totalDifficulty: data.totalDifficulty,
        gasLimit: data.gasLimit,
        gasUsed: data.gasUsed,
        tx_count: data.transactions.length,
        miner: data.miner.toLowerCase(),
        timestamp: data.timestamp,
        size: data.size,
        parentHash: data.parentHash,
        sha3Uncles: data.sha3Uncles,
        nonce: data.nonce,
      }, { returning: false })
      console.log('Blocks is: ', data.number)
    } catch (e) {
      console.log(e)
      console.log('======= Create new Block issue ===============')
    }
    if (data.transactions.length !== 0) {
      const txs = data.transactions
      const results = []
      // eslint-disable-next-line no-restricted-syntax
      for (const tx of txs) {
        // current 1 tx
        const transaction = await web3.eth.getTransaction(tx)
        results.push(Transactions.create({
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
          hash: tx,
        }, { returning: false }))
        if (transaction.to) {
          try {
            await Addresses.create({
              address: transaction.to.toLowerCase(),
              last_active: data.timestamp,
            }, { returning: false })
          } catch (e) {
            await Addresses.update({
              last_active: data.timestamp,
            }, { where: { address: transaction.to.toLowerCase() } })
          }
        }
      }
      try {
        await Promise.all(results)
      } catch (e) {
        console.log('Cannot save all txs in promise all')
      }
    }
  }
  console.log('Updade Balance In')
  await updateBalances()
}

async function updateBalances() {
  const addresses = await Addresses.findAll({ attributes: ['address'] })
  addresses.forEach(async (address) => {
    const expBalance = await web3.eth.getBalance(address.address)
    console.log(expBalance)
    await Addresses.update({
      balance_EXP: formatDB(expBalance),
    }, { where: { address: address.address } })
  })
  console.log('Finishing update balances, you can run ./sync.js')
}
updateBalances()

// TO DO: move this func to separete file?
function getTokenBalance(address, tokenName, contractAddress) {
  return new Promise(async (resolve, reject) => {
    await web3.eth.call({
      to: contractAddress.toLowerCase(),
      data: tokenName.methods.balanceOf(address).encodeABI(),
    }, (err, result) => {
      if (result) {
        const tokens = web3.utils.toBN(result).toString()
	  		const amount = web3.utils.fromWei(tokens, 'ether')
	  		resolve(Number(amount).toFixed(2))
      } else {
        reject(err)
      }
    })
  })
}

async function main() {
  const latestChainBlock = await web3.eth.getBlock('latest')
  const latestDbBlock = await Blocks.max('number') || 0
  if (latestChainBlock.number !== latestDbBlock) {
    console.log(`Start adding missing blocks from ${latestDbBlock} to ${latestChainBlock.number}`)
    try {
      await getMissingBlocks(latestDbBlock + 1, latestChainBlock.number)
    } catch (e) {
      console.log(e)
    }
  }
  console.log('Getting ALl Balances')
  await updateBalances()
  console.log('Get all balance  succes')
}

// main()

module.exports = getMissingBlocks
