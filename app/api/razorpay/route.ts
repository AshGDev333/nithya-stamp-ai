import { NextRequest, NextResponse } from 'next/server'
import { getStoredPrice } from '@/lib/db'
import { getPriceBySize } from '@/lib/utils'

const MIN_AMOUNT =   100
const MAX_AMOUNT = 50_000

export async function POST(req: NextRequest) {
  try {
    const { sizeKey, quantity, currency = 'INR', receipt } = await req.json()

    const qty  = Math.max(1, Math.min(100, parseInt(quantity) || 1))
    const unit = (await getStoredPrice(sizeKey || '63x23')) ?? getPriceBySize(sizeKey || '63x23')
    const amount = unit * qty

    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 })
    }

    const keyId     = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json({
        id:       `mock_order_${Date.now()}`,
        amount:   Math.round(amount * 100),
        currency,
        receipt,
        status:   'created',
        mock:     true,
      })
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount:   Math.round(amount * 100),
        currency,
        receipt:  receipt || `receipt_${Date.now()}`,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.description || 'Razorpay order creation failed')
    }

    const order = await response.json()
    return NextResponse.json(order)
  } catch (err: any) {
    console.error('Razorpay order error:', err)
    return NextResponse.json({ error: 'Payment initiation failed' }, { status: 500 })
  }
}
