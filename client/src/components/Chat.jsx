import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import styles from "../styles/Chat.module.css"
import { produce } from 'immer'

export default function Chat({ username, socket, isMobile, setLogged}) {
    const [chats, setChats] = useState(null)
    const [chat, setChat] = useState(isMobile ? null : 0)
    const [page, setPage] = useState(0) // for mobile
    const [firstTime, setFirst] = useState(true)
    const chatDiv = useRef();
    const chatRef = useRef(chat)

    useEffect(() => {
        fetch('/messages/chats')
        .then((res) => res.json())
        .then((data) => {
            for (let [ind, singleChat] of data.all_chats.entries()) {
                singleChat.status = 'offline'
                singleChat.saved = 'ok'
                if (singleChat.a_chatter.username === username) {
                    if (ind === chat && singleChat.a_chatter_read_index < singleChat.messages.length - 1) {
                        singleChat.a_chatter_read_index = singleChat.messages.length - 1
                        socket.emit('message read', singleChat._id, singleChat.b_chatter._id)
                    }
                }
                else {
                    if (ind === chat && singleChat.b_chatter_read_index < singleChat.messages.length - 1) {
                        singleChat.b_chatter_read_index = singleChat.messages.length - 1
                        socket.emit('message read', singleChat._id, singleChat.a_chatter._id)
                    }
                }
            }
            setChats(data)
        })
        .catch((err) => console.log(err))
    }, [])

    useEffect(() => {
        if (chats !== null && firstTime === true) {
            setFirst(false)
            socket.emit('send connected friends')
        }
    }, [chats])

    useEffect(() => {
        socket.on('recieve message', (msg, chatId, senderId) => {
            setChats((prevChats => {
                const placeholder = {...prevChats}
                for (let i = 0; i < placeholder.all_chats.length; i++) {
                    if (placeholder.all_chats[i]._id === chatId) {
                        placeholder.all_chats[i].messages.push({ sender: senderId, message: msg })
                        if (i === chatRef.current) {
                            socket.emit('message read', chatId, senderId)
                            placeholder.all_chats[i].a_chatter_read_index = placeholder.all_chats[i].messages.length - 1
                            placeholder.all_chats[i].b_chatter_read_index = placeholder.all_chats[i].messages.length - 1
                        }
                        else {
                            if (placeholder.all_chats[i].a_chatter.username === username) {
                                placeholder.all_chats[i].b_chatter_read_index = placeholder.all_chats[i].messages.length - 1
                            }
                            else {
                                placeholder.all_chats[i].a_chatter_read_index = placeholder.all_chats[i].messages.length - 1
                            }
                        }
                        return placeholder
                    }
                }
            }))
        });

        socket.on('connected friends', (connectedFriends) => {
            setChats((prevChats => {
                const placeholder = {...prevChats}
                for (let chat of placeholder.all_chats) {
                    if (connectedFriends.includes(chat._id)) {
                        chat.status = 'online'
                    }
                }
                return placeholder
            }))
        })

        socket.on('user connected', (userId) => {
            setChats((prevChats) => {
                const placeholder = {...prevChats}
                for (let chat of placeholder.all_chats) {
                    if (chat.a_chatter._id === userId || chat.b_chatter._id === userId) {
                        chat.status = 'online'
                        return placeholder
                    }
                }
            })
        })
        socket.on('user disconnected', (userId) => {
            setChats((prevChats) => {
                const placeholder = {...prevChats}
                for (let chat of placeholder.all_chats) {
                    if (chat.a_chatter._id === userId || chat.b_chatter._id === userId) {
                        chat.status = 'offline'
                        return placeholder
                    }
                }
            })
        })

        socket.on('friend read message', (chatId) => {
            setChats((prevChats) => {
                const temp = {...prevChats}
                for (let chat of temp.all_chats) {
                    if (chat._id === chatId) {
                        if (chat.a_chatter.username === username) {
                            chat.b_chatter_read_index = chat.messages.length - 1
                        }
                        else {
                            chat.a_chatter_read_index = chat.messages.length - 1
                        }
                        break
                    }
                }
                return temp
            })
        })

        socket.on('user logged out', () => {
            console.log(1)
            setLogged(false)
            socket.disconnect()
        })

        return () => {
            socket.off('recieve message')
            socket.off('user connected')
            socket.off('user disconnected')
            socket.off('connected friends')
            socket.off('friend read message')
        }
    }, [])

    useEffect(() => {
        if (chatDiv.current) chatDiv.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
        chatRef.current = chat // for using chat value inside the recieve message socket
        if (chats && chat !== null) {
            if (chats.all_chats[chat].a_chatter.username === username) {
                if (chats.all_chats[chat].a_chatter_read_index < chats.all_chats[chat].messages.length - 1) {
                    const temp = {...chats}
                    temp.all_chats[chat].a_chatter_read_index = chats.all_chats[chat].messages.length - 1
                    setChats(temp)
                    socket.emit('message read', temp.all_chats[chat]._id, chats.all_chats[chat].b_chatter._id)
                }
            }
            else {
                if (chats.all_chats[chat].b_chatter_read_index < chats.all_chats[chat].messages.length - 1) {
                    const temp = {...chats}
                    temp.all_chats[chat].b_chatter_read_index = chats.all_chats[chat].messages.length - 1
                    setChats(temp)
                    socket.emit('message read', temp.all_chats[chat]._id, chats.all_chats[chat].a_chatter._id)
                }
            }
        }
    }, [chat])

    function handleLogOut() {
        socket.emit('user logged out', username)
        fetch('/account/log-out')
        .then(res => {
            if (res.ok) window.location.reload();
        })
        .catch(err => console.log(err))
    }

    return (
        <div className={styles.cont}>
            <div className={styles.topBar}>
                <p className={styles.title}>ProjectChat</p>
                <p onClick={handleLogOut} className={styles.logOut}>Log out</p>
            </div>
            <div className={styles.sidebarChat}>
                { isMobile ? 
                    page === 0 ? <Sidebar chats={chats} setChat={setChat} username={username} setChats={setChats} setPage={setPage}/>
                    : <ChatWindow chat={chat} chats={chats} setChats={setChats} chatDiv={chatDiv} username={username} socket={socket} setPage={setPage} isMobile={isMobile} setChat={setChat}/>
                    : <>
                    <Sidebar chats={chats} setChat={setChat} username={username} setChats={setChats} setPage={setPage}/>
                    <ChatWindow chat={chat} chats={chats} setChats={setChats} chatDiv={chatDiv} username={username} 
                    socket={socket} setPage={setPage} isMobile={isMobile} setChat={setChat}/>
                    </>
                }
            </div>
        </div>
    )
}