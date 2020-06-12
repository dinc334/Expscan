"use strict";

const express = require('express');
const router = express.Router();

const { Addresses, Tokens } = require('../models');

router.get('/', async (req, res) => {
  let id = 1;
  let page = req.query.p || 1;
  page = Number(page);
  if(page !== 1) id+=(page*100)-100;

  const count = await Addresses.count({
    where: { balance_EXP: {$ne: null}, balance_EXP: {$ne: 0}}
  });

  const addresses = await Addresses.findAll({
    where:  { balance_EXP: {$ne: null}, balance_EXP: {$ne: 0}},
    order: [['balance_EXP','DESC']],
    offset: ((100*page)-100),
    limit: 100
  });

  if(count > 1000) {
    var limit = Math.floor(count/1000)*10;
  } else {
    var limit = 1;
  }
  if(page > limit) return res.redirect("/error");

  const { totalSupply } = await Tokens.findOne({
    where: {ticker: 'EXP'}
  });
  return res.render('richlist', {
    page,
    count,
    addresses : addresses, 
    exp: true, 
    totalSupply,
    id
  })
});

router.get('/tokenlab', async (req,res) => {
  let id = 1;
  let page = req.query.p || 1;
  page = Number(page);
  if(page !== 1) id+=(page*100)-100;


  const count = await Addresses.count({
    where: { balance_LAB: {$ne: null}, balance_LAB: {$ne: 0}}
  });

  const addresses = await Addresses.findAll({
    where: { balance_LAB: {$ne: null}, balance_LAB: {$ne: 0}},
    order: [['balance_LAB','DESC']],
    offset: ((100*page)-100),
    limit: 100
  });
  // based on count calc limit
  if(count > 1000) {
    var limit = Math.floor(count/1000)*10;
  } else {
    var limit = 1;
  }
  if(page > limit) return res.redirect("/error");

  const { totalSupply } = await Tokens.findOne({
    where: { ticker : 'LAB'}
  });
  return res.render('richlist', {
    count,
    page,
    addresses : addresses, 
    lab : true, 
    totalSupply,
    id
  });
})

router.get('/expex', async (req,res) => {
  let id = 1;
  let page = req.query.p || 1;
  page = Number(page);
  if(page !== 1) id+=(page*100)-100;

  const count = await Addresses.count({
    where: { balance_PEX: {$ne: null}, balance_PEX: {$ne: 0}}
  });

  const addresses = await Addresses.findAll({
    where: { balance_PEX: {$ne: null}, balance_PEX: {$ne: 0}},
    order: [['balance_PEX','DESC']],
    offset: ((100*page)-100),
    limit: 100
  });
  if(count > 1000) {
    var limit = Math.floor(count/1000)*10;
  } else {
    var limit = 1;
  }
  if(page > limit) return res.redirect("/error");

  const { totalSupply } = await Tokens.findOne({
    where: {ticker : 'PEX'}
  });
  return res.render('richlist', {
    count,
    page,
    addresses : addresses, 
    pex : true, 
    totalSupply,
    id
  });
})

module.exports = router;
