import styles from '../styles/SearchPeople.module.css'
import search from '../assets/search.svg'
import { useRef, useState } from 'react'

export default function SearchPeople ({ chats, setChats, setChat, username}) {
    const [results, setResults] = useState(null);

    function handleKeyUp(e) {
        const val = e.target.value
        if (val.length === 0) setResults(null)
        else {
            fetch(`/messages/search-users?search=${val}`)
            .then(res => {
                if (res.status === 404 ) {
                    setResults([{ error: 'no users found' }])
                    throw new Error('no users found with that username')
                }
                else if (res.status === 200) return res.json()
            })
            .then(data => setResults(data.chatters))
            .catch((err) => console.log(err))
        }
    }

    function addChatter(name) {
        for (let i = 0; i < chats.all_chats.length; i++) {
            if (chats.all_chats[i].a_chatter.username === name || chats.all_chats[i].b_chatter.username === name) {
                setChat(i) 
                setResults(null)
                return;
            }
        }
        if (username === name) return;
        const temp = {...chats}
        temp.all_chats.push({ a_chatter: { username: name }, temp: true, messages: [], status: 'offline' })
        setChats(temp)
        setChat(temp.all_chats.length - 1)
    }

    return (
        <div className={styles.search}>
            <form className={styles.searchForm}>
                <button type='submit'><img src={search} alt="" width={16}/></button>
                <input type="text" name="search" className={styles.inSearch} placeholder='search for people' autoComplete='off' onKeyUp={handleKeyUp}/>
            </form>
            <div className={results ? styles.results : styles.hide}>
                {results && results.length === 1 && results[0].error !== undefined ? results[0].error : results ? results.map((el) => {
                    return <p onClick={() => addChatter(el.username)}>{el.username}</p>
                }) : null}
            </div>
        </div>
    )
}