import styles from '../styles/Sidebar.module.css'
import profile from '../assets/profile.svg'
import SearchPeople from './SearchPeople'

export default function Sidebar({ chats, setChat, username, setChats, setPage }) {
    function handleNameClick(index) {
        setChat(index)
        setPage(1)
    }
    return (
        <div className={styles.cont}>
            <SearchPeople chats={chats} setChat={setChat} setChats={setChats} username={username}/>
            <div className={styles.peopleCont}>
                {chats !== null  && chats.all_chats.length !== 0 ? chats.all_chats.map((chat, index) => {
                    return  <div onClick={() => handleNameClick(index)} className={styles.personCont}>
                                <div className={styles.pictureCont}>
                                    <img src={profile} alt="profile or default picture" width={32} className={styles.profile}/>
                                    <span className={chat.status === 'offline' ? styles.offline : styles.online}></span>
                                </div>
                                <div className={styles.textCont}>
                                    <p className={styles.username}>
                                        {chat.a_chatter.username !== username ? chat.a_chatter.username : chat.b_chatter.username}
                                    </p>
                                    <p className={ chat.a_chatter.username === username ? 
                                         chat.a_chatter_read_index < chat.messages.length - 1 ? `${styles.lastMessage} ${styles.bold}` : styles.lastMessage
                                         : chat.b_chatter_read_index < chat.messages.length - 1 ? `${styles.lastMessage} ${styles.bold}` : styles.lastMessage}>
                                        {chat.messages.length !== 0 ? chat.messages[chat.messages.length - 1].message : null}
                                    </p>
                                </div>
                                { chat.a_chatter.username === username ? 
                                    chat.a_chatter_read_index < chat.messages.length - 1 ? <p className={styles.unreadNum}>{chat.messages.length - 1 - chat.a_chatter_read_index}</p> : null
                                    : chat.b_chatter_read_index < chat.messages.length - 1 ? <p className={styles.unreadNum}>{chat.messages.length - 1 - chat.b_chatter_read_index}</p> : null}
                            </div>
                }): null}
            </div>
        </div>
    )
}