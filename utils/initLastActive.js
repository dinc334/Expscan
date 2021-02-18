const { Addresses, Transactions } = require('../models')

// need to update last_active
async function initLastActive() {
  const addresses = await Addresses.findAll({
    where: { balance_EXP: { $ne: null }, balance_EXP: { $ne: 0 } },
  })
  for (let i = 0; i < addresses.length; i++) {
  	console.log('Addresses is, ', i)
  	const { address } = addresses[i]
  	try {
  		// get lastes tx
  		var latestTx = await Transactions.findAll({
  			limit: 1,
  			order: [['timestamp', 'DESC']],
  		 	where: { to: address },
  		 })
  	} catch (e) {
  		console.error(e)
  	}
  	if (latestTx[0]) {
  		try {
  			await Addresses.update({
  				last_active: latestTx[0].timestamp,
  			}, { where: { address } })
  		} catch (e) {
  			console.error(e)
  		}
  	}
  }
}

initLastActive()
