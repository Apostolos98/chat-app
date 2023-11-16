import styles from '../styles/Sidebar.module.css'
import profile from '../assets/profile.svg'
import SearchPeople from './SearchPeople'

export default function Sidebar({ chats, setChat, username, setChats }) {

    return (
        <div className={styles.cont}>
            <SearchPeople chats={chats} setChat={setChat} setChats={setChats} username={username}/>
            <div className={styles.peopleCont}>
                {chats !== null ? chats.all_chats.map((chat, index) => {
                    return  <div onClick={() => setChat(index)} className={styles.personCont}>
                                <div className={styles.pictureCont}>
                                    <img src={profile} alt="profile or default picture" width={32} className={styles.profile}/>
                                    <span className={chat.status === 'offline' ? styles.offline : styles.online}></span>
                                </div>
                                <div className={styles.textCont}>
                                    <p className={styles.username}>
                                        {chat.a_chatter.username !== username ? chat.a_chatter.username : chat.b_chatter.username}
                                    </p>
                                    <p className={styles.lastMessage}>{chat.messages.length !== 0 ? chat.messages[chat.messages.length - 1].message : null}</p>
                                </div>
                            </div>
                }): null}
            </div>
        </div>
    )
}