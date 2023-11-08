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
  
  // to see if there is a auth cookie after the page has loaded or after a reload
  useEffect(() => {
    socket.on('connect', () => {
      console.log('client connected via sockets')
    })
    fetch('/account/is-authenticated')
    .then(res => {
      if (res.status === 200) setLogged(true)
      else if (res.status === 401) setLogged(false)
      else res.text().then(message => { throw new Error(message) })
    })
    .catch(err => console.log(err))
  },[])

  return (
    <div>
      {loggedIn?<Chat username={username} />:<Authentication setLogged={setLogged} setUsername={setUsername}/>}
    </div>
  )
}

export default App
