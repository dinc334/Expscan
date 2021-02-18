const Web3 = require('web3')

const web3 = new Web3()

const {
  Blocks, Transactions, Addresses, Supplies, TxsTokens, Contracts,
} = require('../models')

const { formatDB } = require('./ethformatter.js')

web3.setProvider(new web3.providers.HttpProvider('http://localhost:9656'))

const ABI = [{
  constant: true, inputs: [], name: 'name', outputs: [{ name: '', type: 'string' }], payable: false, type: 'function',
}, {
  constant: false, inputs: [{ name: '_spender', type: 'address' }, { name: '_value', type: 'uint256' }], name: 'approve', outputs: [{ name: 'success', type: 'bool' }], payable: false, type: 'function',
}, {
  constant: true, inputs: [], name: 'totalSupply', outputs: [{ name: '', type: 'uint256' }], payable: false, type: 'function',
}, {
  constant: false, inputs: [{ name: '_from', type: 'address' }, { name: '_to', type: 'address' }, { name: '_value', type: 'uint256' }], name: 'transferFrom', outputs: [{ name: 'success', type: 'bool' }], payable: false, type: 'function',
}, {
  constant: true, inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], payable: false, type: 'function',
}, {
  constant: true, inputs: [], name: 'version', outputs: [{ name: '', type: 'string' }], payable: false, type: 'function',
}, {
  constant: true, inputs: [{ name: '_owner', type: 'address' }], name: 'balanceOf', outputs: [{ name: 'balance', type: 'uint256' }], payable: false, type: 'function',
}, {
  constant: true, inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }], payable: false, type: 'function',
}, {
  constant: false, inputs: [{ name: '_to', type: 'address' }, { name: '_value', type: 'uint256' }], name: 'transfer', outputs: [{ name: 'success', type: 'bool' }], payable: false, type: 'function',
}, {
  constant: false, inputs: [{ name: '_spender', type: 'address' }, { name: '_value', type: 'uint256' }, { name: '_extraData', type: 'bytes' }], name: 'approveAndCall', outputs: [{ name: 'success', type: 'bool' }], payable: false, type: 'function',
}, {
  constant: true, inputs: [{ name: '_owner', type: 'address' }, { name: '_spender', type: 'address' }], name: 'allowance', outputs: [{ name: 'remaining', type: 'uint256' }], payable: false, type: 'function',
}, { inputs: [{ name: '_initialAmount', type: 'uint256' }, { name: '_tokenName', type: 'string' }, { name: '_decimalUnits', type: 'uint8' }, { name: '_tokenSymbol', type: 'string' }], payable: false, type: 'constructor' }, { payable: false, type: 'fallback' }, {
  anonymous: false, inputs: [{ indexed: true, name: '_from', type: 'address' }, { indexed: true, name: '_to', type: 'address' }, { indexed: false, name: '_value', type: 'uint256' }], name: 'Transfer', type: 'event',
}, {
  anonymous: false, inputs: [{ indexed: true, name: '_owner', type: 'address' }, { indexed: true, name: '_spender', type: 'address' }, { indexed: false, name: '_value', type: 'uint256' }], name: 'Approval', type: 'event',
}]

const tokenlab = new web3.eth.Contract(ABI, '0xa887adb722cf15bc1efe3c6a5d879e0482e8d197')
const pex = new web3.eth.Contract(ABI, '0x0cc6177ea69b0f1c2415043ac81ccd8f77d0c1a9')

async function main() {
  const latestBlock = await web3.eth.getBlock('latest')
  console.log('Initial Parsing')
  // await getMissingBlocks(2108382, 2108389)
  console.log('Getting Balance')
  await updateBalances()
  console.log('Get all balance succes')
}

// main()

async function getMissingBlocks(fromBlock, toBlock) {
  console.log(`Start parsing from ${fromBlock} to ${toBlock}`)
  for (let i = fromBlock + 1; i < toBlock; i++) {
    const data = await web3.eth.getBlock(i)
    try {
      const block = await Blocks.create({
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
    if (data.transactions.length != 0) {
      const txs = data.transactions
      const results = []
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
          await Addresses.create({
            address: transaction.to.toLowerCase(),
            last_active: data.timestamp,
          }, { returning: false })
        }
      }
      try {
        await Promise.all(results)
      } catch (e) {
      }
    }
  }
  console.log('Updade Balance In')
  await updateBalances()
}

async function updateBalances() {
  const pexAddr = '0x0cc6177ea69b0f1c2415043ac81ccd8f77d0c1a9'
  const labAddr = '0xa887adb722cf15bc1efe3c6a5d879e0482e8d197'
  const addresses = await Addresses.findAll({ attributes: ['address'] })
  for (const address of addresses) {
    const balance_EXP = await web3.eth.getBalance(address.address)
    const balance_PEX = await getTokenBalance(address.address, pex, pexAddr)
    const balance_LAB = await getTokenBalance(address.address, tokenlab, labAddr)
    await Addresses.update({ balance_EXP: formatDB(balance_EXP), balance_PEX, balance_LAB }, { where: { address: address.address } })
  }
  console.log('Finishing update balances, you can run ./sync.js')
}

// REFACTOR
// Can i move this func to separete file?
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

async function saveContract(hash) {
  const data = await web3.eth.getTransactionReceipt(hash)
  console.log(data)
  try {
    // test variant
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

module.exports = getMissingBlocks
