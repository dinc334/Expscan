const express = require('express')

const router = express.Router()

const { TokensTxs } = require('../models')

router.get('/', async (req, res) => {
  let page = req.query.p || 1
  page = Number(page)

  const numberOfTxs = await TokensTxs.count()

  const limit = Math.round(numberOfTxs / 1000) * 10
  if (page > limit) return res.redirect('/error')

  const tokensTxs = await TokensTxs.findAll({
    limit: 100,
    order: [['timestamp', 'DESC']],
    offset: ((100 * page) - 100),
  })

  if (!page) page = 0
  return res.render('tokenstxs', {
    page,
    numberOfTxs,
    tokensTxs,
  })
})

module.exports = router
