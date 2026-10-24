import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'

import { useAuth } from '../hooks/useAuth'

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
    <main className="min-h-screen bg-[#071013] px-6 py-10 text-slate-100 sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0c191d] shadow-2xl shadow-black/30 lg:grid-cols-[0.9fr_1fr]">
          <div className="hidden flex-col justify-between bg-[#10292b] p-12 lg:flex">
            <Link to="/login" className="text-6xl font-semibold tracking-tight text-cyan-300">Nexora<span className="text-white"></span></Link>
            <div className="max-w-sm">
              <p className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">A new perspective</p>
              <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-white">Curiosity starts here.</h1>
              <p className="mt-6 text-lg leading-8 text-slate-300">Build a smarter way to search, one thoughtful question at a time.</p>
            </div>
            <p className="text-sm text-slate-400">Explore more. Wonder often.</p>
          </div>

          <div className="p-8 sm:p-12">
            <div className="mb-10 lg:hidden">
              <Link to="/login" className="text-xl font-semibold tracking-tight text-cyan-300">perplexity<span className="text-white">.</span></Link>
            </div>
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">Get started</p>
              <h2 className="text-3xl font-semibold tracking-tight text-white">Create your account</h2>
              <p className="mt-3 text-sm text-slate-400">Start finding better answers today.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
              <div>
                <label htmlFor="register-username" className="mb-2 block text-sm font-medium text-slate-200">Username</label>
                <input id="register-username" name="username" type="text" value={formData.username} onChange={handleChange} required autoComplete="username" placeholder="Choose a username" className="w-full rounded-xl border border-white/10 bg-[#071013] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
              </div>
              <div>
                <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-slate-200">Email</label>
                <input id="register-email" name="email" type="email" value={formData.email} onChange={handleChange} required autoComplete="email" placeholder="you@example.com" className="w-full rounded-xl border border-white/10 bg-[#071013] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
              </div>
              <div>
                <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-slate-200">Password</label>
                <input id="register-password" name="password" type="password" value={formData.password} onChange={handleChange} required minLength="8" autoComplete="new-password" placeholder="At least 8 characters" className="w-full rounded-xl border border-white/10 bg-[#071013] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-cyan-300 px-4 py-3.5 text-sm font-semibold text-[#071013] transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#0c191d] disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Creating account...' : 'Create account'}</button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">Already have an account? <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">Sign in</Link></p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Register