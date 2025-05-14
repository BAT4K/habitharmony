import React, { useState, useEffect } from 'react'
import Intro3 from "../assets/Intro3.webp"
import { ArrowRight } from 'lucide-react'

const Auth = () => {
  const [loginActive, setLoginActive] = useState(false);
  const [signupActive, setSignupActive] = useState(false);
  
  // Handle touch events for mobile
  const handleTouchStart = (buttonType) => {
    if (buttonType === 'login') setLoginActive(true);
    if (buttonType === 'signup') setSignupActive(true);
  };
  
  const handleTouchEnd = (buttonType) => {
    if (buttonType === 'login') setLoginActive(false);
    if (buttonType === 'signup') setSignupActive(false);
  };
  
  const handleEmailLogin = () => {
    window.location.href = '/login'
  }

  const handleSignup = () => {
    window.location.href = '/signup'
  }

  // Add viewport meta tag to ensure proper scaling
  useEffect(() => {
    // Make sure viewport meta is set correctly for mobile
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
      document.head.appendChild(meta);
    } else {
      viewportMeta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
    }
    
    // Prevent bounce/elastic scrolling on iOS
    document.body.style.overscrollBehavior = 'none';
    
    return () => {
      document.body.style.overscrollBehavior = '';
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <img 
        src={Intro3} 
        alt="intro background" 
        className="w-full h-full object-cover block"
        loading="lazy"
      />
      
      <div className="absolute inset-0 flex flex-col justify-end items-center pb-16 md:pb-24 px-4 md:px-6">
        {/* Buttons - with improved mobile touch handling */}
        <div className="w-full max-w-xs flex flex-col gap-4 items-center">
          <button
            onClick={handleEmailLogin}
            onTouchStart={() => handleTouchStart('login')}
            onTouchEnd={() => handleTouchEnd('login')}
            className="w-full py-4 px-6 bg-[#914938] text-white rounded-full font-bold text-lg flex items-center justify-center relative overflow-hidden tap-highlight-transparent"
            style={{
              transform: loginActive ? 'translateY(-2px) scale(0.98)' : 'translateY(0) scale(1)',
              transition: 'all 0.2s ease',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Button background animation - works on touch */}
            <span className={`absolute inset-0 bg-white opacity-0 transition-opacity duration-200 ${loginActive ? 'opacity-10' : ''}`}></span>
            
            <span className="mr-2 relative z-10">Login</span>
            <ArrowRight 
              size={18} 
              className="relative z-10 transition-transform duration-200"
              style={{
                transform: loginActive ? 'translateX(3px)' : 'translateX(0)'
              }}
            />
          </button>
          
          <button
            onClick={handleSignup}
            onTouchStart={() => handleTouchStart('signup')}
            onTouchEnd={() => handleTouchEnd('signup')}
            className="w-full py-4 px-6 bg-white text-black border-0 rounded-full font-bold text-lg flex items-center justify-center relative overflow-hidden tap-highlight-transparent"
            style={{
              transform: signupActive ? 'translateY(-2px) scale(0.98)' : 'translateY(0) scale(1)',
              transition: 'all 0.2s ease',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Button background animation - works on touch */}
            <span className={`absolute inset-0 bg-[#914938] opacity-0 transition-opacity duration-200 ${signupActive ? 'opacity-5' : ''}`}></span>
            
            <span className="mr-2 relative z-10">Create account</span>
            <ArrowRight 
              size={18} 
              className="relative z-10 transition-transform duration-200"
              style={{
                transform: signupActive ? 'translateX(3px)' : 'translateX(0)'
              }}
            />
          </button>
        </div>
      </div>

      {/* Add safe area padding for notched devices */}
      <style>{`
        @supports (padding: env(safe-area-inset-bottom)) {
          .pb-16 {
            padding-bottom: calc(4rem + env(safe-area-inset-bottom));
          }
        }
        
        /* Remove tap highlight on mobile */
        .tap-highlight-transparent {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  )
}

export default Auth