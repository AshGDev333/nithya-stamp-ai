import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createOrder, getStoredPrice } from '@/lib/db'
import { sendAdminOrderNotification, sendOrderConfirmationEmail } from '@/lib/email'
import { generateOrderId, getPriceBySize } from '@/lib/utils'

const MAX_NAME_LEN    = 120
const MAX_EMAIL_LEN   = 254
const MAX_PHONE_LEN   = 20
const MAX_ADDRESS_LEN = 500
const MAX_SVG_LEN     = 300_000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) return true
  const expected = createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')
  return expected === signature
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      customer, stampSvg, stampRequirements, stampShape, stampSize, stampColor,
      quantity, sizeKey, razorpayOrderId, razorpayPaymentId, razorpaySignature,
    } = body

    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
      return NextResponse.json({ error: 'Customer details are required' }, { status: 400 })
    }
    if (customer.name.length    > MAX_NAME_LEN)    return NextResponse.json({ error: 'Name too long' },    { status: 400 })
    if (customer.email.length   > MAX_EMAIL_LEN)   return NextResponse.json({ error: 'Email too long' },   { status: 400 })
    if (customer.phone.length   > MAX_PHONE_LEN)   return NextResponse.json({ error: 'Phone too long' },   { status: 400 })
    if (customer.address.length > MAX_ADDRESS_LEN) return NextResponse.json({ error: 'Address too long' }, { status: 400 })
    if (!EMAIL_RE.test(customer.email))             return NextResponse.json({ error: 'Invalid email' },    { status: 400 })
    if (!stampSvg)                                  return NextResponse.json({ error: 'Stamp design is required' }, { status: 400 })
    if (stampSvg.length > MAX_SVG_LEN)              return NextResponse.json({ error: 'Stamp SVG too large' },     { status: 400 })

    const qty = Math.max(1, Math.min(100, parseInt(quantity) || 1))
    const unitPrice = (await getStoredPrice(sizeKey || '63x23')) ?? getPriceBySize(sizeKey || '63x23')
    const total = unitPrice * qty

    if (razorpayOrderId && razorpayPaymentId) {
      if (!razorpaySignature) {
        return NextResponse.json({ error: 'Payment signature missing' }, { status: 400 })
      }
      if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
      }
    }

    const orderId = generateOrderId()

    await createOrder({
      id: orderId,
      customerName:    customer.name.trim(),
      customerEmail:   customer.email.trim().toLowerCase(),
      customerPhone:   customer.phone.trim(),
      customerAddress: customer.address.trim(),
      customerCity:    (customer.city    || '').slice(0, 100).trim(),
      customerState:   (customer.state   || '').slice(0, 100).trim(),
      customerPincode: (customer.pincode || '').slice(0, 10).trim(),
      stampSvg,
      stampRequirements: stampRequirements || '{}',
      stampShape:  stampShape || 'circle',
      stampSize:   stampSize  || 38,
      stampColor:  stampColor || 'blue',
      quantity: qty,
      price: unitPrice,
      total,
      paymentId: razorpayPaymentId || undefined,
    })

    const orderData = {
      id: orderId,
      customerName: customer.name, customerEmail: customer.email,
      customerPhone: customer.phone, customerAddress: customer.address,
      customerCity: customer.city || '', customerState: customer.state || '',
      customerPincode: customer.pincode || '',
      stampSvg, stampRequirements: stampRequirements || '{}',
      stampShape: stampShape || 'circle', stampSize: stampSize || 38,
      stampColor: stampColor || 'blue',
      quantity: qty, price: unitPrice, total,
      createdAt: new Date().toISOString(),
    }

    Promise.all([
      sendAdminOrderNotification(orderData).catch(e => console.error('Admin email failed:', e)),
      sendOrderConfirmationEmail({ id: orderId, customerName: customer.name, customerEmail: customer.email, total })
        .catch(e => console.error('Confirmation email failed:', e)),
    ])

    return NextResponse.json({ success: true, orderId })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 })
  }
}
