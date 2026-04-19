/**
 * StampAI — 18 Professional Stamp Templates
 * Exactly matching real Indian rubber stamp designs
 * 6 types × 3 layouts (A/B/C) per type
 *
 * Based on real Nithya Press / Trodat Flashy stamp photos:
 *  - Address Stamp 63×23, Address+Logo 63×23, Name Stamp 63×23
 *  - Proprietor/Signature 63×23, Round Seal 30×30, Logo Stamp
 */

import { StampRequirements } from '@/types'

// ─── Ink colors ────────────────────────────────────────────
const INK: Record<string, string> = {
  blue:   '#1a3a8b',
  red:    '#8b0000',
  black:  '#111111',
  green:  '#145214',
  purple: '#4a0e8f',
}

// ─── Size → canvas pixels (6 px per mm) ───────────────────
const DIMS: Record<string, { W: number; H: number }> = {
  '60x20': { W: 360, H: 120 },
  '63x23': { W: 378, H: 138 },
  '52x33': { W: 312, H: 198 },
  '67x32': { W: 402, H: 192 },
  '80x50': { W: 480, H: 300 },
  'r30':   { W: 300, H: 300 },
  'r30p':  { W: 300, H: 300 },
  'r40':   { W: 400, H: 400 },
  'r40l':  { W: 400, H: 400 },
}

// ─── Helpers ───────────────────────────────────────────────
const esc = (s: string) =>
  (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')

const fit = (s: string, max: number) => {
  const t = esc(s || '')
  return t.length > max ? t.slice(0, max - 1) + '…' : t
}

// Scale font so text (Arial ~0.58 char ratio) fits in maxPx
const autoFS = (text: string, maxPx: number, maxFS: number, minFS = 9) =>
  !text ? maxFS : Math.max(minFS, Math.min(maxFS, Math.floor(maxPx / (text.length * 0.58))))

// Centered text element
const tx = (
  x: number, y: number, text: string, fs: number, fill: string,
  opts: { w?: string; f?: string; ls?: number; anchor?: string } = {}
) => `<text x="${x}" y="${y}" text-anchor="${opts.anchor || 'middle'}" dominant-baseline="middle"
  font-family="${opts.f || 'Arial,Helvetica,sans-serif'}"
  font-size="${fs}" font-weight="${opts.w || '400'}"
  fill="${fill}"${opts.ls ? ` letter-spacing="${opts.ls}"` : ''}>${text}</text>`

const bold_fam = "'Arial Black',Arial,sans-serif"

// Wrap in SVG tag
const wrap = (W: number, H: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}\n</svg>`

// ══════════════════════════════════════════════════════════════
//  1. ADDRESS STAMP
//  Based on: NITHYA PRESS Address Stamp 63×23
// ══════════════════════════════════════════════════════════════

/**
 * 1A — Classic Stack (exactly like NITHYA PRESS address stamp)
 * Company name BOLD large, address rows centered, phone at bottom
 */
function addr_A(r: StampRequirements, W: number, H: number): string {
  const c    = INK[r.color] || INK.black
  const name = fit(r.companyName, 28)
  const l2   = fit(r.line2 || '', 46)  // "TENKASI MAIN ROAD,"
  const l3   = fit(r.line3 || '', 52)  // "ALANGULAM - 627 851."
  const ph   = r.phone ? `Cell: ${fit(r.phone, 22)}` : ''
  const rows = [l2, l3, ph].filter(Boolean)
  const cx   = W / 2
  const pad  = 8

  const nameFS = autoFS(name, W - 28, 22, 12)
  const rowFS  = autoFS(l3 || l2 || '', W - 20, 14, 9)
  const usableH = H - pad * 2
  const nameH   = nameFS * 1.6
  const rowH    = rows.length ? (usableH - nameH - 12) / rows.length : 20
  const safeRH  = Math.min(rowH, 24)

  let y = pad + nameH * 0.7
  const els: string[] = []

  // Company name — BOLD like real stamp
  els.push(tx(cx, y, name, nameFS, c, { w: '900', f: bold_fam, ls: 0.5 }))
  y += nameH * 0.52 + 5
  // Thick rule under name
  els.push(`<line x1="${pad + 10}" y1="${y}" x2="${W - pad - 10}" y2="${y}" stroke="${c}" stroke-width="1.8"/>`)
  y += safeRH * 0.55

  rows.forEach((row) => {
    const isBold = row === l2 // first address line often slightly bold
    const isCellBold = row === ph
    els.push(tx(cx, y, row, isCellBold ? rowFS + 1 : rowFS, c, {
      w: isCellBold ? '700' : isBold ? '500' : '400'
    }))
    y += safeRH
  })

  return wrap(W, H, `
  <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" rx="5"
    fill="none" stroke="${c}" stroke-width="3"/>
  ${els.join('\n  ')}`)
}

/**
 * 1B — Name + Bold Designation + Address (like M.RAJESH Name Stamp)
 * Personal name large, designation bold, address lines, cell
 */
function addr_B(r: StampRequirements, W: number, H: number): string {
  const c    = INK[r.color] || INK.black
  const name = fit(r.companyName, 28)
  const des  = fit(r.line2 || '', 40)  // "PRINTING & BINDING MANAGER"
  const l3   = fit(r.line3 || '', 50)  // "ALANGULAM - 627 851."
  const ph   = r.phone ? `Cell: ${fit(r.phone, 22)}` : ''
  const rows = [des, l3, ph].filter(Boolean)
  const cx   = W / 2
  const pad  = 8

  const nameFS = autoFS(name, W - 28, 20, 11)
  const desFS  = autoFS(des, W - 20, 15, 9)
  const rowFS  = autoFS(l3, W - 20, 13, 8)

  const usableH = H - pad * 2
  const rh      = usableH / (rows.length + 1.2)
  let y = pad + rh * 0.82

  const els: string[] = []
  // Name
  els.push(tx(cx, y, name, nameFS, c, { w: '900', f: bold_fam, ls: 0.3 }))
  y += rh * 0.95
  els.push(`<line x1="${pad + 12}" y1="${y - rh * 0.3}" x2="${W - pad - 12}" y2="${y - rh * 0.3}" stroke="${c}" stroke-width="1.5"/>`)
  rows.forEach(row => {
    const isDes  = row === des
    const isCell = row === ph
    els.push(tx(cx, y, row,
      isDes ? desFS : isCell ? rowFS + 1 : rowFS, c,
      { w: isDes ? '700' : isCell ? '700' : '400' }))
    y += rh
  })

  return wrap(W, H, `
  <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" rx="5"
    fill="none" stroke="${c}" stroke-width="3.5"/>
  ${els.join('\n  ')}`)
}

/**
 * 1C — Address with Logo (like NITHYA PRESS Address+Logo 63×23)
 * Logo/image on left side, company name bold + address rows on right
 */
function addr_C(r: StampRequirements, W: number, H: number): string {
  const c    = INK[r.color] || INK.black
  const name = fit(r.companyName, 22)
  const l2   = fit(r.line2 || '', 36)
  const l3   = fit(r.line3 || '', 40)
  const ph   = r.phone ? `Cell: ${fit(r.phone, 20)}` : ''
  const rows = [l2, l3, ph].filter(Boolean)

  const logoW = Math.round(W * 0.28)
  const textX = logoW + 14
  const textW = W - textX - 8
  const cx    = textX + textW / 2
  const pad   = 8
  const init  = (r.companyName || '').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const nameFS = autoFS(name, textW, 18, 10)
  const rowFS  = autoFS(l3 || l2, textW, 13, 8)
  const usable = H - pad * 2
  const rh     = usable / (rows.length + 1.2)
  let y        = pad + rh * 0.8

  const els: string[] = []
  els.push(tx(cx, y, name, nameFS, c, { w: '900', f: bold_fam }))
  y += rh
  els.push(`<line x1="${textX + 2}" y1="${y - rh * 0.38}" x2="${W - pad - 4}" y2="${y - rh * 0.38}" stroke="${c}" stroke-width="1.5"/>`)
  rows.forEach(row => {
    const isCell = row === ph
    els.push(tx(cx, y, row, isCell ? rowFS + 1 : rowFS, c, { w: isCell ? '700' : '400' }))
    y += rh
  })

  const logoContent = r.logoSvg
    ? `<g transform="translate(${pad + 2},${pad + 2}) scale(${(H - pad * 2 - 4) / 100})">${r.logoSvg}</g>`
    : `<text x="${logoW / 2 + pad}" y="${H / 2 + 5}" text-anchor="middle" dominant-baseline="middle"
        font-family="'Arial Black',Arial" font-size="${Math.round(Math.min(logoW, H) * 0.32)}"
        fill="${c}" opacity="0.5">${init}</text>`

  return wrap(W, H, `
  <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" rx="5"
    fill="none" stroke="${c}" stroke-width="3.5"/>
  <rect x="${pad + 5}" y="${pad + 5}" width="${W - pad * 2 - 10}" height="${H - pad * 2 - 10}" rx="3"
    fill="none" stroke="${c}" stroke-width="1"/>
  <!-- Logo area -->
  ${logoContent}
  <!-- Vertical separator -->
  <line x1="${logoW + 12}" y1="${pad + 8}" x2="${logoW + 12}" y2="${H - pad - 8}"
    stroke="${c}" stroke-width="1.5"/>
  ${els.join('\n  ')}`)
}


// ══════════════════════════════════════════════════════════════
//  2. PREMIUM HEADER
//  Filled header + content body
// ══════════════════════════════════════════════════════════════

/**
 * 2A — Filled Black Bar (like real "KGF" style)
 * Solid filled top bar, white company name, address below
 */
function prem_A(r: StampRequirements, W: number, H: number): string {
  const c    = INK[r.color] || INK.black
  const name = fit(r.companyName, 26)
  const l2   = fit(r.line2 || '', 44)
  const l3   = fit(r.line3 || '', 50)
  const ph   = r.phone ? `Cell: ${fit(r.phone, 22)}` : ''
  const rows = [l2, l3, ph].filter(Boolean)
  const cx   = W / 2
  const pad  = 8

  const nameFS   = autoFS(name, W - 40, 21, 12)
  const headerH  = Math.min(nameFS * 2.2, H * 0.44)
  const rowFS    = autoFS(l3 || l2, W - 30, 13, 9)
  const bodyH    = H - pad - headerH - 6
  const rh       = rows.length ? Math.min(bodyH / rows.length, 26) : 22

  let ry = pad + headerH + rh * 0.65
  const rowEls = rows.map(row => {
    const isCell = row === ph
    const el = tx(cx, ry, row, isCell ? rowFS + 1 : rowFS, c, { w: isCell ? '700' : '400' })
    ry += rh
    return el
  }).join('\n  ')

  const logo = r.logoSvg
    ? `<g transform="translate(${pad + 4},${pad + 4}) scale(${(headerH - 8) / 100})">${r.logoSvg}</g>`
    : ''
  const nx = r.logoSvg ? Math.round(W * 0.62) : cx

  return wrap(W, H, `
  <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" rx="4"
    fill="none" stroke="${c}" stroke-width="4.5"/>
  <rect x="${pad + 6}" y="${pad + 6}" width="${W - pad * 2 - 12}" height="${H - pad * 2 - 12}" rx="2"
    fill="none" stroke="${c}" stroke-width="1"/>
  <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${headerH}" fill="${c}" rx="4"/>
  ${logo}
  ${tx(nx, pad + headerH * 0.5, name, nameFS, c, { w: '900', f: bold_fam, ls: 0.5 })}
  ${rowEls}`)
}

/**
 * 2B — Double Border Serif
 * Thick outer + thin inner border, serif company name
 */
function prem_B(r: StampRequirements, W: number, H: number): string {
  const c    = INK[r.color] || INK.black
  const name = fit(r.companyName, 26)
  const l2   = fit(r.line2 || '', 44)
  const l3   = fit(r.line3 || '', 50)
  const ph   = r.phone ? `☎  ${fit(r.phone, 22)}` : ''
  const rows = [l2, l3, ph].filter(Boolean)
  const cx   = W / 2
  const op   = 6, ip = 14

  const nameFS  = autoFS(name, W - 50, 20, 11)
  const nameH   = Math.min(nameFS * 2.0, (H - ip * 2) * 0.42)
  const divY    = ip + nameH + 6
  const bodyH   = H - divY - ip - 8
  const rh      = rows.length ? Math.min(bodyH / rows.length, 26) : 22
  const rowFS   = autoFS(l3 || l2, W - 50, 13, 9)

  let ry = divY + rh * 0.7
  const rowEls = rows.map(row => {
    const isCell = row === ph
    const el = tx(cx, ry, row, isCell ? rowFS + 1 : rowFS, c, { w: isCell ? '700' : '400' })
    ry += rh
    return el
  }).join('\n  ')

  return wrap(W, H, `
  <rect x="${op}" y="${op}" width="${W - op * 2}" height="${H - op * 2}" rx="5"
    fill="none" stroke="${c}" stroke-width="5"/>
  <rect x="${ip}" y="${ip}" width="${W - ip * 2}" height="${H - ip * 2}" rx="2"
    fill="none" stroke="${c}" stroke-width="1.2"/>
  ${tx(cx, ip + nameH * 0.52, name, nameFS, c, { w: '700', f: "Georgia,'Times New Roman',serif", ls: 1 })}
  <line x1="${ip + 14}" y1="${divY}" x2="${W - ip - 14}" y2="${divY}" stroke="${c}" stroke-width="2.5"/>
  ${rowEls}`)
}

/**
 * 2C — Modern Banner
 * Ultra-bold name with decorative rules, minimalist contact bottom
 */
function prem_C(r: StampRequirements, W: number, H: number): string {
  const c    = INK[r.color] || INK.black
  const name = fit(r.companyName, 26)
  const l2   = fit(r.line2 || '', 44)
  const ph   = r.phone ? `☎ ${fit(r.phone, 20)}` : (r.email ? fit(r.email, 32) : '')
  const cx   = W / 2, pad = 10
  const nameFS = autoFS(name, W - 30, 23, 13)
  const midY   = H / 2 - 2
  const rg     = nameFS * 0.68

  return wrap(W, H, `
  <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" rx="5"
    fill="none" stroke="${c}" stroke-width="3"/>
  <line x1="${pad + 14}" y1="${midY - rg - 2}" x2="${W - pad - 14}" y2="${midY - rg - 2}"
    stroke="${c}" stroke-width="2.5"/>
  <line x1="${pad + 22}" y1="${midY - rg + 4}" x2="${W - pad - 22}" y2="${midY - rg + 4}"
    stroke="${c}" stroke-width="0.8"/>
  ${tx(cx, midY, name, nameFS, c, { w: '900', f: bold_fam, ls: 1.5 })}
  <line x1="${pad + 22}" y1="${midY + rg - 4}" x2="${W - pad - 22}" y2="${midY + rg - 4}"
    stroke="${c}" stroke-width="0.8"/>
  <line x1="${pad + 14}" y1="${midY + rg + 2}" x2="${W - pad - 14}" y2="${midY + rg + 2}"
    stroke="${c}" stroke-width="2.5"/>
  ${l2 ? tx(cx, midY + rg + 16, l2, 11, c) : ''}
  ${ph ? tx(cx, H - pad - 9, ph, 11, c, { w: '600' }) : ''}`)
}


// ══════════════════════════════════════════════════════════════
//  3. LOGO STAMP
//  Based on: Eagle Logo Stamp 40×40, Brand Logo Stamp 50×80
// ══════════════════════════════════════════════════════════════

/**
 * 3A — Full Logo + Name Banner (like "BRAND LOGO STAMP" with lion)
 * Bold name at top, full logo below, optional tagline
 */
function logo_A(r: StampRequirements, W: number, H: number): string {
  const c      = INK[r.color] || INK.black
  const name   = fit(r.companyName, 26)
  const tag    = fit(r.line2 || '', 36)
  const bannerH = Math.round(H * 0.25)
  const logoAreaY = bannerH + 4
  const logoAreaH = H - bannerH - 10
  const cx     = W / 2
  const pad    = 8
  const nameFS = autoFS(name, W - 30, 22, 12)
  const init   = (r.companyName || '').split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase()

  const logoContent = r.logoSvg
    ? `<g transform="translate(${pad + 4},${logoAreaY + 4}) scale(${(logoAreaH - 8) / 100})">${r.logoSvg}</g>`
    : `<text x="${cx}" y="${logoAreaY + logoAreaH / 2 + 8}" text-anchor="middle" dominant-baseline="middle"
        font-family="'Arial Black',Arial" font-size="${Math.round(Math.min(W, logoAreaH) * 0.4)}"
        fill="${c}" opacity="0.12">${init}</text>
       <text x="${cx}" y="${logoAreaY + logoAreaH / 2 + 8}" text-anchor="middle" dominant-baseline="middle"
        font-family="'Arial Black',Arial" font-size="${Math.round(Math.min(W, logoAreaH) * 0.18)}"
        fill="${c}">${init}</text>`

  return wrap(W, H, `
  <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" rx="4"
    fill="none" stroke="${c}" stroke-width="3.5"/>
  <!-- Name banner -->
  ${tx(cx, bannerH * 0.52 + pad, name, nameFS, c, { w: '900', f: bold_fam, ls: 1 })}
  <line x1="${pad + 8}" y1="${bannerH + pad}" x2="${W - pad - 8}" y2="${bannerH + pad}"
    stroke="${c}" stroke-width="2"/>
  <!-- Logo area -->
  ${logoContent}
  ${tag ? tx(cx, H - pad - 7, tag, 10, c) : ''}`)
}

/**
 * 3B — Side-by-Side (Logo left, text right — like RAJA FARMS)
 * Square logo left 30%, company name + service + contact right
 */
function logo_B(r: StampRequirements, W: number, H: number): string {
  const c     = INK[r.color] || INK.black
  const logoW = Math.round(W * 0.30)
  const textX = logoW + 16
  const textW = W - textX - 8
  const cx    = textX + textW / 2
  const name  = fit(r.companyName, 20)
  const serv  = fit(r.line2 || '', 28)
  const l3    = fit(r.line3 || '', 34)
  const ph    = r.phone ? `☎ ${fit(r.phone, 18)}` : ''
  const rows  = [serv, l3, ph].filter(Boolean)
  const pad   = 8
  const init  = (r.companyName || '').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const nameFS = autoFS(name, textW, 17, 10)
  const rowFS  = autoFS(l3 || serv, textW, 12, 8)
  const rh     = (H - pad * 2) / (rows.length + 1.2)
  let y        = pad + rh * 0.82
  const els: string[] = []
  els.push(tx(cx, y, name, nameFS, c, { w: '900', f: bold_fam }))
  y += rh
  els.push(`<line x1="${textX + 2}" y1="${y - rh * 0.38}" x2="${W - pad - 4}" y2="${y - rh * 0.38}" stroke="${c}" stroke-width="1.5"/>`)
  rows.forEach(row => {
    const isCell = row === ph
    els.push(tx(cx, y, row, isCell ? rowFS + 1 : rowFS, c, { w: isCell ? '700' : '400' }))
    y += rh
  })

  const logoContent = r.logoSvg
    ? `<g transform="translate(${pad + 2},${pad + 2}) scale(${(H - pad * 2 - 4) / 100})">${r.logoSvg}</g>`
    : `<circle cx="${logoW / 2 + pad}" cy="${H / 2}" r="${Math.min(logoW / 2 - 10, H / 2 - 10)}"
        fill="none" stroke="${c}" stroke-width="2"/>
       <text x="${logoW / 2 + pad}" y="${H / 2 + 5}" text-anchor="middle" dominant-baseline="middle"
        font-family="'Arial Black',Arial" font-size="${Math.round(Math.min(logoW, H) * 0.26)}"
        fill="${c}">${init}</text>`

  return wrap(W, H, `
  <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" rx="4"
    fill="none" stroke="${c}" stroke-width="4"/>
  <rect x="${pad + 5}" y="${pad + 5}" width="${W - pad * 2 - 10}" height="${H - pad * 2 - 10}" rx="2"
    fill="none" stroke="${c}" stroke-width="1"/>
  ${logoContent}
  <line x1="${logoW + 12}" y1="${pad + 8}" x2="${logoW + 12}" y2="${H - pad - 8}"
    stroke="${c}" stroke-width="1.5"/>
  ${els.join('\n  ')}`)
}

/**
 * 3C — Full-Area Logo (like Eagle Logo Stamp 40×40)
 * Logo fills the stamp, optional small name at bottom
 */
function logo_C(r: StampRequirements, W: number, H: number): string {
  const c    = INK[r.color] || INK.black
  const name = fit(r.companyName, 24)
  const pad  = 8
  const nameH = name ? 28 : 0
  const logoH = H - pad * 2 - nameH - (nameH ? 6 : 0)
  const cx    = W / 2
  const init  = (r.companyName || '').split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase()
  const nameFS = autoFS(name, W - 20, 16, 10)

  const logoContent = r.logoSvg
    ? `<g transform="translate(${pad + 2},${pad + 2}) scale(${logoH / 100})">${r.logoSvg}</g>`
    : `<text x="${cx}" y="${pad + logoH * 0.5 + 6}" text-anchor="middle" dominant-baseline="middle"
        font-family="'Arial Black',Arial" font-size="${Math.round(Math.min(W - 30, logoH) * 0.45)}"
        fill="${c}" opacity="0.08">${init}</text>
       <text x="${cx}" y="${pad + logoH * 0.5 + 6}" text-anchor="middle" dominant-baseline="middle"
        font-family="'Arial Black',Arial" font-size="${Math.round(Math.min(W - 30, logoH) * 0.22)}"
        fill="${c}">${init}</text>`

  return wrap(W, H, `
  <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" rx="4"
    fill="none" stroke="${c}" stroke-width="3.5"/>
  ${logoContent}
  ${nameH ? `<line x1="${pad + 8}" y1="${H - pad - nameH}" x2="${W - pad - 8}" y2="${H - pad - nameH}" stroke="${c}" stroke-width="1.2"/>
  ${tx(cx, H - pad - nameH * 0.48, name, nameFS, c, { w: '700' })}` : ''}`)
}


// ══════════════════════════════════════════════════════════════
//  4. ROUND SEAL
//  Exactly like NITHYA PRESS Round Stamp 30×30
// ══════════════════════════════════════════════════════════════

// Build arc textPath
const arcPath = (id: string, CX: number, CY: number, R: number, cw: boolean) =>
  `<defs><path id="${id}" d="M ${CX - R},${CY} a ${R},${R} 0 0,${cw ? 1 : 0} ${R * 2},0"/></defs>`

const arcText = (href: string, text: string, fs: number, fill: string, weight: string, spacing: number) =>
  `<text font-family="${weight === '900' ? bold_fam : 'Arial,Helvetica,sans-serif'}"
    font-size="${fs}" font-weight="${weight}" fill="${fill}" letter-spacing="${spacing}">
    <textPath href="#${href}" startOffset="50%" text-anchor="middle">${text}</textPath>
  </text>`

/**
 * 4A — Classic Round Seal (exactly like NITHYA PRESS round stamp)
 * 2 circles, name on top arc, logo/text center, city + ★ bottom
 */
function seal_A(r: StampRequirements, W: number): string {
  const c   = INK[r.color] || INK.black
  const CX  = W / 2, CY = W / 2
  const R1  = W / 2 - 10
  const R2  = Math.round(R1 * 0.82)
  const Rt  = Math.round(R1 * 0.90)
  const Rb  = Math.round(R2 * 0.87)
  const name = fit((r.companyName || '').toUpperCase(), 22)
  const city = fit((r.line3 || r.line2 || '').toUpperCase(), 18)
  const tag  = fit(r.line2 || '', 14)
  const ph   = r.phone ? fit(r.phone, 14) : ''
  const nameFS = Math.min(Math.round(W * 0.056), 18)
  const cityFS = Math.min(Math.round(W * 0.044), 14)

  // Stars at ±60°
  const sr = Math.round((R1 + R2) / 2)
  const sx1 = +(CX + sr * Math.cos(Math.PI + Math.PI / 3)).toFixed(1)
  const sy1 = +(CY + sr * Math.sin(Math.PI + Math.PI / 3) + 3).toFixed(1)
  const sx2 = +(CX + sr * Math.cos(-Math.PI / 3)).toFixed(1)
  const sy2 = +(CY + sr * Math.sin(-Math.PI / 3) + 3).toFixed(1)

  const innerR = Math.round(R2 * 0.50)
  const center = r.logoSvg
    ? `<g transform="translate(${CX - innerR},${CY - innerR}) scale(${innerR * 2 / 100})">${r.logoSvg}</g>`
    : `${tx(CX, CY - 8, tag, Math.round(W * 0.042), c)}
       <line x1="${CX - innerR * 0.8}" y1="${CY + 6}" x2="${CX + innerR * 0.8}" y2="${CY + 6}"
         stroke="${c}" stroke-width="1"/>
       ${ph ? tx(CX, CY + 22, ph, Math.round(W * 0.038), c) : ''}`

  return wrap(W, W, `
  ${arcPath('r4a_top', CX, CY, Rt, true)}
  ${arcPath('r4a_bot', CX, CY, Rb, false)}
  <circle cx="${CX}" cy="${CY}" r="${R1}" fill="none" stroke="${c}" stroke-width="5"/>
  <circle cx="${CX}" cy="${CY}" r="${R2}" fill="none" stroke="${c}" stroke-width="2"/>
  <text x="${sx1}" y="${sy1}" text-anchor="middle" font-size="${Math.round(W * 0.038)}" fill="${c}">★</text>
  <text x="${sx2}" y="${sy2}" text-anchor="middle" font-size="${Math.round(W * 0.038)}" fill="${c}">★</text>
  ${arcText('r4a_top', name, nameFS, c, '900', 2.5)}
  ${center}
  ${arcText('r4a_bot', city, cityFS, c, '700', 2)}`)
}

/**
 * 4B — Triple Ring Seal
 * 3 concentric rings, inner ring with text, logo center
 */
function seal_B(r: StampRequirements, W: number): string {
  const c    = INK[r.color] || INK.black
  const CX   = W / 2, CY = W / 2
  const R1   = W / 2 - 10
  const R2   = Math.round(R1 * 0.80)
  const R3   = Math.round(R1 * 0.58)
  const Rt   = Math.round(R1 * 0.90)
  const Rb   = Math.round(R2 * 0.90)
  const name = fit((r.companyName || '').toUpperCase(), 22)
  const city = fit((r.line3 || r.line2 || '').toUpperCase(), 20)
  const inner = fit('★ AUTHORISED SIGNATORY ★', 28)
  const init  = (r.companyName || '').split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase()
  const nameFS  = Math.min(Math.round(W * 0.054), 17)
  const cityFS  = Math.min(Math.round(W * 0.040), 13)
  const innerFS = Math.min(Math.round(W * 0.036), 12)
  const initFS  = Math.min(Math.round(R3 * 0.58), 36)

  return wrap(W, W, `
  ${arcPath('r4b_top', CX, CY, Rt, true)}
  ${arcPath('r4b_bot', CX, CY, Rb, false)}
  ${arcPath('r4b_in',  CX, CY, Math.round(R3 * 0.90), true)}
  <circle cx="${CX}" cy="${CY}" r="${R1}" fill="none" stroke="${c}" stroke-width="5"/>
  <circle cx="${CX}" cy="${CY}" r="${R2}" fill="none" stroke="${c}" stroke-width="1.5"/>
  <circle cx="${CX}" cy="${CY}" r="${R3}" fill="none" stroke="${c}" stroke-width="1.5"/>
  ${arcText('r4b_top', name, nameFS, c, '900', 2.5)}
  ${arcText('r4b_bot', city, cityFS, c, '700', 2)}
  ${arcText('r4b_in',  inner, innerFS, c, '600', 1)}
  ${r.logoSvg
    ? `<g transform="translate(${CX - R3 * 0.46},${CY - R3 * 0.46}) scale(${(R3 * 0.92) / 100})">${r.logoSvg}</g>`
    : tx(CX, CY + 5, init, initFS, c, { w: '900', f: bold_fam })}`)
}

/**
 * 4C — Date Box Seal
 * Name/city arcs + blank center box for date/signature writing
 */
function seal_C(r: StampRequirements, W: number): string {
  const c    = INK[r.color] || INK.black
  const CX   = W / 2, CY = W / 2
  const R1   = W / 2 - 10
  const R2   = Math.round(R1 * 0.82)
  const Rt   = Math.round(R1 * 0.90)
  const Rb   = Math.round(R2 * 0.87)
  const name = fit((r.companyName || '').toUpperCase(), 22)
  const city = fit((r.line3 || r.line2 || r.companyName || '').toUpperCase(), 18)
  const nameFS = Math.min(Math.round(W * 0.054), 17)
  const cityFS = Math.min(Math.round(W * 0.043), 14)
  const labelFS = Math.min(Math.round(W * 0.038), 12)
  const bW = Math.round(R2 * 1.1), bH = Math.round(R2 * 0.5)
  const sr  = Math.round((R1 + R2) / 2)
  const sx1 = +(CX + sr * Math.cos(Math.PI + Math.PI / 3)).toFixed(1)
  const sy1 = +(CY + sr * Math.sin(Math.PI + Math.PI / 3) + 3).toFixed(1)
  const sx2 = +(CX + sr * Math.cos(-Math.PI / 3)).toFixed(1)
  const sy2 = +(CY + sr * Math.sin(-Math.PI / 3) + 3).toFixed(1)

  return wrap(W, W, `
  ${arcPath('r4c_top', CX, CY, Rt, true)}
  ${arcPath('r4c_bot', CX, CY, Rb, false)}
  <circle cx="${CX}" cy="${CY}" r="${R1}" fill="none" stroke="${c}" stroke-width="5"/>
  <circle cx="${CX}" cy="${CY}" r="${R2}" fill="none" stroke="${c}" stroke-width="2"/>
  <text x="${sx1}" y="${sy1}" text-anchor="middle" font-size="${Math.round(W * 0.038)}" fill="${c}">★</text>
  <text x="${sx2}" y="${sy2}" text-anchor="middle" font-size="${Math.round(W * 0.038)}" fill="${c}">★</text>
  ${arcText('r4c_top', name, nameFS, c, '900', 2)}
  ${arcText('r4c_bot', city, cityFS, c, '700', 1.5)}
  <!-- Blank date/signature box -->
  <rect x="${CX - bW / 2}" y="${CY - bH / 2}" width="${bW}" height="${bH}" rx="3"
    fill="none" stroke="${c}" stroke-width="1.5"/>
  <text x="${CX - bW / 2 + 8}" y="${CY - bH / 2 + labelFS + 3}" dominant-baseline="middle"
    font-family="Arial,sans-serif" font-size="${labelFS}" fill="${c}">Date:</text>`)
}


// ══════════════════════════════════════════════════════════════
//  5. PROFESSIONAL
// ══════════════════════════════════════════════════════════════

/**
 * 5A — Credentials Stack (like Dr/Advocate stamps)
 * Name + degree line, title, licence, phone
 */
function prof_A(r: StampRequirements, W: number, H: number): string {
  const c    = INK[r.color] || INK.black
  const name = fit(r.companyName, 30)
  const cred = fit(r.line2 || '', 40)  // degrees / title
  const org  = fit(r.line3 || '', 44)  // organisation / address
  const ph   = r.phone ? `Cell: ${fit(r.phone, 22)}` : ''
  const em   = !r.phone && r.email ? fit(r.email, 30) : ''
  const rows = [cred, org, ph || em].filter(Boolean)
  const cx   = W / 2, pad = 10

  const nameFS = autoFS(name, W - 28, 20, 11)
  const rowFS  = autoFS(org || cred, W - 28, 13, 9)
  const rh     = Math.min((H - pad * 2) / (rows.length + 1.5), 28)
  let y        = pad + rh * 0.85
  const els: string[] = []
  els.push(tx(cx, y, name, nameFS, c, { w: '900', f: bold_fam }))
  y += rh
  els.push(`<line x1="${pad + 12}" y1="${y - rh * 0.38}" x2="${W - pad - 12}" y2="${y - rh * 0.38}" stroke="${c}" stroke-width="2"/>`)
  rows.forEach(row => {
    const isCell = row === ph
    els.push(tx(cx, y, row, isCell ? rowFS + 1 : rowFS, c, { w: isCell ? '700' : '400' }))
    y += rh
  })

  return wrap(W, H, `
  <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" rx="4"
    fill="none" stroke="${c}" stroke-width="4"/>
  <rect x="${pad + 5}" y="${pad + 5}" width="${W - pad * 2 - 10}" height="${H - pad * 2 - 10}" rx="2"
    fill="none" stroke="${c}" stroke-width="1"/>
  ${els.join('\n  ')}`)
}

/**
 * 5B — Symbol + Details (Medical/Legal icon left)
 */
function prof_B(r: StampRequirements, W: number, H: number): string {
  const c      = INK[r.color] || INK.black
  const iconW  = Math.round(W * 0.22)
  const textX  = iconW + 14
  const textW  = W - textX - 8
  const cx     = textX + textW / 2
  const name   = fit(r.companyName, 24)
  const cred   = fit(r.line2 || '', 32)
  const org    = fit(r.line3 || '', 36)
  const ph     = r.phone ? `☎ ${fit(r.phone, 20)}` : ''
  const rows   = [cred, org, ph].filter(Boolean)
  const nameFS = autoFS(name, textW, 17, 10)
  const rowFS  = autoFS(org || cred, textW, 12, 8)
  const rh     = (H - 22) / (rows.length + 1.3)
  let y        = 11 + rh * 0.85
  const els: string[] = []
  els.push(tx(cx, y, name, nameFS, c, { w: '900', f: bold_fam }))
  y += rh
  els.push(`<line x1="${textX + 2}" y1="${y - rh * 0.4}" x2="${W - 10}" y2="${y - rh * 0.4}" stroke="${c}" stroke-width="1.8"/>`)
  rows.forEach(row => {
    const isCell = row === ph
    els.push(tx(cx, y, row, isCell ? rowFS + 1 : rowFS, c, { w: isCell ? '700' : '400' }))
    y += rh
  })
  // Medical cross icon
  const ix = iconW / 2 + 6, iy = H / 2
  const ir = Math.min(iconW / 2 - 6, H / 2 - 8)

  return wrap(W, H, `
  <rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="4" fill="none" stroke="${c}" stroke-width="4"/>
  <rect x="11" y="11" width="${W - 22}" height="${H - 22}" rx="2" fill="none" stroke="${c}" stroke-width="1"/>
  <rect x="${ix - ir * 0.28}" y="${iy - ir}" width="${ir * 0.56}" height="${ir * 2}" rx="3" fill="${c}"/>
  <rect x="${ix - ir}" y="${iy - ir * 0.28}" width="${ir * 2}" height="${ir * 0.56}" rx="3" fill="${c}"/>
  <line x1="${iconW + 10}" y1="12" x2="${iconW + 10}" y2="${H - 12}" stroke="${c}" stroke-width="1.5"/>
  ${els.join('\n  ')}`)
}

/**
 * 5C — Office Header style
 * Name top, divider, address/org rows, phone+email bottom
 */
function prof_C(r: StampRequirements, W: number, H: number): string {
  const c    = INK[r.color] || INK.black
  const name = fit(r.companyName, 30)
  const cred = fit(r.line2 || '', 44)
  const org  = fit(r.line3 || '', 46)
  const ph   = r.phone ? `☎ ${fit(r.phone, 18)}` : ''
  const em   = r.email ? `✉ ${fit(r.email, 22)}` : ''
  const bot  = [ph, em].filter(Boolean).join('   |   ')
  const cx   = W / 2, pad = 10
  const rows = [cred, org].filter(Boolean)
  const nameFS = autoFS(name, W - 28, 20, 11)
  const rowFS  = autoFS(org || cred, W - 28, 13, 9)
  const rh     = (H - pad * 2) / (rows.length + 2.2)
  let y        = pad + rh * 0.82
  const els: string[] = []
  els.push(tx(cx, y, name, nameFS, c, { w: '900', f: bold_fam }))
  y += rh
  els.push(`<line x1="${W * 0.1}" y1="${y - rh * 0.38}" x2="${W * 0.9}" y2="${y - rh * 0.38}" stroke="${c}" stroke-width="1.8"/>`)
  rows.forEach(row => { els.push(tx(cx, y, row, rowFS, c)); y += rh })
  if (bot) {
    els.push(`<line x1="${pad + 8}" y1="${H - pad - rh}" x2="${W - pad - 8}" y2="${H - pad - rh}" stroke="${c}" stroke-width="1"/>`)
    els.push(tx(cx, H - pad - rh * 0.44, bot, 11, c, { w: '600' }))
  }

  return wrap(W, H, `
  <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" rx="4"
    fill="none" stroke="${c}" stroke-width="4"/>
  <rect x="${pad + 5}" y="${pad + 5}" width="${W - pad * 2 - 10}" height="${H - pad * 2 - 10}" rx="2"
    fill="none" stroke="${c}" stroke-width="1"/>
  ${els.join('\n  ')}`)
}


// ══════════════════════════════════════════════════════════════
//  6. SIGNATURE STAMP
//  Exactly like NITHYA PRESS Proprietor Stamp 63×23
// ══════════════════════════════════════════════════════════════

/**
 * 6A — Traditional "For Company / PROPRIETOR" (exactly like real photo)
 */
function sig_A(r: StampRequirements, W: number, H: number): string {
  const c    = INK[r.color] || INK.black
  const name = fit(r.companyName, 28)
  const role = fit((r.line2 || 'PROPRIETOR').toUpperCase(), 26)
  const cx   = W / 2, pad = 10
  const nameFS = autoFS(name, W - 40, 19, 11)
  const roleFS = autoFS(role, W - 40, Math.round(nameFS * 0.78), 9)

  return wrap(W, H, `
  <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" rx="5"
    fill="none" stroke="${c}" stroke-width="3.5"/>
  <rect x="${pad + 5}" y="${pad + 5}" width="${W - pad * 2 - 10}" height="${H - pad * 2 - 10}" rx="3"
    fill="none" stroke="${c}" stroke-width="1"/>
  ${tx(cx, H * 0.25, 'For', 12, c)}
  ${tx(cx, H * 0.45, name, nameFS, c, { w: '900', f: bold_fam, ls: 0.3 })}
  <line x1="${pad + 18}" y1="${H * 0.62}" x2="${W - pad - 18}" y2="${H * 0.62}"
    stroke="${c}" stroke-width="2.2"/>
  ${tx(cx, H * 0.80, role, roleFS, c, { w: '700', ls: 2 })}`)
}

/**
 * 6B — Dotted Signature Box
 * Company name + dotted rectangle for handwritten signature
 */
function sig_B(r: StampRequirements, W: number, H: number): string {
  const c    = INK[r.color] || INK.black
  const name = fit(r.companyName, 28)
  const cx   = W / 2, pad = 10
  const nameFS = autoFS(name, W - 30, 17, 10)
  const bX = pad + 18, bY = H * 0.35
  const bW = W - bX * 2, bH = H * 0.36

  return wrap(W, H, `
  <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" rx="5"
    fill="none" stroke="${c}" stroke-width="4"/>
  ${tx(cx, H * 0.2, name, nameFS, c, { w: '900', f: bold_fam })}
  <rect x="${bX}" y="${bY}" width="${bW}" height="${bH}" rx="3"
    fill="none" stroke="${c}" stroke-width="1.5" stroke-dasharray="5,4"/>
  <text x="${bX + bW - 8}" y="${bY + bH - 9}" text-anchor="end" dominant-baseline="middle"
    font-family="Arial,Helvetica,sans-serif" font-size="10" fill="${c}">Authorized Signatory</text>`)
}

/**
 * 6C — Filled Header Signature
 * Filled bar with name in white, designation + phone below
 */
function sig_C(r: StampRequirements, W: number, H: number): string {
  const c    = INK[r.color] || INK.black
  const name = fit(r.companyName, 28)
  const role = fit(r.line2 || 'Proprietor', 24)
  const ph   = r.phone ? `☎ ${fit(r.phone, 18)}` : ''
  const cx   = W / 2, pad = 10
  const nameFS = autoFS(name, W - 30, 17, 10)
  const roleFS = autoFS(role, W - 30, Math.round(nameFS * 0.78), 9)
  const hdrH   = Math.round(H * 0.42)

  return wrap(W, H, `
  <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" rx="5"
    fill="none" stroke="${c}" stroke-width="3.5"/>
  <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${hdrH}" fill="${c}" rx="5"/>
  ${tx(cx, pad + hdrH * 0.5, name, nameFS, c, { w: '900', f: bold_fam })}
  ${/* white text override */ `<text x="${cx}" y="${pad + hdrH * 0.5}" text-anchor="middle" dominant-baseline="middle"
    font-family="${bold_fam}" font-size="${nameFS}" font-weight="900" fill="white">${name}</text>`}
  ${tx(cx, H * 0.67, role, roleFS, c, { w: '700', ls: 1.5 })}
  <line x1="${pad + 16}" y1="${H * 0.78}" x2="${W - pad - 16}" y2="${H * 0.78}"
    stroke="${c}" stroke-width="1"/>
  ${ph ? tx(cx, H * 0.88, ph, 11, c) : ''}`)
}


// ══════════════════════════════════════════════════════════════
//  DISPATCH — pick 3 correct variations for the selected type
// ══════════════════════════════════════════════════════════════
function generateLocal(req: StampRequirements): string[] {
  const stampType = (req as any).stampType || 'address'
  const sizeKey   = (req as any).sizeKey   || '63x23'
  const isCircle  = stampType === 'seal' || req.shape === 'circle' || sizeKey.startsWith('r')
  const dims      = DIMS[sizeKey] || DIMS['63x23']
  const { W, H }  = dims

  if (isCircle) return [seal_A(req, W), seal_B(req, W), seal_C(req, W)]

  switch (stampType) {
    case 'premium':      return [prem_A(req, W, H), prem_B(req, W, H), prem_C(req, W, H)]
    case 'logo-left':    return [logo_A(req, W, H), logo_B(req, W, H), logo_C(req, W, H)]
    case 'professional': return [prof_A(req, W, H), prof_B(req, W, H), prof_C(req, W, H)]
    case 'signature':    return [sig_A(req, W, H), sig_B(req, W, H), sig_C(req, W, H)]
    case 'address':
    default:             return [addr_A(req, W, H), addr_B(req, W, H), addr_C(req, W, H)]
  }
}


// ══════════════════════════════════════════════════════════════
//  CLAUDE API — primary generator
// ══════════════════════════════════════════════════════════════
async function callClaude(req: StampRequirements, stampType: string): Promise<string[] | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const c       = INK[req.color] || INK.black
  const sizeKey = (req as any).sizeKey || '63x23'
  const isCircle = stampType === 'seal' || req.shape === 'circle' || sizeKey.startsWith('r')
  const dims    = DIMS[sizeKey] || DIMS['63x23']
  const { W, H } = dims

  const typeDesc: Record<string, string> = {
    address: `3 address stamp variations (${W}×${H}):
V1: Single border (rx=5, sw=3), bold name top, thin rule, address/phone rows centered.
V2: Single border, personal name large bold, designation bold (2nd line), address + cell.
V3: Double border, logo column left 28% with separator, name+address+phone right side.`,
    premium: `3 premium header stamp variations (${W}×${H}):
V1: Filled solid top band (fill="${c}"), company name WHITE in band, address rows below.
V2: Thick outer (5px) + thin inner (1.2px) double border, SERIF (Georgia) name center, rows.
V3: Single border, ultra-bold name with double decorative rules above AND below, minimal info.`,
    'logo-left': `3 logo stamp variations (${W}×${H}):
V1: Name banner top (bold, 25% height) + divider + full logo/image below + optional tagline.
V2: Logo/initials column left 30%, solid separator line, name+service+contact text right.
V3: Single border, logo occupies full area, small name text at bottom only.`,
    seal: `3 round seal variations (${W}×${W} circle):
V1: 2 concentric circles, name top arc, text+line center, city+★ bottom arc.
V2: 3 concentric circles, inner arc "AUTHORISED SIGNATORY", initials/logo center.
V3: 2 circles, blank dotted date-box center, name top arc, city bottom arc.`,
    professional: `3 professional stamp variations (${W}×${H}):
V1: Double border, name bold top, thick divider, degree/title/phone rows.
V2: Medical cross icon left column, separator, name+credentials+phone right.
V3: Double border, name top, thin divider, rows, phone+email icon bottom line.`,
    signature: `3 signature stamp variations (${W}×${H}):
V1: Double border, "For" small, company name bold, thick rule, PROPRIETOR spaced.
V2: Single border, company name top, dotted rect box for signature, "Authorized Signatory".
V3: Filled header strip (name WHITE), role below, thin rule, optional phone.`,
  }

  const prompt = `Generate 3 professional Indian rubber stamp SVGs. Output ONLY raw SVG elements.

DATA:
Company: "${esc(req.companyName)}"
Line 2: "${esc(req.line2 || '')}"
Line 3: "${esc(req.line3 || '')}"
Phone: "${esc(req.phone || '')}"
Email: "${esc(req.email || '')}"
Website: "${esc(req.website || '')}"

INK COLOR: ${c} — ALL text, borders, lines MUST use this exact hex. No other colors.
Exception: white text is ONLY allowed on filled background rectangles.
Background: transparent.

${typeDesc[stampType] || typeDesc.address}

STRICT RULES:
• Each SVG: xmlns="http://www.w3.org/2000/svg" width="${W}" height="${isCircle ? W : H}"
• Company/name: font-family="'Arial Black',Arial,sans-serif" font-weight="900"
• Address/phone: font-family="Arial,Helvetica,sans-serif"
• Phone row: bold (700), prefix with ☎
• Text MUST fit inside borders — reduce font-size if needed
• 3 designs must look visually DIFFERENT
• Output EXACTLY 3 <svg>…</svg> tags, no other text`

  console.log(`[StampAI] Claude API: model=claude-sonnet-4-6, type=${stampType}`)
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        system: 'Output only 3 raw <svg>...</svg> elements. No markdown, no explanation, no code fences.',
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      console.error(`[StampAI] Claude HTTP ${res.status}`)
      return null
    }
    const data = await res.json()
    if (data.error) { console.error('[StampAI] Claude error:', data.error); return null }

    let raw: string = data.content?.[0]?.text || ''
    raw = raw.replace(/```(?:svg|xml)?\s*/gi, '').replace(/```/g, '')
    let svgs: string[] = (raw.match(/<svg[\s\S]*?<\/svg>/gi) || []) as string[]

    // Fallback extraction by indexOf
    if (svgs.length < 3) {
      const lo = raw.toLowerCase()
      const starts: number[] = [], ends: number[] = []
      let p = 0
      while (p < lo.length) { const i = lo.indexOf('<svg', p); if (i < 0) break; starts.push(i); p = i + 4 }
      p = 0
      while (p < lo.length) { const i = lo.indexOf('</svg>', p); if (i < 0) break; ends.push(i + 6); p = i + 6 }
      svgs = []
      for (let i = 0; i < Math.min(starts.length, ends.length, 3); i++) svgs.push(raw.slice(starts[i], ends[i]))
    }

    const valid = svgs.filter(s => s.length > 80 && (s.includes('<text') || s.includes('<circle') || s.includes('<rect')))
    if (valid.length < 3) { console.error(`[StampAI] Claude returned ${valid.length} SVGs`); return null }
    console.log(`[StampAI] Claude: ${valid.length} SVGs ✓`)
    return valid.slice(0, 3)
  } catch (err) {
    console.error('[StampAI] Claude exception:', err)
    return null
  }
}


// ══════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ══════════════════════════════════════════════════════════════
export async function generateStampSVGs(req: StampRequirements): Promise<string[]> {
  const stampType = (req as any).stampType || 'address'
  const ai = await callClaude(req, stampType)
  if (ai && ai.length >= 3) return ai
  console.log(`[StampAI] Using local templates for type="${stampType}"`)
  return generateLocal(req)
}

// ─── Utility: split long address into lines ────────────────
export function splitAddress(address: string, maxChars: number): string[] {
  if (!address) return []
  if (address.length <= maxChars) return [address]
  const words = address.split(/[\s,]+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current}, ${word}` : word
    if (test.length > maxChars && current) { lines.push(current); current = word }
    else current = test
  }
  if (current) lines.push(current)
  return lines
}
