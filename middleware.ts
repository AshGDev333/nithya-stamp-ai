import { NextRequest, NextResponse } from 'next/server'

// NOTE: middleware runs in the Next.js Edge runtime — Node.js APIs like
// `Buffer` and `crypto` (built-in) are NOT available here.
// We use Web-standard APIs only: `atob()` and `TextEncoder`.

/* ── Routes that require admin authentication ── */
const ADMIN_PROTECTED = [
  '/admin/orders',
  '/admin/dashboard',
  '/admin/settings',
]

function getSecret(): string {
  return process.env.NEXTAUTH_SECRET || 'stampai_secret_change_me'
}

/** Constant-time string comparison using Web APIs (Edge-safe). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const ea = new TextEncoder().encode(a)
  const eb = new TextEncoder().encode(b)
  let diff = 0
  for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i]
  return diff === 0
}

function isValidAdminToken(token: string | null | undefined): boolean {
  if (!token) return false
  try {
    // `atob` is available in both Edge and browser environments
    const decoded = atob(token)

    // Expected format: "admin:<timestamp>:<secret>"
    const firstColon  = decoded.indexOf(':')
    const secondColon = decoded.indexOf(':', firstColon + 1)
    if (firstColon === -1 || secondColon === -1) return false

    const role        = decoded.slice(0, firstColon)
    const timestamp   = decoded.slice(firstColon + 1, secondColon)
    const tokenSecret = decoded.slice(secondColon + 1)

    if (role !== 'admin') return false
    if (!safeEqual(tokenSecret, getSecret())) return false

    const ts = parseInt(timestamp, 10)
    if (isNaN(ts)) return false
    const age = Date.now() - ts
    return age > 0 && age < 8 * 60 * 60 * 1000 // 8 hours
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Protect admin sub-pages ──
  const isAdminProtected = ADMIN_PROTECTED.some(p => pathname.startsWith(p))

  if (isAdminProtected) {
    // Cookie is the authoritative token at middleware level
    const cookieToken  = request.cookies.get('admin_token')?.value
    const headerToken  = request.headers.get('x-admin-token')
    const token        = cookieToken ?? headerToken

    if (!isValidAdminToken(token)) {
      const loginUrl = new URL('/admin', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      loginUrl.searchParams.set('reason',   'auth_required')
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── Security headers on every response ──
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options',  'nosniff')
  response.headers.set('X-Frame-Options',          'DENY')
  response.headers.set('X-XSS-Protection',         '1; mode=block')
  response.headers.set('Referrer-Policy',          'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy',       'camera=(), microphone=(), geolocation=()')
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }
  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
