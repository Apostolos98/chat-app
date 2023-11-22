require("dotenv").config()
const express = require("express")
const path = require("path")
const passport = require("passport")
const session = require("express-session")
const LocalStrategy = require("passport-local")
const bcrypt = require("bcryptjs")
const app = express();
const { Server } = require('socket.io')

const port = process.env.PORT || 3000;

const User = require("./models/user")
const Chat = require("./models/chat")
const indexRouter = require("./routes/index")
const accountRouter = require("./routes/account")
const messagesRouter = require("./routes/messages")
const allConnectedIds = []

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

connectDB().catch((err) => console.error('Error:', err));

async function connectDB() {
  // Log before attempting the MongoDB connection
  console.log('Connecting to MongoDB...');
  let uri;
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') uri = process.env.MONGO
  else if (process.env.NODE_ENV === 'test') uri = process.env.TESTMONGODB
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    // Rest of your code here
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

const sessionMiddleware = session({ secret: process.env.SECRET, resave: false, saveUninitialized: true })

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
app.use(express.json());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      };
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        // passwords do not match!
        return done(null, false, { message: "Incorrect password" })
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    };
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  };
});

app.use("/", indexRouter)
app.use("/account", accountRouter)
app.use("/messages", messagesRouter)

const io = new Server(app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
}));


// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error('unauthorized'))
  }
});


io.on('connection', (socket) => {
  const socketStringId = socket.request.user._id.toString()
  socket.join(socketStringId)

  async function onConnect() {
    // transmiting the user as a connected user to his friends
    let user;
    try {
      user = await User.findOne({ _id: socket.request.user._id }).select('chats').populate('chats').exec()
      for (let chat of user.chats) {
        if (chat.a_chatter._id.toString() === socketStringId) socket.to(chat.b_chatter._id.toString()).emit('user connected', socket.request.user._id)
        else socket.to(chat.a_chatter._id.toString()).emit('user connected', socket.request.user._id)
      }
      allConnectedIds.push(user._id.toString())
    } 
    catch (err) {
      console.log(err)
    }
  }
  onConnect()

  socket.onAny((event, ...args) => {
    console.log(event, args);
  });

  socket.on('send connected friends', async () => {
    const connectedFriends = []
    const user = await User.findOne({ _id: socketStringId }).select('chats').populate('chats').exec()
    for (let chat of user.chats) {
      const a_chatterString = chat.a_chatter._id.toString()
      const b_chatterString = chat.b_chatter._id.toString()
      // server sends the id of chat as a way to show that the friend in the chat is online for conveniance iterating on client
      if (allConnectedIds.includes(a_chatterString) && a_chatterString !== socketStringId) connectedFriends.push(chat._id)
      else if (allConnectedIds.includes(b_chatterString) && b_chatterString !== socketStringId) connectedFriends.push(chat._id)
    }
    socket.emit('connected friends', connectedFriends)
  })

  socket.on('disconnect', async () => {
    try {
      const user = await User.findOne({ _id: socket.request.user._id }).select('chats').populate('chats').exec()
      for (let chat of user.chats) {
        if (chat.a_chatter._id.toString() === socketStringId) socket.to(chat.b_chatter._id.toString()).emit('user disconnected', socket.request.user._id)
        else socket.to(chat.a_chatter._id.toString()).emit('user disconnected', socket.request.user._id)
      }
      allConnectedIds.splice(allConnectedIds.indexOf(user._id.toString()), 1) // deleting user from connected list
    } 
    catch (err) {
      console.log(err)
    }
  })

  socket.on('send message', async (msg, chatId, recId, chatInd, callback) => {
    const sender = socket.request.user._id
    try {
      const chat = await Chat.findOne({ $and: [{ _id: chatId }, { $or: [{ a_chatter: sender }, { b_chatter: sender }]}]}).exec()
      if (chat !== null && (chat.a_chatter._id.toString() === recId || chat.b_chatter._id.toString() === recId)) {
          chat.messages.push({ sender: sender, message: msg })
          if (chat.a_chatter._id === sender) {
            chat.a_chatter_read_index = chat.messages.length - 1
          }
          else {
            chat.b_chatter_read_index = chat.messages.length - 1
          }
          await chat.save()
          socket.to(recId).emit('recieve message', msg, chatId, sender)
          socket.to(socketStringId).emit('message saved')
          callback(null, true, chatInd)
      }
      else {
          throw new Error('chat not found')
      }
    }
    catch (err) {
        console.log(err)
        callback(true, false, chatInd)
    }
  })

  socket.on('message read', async (chatId, senderId) => {
    try {
      const chat = await Chat.findOne({ _id: chatId })
      if (chat.a_chatter._id.toString() === socket.request.user._id.toString()) {
        chat.a_chatter_read_index = chat.messages.length - 1
      }
      else {
        chat.b_chatter_read_index = chat.messages.length - 1
      }
      await chat.save()
      socket.to(senderId).emit('friend read message', chatId)
    }
    catch (err) {
      console.log(err)
    }
  })
});

module.exports = app;