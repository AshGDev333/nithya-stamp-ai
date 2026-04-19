import { NextRequest, NextResponse } from 'next/server'
import { getOrderStats } from '@/lib/db'
import { verifyAdminToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const stats = await getOrderStats()
    return NextResponse.json({ stats })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
