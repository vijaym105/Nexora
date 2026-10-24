import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import AuthShell from '../components/AuthShell'
import { inputClass, primaryButtonClass, errorBoxClass, successBoxClass } from '../components/authStyles'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  const navigate = useNavigate()
  const { handleResetPassword } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await handleResetPassword({ token, password })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // opened without a token (e.g. the link was cut off)
  if (!token) {
    return (
      <AuthShell
        eyebrow="Account recovery"
        title="Invalid reset link"
        subtitle="This link is missing its reset token. Request a new one to continue."
      >
        <Link to="/forgot-password" className={`${primaryButtonClass} block text-center`}>
          Request a new link
        </Link>
      </AuthShell>
    )
  }

  if (done) {
    return (
      <AuthShell
        eyebrow="All set"
        title="Password updated"
        subtitle="Your password has been changed. You can now sign in with it."
      >
        <div className="space-y-5">
          <p role="status" className={successBoxClass}>Password reset successfully.</p>
          <button type="button" onClick={() => navigate('/login')} className={primaryButtonClass}>
            Go to sign in
          </button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password"
      subtitle="Pick something you haven't used before."
      footer={<Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">Back to sign in</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div role="alert" className={errorBoxClass}>
            <p>{error}</p>
            {/invalid|expired/i.test(error) && (
              <Link to="/forgot-password" className="mt-2 inline-block font-semibold text-cyan-300 hover:text-cyan-200">
                Request a new link
              </Link>
            )}
          </div>
        )}
        <div>
          <label htmlFor="reset-password" className="mb-2 block text-sm font-medium text-slate-200">New password</label>
          <input
            id="reset-password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="8"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="reset-confirm" className="mb-2 block text-sm font-medium text-slate-200">Confirm password</label>
          <input
            id="reset-confirm"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength="8"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            className={inputClass}
          />
        </div>
        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? 'Updating password...' : 'Update password'}
        </button>
      </form>
    </AuthShell>
  )
}

export default ResetPassword
