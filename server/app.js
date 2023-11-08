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
const indexRouter = require("./routes/index")
const accountRouter = require("./routes/account")
const messagesRouter = require("./routes/messages")

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

app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: true }));
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

io.on('connection', (socket) => {
  console.log('a user connected');
});

module.exports = app;