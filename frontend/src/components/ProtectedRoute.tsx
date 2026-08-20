import { Navigate } from 'react-router-dom'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useState, useEffect } from 'react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(auth.currentUser)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u: any) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
