import { NextRequest, NextResponse } from 'next/server'
import { getOrdersByEmail } from '@/lib/db'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function maskOrder(o: any) {
  const { stamp_svg, admin_notified, payment_id, ...safe } = o
  return safe
}

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email')
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    const orders = await getOrdersByEmail(email)
    return NextResponse.json({ orders: orders.map(maskOrder) })
  } catch (err: any) {
    console.error('Get orders error:', err)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
