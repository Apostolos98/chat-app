const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')

const account_controller = require('../controllers/account_controller')

router.post('/sign-up', [
    check('username').escape(),
    check('password').escape(),
    check('confirmPass').escape()
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next()
} 
, account_controller.account_signup)

router.post('/log-in', [
    check('username').escape(),
    check('password').escape()
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next()
}, account_controller.account_login)

router.get('/log-out', account_controller.account_logout)

router.get('/is-authenticated', account_controller.is_authenticated)

module.exports = router