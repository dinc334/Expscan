const express = require('express')

const router = express.Router()

router.post('/', (req, res, next) => {
  let searchString = req.body.search.trim().toLowerCase()
  if (searchString.length > 22 && searchString.substr(0, 2) != '0x') { searchString = `0x${searchString}` }
  if (searchString.length === 2) {
    return next({ message: 'Error: Invalid search string!' })
  } if (searchString.length < 22 && parseInt(searchString)) {
    res.redirect(`/block/${searchString}`)
  } else if (searchString.length == 66) {
    res.redirect(`/tx/${searchString}`)
  } else if (searchString.length == 42) {
    res.redirect(`/account/${searchString}`)
  } else {
    return res.redirect('error')
  }
})

module.exports = router
