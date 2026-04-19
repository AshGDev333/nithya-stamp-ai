import { NextRequest, NextResponse } from 'next/server'
import { getAllOrders, searchOrders, getOrderStats } from '@/lib/db'
import { verifyAdminToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const url = req.nextUrl
    const q = url.searchParams.get('q') || ''
    const status = url.searchParams.get('status') || ''

    let orders = q ? await searchOrders(q) : await getAllOrders()
    if (status) orders = orders.filter((o: any) => o.status === status)

    return NextResponse.json({ orders })
  } catch (err: any) {
    console.error('Admin orders error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
