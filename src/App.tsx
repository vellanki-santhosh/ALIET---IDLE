import { FormEvent, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, Code2, LogOut, Menu, ShieldCheck, Users } from 'lucide-react'
import { hasSupabaseConfig, supabase } from './lib/supabase'

type Role = 'student' | 'instructor'
type User = { email: string; role: Role }
type Note = { id: string; title: string; module: string; order: number; updatedAt: string; url?: string }
type AuthValue = { user: User | null; login: (email: string, password: string, role?: Role) => Promise<void>; signup: (email: string, password: string, role: Role) => Promise<void>; logout: () => Promise<void> }

const AuthContext = createContext<AuthValue | null>(null)
const noteSeed: Note[] = [
  { id: '1', title: 'Introduction to Algorithms', module: 'Module 1', order: 1, updatedAt: 'Today' },
  { id: '2', title: 'Complexity Analysis', module: 'Module 1', order: 2, updatedAt: 'Today' },
  { id: '3', title: 'Arrays and Strings', module: 'Module 2', order: 1, updatedAt: 'Yesterday' },
]

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => JSON.parse(localStorage.getItem('aliet-user') || 'null'))
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => data.session && setUser({ email: data.session.user.email || '', role: 'student' }))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session ? { email: session.user.email || '', role: 'student' } : null))
    return () => listener.subscription.unsubscribe()
  }, [])
  const setLocalUser = (next: User | null) => { setUser(next); next ? localStorage.setItem('aliet-user', JSON.stringify(next)) : localStorage.removeItem('aliet-user') }
  const value = useMemo<AuthValue>(() => ({
    user,
    async login(email, password, role = 'student') {
      if (supabase) { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; return }
      setLocalUser({ email, role })
    },
    async signup(email, password, role) {
      if (supabase) { const { error } = await supabase.auth.signUp({ email, password, options: { data: { role } } }); if (error) throw error; return }
      setLocalUser({ email, role })
    },
    async logout() { if (supabase) await supabase.auth.signOut(); setLocalUser(null) },
  }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider missing'); return value }

function Protected({ children, role }: { children: React.ReactNode; role?: Role }) {
  const { user } = useAuth(); const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { login, signup } = useAuth(); const navigate = useNavigate(); const [error, setError] = useState(''); const [role, setRole] = useState<Role>('student')
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); const data = new FormData(e.currentTarget); const email = String(data.get('email')); const password = String(data.get('password'))
    try { mode === 'login' ? await login(email, password, role) : await signup(email, password, role); navigate('/dashboard') } catch (err) { setError(err instanceof Error ? err.message : 'Unable to continue.') }
  }
  return <main className="auth-page"><section className="auth-card"><span className="eyebrow">ALIET IDLE</span><h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1><p>{hasSupabaseConfig ? 'Use your account credentials to continue.' : 'Demo mode is active. Add Supabase keys to enable real authentication.'}</p>
    <form onSubmit={submit}><label>Email<input required type="email" name="email" placeholder="you@example.com" /></label><label>Password<input required minLength={6} type="password" name="password" placeholder="At least 6 characters" /></label>
      <fieldset><legend>Continue as</legend><label className="choice"><input checked={role === 'student'} onChange={() => setRole('student')} type="radio" name="role" /> Student</label><label className="choice"><input checked={role === 'instructor'} onChange={() => setRole('instructor')} type="radio" name="role" /> Instructor</label></fieldset>
      {error && <p className="error">{error}</p>}<button className="primary">{mode === 'login' ? 'Log in' : 'Sign up'}</button></form><p className="switch">{mode === 'login' ? 'New here?' : 'Already registered?'} <NavLink to={mode === 'login' ? '/signup' : '/login'}>{mode === 'login' ? 'Create an account' : 'Log in'}</NavLink></p></section></main>
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth(); const navigate = useNavigate(); const [open, setOpen] = useState(false)
  async function leave() { await logout(); navigate('/login') }
  return <div className="app-shell"><aside className={open ? 'sidebar open' : 'sidebar'}><div className="brand"><Code2 /> <span>ALIET <b>IDLE</b></span></div><nav><NavLink to="/dashboard"><Users /> Dashboard</NavLink><NavLink to="/notes"><BookOpen /> Lecture notes</NavLink>{user?.role === 'instructor' && <NavLink to="/instructor"><ShieldCheck /> Instructor tools</NavLink>}</nav><button className="logout" onClick={leave}><LogOut /> Log out</button></aside><div className="content"><header><button className="menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation"><Menu /></button><div><strong>{user?.role === 'instructor' ? 'Instructor workspace' : 'Student workspace'}</strong><span>{user?.email}</span></div></header>{children}</div></div>
}

function Dashboard() { const { user } = useAuth(); const instructor = user?.role === 'instructor'; return <Layout><main className="page"><span className="eyebrow">{instructor ? 'Teaching overview' : 'Learning overview'}</span><h1>{instructor ? 'Welcome, instructor.' : 'Keep building momentum.'}</h1><div className="stats"><article><b>{instructor ? '24' : '0'}</b><span>{instructor ? 'Active students' : 'Problems solved'}</span></article><article><b>{instructor ? '3' : '0'}</b><span>{instructor ? 'Published modules' : 'Current score'}</span></article><article><b>{instructor ? '0' : '—'}</b><span>{instructor ? 'Open assessments' : 'Next assessment'}</span></article></div><section className="panel"><h2>{instructor ? 'Your next steps' : 'Start learning'}</h2><p>{instructor ? 'Upload notes, create a coding problem, then schedule an assessment.' : 'Browse your module notes and check back for coding challenges.'}</p><NavLink className="primary inline" to="/notes">Open lecture notes</NavLink></section></main></Layout> }

function Notes() {
  const { user } = useAuth(); const [notes, setNotes] = useState<Note[]>(() => JSON.parse(localStorage.getItem('aliet-notes') || 'null') || noteSeed); const [selected, setSelected] = useState('Module 1'); const [form, setForm] = useState({ title: '', module: 'Module 1' })
  useEffect(() => localStorage.setItem('aliet-notes', JSON.stringify(notes)), [notes]); const modules = [...new Set(notes.map(n => n.module))]; const shown = notes.filter(n => n.module === selected).sort((a, b) => a.order - b.order)
  function addNote(e: FormEvent) { e.preventDefault(); if (!form.title.trim()) return; setNotes([...notes, { id: crypto.randomUUID(), title: form.title.trim(), module: form.module, order: notes.filter(n => n.module === form.module).length + 1, updatedAt: 'Just now' }]); setForm({ title: '', module: form.module }) }
  return <Layout><main className="page"><span className="eyebrow">Knowledge base</span><h1>Lecture notes</h1><div className="notes-layout"><aside className="module-list"><h2>Modules</h2>{modules.map(module => <button className={selected === module ? 'active' : ''} onClick={() => setSelected(module)} key={module}>{module}</button>)}</aside><section className="panel notes-panel"><h2>{selected}</h2>{shown.map(note => <article className="note" key={note.id}><div><BookOpen /><span><b>{note.title}</b><small>Updated {note.updatedAt}</small></span></div><button className="secondary" onClick={() => alert(`Preview/download for “${note.title}” will use Supabase Storage once configured.`)}>View</button></article>)}{shown.length === 0 && <p>No notes in this module yet.</p>}</section></div>{user?.role === 'instructor' && <section className="panel upload"><h2>Add a lecture note</h2><form onSubmit={addNote}><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Note title" /><select value={form.module} onChange={e => setForm({ ...form, module: e.target.value })}>{modules.map(m => <option key={m}>{m}</option>)}</select><input type="file" aria-label="Select note file" /><button className="primary">Save note metadata</button></form><small>File upload will be sent to Supabase Storage when credentials are configured.</small></section>}</main></Layout>
}
function Instructor() { return <Layout><main className="page"><span className="eyebrow">Instructor only</span><h1>Teaching tools</h1><section className="panel"><h2>Coming next</h2><p>Create modules, author coding challenges, and schedule timed assessments from this workspace.</p></section></main></Layout> }
function Home() { return <Navigate to="/dashboard" replace /> }
export default function App() { return <AuthProvider><Routes><Route path="/login" element={<AuthPage mode="login" />} /><Route path="/signup" element={<AuthPage mode="signup" />} /><Route path="/dashboard" element={<Protected><Dashboard /></Protected>} /><Route path="/notes" element={<Protected><Notes /></Protected>} /><Route path="/instructor" element={<Protected role="instructor"><Instructor /></Protected>} /><Route path="*" element={<Home />} /></Routes></AuthProvider> }
