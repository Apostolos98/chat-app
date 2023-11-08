require('dotenv').config()
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const User = require('./models/user')
const Chat = require('./models/chat')

const userArr = []

main().catch((err) => console.log(err))

async function main() {
    console.log('about to connect')
    mongoose.connect(process.env.TESTMONGODB)
    console.log('connected to mongodb')
    await users()
    console.log('created users')
    await createChat()
    console.log('chat created')
    mongoose.connection.close()
    console.log('disconnected from mongodb')
}

function chats() {

}

async function createChat() {
    const chat = new Chat({ a_chatter: userArr[0]._id, b_chatter: userArr[1]._id, messages: [] })
    chat.messages.push({sender: userArr[0]._id, message: 'hello'})
    chat.messages.push({sender: userArr[1]._id, message: 'hello back'})
    await chat.save()
    userArr[0].chats.push(chat._id)
    await userArr[0].save()
    userArr[1].chats.push(chat._id)
    await userArr[1].save()
}

async function users() {
    await createUser('asd', 'asd')
    await createUser('qwe', 'qwe')
    await createUser('zxc', 'zxc')
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