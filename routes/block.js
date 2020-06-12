"use strict";

const express = require('express');
const router = express.Router();

const { Blocks, Transactions } = require('../models');


router.get('/:block', async (req, res) => {
  let findBlock = req.params.block;
  let blockData = await Blocks.findOne({where: {number : findBlock}})
  
  let transactions = await Transactions.findAll({where: {blockNumber : findBlock}});
  
  return res.render('block', { 
    block: blockData, 
    transactions,
    blockNumber: findBlock
  });
});

module.exports = router;
