import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'
import { getAdminEmail } from '@/lib/db'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const targetEmail = (body.email || await getAdminEmail()).trim()

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json({ error: 'No valid email configured' }, { status: 400 })
    }

    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASS
    if (!emailUser || !emailPass) {
      return NextResponse.json(
        { error: 'Email server not configured (EMAIL_USER / EMAIL_PASS missing in .env)' },
        { status: 503 }
      )
    }

    const transporter = nodemailer.createTransport({
      host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
      port:   parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth:   { user: emailUser, pass: emailPass },
    })

    await transporter.sendMail({
      from:    `"Nithya Stamp AI" <${emailUser}>`,
      to:      targetEmail,
      subject: '✅ Test Email — Nithya Stamp AI Notification System',
      html: `
        <div style="font-family:Georgia,serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
          <div style="background:linear-gradient(135deg,#0a0f2e,#1a3a6b);color:#fff;padding:30px;text-align:center">
            <h2 style="margin:0">🖊 Nithya Stamp AI</h2>
            <p style="margin:8px 0 0;opacity:.8">Admin Notification System</p>
          </div>
          <div style="padding:30px;color:#333">
            <h3 style="color:#1a3a6b">✅ Test Email Successful!</h3>
            <p>This is a test email confirming that your admin notification system is working correctly.</p>
            <p>New orders will be sent to: <strong>${targetEmail}</strong></p>
            <div style="background:#f0f4ff;border-left:4px solid #1a3a6b;padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0">
              Sent at: ${new Date().toLocaleString('en-IN')}
            </div>
          </div>
          <div style="background:#1a1a2e;color:#888;padding:16px;text-align:center;font-size:12px">
            Nithya Press, Alangulam — Admin System
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true, sentTo: targetEmail })
  } catch (err: any) {
    console.error('Test email error:', err)
    return NextResponse.json(
      { error: err.message?.includes('auth')
          ? 'Email authentication failed — check EMAIL_USER and EMAIL_PASS'
          : 'Failed to send test email' },
      { status: 500 }
    )
  }
}
