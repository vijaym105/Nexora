import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import AuthShell from '../components/AuthShell'
import { inputClass, primaryButtonClass, errorBoxClass, successBoxClass } from '../components/authStyles'

const Spinner = () => (
  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-cyan-300" role="status" aria-label="Verifying" />
)

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  // 'loading' | 'success' | 'error'
  const [status, setStatus] = useState(token ? 'loading' : 'error')
  const [message, setMessage] = useState(token ? '' : 'This verification link is missing its token.')

  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState(null)
  const [resendError, setResendError] = useState(null)

  const { handleVerifyEmail, handleResendVerification } = useAuth()
  const hasRun = useRef(false)

  useEffect(() => {
    if (!token || hasRun.current) return
    hasRun.current = true

    handleVerifyEmail(token)
      .then((data) => {
        setMessage(data.message)
        setStatus('success')
      })
      .catch((err) => {
        setMessage(err.response?.data?.message || 'We could not verify your email. Please try again.')
        setStatus('error')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleResend = async (event) => {
    event.preventDefault()
    setResending(true)
    setResendError(null)
    setResendMessage(null)
    try {
      const data = await handleResendVerification(email)
      setResendMessage(data.message)
    } catch (err) {
      setResendError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setResending(false)
    }
  }

  if (status === 'loading') {
    return (
      <AuthShell eyebrow="Email verification" title="Verifying your email" subtitle="Hang tight, this only takes a moment.">
        <Spinner />
      </AuthShell>
    )
  }

  if (status === 'success') {
    return (
      <AuthShell eyebrow="Email verification" title="You're verified" subtitle="Your account is active and ready to go.">
        <div className="space-y-5">
          <p role="status" className={successBoxClass}>{message}</p>
          <Link to="/login" className={`${primaryButtonClass} block text-center`}>
            Continue to sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      eyebrow="Email verification"
      title="Verification failed"
      subtitle="Enter your email and we'll send you a fresh link."
      footer={<Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">Back to sign in</Link>}
    >
      <div className="space-y-5">
        <p role="alert" className={errorBoxClass}>{message}</p>

        {resendMessage ? (
          <p role="status" className={successBoxClass}>{resendMessage}</p>
        ) : (
          <form onSubmit={handleResend} className="space-y-5">
            {resendError && <p role="alert" className={errorBoxClass}>{resendError}</p>}
            <div>
              <label htmlFor="resend-email" className="mb-2 block text-sm font-medium text-slate-200">Email</label>
              <input
                id="resend-email"
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
            <button type="submit" disabled={resending} className={primaryButtonClass}>
              {resending ? 'Sending...' : 'Send a new verification link'}
            </button>
          </form>
        )}
      </div>
    </AuthShell>
  )
}

export default VerifyEmail
