import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import styles from "../styles/Chat.module.css"

export default function Chat({ username, socket }) {
    const [chats, setChats] = useState(null)
    const [chat, setChat] = useState(0)
    const [input, setInput] = useState('')
    const [firstTime, setFirst] = useState(true)

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
                console.log(prevChats)
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

    return (
        <div className={styles.cont}>
            <Sidebar chats={chats} setChat={setChat} username={username}/>
            <div>
                <p>welcome to chat</p>
                <p onClick={handleLogOut}>log out</p>
                {chats === null ? null : 
                    <div>
                        {chats.all_chats[chat].messages.map((el) => {
                             if (el.sender.username === username) return <p className={styles.right}>{el.message}</p>
                             else return <p className={styles.left}>{el.message}</p>
                        })}
                    </div>
                }
                <form onSubmit={handleSubmit}>
                    <input type="text" name="msg" value={input} onChange={(e) => setInput(e.target.value)}/>
                    <input type="submit" value="submit"/>
                </form>
            </div>
        </div>
    )
}