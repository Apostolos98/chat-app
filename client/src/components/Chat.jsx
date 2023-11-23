import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import send from "../assets/send.svg"
import styles from "../styles/Chat.module.css"
import profile from '../assets/profile.svg'
import saved from '../assets/saved.svg'
import { produce } from 'immer'

export default function Chat({ username, socket, isMobile }) {
    const [chats, setChats] = useState(null)
    const [chat, setChat] = useState(0)
    const [input, setInput] = useState('')
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
        if (chatDiv.current) chatDiv.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    },[chats])

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
        if (chats) {
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
        fetch('/account/log-out')
        .then(res => {
            if (res.ok) window.location.reload();
        })
        .catch(err => console.log(err))
    }

    function handleSubmit(e) {
        e.preventDefault();
        // when a user clicks to add another user a chat with a temp property is created to show that the client needs to send the appropriate request
        // for the chat to be created
        if (chats.all_chats[chat].temp) {
            fetch('/messages/chats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipient: chats.all_chats[chat].a_chatter.username,
                    message: e.target.msg.value
                })
            })
            .then(res => {
                if (res.status === 409 || res.status === 404 || res.status === 500) throw new Error('error completing operation')
                else return res.json()
            })
            .then((chat) => {
                const temp = {...chats}
                temp.all_chats[temp.all_chats.length - 1] = chat
                temp.all_chats[temp.all_chats.length - 1].status = 'offline'
                temp.all_chats[temp.all_chats.length - 1].saved = 'ok'
                setChats(temp)
                setInput('')
            })
            .catch((err) => console.log(err))
        }
        else {
            let recId, senderId;
            const a = {...chats}
            if (chats.all_chats[chat].a_chatter.username === username) {
                senderId = chats.all_chats[chat].a_chatter._id
                recId = chats.all_chats[chat].b_chatter._id
                a.all_chats[chat].a_chatter_read_index = a.all_chats[chat].messages.length // not -1 since we assign before we push the new message
            }
            else if (chats.all_chats[chat].b_chatter.username === username) {
                senderId = chats.all_chats[chat].b_chatter._id
                recId = chats.all_chats[chat].a_chatter._id
                a.all_chats[chat].b_chatter_read_index = a.all_chats[chat].messages.length
            }
            a.all_chats[chat].messages.push({ sender: {_id: senderId, username: username }, message: e.target.msg.value})
            a.all_chats[chat].saved = 'pending'
            socket.emit('send message', e.target.msg.value, chats.all_chats[chat]._id, recId, chat, (err, saved, chatInd) => {
                if (err) {
                    setChats((prevChats) => {
                        const temp = {...prevChats}
                        temp.all_chats[chatInd].saved = 'fail'
                        return temp
                    })
                }
                if (saved) {
                    setChats((prevChats) => {
                        const temp = {...prevChats}
                        temp.all_chats[chatInd].saved = 'ok'
                        return temp
                    })
                }
            })
            setChats(a)
            setInput('')
        }
    }

    function correctSymbolRight(ind) {
        if (chats.all_chats[chat].a_chatter.username === username) {
            if (chats.all_chats[chat].b_chatter_read_index === ind) {
                return <span><img src={profile} alt="" width={20}/></span>
            }
            else if (ind > chats.all_chats[chat].b_chatter_read_index) {
                if (chats.all_chats[chat].saved === 'ok') return <span><img src={saved} alt="" width={20}/></span>
                else if (chats.all_chats[chat].saved === 'pending') return <span>...</span>
                else if (chats.all_chats[chat].saved === 'fail') return <span>fail</span>
            }
        }
        else {
            if (chats.all_chats[chat].a_chatter_read_index === ind) {
                return <span><img src={profile} alt="" width={20}/></span>
            }
            else if (ind > chats.all_chats[chat].a_chatter_read_index) {
                if (chats.all_chats[chat].saved === 'ok') return <span><img src={saved} alt="" width={20}/></span>
                else if (chats.all_chats[chat].saved === 'pending') return <span>...</span>
                else if (chats.all_chats[chat].saved === 'fail') return <span>fail</span>
            }
        }
    }

    function correctSymbolLeft(ind) {
        if (chats.all_chats[chat].a_chatter.username === username) {
            if (chats.all_chats[chat].b_chatter_read_index === ind) return <span><img src={profile} alt="" width={20}/></span>
        }
        else {
            if (chats.all_chats[chat].a_chatter_read_index === ind) return <span><img src={profile} alt="" width={20}/></span>
        }
    }

    return (
        <div className={styles.cont}>
            <div className={styles.topBar}>
                <p className={styles.title}>ProjectChat</p>
                <p onClick={handleLogOut} className={styles.logOut}>Log out</p>
            </div>
            <div className={styles.sidebarChat}>
                <Sidebar chats={chats} setChat={setChat} username={username} setChats={setChats}/>
                <div className={styles.chatCont}>
                    <div className={styles.header}>
                        {chats && chats.all_chats.length !== 0 ? 
                        <p>{chats.all_chats[chat].a_chatter.username === username ? chats.all_chats[chat].b_chatter.username : chats.all_chats[chat].a_chatter.username}</p> 
                        : null}
                    </div>
                    <div className={styles.chatMain}>
                        <div className={styles.chatMessages}>
                            {chats === null || chats.all_chats.length === 0? null : 
                                <div ref={chatDiv}>
                                    {chats.all_chats[chat].messages.map((el, ind) => {
                                        if (el.sender.username === username) return ( 
                                            <div className={styles.right}>
                                                <p className={styles.rightP}>{el.message}</p>
                                                { correctSymbolRight(ind) }
                                            </div>)
                                        else return (
                                            <div className={styles.left}>
                                                <p className={styles.leftP}>{el.message}</p>
                                                { correctSymbolLeft(ind) }
                                            </div>)
                                    })}
                                </div>
                            }
                        </div>
                        <form onSubmit={handleSubmit} className={styles.chatForm}>
                            <input type="text" name="msg" value={input} onChange={(e) => setInput(e.target.value)} placeholder="type a message"/>
                            <button type="submit"><img src={send} alt="" width={32}/></button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}