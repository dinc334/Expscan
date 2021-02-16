"use strcit"

const Web3 = require('web3')

const { Tokens } = require('../models')

const ABI = require('../data/ABI.json')
const web3 = new Web3()

web3.setProvider(new web3.providers.HttpProvider('http://localhost:9656'))

// short Description
//  - get TotalSupply

const PEX = '0x0cc6177ea69b0f1c2415043ac81ccd8f77d0c1a9'
const LAB = '0xa887adb722cf15bc1efe3c6a5d879e0482e8d197'


async function main(){
	let pex = await getTotalSupply(PEX)
	console.log(pex)
	let lab = await getTotalSupply(LAB)
	console.log(lab)
}

main()


function getTotalSupply(address) {
	return new Promise((resolve, reject) => {
		const token = new web3.eth.Contract(ABI, address)
		web3.eth.call({
			to: address,
			data: token.methods.totalSupply().encodeABI()
		}, (err,result) => {
			if(result) {
				let tokens = web3.utils.toBN(result).toString()
	  		let amount = web3.utils.fromWei(tokens, 'ether')
	  		resolve(Number(amount).toFixed(2))
			} else {
				reject(err)
			}
		})
	})
}
