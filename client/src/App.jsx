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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 750);

  // Add a listener for window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 750)
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
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
    <>
      {loggedIn ? 
      <Chat username={username} socket={socket} isMobile={isMobile} setLogged={setLogged}/> : 
      <Authentication setLogged={setLogged} setUsername={setUsername}/>}
    </>
  )
}

export default App
