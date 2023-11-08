const User = require('../models/user')
const bcrypt = require('bcryptjs')
const passport = require('passport')

exports.account_login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err)
    if (!user) return res.status(401).send()
    req.logIn(user, (err) => {
      if (err) return next(err)
      return res.status(200).send()
    })
  })(req, res, next)
}

exports.account_logout = (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  }

exports.account_signup = async (req, res, next) => {
    const user = await User.findOne({ username: req.body.username }).exec()
    if (!user) {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
            console.error(err); // Log the error for debugging
            return res.status(500).json({ message: "An error occurred during user registration." });
            }
        else {
        const user = new User({
            username: req.body.username,
            password: hashedPassword
        });
        await user.save();
        return res.status(200).json({ message: 'Successful sign up' });
        }});
    }
    else {
      return res.status(409).json({ message: "username already in use"})
    }
  }

exports.is_authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({ username: req.user.username })
  } else {
    return res.status(401).json({ username: 'unathorized' })
  }
}