const express = require('express')

const router = express.Router()

const { Blocks, Transactions } = require('../models')

router.get('/:block', async (req, res) => {
  const findBlock = req.params.block
  const blockData = await Blocks.findOne({ where: { number: findBlock } })

  const transactions = await Transactions.findAll({ where: { blockNumber: findBlock } })

  return res.render('block', {
    block: blockData,
    transactions,
    blockNumber: findBlock,
  })
})

module.exports = router
