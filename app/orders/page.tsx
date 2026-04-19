'use client'
import { useState, useEffect } from 'react'
import { Search, Package, Clock, CheckCircle, Truck, Printer, Loader2 } from 'lucide-react'
import { formatPrice, formatDate, getStatusLabel } from '@/lib/utils'

const STATUS_STEPS = ['pending', 'processing', 'printing', 'shipped', 'delivered']
const STATUS_ICONS: Record<string, any> = {
  pending: Clock, processing: Package, printing: Printer,
  shipped: Truck, delivered: CheckCircle,
}
const STATUS_COLORS: Record<string, string> = {
  pending:    'text-amber-600 bg-amber-50 border-amber-200',
  processing: 'text-blue-600 bg-blue-50 border-blue-200',
  printing:   'text-violet-600 bg-violet-50 border-violet-200',
  shipped:    'text-cyan-600 bg-cyan-50 border-cyan-200',
  delivered:  'text-emerald-600 bg-emerald-50 border-emerald-200',
}

function scaleSvg(svg: string, w: number): string {
  if (!svg) return ''
  const vb = svg.match(/viewBox=["']([^"']+)["']/)
  const wm = svg.match(/\swidth=["']([^"'px%]+)["']/)
  const hm = svg.match(/\sheight=["']([^"'px%]+)["']/)
  let sw = wm ? parseFloat(wm[1]) : 300
  let sh = hm ? parseFloat(hm[1]) : 200
  if (vb) { const p = vb[1].trim().split(/[\s,]+/); if (p.length === 4) { sw = +p[2]; sh = +p[3] } }
  const newH = Math.round(w * sh / sw)
  let r = svg.replace(/\swidth=["'][^"']*["']/g, '').replace(/\sheight=["'][^"']*["']/g, '')
    .replace('<svg', `<svg width="${w}" height="${newH}"`)
  if (!r.includes('viewBox')) r = r.replace('<svg', `<svg viewBox="0 0 ${sw} ${sh}"`)
  return r
}

function ProgressBar({ status }: { status: string }) {
  const idx = STATUS_STEPS.indexOf(status)
  return (
    <div className="flex items-center mt-4">
      {STATUS_STEPS.map((s, i) => {
        const Icon = STATUS_ICONS[s]
        const done = i <= idx
        return (
          <div key={s} className={`flex items-center ${i < STATUS_STEPS.length - 1 ? 'flex-1' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-[#0d1b4b] text-white shadow-sm' : 'bg-gray-100 text-gray-300'}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${i < idx ? 'bg-[#0d1b4b]' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function OrdersPage() {
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  // Pre-fill email from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('stamp_last_email')
    if (saved) setEmail(saved)
  }, [])

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Enter a valid email address')
      return
    }
    setLoading(true); setError(''); setSearched(false)
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrders(data.orders || [])
      setSearched(true)
      // Remember email for next visit
      localStorage.setItem('stamp_last_email', trimmed)
    } catch (e: any) {
      setError(e.message || 'Failed to fetch orders')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen pb-12 sm:pb-16 animate-fade-in">
      <div className="container-app pt-6 sm:pt-8" style={{ maxWidth: 720 }}>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0d1b4b] mb-2">
            Track Your Orders
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Enter your email address to see all your stamp orders
          </p>
        </div>

        {/* ── Search form — fixed layout, no icon overlap ── */}
        <form onSubmit={search} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-6">
          <label className="field-label mb-2 block">Your Email Address</label>

          {/* Input + button in a flex row — each element separate, NO icon inside input */}
          <div className="flex gap-3">
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              className={`field-input flex-1 ${error ? 'error' : ''}`}
              placeholder="your@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
            />
            <button
              type="submit"
              disabled={loading}
              className="flex-shrink-0 flex items-center gap-2 bg-[#0d1b4b] text-white font-semibold px-5 py-3 rounded-xl hover:bg-[#1a3a8b] transition-colors disabled:opacity-60 active:scale-95 whitespace-nowrap"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Search className="w-4 h-4" />
              }
              <span className="hidden sm:inline">Track</span>
            </button>
          </div>

          {error && (
            <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
              <span>⚠</span> {error}
            </p>
          )}
        </form>

        {/* No results */}
        {searched && !orders.length && (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-500 mb-1">No orders found</h3>
            <p className="text-gray-400 text-sm">No orders were placed using this email address</p>
          </div>
        )}

        {/* Orders */}
        {orders.length > 0 && (
          <div className="space-y-4 sm:space-y-5">
            <p className="text-sm text-gray-400">
              {orders.length} order{orders.length !== 1 ? 's' : ''} found for <strong>{email}</strong>
            </p>

            {orders.map((order: any) => {
              const StatusIcon = STATUS_ICONS[order.status] || Package
              const reqs = (() => { try { return JSON.parse(order.stamp_requirements) } catch { return {} } })()

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Header row */}
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-50">
                    <div className="min-w-0 mr-3">
                      <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                      <p className="font-mono text-xs font-bold text-[#0d1b4b] truncate">{order.id}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border flex-shrink-0 ${STATUS_COLORS[order.status]}`}>
                      <StatusIcon className="w-3 h-3" />
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      {/* Stamp preview */}
                      <div className="flex-shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-xl border border-gray-100 overflow-hidden flex items-center justify-center p-2"
                        style={{ background: 'radial-gradient(ellipse at center,#fefef8 60%,#f0ead8 100%)' }}>
                        {order.stamp_svg ? (
                          <div className="w-full" dangerouslySetInnerHTML={{ __html: scaleSvg(order.stamp_svg, 80) }} />
                        ) : <span className="text-2xl">🖊</span>}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#0d1b4b] text-sm sm:text-base leading-tight">
                          {reqs.companyName || 'Custom Stamp'}
                        </h3>
                        <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                          <p>{order.stamp_shape} · {order.stamp_size}mm · {order.stamp_color} ink</p>
                          <p>Qty: {order.quantity} · {formatDate(order.created_at)}</p>
                          <p className="hidden sm:block">{order.customer_city}, {order.customer_state}</p>
                        </div>
                        <p className="mt-2 font-bold text-[#0d1b4b] text-sm">{formatPrice(order.total)}</p>
                      </div>
                    </div>

                    <ProgressBar status={order.status} />

                    {/* Step labels */}
                    <div className="flex mt-2">
                      {STATUS_STEPS.map(s => (
                        <span key={s} className="flex-1 text-center text-[9px] sm:text-[10px] text-gray-400 capitalize leading-tight">
                          {s}
                        </span>
                      ))}
                    </div>

                    {order.status === 'delivered' && (
                      <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Delivered! A delivery confirmation with your stamp image was sent to {order.customer_email}.
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
