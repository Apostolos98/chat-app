const express = require('express')
const router = express.Router()

const account_controller = require('../controllers/account_controller')

router.post('/sign-up', account_controller.account_signup)

router.post('/log-in', account_controller.account_login)

router.get('/log-out', account_controller.account_logout)

router.get('/is-authenticated', account_controller.is_authenticated)

module.exports = router