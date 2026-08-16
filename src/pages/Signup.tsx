import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (password !== confirmPassword) return setError('Passwords do not match.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')

    setLoading(true)
    const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
    setLoading(false)
    if (signUpError) return setError(signUpError.message)
    setMessage('Account created. Check your email to confirm your account before logging in.')
  }

  return <main className="min-h-screen bg-gray-950 px-4 py-12 text-white"><section className="mx-auto w-full max-w-md rounded-2xl bg-gray-900 p-8 shadow-xl ring-1 ring-gray-800"><h1 className="text-center text-3xl font-bold">Create account</h1><p className="mt-2 text-center text-gray-400">Create your Coding Assessment Platform account.</p>
    <form className="mt-8 space-y-5" onSubmit={handleSignup}>
      <label className="block text-sm text-gray-300">Email<input className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-blue-500" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
      <label className="block text-sm text-gray-300">Password<input className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-blue-500" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" /></label>
      <label className="block text-sm text-gray-300">Confirm password<input className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-blue-500" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm password" /></label>
      {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300" role="alert">{error}</p>}{message && <p className="rounded-lg bg-green-500/10 p-3 text-sm text-green-300" role="status">{message}</p>}
      <button className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Sign up'}</button>
    </form><p className="mt-6 text-center text-sm text-gray-400">Already have an account? <Link className="font-medium text-blue-400 hover:text-blue-300" to="/login">Log in</Link></p>
  </section></main>
}
