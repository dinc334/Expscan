const Web3 = require('web3')
const InputDataDecoder = require('ethereum-input-data-decoder')

const web3 = new Web3()
const contracts = require('../data/contracts.json')
const ABI = require('../data/ABI.json')
const getMissingBlocks = require('./parseGexp.js')

const {
  Blocks, Transactions, Addresses, TxsTokens, Contracts,
} = require('../models')

const { formatAmount } = require('./ethformatter.js')
const { web3Http } = require('../config/config-server.json')

web3.setProvider(new web3.providers.HttpProvider(web3Http))

const decoder = new InputDataDecoder(ABI)
const tokenlab = new web3.eth.Contract(ABI, contracts.tokenlab.address)
const pex = new web3.eth.Contract(ABI, contracts.pex.address)

// listenBlocks - get all latest blocks
async function main() {
  const data = await web3.eth.getBlock('latest')
  const latestDbBlock = await Blocks.max('number') || 0

  if (data.number !== latestDbBlock + 1) {
    const numberOfMissing = data.number - latestDbBlock + 1
    console.log(`Number of missing blocks is: ${numberOfMissing}`)
    getMissingBlocks(latestDbBlock + 1, data.number)
    // update balance of missing blocks
    // listenBlocks()
    console.log('All done, know just sync')
  } else {
    console.log('Just sync')
    await listenBlocks()
  }
}

main() // parse from 0 to latest 0 -> 100
// listenBlocks() // parse from latest to all new 100 -> all new

async function listenBlocks() {
  const data = await web3.eth.getBlock('latest')
  const latestInDbBlock = await Blocks.max('number')
  if (data.number !== latestInDbBlock) {
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
        miner: data.miner,
        timestamp: data.timestamp,
        size: data.size,
        parentHash: data.parentHash,
        sha3Uncles: data.sha3Uncles,
        nonce: data.nonce,
      }, { returning: false })
    } catch (e) {
      console.log('======= Create new Block issue (sync.js)===============')
      console.log(e)
    }
    if (data.transactions.length !== 0) {
      const txs = data.transactions
      for (const tx of txs) {
        const transaction = await web3.eth.getTransaction(tx)
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
            hash: tx,
          }, { returning: false })
        } catch (e) {
          console.log(e)
          console.log('Error here?')
        }
        // if this tx create new contract, them skip this loop iteration
        if (!transaction.to) continue
        if (transaction.input != '0x') {
          // lab transfer
          if (transaction.to.toLowerCase() == contracts.tokenlab.address.toLowerCase()) {
            await createTxsToken(transaction, data.timestamp, 'LAB')
          }
          // pex transfer
          if (transaction.to.toLowerCase() == contracts.pex.address.toLowerCase()) {
            await createTxsToken(transaction, data.timestamp, 'PEX')
          }
        }
        // update Addresses
        const existsTo = await Addresses.findOne({ where: { address: (transaction.to).toLowerCase() } })
        const balanceTo = await web3.eth.getBalance(transaction.to)
        const balanceFrom = await web3.eth.getBalance(transaction.from)
        if (!existsTo) {
          try {
            await Addresses.create({
              address: (transaction.to).toLowerCase(),
              balance_EXP: formatAmount(balanceTo).split(' ')[0],
              last_active: data.timestamp,
            }, { returning: false })
          } catch (e) {
            console.log('======== Create new tx issue (sync.js)=============')
            console.error(e)
          }
        } else {
          try {
            await Addresses.update({
              balance_EXP: formatAmount(balanceTo).split(' ')[0],
              last_active: data.timestamp,
            }, {
              where: { address: (transaction.to).toLowerCase() },
            })
            await Addresses.update({
              balance_EXP: formatAmount(balanceFrom).split(' ')[0],
              last_active: data.timestamp,
            }, {
              where: { address: (transaction.from).toLowerCase() },
            })
          } catch (e) {
            console.log('=========== Update old tx issue ============')
            console.error(e)
          }
        }
      }
    }
    console.log(` - New block was added ${data.number}`)
  }
  console.log('---------------Empty call------------')
  setTimeout(listenBlocks, 700)
}

async function createTxsToken(transaction, timestamp, tokenName) {
  const pexAddr = '0x0cc6177ea69b0f1c2415043ac81ccd8f77d0c1a9'
  const labAddr = '0xa887adb722cf15bc1efe3c6a5d879e0482e8d197'
  const result = decoder.decodeData(transaction.input)
  const toAddress = (`0x${result.inputs[0]}`).toLowerCase()
  if (result.name == 'transfer') {
    try {
      await TxsTokens.create({
        blockHash: transaction.blockHash,
        blockNumber: transaction.blockNumber,
        from: transaction.from.toLowerCase(),
        to: toAddress,
        value: web3.utils.fromWei(result.inputs[1], 'ether'),
        hash: transaction.hash.toLowerCase(),
        token: tokenName,
        timestamp,
      }, { returning: false })
      // update sender token balance

      console.log(`--- Write ${tokenName} transfer`)
      if (tokenName === 'LAB') {
        const balanceLAB = await getTokenBalance(transaction.from, tokenlab, labAddr)
        await Addresses.update({
          balance_LAB: balanceLAB,
        }, { where: { address: toAddress } })
      } else {
        const balancePEX = await getTokenBalance(transaction.from, pex, pexAddr)
        await Addresses.update({
          balance_PEX: balancePEX,
        }, { where: { address: toAddress } })
      }
    } catch (e) {
      console.log(e)
      console.log('Error write TxToken (sync.js)')
    }
  }
}

// REFACTOR
// Can i move this func to separete file?
function getTokenBalance(address, tokenName, contractAddress) {
  return new Promise(async (resolve, reject) => {
    await web3.eth.call({
      to: contractAddress,
      data: tokenName.methods.balanceOf(address).encodeABI(),
    }, (err, result) => {
      if (result) {
        const tokens = web3.utils.toBN(result).toString()
	  		const amount = web3.utils.fromWei(tokens, 'ether')
	  		resolve(Number(amount).toFixed(3))
      } else {
        reject(err)
      }
    })
  })
}

async function saveContract(hash) {
  const data = await web3.eth.getTransactionReceipt(hash)
  console.log(data)
  try {
    // test variant
    await Contracts.create({
      hash,
      contractAddress: data.contractAddress.toLowerCase(),
      creator: data.from.toLowerCase(),
    }, { returning: false })
    console.log('New contract written')
  } catch (e) {
    console.log(e)
    console.log('Internal DB error (contracts)')
  }
  return data.contractAddress.toLowerCase()
}

// update Total Supply every 10 min
// cron.schedule('0 */10 * * * *',async () => {
// 	console.log(new Date().getMinutes())
// 	await getTotalExp() // update Total Supply every 10 min
// 	// 0.5169572615
// 	// 0.5136815598
// })
