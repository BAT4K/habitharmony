import React from 'react'
import Intro3 from "../assets/Intro3.svg"
import { ArrowRight } from 'lucide-react'

const Auth = () => {
  const handleEmailLogin = () => {
    window.location.href = '/login'
  }

  const handleSignup = () => {
    window.location.href = '/signup'  // Link to your existing Signup page
  }

  return (
    <div style={{position: 'relative', height: '100vh'}}>
      <img src={Intro3} alt="intro 3" className='w-full h-full object-cover' style={{display:'block'}}/>
      <div 
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          width: '80%',
          maxWidth: '300px'
        }}
      >
        <button
          onClick={handleEmailLogin}
          className='py-4 px-16 bg-[#914938] text-white rounded-4xl font-bold text-xl flex items-center justify-center'
        >
          <span className="mr-2">Login</span>
          <ArrowRight size={18} />
        </button>
        
        <button
          onClick={handleSignup}
          className='py-4 px-16 bg-white text-[#333] border border-gray-300 rounded-4xl font-bold text-xl flex items-center justify-center'
        >
          <span className="mr-2">Create account</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}

export default Auth