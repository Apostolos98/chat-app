require('dotenv').config()
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const User = require('./models/user')
const Chat = require('./models/chat')

const userArr = []

main().catch((err) => console.log(err))

async function main() {
    console.log('about to connect')
    mongoose.connect(process.env.MONGO)
    console.log('connected to mongodb')
    await users()
    console.log('created users')
    await createChat(userArr[0], userArr[1])
    await createChat(userArr[2], userArr[0])
    console.log('chat created')
    mongoose.connection.close()
    console.log('disconnected from mongodb')
}

function chats() {

}

async function createChat(user1, user2) {
    const chat = new Chat({ a_chatter: user1._id, b_chatter: user2._id, messages: [] })
    chat.messages.push({sender: user1._id, message: 'hello'})
    chat.messages.push({sender: user2._id, message: 'hello back'})
    chat.a_chatter_read_index = 1
    chat.b_chatter_read_index = 1
    await chat.save()
    user1.chats.push(chat._id)
    await user1.save()
    user2.chats.push(chat._id)
    await user2.save()
}

async function users() {
    await createUser('Asdasd12', 'asd')
    await createUser('Asdasd12', 'qwe')
    await createUser('Asdasd12', 'zxc')
}

function createUser(pass, name) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(pass, 10, function(err, hash) {
            if (err) {
                console.log('error hashing')
                reject(err)
            } else {
                const user = new User({
                    username: name,
                    password: hash
                })
                userArr.push(user)
                user.save().then(() => resolve()).catch((err) => reject(err))
            }
        })
    })
}