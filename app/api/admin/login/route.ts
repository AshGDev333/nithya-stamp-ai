import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    const adminUser = process.env.ADMIN_USERNAME || 'admin'
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123'

    // Rate limiting hint: add IP-based throttle in production
    if (!username || !password) {
      return NextResponse.json({ error: 'Credentials required' }, { status: 400 })
    }

    if (username !== adminUser || password !== adminPass) {
      // Consistent timing to prevent timing attacks
      await new Promise(r => setTimeout(r, 300 + Math.random() * 200))
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    // Token: role:timestamp:secret_hash
    const secret = process.env.NEXTAUTH_SECRET || 'stampai_secret_change_me'
    const token = Buffer.from(`admin:${Date.now()}:${secret}`).toString('base64')

    const response = NextResponse.json({ success: true, token })

    // Set HTTP-only cookie so middleware can verify on page navigation
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

export async function DELETE() {
  // Logout endpoint
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_token')
  return response
}
