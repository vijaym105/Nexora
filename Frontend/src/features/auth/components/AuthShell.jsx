import { Link } from 'react-router'

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

// Centered glass card used by the verify-email / forgot-password / reset-password pages.
const AuthShell = ({ eyebrow, title, subtitle, children, footer }) => (
  <main className="relative min-h-screen overflow-hidden bg-[#06040f] px-4 py-8 text-slate-100 sm:px-8 sm:py-10">
    {/* ambient glow */}
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-violet-700/30 blur-[120px] sm:h-[520px] sm:w-[520px]" />
      <div className="absolute -bottom-40 -right-24 h-[420px] w-[420px] rounded-full bg-blue-600/25 blur-[130px] sm:h-[560px] sm:w-[560px]" />
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[110px]" />
    </div>

    <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
      <section className="w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-10">
        <div className="mb-8">
          <Logo />
        </div>

        <div className="mb-8">
          {eyebrow && <p className="mb-2 text-sm font-medium text-cyan-300">{eyebrow}</p>}
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-3 text-sm text-slate-400">{subtitle}</p>}
        </div>

        {children}

        {footer && <div className="mt-8 text-center text-sm text-slate-400">{footer}</div>}
      </section>
    </div>
  </main>
)

export default AuthShell
