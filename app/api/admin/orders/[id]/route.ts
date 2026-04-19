import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus, getOrderById } from '@/lib/db'
import { verifyAdminToken } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { status } = await req.json()
    const validStatuses = ['pending', 'processing', 'printing', 'shipped', 'delivered']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    const order = await getOrderById(params.id)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    await updateOrderStatus(params.id, status)
    return NextResponse.json({ success: true, orderId: params.id, status })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const order = await getOrderById(params.id)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json({ order })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
