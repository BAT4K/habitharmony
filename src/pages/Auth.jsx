import React from 'react'
import Intro3 from "../assets/Intro3.svg"
import { ArrowRight } from 'lucide-react'

const Auth = () => {
  const handleGoogleLogin = () => {
    // Code to handle Google login here
  }

  const handleAppleLogin = () => {
    // Code to handle Apple login here
  }

  const handleFacebookLogin = () => {
    // Code to handle Facebook login here
  }

  const handleEmailLogin = () => {
    // Code to handle email login here and redirect to 'login' page
    window.location.href = '/login'
  }

  return (
    <div style={{position: 'relative', height: '100vh'}}>
      <img src={Intro3} alt="intro 3" className='w-full h-full object-cover' style={{display:'block'}}/>
      <button onClick={handleGoogleLogin} style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '20px',
        backgroundColor: '#dd4b39',
        color: '#fff',
        cursor: 'pointer',
      }}>Google</button>
      <button onClick={handleAppleLogin} style={{
        position: 'absolute',
        top: '55%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '20px',
        backgroundColor: '#007bff',
        color: '#fff',
        cursor: 'pointer',
      }}>Apple</button>
      <button onClick={handleFacebookLogin} style={{
        position: 'absolute',
        top: '65%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '20px',
        backgroundColor: '#3b5998',
        color: '#fff',
        cursor: 'pointer',  
      }}>Facebook</button>
      <div style={{
        position: 'absolute',
        bottom: '16px', // Adjust this value to move the text box up or down as needed
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
      }}>
        <span style={{marginRight: 8}}>Login with email</span>
        <ArrowRight />
      </div>
    </div>
  )
}

export default Auth