import styles from '../styles/Sidebar.module.css'
import search from '../assets/search.svg'
import profile from '../assets/profile.svg'

export default function Sidebar({ chats, setChat, username }) {

    return (
        <div className={styles.cont}>
            <div className={styles.search}>
                <form>
                    <button type='submit'><img src={search} alt="" width={16}/></button>
                    <input type="text" name="search" className={styles.inSearch} placeholder='search for people'/>
                </form>
            </div>
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
                                    <p className={styles.lastMessage}>{chat.messages[chat.messages.length - 1].message}</p>
                                </div>
                            </div>
                }): null}
            </div>
        </div>
    )
}