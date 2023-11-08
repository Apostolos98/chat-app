import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export default function Chat({ username }) {
    const [chats, setChats] = useState({})
    const [chat, setChat] = useState(null)

    useEffect(() => {
        fetch('/messages/chats')
        .then((res) => res.json())
        .then((data) => setChats(data))
        .catch((err) => console.log(err))
    }, [])

    function handleLogOut() {
        fetch('/account/log-out')
        .then(res => {
            if (res.ok) window.location.reload();
        })
        .catch(err => console.log(err))
    }

    return (
        <>
            <Sidebar chats={chats} setChat={setChat} username={username}/>
            <p>welcome to chat</p>
            <p onClick={handleLogOut}>log out</p>
        </>
    )
}