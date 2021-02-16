const cron = require('node-cron')
const sendNotification = require('../utils/telegramBot')

const {
  Tokens, TxsTokens, Addresses, sequelize,
} = require('../models')

async function getTransferAndHolders() {
  const pexTxs = await TxsTokens.count({ where: { token: 'PEX' } })
  const labTxs = await TxsTokens.count({ where: { token: 'LAB' } })
  const pexHolders = await Addresses.count({
  	where: { balance_PEX: { $ne: null }, balance_PEX: { $ne: 0 } },
  })

  const labHolders = await Addresses.count({
  	where: { balance_LAB: { $ne: null }, balance_LAB: { $ne: 0 } },
  })
  try {
	  await Tokens.update({
	  	transfers: pexTxs,
	  	holders: pexHolders,
	  }, { where: { ticker: 'PEX' } })
	  await Tokens.update({
	  	transfers: labTxs,
	  	holders: labHolders,
	  }, { where: { ticker: 'LAB' } })
  } catch (e) {
    sendNotification('Error in initUpdate_TokensHolders')
  	console.error(e)
  }
  console.log('Update Holders and Transfers in Tokens')
}
getTransferAndHolders() // init

cron.schedule('0 0 */1 * * *', async () => {
  await getTransferAndHolders()
})
