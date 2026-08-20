import { Routes, Route, Navigate } from 'react-router-dom'
import { auth } from './firebase'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Report from './pages/Report'
import History from './pages/History'
import Settings from './pages/Settings'
import AiChat from './pages/AiChat'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/report/:id" element={<ProtectedRoute><Report /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><AiChat /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
