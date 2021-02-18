const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

// var config = new(require('./config.js'))();

const app = express()

app.set('view engine', 'pug')
app.set('views', 'frontend/views')
app.use(express.static('frontend/public'))

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false,
}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.locals.moment = require('moment')
app.locals.numeral = require('numeral')
app.locals.ethformatter = require('../utils/ethformatter.js').formatAmount
app.locals.formatNumber = require('../utils/ethformatter.js').formatNumber
app.locals.calcFunc = require('../utils/calcFunc.js')
app.locals.check = require('../utils/check.js')
app.locals.hexToString = require('../utils/hexToString.js')
// app.locals.nameformatter = new(require('./utils/nameformatter.js'))(config);
// app.locals.config = config;

app.use('/', require('../routes/index'))
// change to admin/v1 api
app.use('/admin/api', require('../routes/adminApi'))
//
app.use('/block', require('../routes/block'))
app.use('/tx', require('../routes/tx'))
app.use('/account', require('../routes/account'))
app.use('/richlist', require('../routes/richlist'))
app.use('/charts', require('../routes/charts.js'))
app.use('/search', require('../routes/search'))
app.use('/tokens', require('../routes/tokens'))
app.use('/tokenstxs', require('../routes/tokenstxs'))
app.use('/token', require('../routes/token'))
app.use('/v1', require('../routes/v1Api'))
app.use('/apis', require('../routes/publicApi')) // public Api docs page
app.use('/pending', require('../routes/pending'))
app.use('/error', require('../routes/error'))

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

const port = '8081'

app.listen(port, () => {
  console.log(`[WEB] ExpScan is available at http://localhost:${port}`)
  console.log(`[API] Version: v1, path http://localhost:${port}/api/v1/ (soon)`)
})
