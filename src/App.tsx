import { useEffect } from 'react'
import { supabase } from './lib/supabase'

function App() {
  useEffect(() => {
    const testConnection = async () => {
      const { error } = await supabase.auth.getSession()

      if (error) {
        console.error('Supabase connection failed:', error)
        return
      }

      console.log('Supabase connected successfully')
    }

    void testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-white">
        Coding Assessment Platform
      </h1>
    </div>
  )
}

export default App
