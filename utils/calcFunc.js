"use strict";

const TimeAgo = require("javascript-time-ago");
const en = require('javascript-time-ago/locale/en');
const moment = require('moment');

TimeAgo.locale(en);

var calcFunc = {
	calcDate: function calcDate(date){
		var data = moment(date*1000);
		return data.fromNow();
	},
	calcPercent: function calcPercent(amount,total_supply){
		let percent = amount/total_supply*100;
		return Number(percent).toFixed(5);
	},
}

module.exports = calcFunc;