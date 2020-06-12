"use strict";

const express = require('express');
const router = express.Router();

// page with charts
router.get('/', async (req,res) => {
	return res.render('charts')
})

module.exports = router;
