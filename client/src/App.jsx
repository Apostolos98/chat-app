import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Authentication from './components/Authentication'
import Chat from './components/Chat'
import { socket } from './socket'
import './styles/App.css'


function App() {
  const [loggedIn, setLogged] = useState(false)
  const [username, setUsername] = useState(null)
  
  // to see if there is a auth cookie after the page after a reload
  useEffect(() => {
    fetch('/account/is-authenticated')
    .then(res => res.json())
    .then(res => {
      if (res.status === 200) {
        setLogged(true)
        setUsername(res.body.username)
      }
      else if (res.status === 401) setLogged(false)
    })
    .catch(err => console.log(err))
  },[])

  useEffect(() => {
    loggedIn===true?socket.connect():null
  }, [loggedIn])

  function handleClick() {
    socket.emit('send message', username)
  }

  return (
    <div>
      {loggedIn?<Chat username={username} handleClick={handleClick}/>:<Authentication setLogged={setLogged} setUsername={setUsername}/>}
    </div>
  )
}

export default App
