import { NextRequest, NextResponse } from 'next/server'
import { generateStampSVGs } from '@/lib/stampGenerator'
import { StampRequirements } from '@/types'

const MAX_TEXT_LEN = 200
const VALID_SHAPES = ['rectangle', 'circle', 'oval', 'square']
const VALID_COLORS = ['blue', 'red', 'black', 'green', 'purple']
const VALID_STAMP_TYPES = ['address', 'round', 'signature', 'date', 'custom']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const companyName = (body.companyName || '').trim().slice(0, MAX_TEXT_LEN)
    if (!companyName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    const requirements = {
      companyName,
      line2:      (body.line2      || '').trim().slice(0, MAX_TEXT_LEN),
      line3:      (body.line3      || '').trim().slice(0, MAX_TEXT_LEN),
      phone:      (body.phone      || '').trim().slice(0, 20),
      email:      (body.email      || '').trim().slice(0, 254),
      website:    (body.website    || '').trim().slice(0, 200),
      customText: (body.customText || '').trim().slice(0, MAX_TEXT_LEN),
      shape:      VALID_SHAPES.includes(body.shape)           ? body.shape      : 'rectangle',
      size:       typeof body.size === 'number'               ? body.size       : 38,
      color:      VALID_COLORS.includes(body.color)           ? body.color      : 'blue',
      style:      body.style || 'classic',
      stampType:  VALID_STAMP_TYPES.includes(body.stampType)  ? body.stampType  : 'address',
      sizeKey:    body.sizeKey || '63x23',
      logoSvg:    body.logoSvg && typeof body.logoSvg === 'string' && body.logoSvg.length < 50_000
                    ? body.logoSvg
                    : undefined,
    } as StampRequirements & { stampType: string; sizeKey: string }

    console.log(`[API /generate-stamp] company="${requirements.companyName}" type="${requirements.stampType}" size="${requirements.sizeKey}" color="${requirements.color}"`)

    const svgs = await generateStampSVGs(requirements)
    const source = process.env.ANTHROPIC_API_KEY ? 'claude+fallback' : 'local'

    return NextResponse.json({
      svgs,
      count:   svgs.length,
      type:    requirements.stampType,
      sizeKey: requirements.sizeKey,
      source,
    })
  } catch (err: any) {
    console.error('[API /generate-stamp] Error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
