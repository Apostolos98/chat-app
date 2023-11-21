const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ChatScehma = new Schema({
    a_chatter: {type: Schema.Types.ObjectId, ref: 'User'},
    b_chatter: {type: Schema.Types.ObjectId, ref: 'User'},
    messages:[{
        sender: {type: Schema.Types.ObjectId, ref: 'User'},
        message: {type: String, required: true},
        _id: false
    }],
    a_chatter_read_index: { type: Number },
    b_chatter_read_index: { type: Number }
})

module.exports = mongoose.model('Chat', ChatScehma)