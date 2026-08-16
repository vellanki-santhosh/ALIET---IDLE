import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function ProtectedRoute() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (mounted) {
        setSession(session)
        setLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <p className="text-gray-400">Checking authentication...</p>
      </div>
    )
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
