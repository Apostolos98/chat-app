export default function Sidebar({ chats, setChat, username }) {
    
    return (
        <div>
            {chats.all_chats !== undefined?chats.all_chats.map((chat) => {
                return <p>{chat.a_chatter.username !== username ? chat.a_chatter.username : chat.b_chatter.username}</p>
            }): null}
        </div>
    )
}