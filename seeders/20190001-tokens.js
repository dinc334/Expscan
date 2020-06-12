"use strict";

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert('tokens', [{
			ticker: 'EXP',
			name: 'Expanse',
			website: 'https://expanse.tech',
			description: 'Expanse.Tech™ was created as the first stable fork of Ethereum by one of the earliest blockchain developers and cryptocurrency entrepreneurs out there, Christopher Franko.',
			bitcointalk: 'https://bitcointalk.org/index.php?topic=1173722.0',
			decimals: 18,
			type: 'coin',
			cmc: 'https://coinmarketcap.com/currencies/expanse/',
			twitter: 'https://twitter.com/ExpanseOfficial'
		},{
			ticker: 'LAB',
			name: 'Tokenlab',
			website: 'https://tokenlab.io',
			description: 'Tokenlab is an ICO- and smart-contract-management platform that aims to simplify the life cycle of an ICO.',
			bitcointalk: 'https://bitcointalk.org/index.php?topic=2153185.0',
			decimals: 18,
			type: 'ERC-644',
			// whitepaper: 'http://www.borderlesscorp.com/docs/tokenlab-whitepaper.pdf',
			cmc: 'https://coinmarketcap.com/currencies/tokenlab/',
			twitter: 'https://twitter.com/TokenlabIO',
			address: '0xa887adb722cf15bc1efe3c6a5d879e0482e8d197',
			totalSupply: 15694112.07
		},{
			ticker: 'PEX',
			name: 'EXPex',
			website: 'http://expex.io',
			description: 'EXPEX is the new decentralized exchange powered by Expanse.',
			decimals: 18,
			type: 'ERC-644',
			cmc: 'https://coinmarketcap.com/currencies/expex/',
			address: '0x0cc6177ea69b0f1c2415043ac81ccd8f77d0c1a9',
			totalSupply: 1000000000.00
		}])
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete('tokens',null, {})
	} 
}