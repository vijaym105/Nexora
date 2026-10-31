import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'

import { useAuth } from '../hooks/useAuth'

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 hover:border-white/20 focus:border-violet-400/60 focus:bg-white/[0.08] focus:ring-2 focus:ring-violet-400/20 sm:py-3.5'

const Logo = () => (
  <Link to="/login" className="flex items-center gap-3">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 text-white shadow-lg shadow-violet-500/30">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M12 3 3 8l9 5 9-5-9-5Z" />
        <path d="m3 13 9 5 9-5" />
      </svg>
    </span>
    <span className="text-xl font-bold tracking-tight text-white">Nexora</span>
  </Link>
)

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })

  const {handleRegister} = useAuth()
  const navigate = useNavigate()
  const loading = useSelector((state) => state.auth.loading)
  const error = useSelector((state) => state.auth.error)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await handleRegister(formData)
      navigate('/login')
    } catch {
      // The hook stores the API error for the form to display.
    }

  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06040f] px-4 py-8 text-slate-100 sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-violet-700/30 blur-[120px] sm:h-[520px] sm:w-[520px]" />
        <div className="absolute -bottom-40 -right-24 h-[420px] w-[420px] rounded-full bg-blue-600/25 blur-[130px] sm:h-[560px] sm:w-[560px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <section className="grid w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40 backdrop-blur-2xl lg:max-w-none lg:grid-cols-[1fr_0.95fr]">
          <div className="hidden flex-col justify-between border-r border-white/10 bg-gradient-to-br from-violet-500/[0.12] to-sky-500/[0.06] p-12 lg:flex">
            <div>
              <Logo />
              <div className="mt-24 max-w-md">
                <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white xl:text-5xl">Curiosity starts here.</h1>
                <p className="mt-6 text-lg leading-8 text-slate-300">Build a smarter way to search, one thoughtful question at a time.</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">Explore more. Wonder often.</p>
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="mb-10 lg:hidden">
              <Logo />
            </div>
            <div className="mb-8">
              <p className="mb-2 text-sm font-medium text-cyan-300">Get started</p>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Create your account</h2>
              <p className="mt-3 text-sm text-slate-400">Start finding better answers today.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
              <div>
                <label htmlFor="register-username" className="mb-2 block text-sm font-medium text-slate-200">Username</label>
                <input id="register-username" name="username" type="text" value={formData.username} onChange={handleChange} required autoComplete="username" placeholder="Choose a username" className={inputClass} />
              </div>
              <div>
                <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-slate-200">Email</label>
                <input id="register-email" name="email" type="email" value={formData.email} onChange={handleChange} required autoComplete="email" placeholder="you@example.com" className={inputClass} />
              </div>
              <div>
                <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-slate-200">Password</label>
                <input id="register-password" name="password" type="password" value={formData.password} onChange={handleChange} required minLength="8" autoComplete="new-password" placeholder="At least 8 characters" className={inputClass} />
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0818] disabled:cursor-not-allowed disabled:opacity-60 sm:py-3.5">{loading ? 'Creating account...' : 'Create account'}</button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">Already have an account? <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">Sign in</Link></p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Register