import { NextRequest } from 'next/server'
import { timingSafeEqual } from 'crypto'

// Never fall back to a predictable default in production.
// Fail loudly if the env var is missing.
function getSecret(): string {
  const s = process.env.NEXTAUTH_SECRET
  if (!s && process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET env var is required in production')
  }
  return s || 'stampai_secret_change_me'
}

export function verifyAdminToken(req: NextRequest): boolean {
  // Prefer HTTP-only cookie; fall back to Bearer header
  const cookieToken = req.cookies.get('admin_token')?.value
  const authHeader  = req.headers.get('Authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  return isTokenValid(cookieToken ?? bearerToken)
}

export function isTokenValid(token: string | null | undefined): boolean {
  if (!token) return false
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    // Expected format: "admin:<timestamp>:<secret>"
    const firstColon  = decoded.indexOf(':')
    const secondColon = decoded.indexOf(':', firstColon + 1)
    if (firstColon === -1 || secondColon === -1) return false

    const role      = decoded.slice(0, firstColon)
    const timestamp = decoded.slice(firstColon + 1, secondColon)
    const tokenSecret = decoded.slice(secondColon + 1)

    if (role !== 'admin') return false

    // ── Constant-time secret comparison to prevent timing attacks ──
    const expectedSecret = getSecret()
    if (tokenSecret.length !== expectedSecret.length) return false
    const secretMatch = timingSafeEqual(
      Buffer.from(tokenSecret),
      Buffer.from(expectedSecret),
    )
    if (!secretMatch) return false

    // ── Expiry check (8 hours) ──
    const ts = parseInt(timestamp, 10)
    if (isNaN(ts)) return false
    const age = Date.now() - ts
    return age > 0 && age < 8 * 60 * 60 * 1000
  } catch {
    return false
  }
}
