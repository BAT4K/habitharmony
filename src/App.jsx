import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from '../app/src/components/Login'
import ModernSignup from '../app/src/components/ModernSignup'
import Form from '../app/src/components/Form'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<ModernSignup />} />
        <Route path="/" element={<Form />} />
      </Routes>
    </Router>
  )
}

export default App 