import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'
import { getSetting, setSetting, deleteSetting, getAllStoredPrices, getAdminEmail } from '@/lib/db'
import { STAMP_SIZE_OPTIONS, getPriceBySize } from '@/lib/utils'

export async function GET(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const storedPrices = await getAllStoredPrices()
    const prices: Record<string, number> = {}
    for (const opt of STAMP_SIZE_OPTIONS) {
      prices[opt.value] = storedPrices[opt.value] ?? opt.price
    }
    return NextResponse.json({ prices, adminEmail: await getAdminEmail() })
  } catch (err: any) {
    console.error('Settings load error:', err)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()

    if (body.prices && typeof body.prices === 'object') {
      for (const opt of STAMP_SIZE_OPTIONS) {
        const val = body.prices[opt.value]
        if (typeof val === 'number' && val > 0 && val <= 99999) {
          if (val === opt.price) {
            await deleteSetting(`price_${opt.value}`)
          } else {
            await setSetting(`price_${opt.value}`, String(val))
          }
        }
      }
    }

    if (typeof body.adminEmail === 'string') {
      const email = body.adminEmail.trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
      }
      await setSetting('admin_email', email)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Settings save error:', err)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
