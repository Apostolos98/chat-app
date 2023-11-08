const User = require('../models/user')
const Chat = require('../models/chat')

exports.list_chats = async (req, res, next) => {
    const user = await User.findOne({ username: req.user.username }).select('chats').populate({
        path: 'chats',
        populate: [
            {path: 'a_chatter', select: 'username -_id'},
            {path: 'b_chatter', select: 'username -_id'}
        ]
    }).exec()
    return res.status(200).json({ all_chats: user.chats })    
}

exports.send_message = async (req, res, next) => {
    const message = req.body.message.value
    const chatId = req.params.id
    try {
        const chat = await Chat.findOne({ _id: chatId}).exec()
        if (chat !== null) {
            const senderId = req.user._id
            chat.messages.push({ sender: senderId, message: message })
            await chat.save()
            return res.status(200).send()
        }
        else {
            throw new Error('chat not found')
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'error saving to database' })
    }
}

exports.new_chat = async (req, res, next) => {
    const message = req.body.message
    const recipientName = req.body.recipient
    let senderId;
    let recipient;

    try {
        if (!message || !recipientName) throw new Error('missing request data')
        senderId = req.user._id
        recipient = await User.findOne({ username: recipientName }).exec()
        if (recipient === null) return res.status(404).json({ message: 'sender or recipient not found'})
    }
    catch (err) {
        return res.status(404).json({ message: 'sender or recipient not found'})
    }
    // checking if chat already exists
    const user = await User.findOne({ username: req.user.username }).select('chats').populate({
        path: 'chats',
        populate: [
            {path: 'a_chatter', select: 'username -_id'},
            {path: 'b_chatter', select: 'username -_id'}
        ]
    }).exec()

    for (let i = 0; i < user.chats.length; i++) {
        if (user.chats[i].a_chatter.username === recipientName || user.chats[i].b_chatter.username === recipientName) {
            return res.status(409).json({ message: 'this chat already exists'})
        }
    }

    try {
        const newChat = new Chat({
            a_chatter: senderId,
            b_chatter: recipient._id,
            messages: [{sender: senderId, message: message}]
        })
        await newChat.save()
        return res.status(201).send()
    }
    catch (err) {
        return res.status(500).json({ message: 'could not save to db'})
    }
}

exports.delete_chat = async (req, res, next) => {
    const chatId = req.params.id
    const deletion = await Chat.deleteOne({ _id: chatId})
    if (deletion.deletedCount !== 1) return res.status(404).json({ message: 'chat not found' })
    else if (deletion.deletedCount === 1) return res.status(204).send()
    else {
        console.log('Error: unexpected error at delete_chat')
        return res.status(500).send()
    }
}

exports.search_chatter = async (req, res, next) => {
    const chatters = await User.find({ username: { $regex: `^${req.body.username}`, $options: 'i' }}).select('username -_id').exec();
    chatters.length > 0 ? res.status(200).json({ chatters: chatters }) : res.status(404).send()   
}