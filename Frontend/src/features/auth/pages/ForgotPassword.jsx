import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import AuthShell from '../components/AuthShell'
import { inputClass, primaryButtonClass, errorBoxClass, successBoxClass } from '../components/authStyles'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sentMessage, setSentMessage] = useState(null)

  const { handleForgotPassword } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await handleForgotPassword(email)
      setSentMessage(data.message)
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to reset it."
      footer={<Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">Back to sign in</Link>}
    >
      {sentMessage ? (
        <div className="space-y-4">
          <p role="status" className={successBoxClass}>{sentMessage}</p>
          <p className="text-sm text-slate-400">
            The link expires in 15 minutes. Didn't get it? Check your spam folder, or{' '}
            <button
              type="button"
              onClick={() => setSentMessage(null)}
              className="font-medium text-cyan-300 transition hover:text-cyan-200"
            >
              try again
            </button>
            .
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p role="alert" className={errorBoxClass}>{error}</p>}
          <div>
            <label htmlFor="forgot-email" className="mb-2 block text-sm font-medium text-slate-200">Email</label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? 'Sending link...' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}

export default ForgotPassword
