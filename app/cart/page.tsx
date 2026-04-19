'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package, Sparkles } from 'lucide-react'
import { formatPrice, getPriceBySize } from '@/lib/utils'
import { toast } from 'sonner'

interface CartItem {
  id: string
  stamp: { id: string; svg: string; designName: string; requirements: any }
  quantity: number
  price: number
  sizeKey?: string
}

/* Scale SVG to fit a pixel width */
function scaleSvg(svg: string, targetW: number): string {
  if (!svg) return ''
  const vb = svg.match(/viewBox=["']([^"']+)["']/)
  const wm = svg.match(/\swidth=["']([^"'px%]+)["']/)
  const hm = svg.match(/\sheight=["']([^"'px%]+)["']/)
  let sw = wm ? parseFloat(wm[1]) : 300
  let sh = hm ? parseFloat(hm[1]) : 200
  if (vb) { const p = vb[1].trim().split(/[\s,]+/); if (p.length === 4) { sw = parseFloat(p[2]); sh = parseFloat(p[3]) } }
  const newH = Math.round(targetW * sh / sw)
  let result = svg
    .replace(/\swidth=["'][^"']*["']/g, '')
    .replace(/\sheight=["'][^"']*["']/g, '')
    .replace('<svg', `<svg width="${targetW}" height="${newH}"`)
  if (!result.includes('viewBox')) result = result.replace('<svg', `<svg viewBox="0 0 ${sw} ${sh}"`)
  return result
}

export default function CartPage() {
  const [items,      setItems]      = useState<CartItem[]>([])
  const [livePrices, setLivePrices] = useState<Record<string, number>>({})

  // Fetch live prices from DB
  useEffect(() => {
    fetch('/api/prices')
      .then(r => r.json())
      .then(d => { if (d.prices) setLivePrices(d.prices) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const load = () => {
      try {
        setItems(JSON.parse(localStorage.getItem(localStorage.getItem('stamp_cart_key') || 'stamp_cart_guest') || '[]'))
      } catch { setItems([]) }
    }
    load()
    window.addEventListener('cart_updated', load)
    return () => window.removeEventListener('cart_updated', load)
  }, [])

  // Effective unit price: DB price (if loaded) → stored price → hardcoded default
  const effectivePrice = (item: CartItem) => {
    const sk = item.sizeKey
    if (sk && livePrices[sk] !== undefined) return livePrices[sk]
    return item.price
  }

  const save = (next: CartItem[]) => {
    setItems(next)
    const k = localStorage.getItem('stamp_cart_key') || 'stamp_cart_guest'
    localStorage.setItem(k, JSON.stringify(next))
    window.dispatchEvent(new Event('cart_updated'))
  }
  const updQty = (id: string, d: number) =>
    save(items.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))
  const remove = (id: string) => { save(items.filter(i => i.id !== id)); toast.info('Item removed') }

  const subtotal = items.reduce((s, i) => s + effectivePrice(i) * i.quantity, 0)
  const gst      = subtotal * 0.18
  const total    = subtotal + gst

  /* ── Empty cart ── */
  if (!items.length) return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fade-in">
      <div className="text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <ShoppingCart className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[#0d1b4b] mb-2">Your cart is empty</h2>
        <p className="text-gray-400 text-sm mb-7">Design a custom stamp and add it here</p>
        <Link href="/design"
          className="inline-flex items-center gap-2 bg-amber-500 text-[#0d1b4b] font-bold px-6 py-3.5 rounded-xl hover:bg-amber-400 transition-colors text-sm">
          <Sparkles className="w-4 h-4" /> Design a Stamp
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-12 sm:pb-16 animate-fade-in">
      <div className="container-app pt-4 sm:pt-6 lg:pt-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0d1b4b] mb-5 sm:mb-6">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">

          {/* Items list */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">

                  {/* ── Stamp preview — properly sized and scaled ── */}
                  <div
                    className="flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
                    style={{
                      width: 88,
                      height: 72,
                      background: 'radial-gradient(ellipse at center,#fefef8 60%,#f0ead8 100%)',
                      border: '1px solid #e0d8c0',
                      padding: '6px',
                    }}
                  >
                    {item.stamp.svg ? (
                      <div
                        className="w-full"
                        dangerouslySetInnerHTML={{ __html: scaleSvg(item.stamp.svg, 76) }}
                      />
                    ) : (
                      <span className="text-2xl">🖊</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[#0d1b4b] text-sm leading-tight truncate">
                          {item.stamp.requirements?.companyName || 'Custom Stamp'}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.stamp.designName} · {item.stamp.requirements?.shape} · {item.stamp.requirements?.size}mm
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.stamp.requirements?.color} ink
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => updQty(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors active:scale-90"
                        >
                          <Minus className="w-3 h-3 text-gray-600" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-[#0d1b4b]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updQty(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors active:scale-90"
                        >
                          <Plus className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-[#0d1b4b] text-sm">{formatPrice(effectivePrice(item) * item.quantity)}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400">{formatPrice(effectivePrice(item))} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link href="/design"
              className="flex items-center gap-2 text-[#0d1b4b] hover:text-[#1a3a8b] text-sm font-medium transition-colors pt-1 pl-1">
              <Package className="w-4 h-4" /> Add another stamp design
            </Link>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <h2 className="font-semibold text-[#0d1b4b] text-base mb-4">Order Summary</h2>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} item{items.length !== 1 ? 's' : ''})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST (18%)</span><span>{formatPrice(gst)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="gold-line !my-2" />
                <div className="flex justify-between font-bold text-[#0d1b4b] text-base">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
              </div>

              <Link href="/checkout"
                className="mt-5 flex items-center justify-center gap-2 bg-amber-500 text-[#0d1b4b] font-bold py-4 rounded-xl hover:bg-amber-400 transition-colors text-sm active:scale-95">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="mt-4 grid grid-cols-3 gap-1.5 text-center">
                {['🔒 Secure', '🚚 Free Ship', '📦 3–5 Days'].map(t => (
                  <div key={t} className="text-xs text-gray-400">{t}</div>
                ))}
              </div>
            </div>

            {/* Pricing guide */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2.5">Pricing Guide</p>
              <div className="space-y-1.5">
                {[['Up to 30mm','₹299'],['31–40mm','₹399'],['41–50mm','₹499'],['50mm+','₹699']].map(([s, p]) => (
                  <div key={s} className="flex justify-between text-xs text-blue-700">
                    <span>{s}</span>
                    <span className="font-semibold">{p}/stamp</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
