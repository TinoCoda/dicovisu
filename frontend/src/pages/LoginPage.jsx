import React from 'react'
import Login from '../components/Login'


    // Here you can add your logic to handle the login, like redirecting to another page}
/**
 * @param {Object} props - Component props
 * @param {()=>{}} props.onLogin - Function to handle login
 * @returns{JSX.Element} 
 */
function LoginPage({ onLogin }) {
  return (
    <>
        <Login onLogin={onLogin}/>
    </>
  )
}

export default LoginPage