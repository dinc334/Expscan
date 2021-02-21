// const moment = require('moment');
const Web3 = require('web3')

const InputDataDecoder = require('ethereum-input-data-decoder')

const {
  Addresses, TokensTxs, Transactions, Prices, Blocks, Tokens, sequelize,
} = require('../models')

// const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:9657'));
const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider('http://localhost:9656'))

const web3Http = new Web3('http://localhost:9656')

const code = '0xa9059cbb000000000000000000000000a5b7cb218c6fa7e95383e0e12edacc601da5c0a0000000000000000000000000000000000000000000000000016345785d8a0000'
const code1 = '0x000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000012d00000000000000000000000000000000000000000000000000000000000000'
const decoder = new InputDataDecoder(ABI)
const test1 = '0xa9059cbb00000000000000000000000034c8df287b39b41d8339460374d7af34d70aee5c000000000000000000000000000000000000000000000000000009184e72a000'

// async function main() {
//   const page = 1
//   const address1 = '0xbab463743603a253bdf1f84975b1a9517505ae05'
//   const address = '0xb3200fb7bf681948623995357ebde1a47253f82a'
//   try {
//     console.time('AllTxs')
//     var transactions = await Transactions.findAll({
//       where: { $or: [{ from: address }, { to: address }] },
//       order: [['blockNumber', 'DESC']],
//       limit: 100,
//       offset: ((100 * page) - 100),
//     })
//     console.timeEnd('AllTxs')
//   } catch (e) {
//     console.error(e)
//   }
//   console.log(transactions.length)
// }
// main()

async function small() {
  const block = await web3.eth.getBlock('latest')
  console.log(block)
}
small()

// EXPLAIN SELECT * FROM blocks WHERE MINER = '0x6dbfe39370adc9e0f284ed4fd8025342e99d21d6' ORDER BY NUMBER desc LIMIT 100;
// const result = decoder.decodeData(bug2);
// console.log(result)
// //console.log(result)

// let value = result.inputs[1]
// console.log(web3.utils.fromWei(value,'ether'));

// Balances address = '0x9c3ef85668f064ed75a707a9fef00ed55bab01f5'
// Tokenlab address = '0xa887adb722cf15bc1efe3c6a5d879e0482e8d197'
// Pex address = '0x0cc6177ea69b0f1c2415043ac81ccd8f77d0c1a9'

// toknalab new acc
// email - karinalol854@gmail.com
// pass - poloniex@fuckG1

// Tokenlab Events
// ModuleSet
// BalanceAdj

// BalanceAdj - 9328
// Tokenlab Transfer - 2575, but must be 4664, i think the rest is ICO txs

// Polyarity block - 1769540

// 1554558709
// 1512729221
//   var today = new Date();
//     var date1 = new Date($('#d1').val() + " " + $('#t1').val()).getTime();
//     var date2 = new Date($('#d2').val() + " " + $('#t2').val()).getTime();
//     append(dl, "Interval ", " from: " + $('#d1').val() + " " + $('#t1').val() + " to: " + $('#d2').val() + " " + $('#t2').val());
//     var msec = date2 - date1;
//     var mins = Math.floor(msec / 60000);
//     var hrs = Math.floor(mins / 60);
//     var days = Math.floor(hrs / 24);
//     var yrs = Math.floor(days / 365);
//     append(dl, "In minutes: ", mins + " minutes");
//     mins = mins % 60;
//     append(dl, "In hours: ", hrs + " hours, " + mins + " minutes");
//     hrs = hrs % 24;
//     append(dl, "In days: ", days + " days, " + hrs + " hours, " + mins + " minutes");
//     //days=days%365;
//     //append(dl,"In years: ",yrs + " years " + days + " days ");

// GXP = 0x29a828f7D34769Ae5d788BBbe505fA5B2AbADF06

// async function main() {
//   let plus = []
// 	const tokenlab = new web3.eth.Contract(ABI, '0x29a828f7D34769Ae5d788BBbe505fA5B2AbADF06');
// 	let allEvents = await tokenlab.getPastEvents('Transfer', {
// 		fromBlock: 700000,
// 		toBlock: 'latest'
// 	})
// 	for(let event of allEvents) {
// 		if(event.returnValues.Polarity == '-') {
// 			plus.push(event)
// 		}
// 	}
// 	console.log(plus.length)
// 	console.log(allEvents.length)

// }

// main()
// from 700k - 10697
// get all Toknelab Tranfers
async function getAllTokenTransfers(abi, address) {
  console.time('Time')
  const tokenName = new web3.eth.Contract(abi, address)
  const allTransfers = await tokenName.getPastEvents('Transfer', {
    fromBlock: 800000,
    toBlock: 'latest',
  })
  for (const tranfer of allTransfers) {
    console.log(tranfer)
  }
  console.log('All tranfers: ', allTransfers.length)
  console.timeEnd('Time')
}

// get pending txs
function getPengingTxs() {
  const subscription = web3.eth.subscribe('pendingTransactions')
  subscription.subscribe((error, resilt) => {
    if (error) console.log(error)
  }).on('data', async (txHash) => {
    const tx = await web3Http.eth.getTransaction(txHash)
  })
  subscription.unsubscribe((error, success) => {
    if (success) { console.log('Successfully unsubscribed!') }
  })
}

// latest BalanceAdj
// hash - 0xd33a77686aaa35fa8005eb8bfbbbfc3a7dcc4e84d444ea40f5e617fdfb68097a
// data - 0xa9059cbb000000000000000000000000a5b7cb218c6fa7e95383e0e12edacc601da5c0a0000000000000000000000000000000000000000000000000016345785d8a0000

// latest Transfer
// hash - 0xd8b6e210ef213bd8ece5b728d315e950273ed9a0be5b3246d030a782bb5898b0
// data - 0xa9059cbb000000000000000000000000db364d087314431849d83d56a0f05a530ef2737a0000000000000000000000000000000000000000000000008ac7230489e80000

// getAllTokenTransfers(ABI,'0xa887adb722cf15bc1efe3c6a5d879e0482e8d197')

// web3.eth.getTransaction('0xd33a77686aaa35fa8005eb8bfbbbfc3a7dcc4e84d444ea40f5e617fdfb68097a').then(result => {
// 	console.log(result)
// })

// Адрес контракта формируется на основе нонс + адрес отправителя
// tx hash0x88198d5bdc5eecde11f14a5504f28ae642db07f017f37a38fa087bcf23a7e759

// All transfers
// LAB
// 0xa9059cbb0000000000000000000000001558c143a809d5da4592327ffd22cf193cbe40eb00000000000000000000000000000000000000000000000006f05b59d3b20000
// 0xa9059cbb0000000000000000000000001fedba1b3e340996793d15b3287c4c885b0ef2040000000000000000000000000000000000000000000000056bc75e2d63100000
// 0xa9059cbb0000000000000000000000001558c143a809d5da4592327ffd22cf193cbe40eb00000000000000000000000000000000000000000000000006f05b59d3b20000

// PEX
// 0xa9059cbb0000000000000000000000003f59737e11b4508681520c4ba851e740f578c565000000000000000000000000000000000000000000000197636569b311551240
// 0xa9059cbb0000000000000000000000002d0be13dfd5de32cf499bc975eb69513cb9f3db6000000000000000000000000000000000000000000000020571122babaa1f160
// 0xa9059cbb0000000000000000000000007fdf56f5a9b5da25f64658e98b976a46a0fc33910000000000000000000000000000000000000000000000008ac7230489e80000
// a9059cbb - hash of "transfer(address,uint256)"
// 10 pex
// 0xa9059cbb0000000000000000000000007fdf56f5a9b5da25f64658e98b976a46a0fc33910000000000000000000000000000000000000000000000008ac7230489e80000

// 0x23b872dd000000000000000000000000fccc22de55bacc399d641a2b08035e87e9e35b0d00000000000000000000000000cc7f1cb64f1188fc7fbc5895baecc7f14f28860000000000000000000000000000000000000000000000000000000000000064
// 0x23b872dd000000000000000000000000866cffa1ff2738fca4c8aadc54c2e79d3f63114100000000000000000000000000cc7f1cb64f1188fc7fbc5895baecc7f14f28860000000000000000000000000000000000000000000000000000000000000064
