import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import send from "../assets/send.svg"
import styles from "../styles/Chat.module.css"

export default function Chat({ username, socket }) {
    const [chats, setChats] = useState(null)
    const [chat, setChat] = useState(0)
    const [input, setInput] = useState('')
    const [firstTime, setFirst] = useState(true)
    const chatDiv = useRef();

    useEffect(() => {
        fetch('/messages/chats')
        .then((res) => res.json())
        .then((data) => {
            for (let chat of data.all_chats) {
                chat.status = 'offline'
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
                for (let chat of placeholder.all_chats) {
                    if (chat._id === chatId) {
                        chat.messages.push({ sender: senderId, message: msg })
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

        return () => {
            socket.off('recieve message')
            socket.off('user connected')
            socket.off('user disconnected')
        }
    }, [])

    function handleLogOut() {
        fetch('/account/log-out')
        .then(res => {
            if (res.ok) window.location.reload();
        })
        .catch(err => console.log(err))
    }

    function handleSubmit(e) {
        e.preventDefault();
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
                setChats(temp)
                setInput('')
            })
            .catch((err) => console.log(err))
        }
        else {
            let recId, senderId;
            if (chats.all_chats[chat].a_chatter.username === username) {
                senderId = chats.all_chats[chat].a_chatter._id
                recId = chats.all_chats[chat].b_chatter._id
            }
            else if (chats.all_chats[chat].b_chatter.username === username) {
                senderId = chats.all_chats[chat].b_chatter._id
                recId = chats.all_chats[chat].a_chatter._id
            }
            socket.emit('send message', e.target.msg.value, chats.all_chats[chat]._id, recId)
            const a = {...chats}
            a.all_chats[chat].messages.push({ sender: {_id: senderId, username: username }, message: e.target.msg.value})
            setChats(a)
            setInput('')
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
                        {chats ? <p>{chats.all_chats[chat].a_chatter.username === username ? chats.all_chats[chat].b_chatter.username : chats.all_chats[chat].a_chatter.username}</p> : null}
                    </div>
                    <div className={styles.chatMain}>
                        <div className={styles.chatMessages}>
                            {chats === null ? null : 
                                <div ref={chatDiv}>
                                    {chats.all_chats[chat].messages.map((el) => {
                                        if (el.sender.username === username) return <div className={styles.right}><p className={styles.rightP}>{el.message}</p></div>
                                        else return <div className={styles.left}><p className={styles.leftP}>{el.message}</p></div>
                                    })}
                                </div>
                            }
                        </div>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="msg" value={input} onChange={(e) => setInput(e.target.value)} placeholder="type a message"/>
                            <button type="submit"><img src={send} alt="" width={32}/></button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}