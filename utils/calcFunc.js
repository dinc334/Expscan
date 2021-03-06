const TimeAgo = require('javascript-time-ago')
const en = require('javascript-time-ago/locale/en')
const moment = require('moment')

TimeAgo.locale(en)

const calcFunc = {
  caclGas: (gas, gasLimit) => (gas * gasLimit) / 10 ** 9,
  calcDate: function calcDate(date) {
    const data = moment(date * 1000)
    return data.fromNow()
  },
  calcPercent: function calcPercent(amount, totalSupply) {
    const percent = (Number(amount) / (Number(totalSupply))) * 100
    return Number(percent).toFixed(5)
  },
}

module.exports = calcFunc
