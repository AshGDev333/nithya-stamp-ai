import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending:    'bg-amber-100 text-amber-800 border-amber-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    printing:   'bg-purple-100 text-purple-800 border-purple-200',
    shipped:    'bg-cyan-100 text-cyan-800 border-cyan-200',
    delivered:  'bg-green-100 text-green-800 border-green-200',
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending:    '⏳ Pending',
    processing: '⚙️ Processing',
    printing:   '🖨️ Printing',
    shipped:    '🚚 Shipped',
    delivered:  '✅ Delivered',
  }
  return labels[status] || status
}

export function generateOrderId(): string {
  const ts  = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `STAMP-${ts}-${rnd}`
}

/* ── Real Trodat stamp pricing based on actual product sizes ── */
export interface StampSizeOption {
  value: string     // used as form value (WxH or diameter)
  label: string     // display label
  dims: string      // e.g. "63×23mm"
  lines: string     // e.g. "Up to 5 lines"
  shape: 'rectangle' | 'circle'
  price: number     // ₹
  tag?: string      // e.g. "Most Popular"
}

export const STAMP_SIZE_OPTIONS: StampSizeOption[] = [
  // ── Rectangle / Address stamps ──
  { value:'60x20', label:'Pocket (60×20mm)',       dims:'60×20mm', lines:'3–4 lines',    shape:'rectangle', price:199, tag:'Budget'        },
  { value:'63x23', label:'Standard (63×23mm)',     dims:'63×23mm', lines:'Up to 5 lines', shape:'rectangle', price:249, tag:'Most Popular'  },
  { value:'52x33', label:'Medium (52×33mm)',       dims:'52×33mm', lines:'Up to 7 lines', shape:'rectangle', price:299                      },
  { value:'67x32', label:'Large (67×32mm)',        dims:'67×32mm', lines:'Up to 7 lines', shape:'rectangle', price:349, tag:'Best Value'    },
  { value:'80x50', label:'Massive (80×50mm)',      dims:'80×50mm', lines:'10+ lines',     shape:'rectangle', price:499, tag:'Maximum Info'  },
  // ── Round / Circle seals ──
  { value:'r30',   label:'Round Pocket (Ø30mm)',   dims:'30×30mm', lines:'Circle seal',   shape:'circle',    price:249                      },
  { value:'r30p',  label:'Round Std (Ø30mm)',      dims:'30×30mm', lines:'Circle seal',   shape:'circle',    price:299, tag:'Popular'       },
  { value:'r40',   label:'Round Medium (Ø40mm)',   dims:'40×40mm', lines:'Circle seal',   shape:'circle',    price:399                      },
  { value:'r40l',  label:'Round Large (Ø40mm)',    dims:'40×40mm', lines:'Circle seal',   shape:'circle',    price:449, tag:'Premium'       },
]

export function getPriceBySize(sizeValue: string): number {
  const opt = STAMP_SIZE_OPTIONS.find(s => s.value === sizeValue)
  return opt?.price ?? 299
}

export function calculatePrice(sizeValue: string, quantity: number): number {
  return getPriceBySize(sizeValue) * quantity
}

/* ── User cart key — per-user based on session ID ── */
export function getCartKey(userEmail?: string): string {
  if (typeof window === 'undefined') return 'stamp_cart_guest'
  if (userEmail) return `stamp_cart_${userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
  // Generate a stable guest session ID
  let sid = sessionStorage.getItem('stamp_session_id')
  if (!sid) {
    sid = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    sessionStorage.setItem('stamp_session_id', sid)
  }
  return `stamp_cart_${sid}`
}

export function getCart(email?: string): any[] {
  try {
    const key = getCartKey(email)
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch { return [] }
}

export function saveCart(items: any[], email?: string): void {
  try {
    const key = getCartKey(email)
    localStorage.setItem(key, JSON.stringify(items))
    localStorage.setItem('stamp_cart_key', key) // track current key
  } catch {}
}

export function clearCart(email?: string): void {
  try {
    const key = getCartKey(email)
    localStorage.removeItem(key)
  } catch {}
}

// NOTE: getAdminPrice / calculateAdminPrice have been removed.
// Prices are now fetched from /api/prices (DB-backed) on every page that needs them.
// Use getPriceBySize() only as a hardcoded fallback when the API hasn't responded yet.
