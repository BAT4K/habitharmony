import React, { useEffect } from 'react'
import Form from '../components/Form'
import { Capacitor } from '@capacitor/core'

const Login = () => {
  useEffect(() => {
    import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
      if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
        StatusBar.setBackgroundColor({ color: '#FFFFFF' })
        StatusBar.setStyle({ style: Style.Dark })
        StatusBar.setOverlaysWebView({ overlay: false })
        StatusBar.setNavigationBarColor({ color: '#FFFFFF' })
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#FFFFFF')
      }
    })
  }, [])

  return (
    <div className='min-h-screen font-display bg-white'>
        <Form />
    </div>
  )
}

export default Login