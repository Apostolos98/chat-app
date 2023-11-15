const express = require('express')
const router = express.Router()

const messages_controller = require('../controllers/messages_controller')

function ensureAuthentication(req, res, next) {
    if (req.isAuthenticated()) return next()
    else res.status(401).send()
  }

// get all chats
router.get('/chats', ensureAuthentication, messages_controller.list_chats)

// create a new chat
router.post('/chats', ensureAuthentication, messages_controller.new_chat)

// send a message
//router.put('/chats/:id', ensureAuthentication, messages_controller.send_message)

// delete a chat
router.delete('/chats/:id', ensureAuthentication, messages_controller.delete_chat)

// search chatters
router.get('/search-chat', ensureAuthentication, messages_controller.search_chatter)

//router.get('/group-chats')

module.exports = router