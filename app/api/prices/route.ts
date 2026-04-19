import { NextResponse } from 'next/server'
import { getAllStoredPrices } from '@/lib/db'
import { STAMP_SIZE_OPTIONS } from '@/lib/utils'

export async function GET() {
  try {
    const stored = await getAllStoredPrices()
    const prices: Record<string, number> = {}
    for (const opt of STAMP_SIZE_OPTIONS) {
      prices[opt.value] = stored[opt.value] ?? opt.price
    }
    return NextResponse.json({ prices })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 })
  }
}
