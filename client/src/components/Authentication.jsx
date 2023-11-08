import { useState } from "react"

export default function Authentication({ setLogged, setUsername }) {
    const [loginError, setError] = useState(null)

    function handleSignUp(e) {
        e.preventDefault()
        const data = {username: e.target.username.value, password: e.target.password.value}
        fetch('/account/sign-up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(res => {
            if (res.status < 400) {
                setLogged(true) 
                setError(null)
                setUsername(data.username)
            }
            else if (res.status === 409) {
                setLogged(false)
                setError('username already in use')
            }
            else console.log(res)
        })
        .catch((err) => console.log(err))
    }

    function handleLogIn(e) {
        e.preventDefault()
        const data = {username: e.target.username.value, password: e.target.password.value}
        fetch('/account/log-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(res => {
            if (res.status < 400) {
                setLogged(true)
                setError(null)
            }
            else {
                setLogged(false)
                setError('Invalid credentials')
            }
        })
        .catch(err => console.log(err))

    }

    return (
        <div>
            <p>sign up</p>
            <form onSubmit={handleSignUp}>
                <input type="text" name="username" />
                <input type="password" name="password" />
                <input type="submit" name="submit" value="sign up"/>
            </form>
            <p>log in </p>
            <form onSubmit={handleLogIn}>
                <input type="text" name="username" />
                <input type="password" name="password" />
                <input type="submit" name="submit" value="sign up"/>
            </form>
            {loginError?<p>{loginError}</p>:null}
        </div>
    )
}