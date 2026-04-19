import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, updateOrderStatus } from '@/lib/db'
import { sendDeliveryConfirmationEmail } from '@/lib/email'
import { verifyAdminToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { orderId } = await req.json()
    if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })

    const order = await getOrderById(orderId)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    await updateOrderStatus(orderId, 'delivered')

    await sendDeliveryConfirmationEmail({
      id: order.id,
      customerName:    order.customer_name,
      customerEmail:   order.customer_email,
      stampSvg:        order.stamp_svg,
      stampShape:      order.stamp_shape,
      stampSize:       order.stamp_size,
      stampColor:      order.stamp_color,
      quantity:        order.quantity,
      total:           order.total,
      customerAddress: order.customer_address,
      customerCity:    order.customer_city,
      customerState:   order.customer_state,
      customerPincode: order.customer_pincode,
    })

    return NextResponse.json({
      success: true,
      message: `Delivery confirmation sent to ${order.customer_email}`,
    })
  } catch (err: any) {
    console.error('Deliver route error:', err)
    return NextResponse.json({ error: 'Failed to send delivery email' }, { status: 500 })
  }
}
