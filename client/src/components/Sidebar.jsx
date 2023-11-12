import styles from '../styles/Sidebar.module.css'

export default function Sidebar({ chats, setChat, username }) {

    return (
        <div>
            {chats !== null ? chats.all_chats.map((chat, index) => {
                return  <p onClick={() => setChat(index)}>
                            {chat.a_chatter.username !== username ? chat.a_chatter.username : chat.b_chatter.username}
                            <span className={chat.status === 'offline' ? styles.offline : styles.online}></span>
                        </p>
            }): null}
        </div>
    )
}