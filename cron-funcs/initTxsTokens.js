const Web3 = require('web3')

const { TxsTokens } = require('../models')

const web3 = new Web3()
const CONFIG = require('../config/config-server.json')

web3.setProvider(new web3.providers.HttpProvider(CONFIG.web3Http))

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
const icoABI = [{
  constant: false, inputs: [{ name: '_owner', type: 'address' }, { name: '_spender', type: 'address' }], name: 'getAllowance', outputs: [{ name: 'remaining', type: 'uint256' }], payable: false, stateMutability: 'nonpayable', type: 'function',
}, {
  constant: true, inputs: [], name: 'totalSupply', outputs: [{ name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function',
}, {
  constant: true, inputs: [{ name: '', type: 'address' }], name: 'balances', outputs: [{ name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function',
}, {
  constant: false, inputs: [{ name: '_val', type: 'uint256' }], name: 'decTotalSupply', outputs: [{ name: 'success', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function',
}, {
  constant: false, inputs: [], name: 'kill', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
}, {
  constant: false, inputs: [{ name: '_sendTo', type: 'address' }], name: 'empty', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
}, {
  constant: false, inputs: [{ name: '_acct', type: 'address' }, { name: '_val', type: 'uint256' }], name: 'incBalance', outputs: [{ name: 'success', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function',
}, {
  constant: false, inputs: [{ name: '_sender', type: 'address' }, { name: '_spender', type: 'address' }, { name: '_value', type: 'uint256' }], name: 'setApprove', outputs: [{ name: 'success', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function',
}, {
  constant: true, inputs: [{ name: '', type: 'address' }], name: 'modules', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'view', type: 'function',
}, {
  constant: false, inputs: [{ name: '_acct', type: 'address' }, { name: '_val', type: 'uint256' }], name: 'decBalance', outputs: [{ name: 'success', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function',
}, {
  constant: false, inputs: [{ name: '_acct', type: 'address' }, { name: '_set', type: 'bool' }], name: 'setModule', outputs: [{ name: 'success', type: 'bool' }, { name: 'module', type: 'address' }, { name: 'set', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function',
}, {
  constant: false, inputs: [{ name: '_acct', type: 'address' }], name: 'getModule', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function',
}, {
  constant: false, inputs: [{ name: '_newOwner', type: 'address' }], name: 'transferRoot', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
}, {
  constant: false, inputs: [], name: 'getTotalSupply', outputs: [{ name: '', type: 'uint256' }], payable: false, stateMutability: 'nonpayable', type: 'function',
}, {
  constant: true, inputs: [], name: 'root', outputs: [{ name: '', type: 'address' }], payable: false, stateMutability: 'view', type: 'function',
}, {
  constant: false, inputs: [{ name: '_val', type: 'uint256' }], name: 'incTotalSupply', outputs: [{ name: 'success', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function',
}, {
  constant: false, inputs: [{ name: '_acct', type: 'address' }], name: 'getBalance', outputs: [{ name: 'balance', type: 'uint256' }], payable: false, stateMutability: 'nonpayable', type: 'function',
}, {
  constant: false, inputs: [{ name: '_from', type: 'address' }, { name: '_spender', type: 'address' }, { name: '_value', type: 'uint256' }], name: 'decApprove', outputs: [{ name: 'success', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function',
}, {
  inputs: [{ name: '_owner', type: 'address' }, { name: '_supply', type: 'uint256' }], payable: false, stateMutability: 'nonpayable', type: 'constructor',
}, {
  anonymous: false, inputs: [{ indexed: true, name: 'Module', type: 'address' }, { indexed: true, name: 'Account', type: 'address' }, { indexed: false, name: 'Amount', type: 'uint256' }, { indexed: false, name: 'Polarity', type: 'string' }], name: 'BalanceAdj', type: 'event',
}, {
  anonymous: false, inputs: [{ indexed: true, name: 'Module', type: 'address' }, { indexed: true, name: 'Set', type: 'bool' }], name: 'ModuleSet', type: 'event',
}]

const LAB = {
  name: 'LAB',
  address: '0xa887adb722cf15bc1efe3c6a5d879e0482e8d197',
  first: 800000,
}
const PEX = {
  name: 'PEX',
  address: '0x0cc6177ea69b0f1c2415043ac81ccd8f77d0c1a9',
  first: 1200000,
}
const BalanceAdj = '0x9c3ef85668f064ed75a707a9fef00ed55bab01f5'

// first LAB transfer -  836852
// first PEX transfer - 1202945

async function initTxsTokens() {
  const pexData = await getAllTransfers(ABI, PEX)
  console.log('Pex txs', pexData.length)
  const labData = await getAllTransfers(ABI, LAB)
  console.log('Lab txs', labData.length)
  const icoData = await getIcoTransfers()
  console.log('Ico txs', icoData.length)
  const dbData = labData.concat(pexData)
  const latest = dbData.concat(icoData)
  try {
    await TxsTokens.bulkCreate(latest)
    console.log('All Token Transfers Saved')
  } catch (e) {
    console.error(e)
  }
}

initTxsTokens()

async function getAllTransfers(abi, token) {
  const allTxs = []
  const tokenName = new web3.eth.Contract(abi, token.address)
  const allTransfers = await tokenName.getPastEvents('Transfer', {
    fromBlock: token.first,
    toBlock: 'latest',
  })
  for (const tx of allTransfers) {
    const txTime = await web3.eth.getBlock(tx.blockNumber)
    const transfer = {
      blockHash: tx.blockHash,
      blockNumber: tx.blockNumber,
      from: tx.returnValues._from.toLowerCase(),
      to: tx.returnValues._to.toLowerCase(),
      value: Number(tx.returnValues._value) / Math.pow(10, 18),
      hash: tx.transactionHash,
      timestamp: txTime.timestamp,
      token: token.name,
    }
    allTxs.push(transfer)
  }
  return allTxs
}

async function getIcoTransfers() {
  const labIco = new web3.eth.Contract(icoABI, BalanceAdj)
  const balanceAdj = await labIco.getPastEvents('BalanceAdj', {
    fromBlock: 750000,
    toBlock: 'latest',
  })
  const balancePlus = []
  const balanceMinus = []
  for (const tx of balanceAdj) {
    const txTime = await web3.eth.getBlock(tx.blockNumber)
    const value = tx.returnValues.Amount / Math.pow(10, 18)

    if (tx.returnValues.Polarity == '+' && value > 1) {
      balancePlus.push({
        blockHash: tx.blockHash,
        blockNumber: tx.blockNumber,
        from: '0x9c3ef85668f064ed75a707a9fef00ed55bab01f5',
        to: tx.returnValues.Account.toLowerCase(),
        value,
        hash: tx.transactionHash,
        token: 'LAB',
        timestamp: txTime.timestamp,
      })
    } else if (tx.returnValues.Polarity == '-' && value > 1) {
      balanceMinus.push(tx.transactionHash)
    }
  }
  const icoAdd = balancePlus.filter((item) => balanceMinus.indexOf(item.hash) == -1)
  return icoAdd
}
