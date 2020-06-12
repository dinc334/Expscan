var BigNumber = require('bignumber.js');

var Ether = new BigNumber(10e+17);


module.exports = {
	formatAmount: function(amount) {
		var res = new BigNumber(amount.toString());
  	return Number(res.dividedBy(Ether)).toFixed(4) + " EXP";
	},
	formatDB: function(amount) {
		var res = new BigNumber(amount.toString());
  	return Number(res.dividedBy(Ether)).toFixed(4);
	},
	formatNumber: function(number) {
		var res = new Intl.NumberFormat('us-US').format(parseInt(number));
		return res;
	}
}
