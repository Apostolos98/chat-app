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
    .then(res => {
      if (res.status === 200) {
        return res.json()
      }
      else if (res.status === 401) {
        setLogged(false)
        throw new Error('unauthorized')
      }
    })
    .then(res => {
        setLogged(true)
        setUsername(res.username)
    })
    .catch(err => console.log(err))
  },[])

  useEffect(() => {
    loggedIn===true?socket.connect():socket.disconnect()
  }, [loggedIn])

  return (
    <div>
      {loggedIn?<Chat username={username} socket={socket}/>:<Authentication setLogged={setLogged} setUsername={setUsername}/>}
    </div>
  )
}

export default App
