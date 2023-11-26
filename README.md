# Project Chat

## ⚠️ Warnings:
1. **Inactive State Delay**: Using Render's free tier, the site may initially be in an inactive state, so it may take about 15 seconds to start.
2. **Websocket Inactivity**: Render will inactivate websocket connections in 5 minutes for the free tier. A page reload is needed if a user stays longer than that.
3. **Site in development**: The website and the codebase is in development

## 🛠️ Built With:
- React
- Vite
- Express
- Socket.io
- Mongoose
- Passport
- Passport-Local
- Cookie-Session
- Bcryptjs
- Dotenv
- Express-Validator

## 🎯 Features:
The site offers the following features:
1. User Authentication
2. Private messaging between users
3. Live status of friends
4. Search for new people
5. Message status (saved to the database and read by friend)
6. New message notifications in the sidebar when chatting with another friend

## 📝 Notes: 
- A user has read a message when they select or have already selected a specific chat, so even if they are online the message is not automatically read.
- Since the intent of showing when a recipient of a message has received it, is to show that they can read it even without an internet connection, this feature was considered but dropped due to the fact this app is a web-based app and this feature is not possible.

## 🌐 Live Site: 
https://project-chat-77kv.onrender.com
