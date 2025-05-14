import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

// Set status bar color and style on app load (only on native)
if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
  StatusBar.setBackgroundColor({ color: '#F8F3F3' })
  StatusBar.setStyle({ style: Style.Dark })
  StatusBar.setOverlaysWebView({ overlay: false })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
