import { useState } from "react"
import styles from "../styles/Authentication.module.css"
import user from "../assets/user.svg"
import lock from "../assets/lock.svg"

export default function Authentication({ setLogged, setUsername }) {
    const [loginError, setError] = useState(null)
    const [action, setAction] = useState('Sign-up')

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
                setUsername(data.username)
            }
            else {
                setLogged(false)
                setError('Invalid credentials')
            }
        })
        .catch(err => console.log(err))

    }

    return (
        <div className={styles.cont}>
            { action === 'Sign-up' ? 
                <div className={styles.formCont}>
                    <h1>Sign up</h1>
                    <form onSubmit={handleSignUp} className={styles.forms}>
                        <div className={styles.fieldCont}>
                            <label htmlFor="usernameS">Username</label>
                            <div className={styles.imgInpCont}>
                                <img src={user} alt="" width={16}/>
                                <input type="text" name="username" className={styles.inpClass} id="usernameS" pattern="^[a-zA-Z0-9_.]{3,16}$" 
                                    required placeholder="Type in your username" autoComplete="off" title="Username should be 3-16 characters long
                                     and can contain alphanumeric characters, underscores, hyphens, and periods."/>
                            </div>
                        </div>
                        <div className={styles.fieldCont}>
                            <label htmlFor="passwordS">Password</label>
                            <div className={styles.imgInpCont}>
                                <img src={lock} alt="" width={16}/>
                                <input type="password" name="password" className={styles.inpClass} pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$" 
                                title="Password should be at least 8 characters long and must contain at least one lowercase letter, 
                                one uppercase letter, and one numeric digit."
                                required placeholder="Type in your password" />
                            </div>
                        </div>
                        <div className={styles.fieldCont}>
                            <label htmlFor="confirmPass">Confirm Password</label>
                            <div className={styles.imgInpCont}>
                                <img src={lock} alt="" width={16}/>
                                <input type="password" name="confirmPassword" className={styles.inpClass} 
                                required placeholder="Confirm your password" id="confirmPass" title="Confirm your password, passwords must match"/>
                            </div>
                        </div>
                        <input type="submit" name="submit" value="Sign up" className={styles.submit}/>
                    </form>
                    <p>Already have an account? <span onClick={() => setAction('Log-in')} className={styles.action}>Log in</span></p>
                </div> : 
                <div className={styles.formCont}>
                    <h1>Log in</h1>
                    <form onSubmit={handleLogIn} className={styles.forms}>
                        <div className={styles.fieldCont}>
                            <label htmlFor="usernameL">Username</label>
                            <div className={styles.imgInpCont}>
                                <img src={user} alt="" width={16}/>
                                <input type="text" name="username" className={styles.inpClass} id="usernameL" pattern="^[a-zA-Z0-9_.]{3,16}$"
                                    required placeholder="Type in your username" title="Username should be 3-16 characters long
                                     and can contain alphanumeric characters, underscores, hyphens, and periods."/>
                            </div>
                        </div>
                        <div className={styles.fieldCont}>
                            <label htmlFor="passwordL">Password</label>
                            <div className={styles.imgInpCont}>
                                <img src={lock} alt="" width={16}/>
                                <input type="password" name="password" className={styles.inpClass} pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$" 
                                title="Password should be at least 8 characters long and must contain at least one lowercase letter, 
                                one uppercase letter, and one numeric digit."
                                required placeholder="Type in your password" id="passwordL"/>
                            </div>
                        </div>
                        <input type="submit" name="submit" value="Log in" className={styles.submit}/>
                    </form>
                    <p>New user? <span onClick={() => setAction('Sign-up')} className={styles.action}>Sign in</span></p>
                </div>
            }
            {loginError?<p className={styles.error}>{loginError}</p>:null}
        </div>
    )
}