import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import styles from "../styles/Chat.module.css"

export default function Chat({ username, socket }) {
    const [chats, setChats] = useState(null)
    const [chat, setChat] = useState(0)
    const [input, setInput] = useState('')

    useEffect(() => {
        fetch('/messages/chats')
        .then((res) => res.json())
        .then((data) => setChats(data))
        .catch((err) => console.log(err))
    }, [])

    useEffect(() => {
        socket.on('recieve message', (msg, chatId, senderId) => {
            const a = {...chats}
            for (let chat of a.all_chats) {
                if (chat._id === chatId) {
                    chat.messages.push({ sender: senderId, message: msg })
                    setChats(a)
                }
            }
        });
        return () => socket.off('recieve message')
    }, [chats])

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