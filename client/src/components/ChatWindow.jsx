import profile from '../assets/profile.svg'
import saved from '../assets/saved.svg'
import send from "../assets/send.svg"
import { useState, useEffect } from 'react'
import styles from '../styles/ChatWindow.module.css'
import back from '../assets/go-back.svg'

export default function ChatWindow({ chats, chat, setChats, setChat, chatDiv, username, socket, setPage, isMobile}) {
    const [input, setInput] = useState('')

    useEffect(() => {
        if (chatDiv.current) chatDiv.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    },[chats])

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

    function goBack() {
        setPage(0)
        setChat(null)
    }

    return (
        <div className={styles.chatCont}>
                    <div className={styles.header}>
                        { isMobile ? <img src={back} alt="" width={32} onClick={goBack}/> : null}
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
    )
}