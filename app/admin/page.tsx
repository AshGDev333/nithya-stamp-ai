'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Eye, EyeOff, Loader2, ShieldAlert, LogOut } from 'lucide-react'
import { toast } from 'sonner'

/* ── Write / clear the HTTP-aware cookie so middleware can read it ── */
function setAdminCookie(token: string) {
  const expires = new Date(Date.now() + 8 * 3600 * 1000).toUTCString()
  document.cookie = `admin_token=${token}; path=/; expires=${expires}; SameSite=Strict`
}
function clearAdminCookie() {
  document.cookie = 'admin_token=; path=/; max-age=0; SameSite=Strict'
}

/** Quick client-side expiry check (does NOT verify secret — that's the server's job). */
function isTokenFreshEnough(token: string): boolean {
  try {
    const decoded = atob(token)
    const firstColon  = decoded.indexOf(':')
    const secondColon = decoded.indexOf(':', firstColon + 1)
    if (firstColon === -1 || secondColon === -1) return false
    const ts  = parseInt(decoded.slice(firstColon + 1, secondColon), 10)
    const age = Date.now() - ts
    return age > 0 && age < 8 * 3600 * 1000
  } catch { return false }
}

export default function AdminLoginPage() {
  const router   = useRouter()
  const params   = useSearchParams()
  const reason   = params.get('reason')
  const redirect = params.get('redirect') || '/admin/orders'

  const [form,      setForm]      = useState({ username: '', password: '' })
  const [showPw,    setShowPw]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [err,       setErr]       = useState('')
  const [attempts,  setAttempts]  = useState(0)
  const [locked,    setLocked]    = useState(false)
  const [lockTimer, setLockTimer] = useState(0)
  const [alreadyIn, setAlreadyIn] = useState(false)

  /* On mount: check if we have a seemingly-valid token in localStorage.
     If reason === 'auth_required' the middleware already rejected us,
     so show the "already in" banner (with sign-out option) instead of
     auto-redirecting, which would cause a redirect loop. */
  useEffect(() => {
    const lsToken = localStorage.getItem('admin_token')
    if (lsToken && isTokenFreshEnough(lsToken)) {
      // Sync localStorage token → cookie so middleware can verify on page nav
      setAdminCookie(lsToken)

      if (reason === 'auth_required') {
        // Middleware rejected — cookie may be missing or invalid.
        // Show banner; user can try "Continue" or sign out.
        setAlreadyIn(true)
      } else {
        // No auth error — token looks fresh, go straight to panel
        router.replace(redirect)
      }
    }
  }, [reason, redirect, router])

  /* Lock countdown */
  useEffect(() => {
    if (lockTimer <= 0) return
    const t = setTimeout(() => setLockTimer(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [lockTimer])
  useEffect(() => { if (lockTimer === 0 && locked) setLocked(false) }, [lockTimer, locked])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    clearAdminCookie()
    setAlreadyIn(false)
    toast.info('Logged out — please sign in again')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (locked) return
    setErr(''); setLoading(true)
    try {
      const res  = await fetch('/api/admin/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        const next = attempts + 1
        setAttempts(next)
        if (next >= 5) {
          setLocked(true); setLockTimer(60)
          setErr('Too many failed attempts. Locked for 60 seconds.')
        } else {
          setErr(`${data.error || 'Invalid credentials'} — ${5 - next} attempt${5-next===1?'':'s'} left`)
        }
        return
      }

      /* Store token in BOTH localStorage (for API Bearer calls)
         AND cookie (for middleware page-navigation checks). */
      localStorage.setItem('admin_token', data.token)
      setAdminCookie(data.token)
      setAttempts(0)
      toast.success('Welcome back, Admin!')
      router.replace(redirect)

    } catch {
      setErr('Network error. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#070e2e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage:'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize:'60px 60px' }} />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-sm">

        {/* ── Brand ── */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden bg-[#1e3a8a]">
            <img
              src="/horse-logo-BGR.png"
              alt="logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            Nithya <span className="text-blue-400">Stamp</span>
            <span className="text-amber-400"> AI</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Nithya Press, Alangulam · Admin Portal</p>
        </div>

        {/* ── Auth-required banner ── */}
        {reason === 'auth_required' && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-4 mb-5 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">Access denied. Please sign in to continue.</p>
          </div>
        )}

        {/* ── Already logged-in notice (security: don't auto-bypass) ── */}
        {alreadyIn && (
          <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-2xl p-4 mb-5">
            <p className="text-emerald-300 text-sm font-semibold mb-2">✅ You are already logged in</p>
            <p className="text-emerald-400/70 text-xs mb-3">
              Your admin session is active. Continue to the panel or log out for a fresh sign-in.
            </p>
            <div className="flex gap-2">
              <button onClick={() => router.push(redirect)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors active:scale-95">
                Continue to Panel →
              </button>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-red-500/40 text-red-400 hover:bg-red-900/30 text-sm rounded-xl transition-colors active:scale-95">
                <LogOut className="w-4 h-4" />Sign out
              </button>
            </div>
          </div>
        )}

        {/* ── Login form ── */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-[#0d1b4b]" />
            <h2 className="font-semibold text-[#0d1b4b]">
              {alreadyIn ? 'Sign in with a different account' : 'Sign in to Admin'}
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="field-label">Username</label>
              <input
                className="field-input"
                placeholder="admin"
                autoComplete="username"
                disabled={locked}
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <input
                  className="field-input pr-10"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={locked}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {err && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">{err}</div>
            )}
            {locked && lockTimer > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-700 text-center">
                🔒 Locked — try again in {lockTimer}s
              </div>
            )}

            <button
              type="submit"
              disabled={loading || locked}
              className="w-full flex items-center justify-center gap-2 bg-[#0d1b4b] text-white font-bold py-3.5 rounded-xl hover:bg-[#1a3a8b] transition-colors disabled:opacity-60 active:scale-95 mt-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                : 'Sign In →'
              }
            </button>
          </form>

          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
              <p className="text-xs text-amber-700">
                Dev: <code className="font-mono font-bold">admin</code> / <code className="font-mono font-bold">admin123</code>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          🔒 Restricted to authorised Nithya Press personnel only
        </p>
      </div>
    </div>
  )
}
