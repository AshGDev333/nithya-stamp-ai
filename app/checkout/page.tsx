'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock, CheckCircle, CreditCard, Smartphone, Building2, Loader2, MapPin, User, Mail, Phone } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

interface CartItem {
  id: string
  stamp: { id: string; svg: string; designName: string; requirements: any }
  quantity: number
  price: number
}

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand',
  'West Bengal','Delhi','Jammu and Kashmir','Ladakh','Puducherry',
]

declare global { interface Window { Razorpay: any } }

/* ── Scale SVG to fit a pixel width, preserving aspect ratio ── */
function scaleSvg(svg: string, targetW: number): string {
  if (!svg) return ''
  const vb = svg.match(/viewBox=["']([^"']+)["']/)
  const wm = svg.match(/\swidth=["']([^"'px%]+)["']/)
  const hm = svg.match(/\sheight=["']([^"'px%]+)["']/)
  let sw = wm ? parseFloat(wm[1]) : 300
  let sh = hm ? parseFloat(hm[1]) : 200
  if (vb) {
    const p = vb[1].trim().split(/[\s,]+/)
    if (p.length === 4) { sw = parseFloat(p[2]); sh = parseFloat(p[3]) }
  }
  const newH = Math.round(targetW * sh / sw)
  let result = svg
    .replace(/\swidth=["'][^"']*["']/g, '')
    .replace(/\sheight=["'][^"']*["']/g, '')
    .replace('<svg', `<svg width="${targetW}" height="${newH}"`)
  if (!result.includes('viewBox')) {
    result = result.replace('<svg', `<svg viewBox="0 0 ${sw} ${sh}"`)
  }
  return result
}

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping')
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [customer, setCustomer] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: 'Tamil Nadu', pincode: '',
  })
  const [livePrices, setLivePrices] = useState<Record<string, number>>({})

  // Refs for Tab/Enter key navigation
  const nameRef    = useRef<HTMLInputElement>(null)
  const emailRef   = useRef<HTMLInputElement>(null)
  const phoneRef   = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLTextAreaElement>(null)
  const cityRef    = useRef<HTMLInputElement>(null)
  const pincodeRef = useRef<HTMLInputElement>(null)
  const stateRef   = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(localStorage.getItem('stamp_cart_key') || 'stamp_cart_guest') || '[]')) } catch { setItems([]) }
    // Load Razorpay SDK
    if (!document.getElementById('rzp-script')) {
      const s = document.createElement('script')
      s.id  = 'rzp-script'
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      s.async = true
      document.body.appendChild(s)
    }
    // Fetch live prices
    fetch('/api/prices')
      .then(r => r.json())
      .then(d => { if (d.prices) setLivePrices(d.prices) })
      .catch(() => {})
  }, [])

  // Effective price uses DB override → stored cart price
  const effectivePrice = (item: CartItem) => {
    const sk = (item as any).sizeKey
    if (sk && livePrices[sk] !== undefined) return livePrices[sk]
    return item.price
  }

  const subtotal = items.reduce((s, i) => s + effectivePrice(i) * i.quantity, 0)
  const gst      = subtotal * 0.18
  const total    = subtotal + gst

  const set = (k: string, v: string) => {
    setCustomer(c => ({ ...c, [k]: v }))
    // Clear error on typing
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!customer.name.trim())                                     e.name    = 'Full name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))       e.email   = 'Enter a valid email'
    if (!/^[6-9]\d{9}$/.test(customer.phone.replace(/\s/g, '')))  e.phone   = 'Enter valid 10-digit mobile'
    if (!customer.address.trim())                                  e.address = 'Delivery address is required'
    if (!customer.city.trim())                                     e.city    = 'City is required'
    if (!/^\d{6}$/.test(customer.pincode))                        e.pincode = '6-digit pincode required'
    setErrors(e)
    if (Object.keys(e).length > 0) {
      // Focus the first error field
      const first = Object.keys(e)[0]
      const refs: Record<string, any> = { name: nameRef, email: emailRef, phone: phoneRef, address: addressRef, city: cityRef, pincode: pincodeRef }
      refs[first]?.current?.focus()
    }
    return Object.keys(e).length === 0
  }

  /* ── Enter key: focus next field (never submit the form accidentally) ── */
  const focusNext = (nextRef: React.RefObject<HTMLElement>) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()  // ← This stops any accidental form submission
      nextRef.current?.focus()
    }
  }

  const handleContinue = () => {
    if (validate()) setStep('payment')
  }

  const handleRazorpay = async () => {
    if (!validate()) return
    setProcessing(true)
    try {
      const item    = items[0]
      const sizeKey = (item as any).sizeKey || '63x23'
      const qty     = item.quantity

      const orderRes = await fetch('/api/razorpay', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send sizeKey + qty so server computes amount — never trust client total
        body: JSON.stringify({ sizeKey, quantity: qty, receipt: `order_${Date.now()}` }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error)

      if (orderData.mock) {
        await placeOrder({ razorpayPaymentId: `MOCK_${Date.now()}`, razorpayOrderId: '', razorpaySignature: '' })
        return
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''
      const rzp = new window.Razorpay({
        key:         keyId,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        'Nithya Stamp AI',
        description: 'Custom Rubber Stamp Order',
        order_id:    orderData.id,
        prefill:     { name: customer.name, email: customer.email, contact: customer.phone },
        theme:       { color: '#0d1b4b' },
        modal:       { ondismiss: () => { setProcessing(false); toast.info('Payment cancelled') } },
        handler: async (response: any) => {
          await placeOrder({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId:   response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          })
        },
      })
      rzp.open()
    } catch (err: any) {
      toast.error(err.message || 'Payment failed')
      setProcessing(false)
    }
  }

  const placeOrder = async (payment: { razorpayPaymentId: string; razorpayOrderId: string; razorpaySignature: string }) => {
    try {
      const item    = items[0]
      const sizeKey = (item as any).sizeKey || '63x23'
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          sizeKey,
          razorpayPaymentId: payment.razorpayPaymentId,
          razorpayOrderId:   payment.razorpayOrderId,
          razorpaySignature: payment.razorpaySignature,
          stampSvg:          item.stamp.svg,
          stampRequirements: JSON.stringify(item.stamp.requirements),
          stampShape:        item.stamp.requirements?.shape  || 'rectangle',
          stampSize:         item.stamp.requirements?.size   || 38,
          stampColor:        item.stamp.requirements?.color  || 'blue',
          quantity:          item.quantity,
          // Note: price and total are intentionally NOT sent — server recomputes from sizeKey
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const cartKey = localStorage.getItem('stamp_cart_key') || 'stamp_cart_guest'; localStorage.removeItem(cartKey)
      window.dispatchEvent(new Event('cart_updated'))
      localStorage.setItem('last_order_id', data.orderId)
      setStep('success')
    } catch (err: any) {
      toast.error(err.message || 'Order failed')
    } finally { setProcessing(false) }
  }

  /* ── Empty cart ── */
  if (!items.length && step !== 'success') return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="font-display text-2xl font-bold text-[#0d1b4b] mb-3">Cart is empty</h2>
        <Link href="/design" className="inline-flex items-center gap-2 bg-amber-500 text-[#0d1b4b] font-bold px-6 py-3 rounded-xl hover:bg-amber-400 transition-colors">
          Design a Stamp
        </Link>
      </div>
    </div>
  )

  /* ── Success screen ── */
  if (step === 'success') {
    const oid = typeof window !== 'undefined' ? localStorage.getItem('last_order_id') || '' : ''
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-5 animate-bounce-in">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0d1b4b] mb-2">Order Placed! 🎉</h1>
          <p className="text-gray-500 text-sm mb-4 leading-relaxed">
            Your stamp is in production. Admin has been notified and will ship within 1–2 business days.
          </p>
          {oid && (
            <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
              <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
              <p className="font-mono text-xs font-bold text-[#0d1b4b] break-all">{oid}</p>
            </div>
          )}
          <p className="text-xs text-gray-400 mb-7">
            Confirmation email sent to <strong>{customer.email}</strong>.
            You'll get another email when it's delivered.
          </p>
          <div className="flex gap-3">
            <Link href="/orders" className="flex-1 py-3 border border-[#0d1b4b] text-[#0d1b4b] rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors text-center">
              Track Order
            </Link>
            <Link href="/design" className="flex-1 py-3 bg-amber-500 text-[#0d1b4b] rounded-xl text-sm font-bold hover:bg-amber-400 transition-colors text-center">
              New Stamp
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* ── Order summary card (shared between steps) ── */
  const OrderSummary = () => (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <h3 className="font-semibold text-[#0d1b4b] text-sm mb-4">Order Summary</h3>

        {items.map(item => (
          <div key={item.id} className="flex items-start gap-3 mb-4 last:mb-0">

            {/* ── Stamp preview box — fixed aspect, SVG scaled properly ── */}
            <div className="w-16 h-14 sm:w-20 sm:h-16 flex-shrink-0 rounded-xl border border-gray-100 overflow-hidden flex items-center justify-center bg-white p-1.5"
              style={{ background: 'radial-gradient(ellipse at center,#fefef8 60%,#f0ead8 100%)' }}>
              {item.stamp.svg ? (
                <div
                  className="w-full"
                  dangerouslySetInnerHTML={{ __html: scaleSvg(item.stamp.svg, 68) }}
                />
              ) : (
                <span className="text-2xl">🖊</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#0d1b4b] leading-tight mb-0.5 line-clamp-2">
                {item.stamp.requirements?.companyName || 'Custom Stamp'}
              </p>
              <p className="text-xs text-gray-400">
                {item.stamp.requirements?.shape} · {item.stamp.requirements?.size}mm
              </p>
              <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
            </div>

            <span className="text-xs font-bold text-[#0d1b4b] flex-shrink-0 pt-0.5">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}

        <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>GST (18%)</span><span>{formatPrice(gst)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">FREE</span>
          </div>
          <div className="gold-line !my-2" />
          <div className="flex justify-between text-sm font-bold text-[#0d1b4b]">
            <span>Total</span><span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-100 rounded-2xl p-3.5 sm:p-4 space-y-1.5">
        {['🔒 SSL-secured payment', '📧 Email confirmation sent', '🖊 Admin notified instantly', '📦 Delivered in 3–5 days'].map(t => (
          <p key={t} className="text-xs text-green-700">{t}</p>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-12 sm:pb-16 animate-fade-in">
      <div className="container-app pt-4 sm:pt-6">

        {/* Back link */}
        <Link href="/cart"
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#0d1b4b] text-sm mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        {/* Step indicators */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6">
          {[
            { label: 'Shipping Details', key: 'shipping' },
            { label: 'Payment',          key: 'payment'  },
          ].map((s, i) => {
            const isActive = step === s.key
            const isDone   = step === 'payment' && i === 0
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`step-dot ${isActive ? 'step-active' : isDone ? 'step-done' : 'step-inactive'}`}>
                  {isDone ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs sm:text-sm font-medium ${isActive ? 'text-[#0d1b4b]' : 'text-gray-400'}`}>
                  {s.label}
                </span>
                {i === 0 && <div className="w-6 sm:w-14 h-px bg-gray-200" />}
              </div>
            )
          })}
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">

          {/* ── Form panel ── */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8">

            {/* ════════════════════════════════════
                STEP 1 — SHIPPING
                All inputs are inside a div (NOT a form).
                Each field uses onKeyDown to move focus to
                the next field when Enter is pressed.
                The Continue button uses type="button" so
                it is never triggered accidentally by Enter.
            ════════════════════════════════════ */}
            {step === 'shipping' && (
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#0d1b4b] mb-6">
                  Shipping Information
                </h2>

                <div className="space-y-4 sm:space-y-5">

                  {/* Full Name */}
                  <div>
                    <label htmlFor="f-name" className="field-label">
                      <User className="w-3 h-3 inline mr-1" />Full Name *
                    </label>
                    <input
                      id="f-name"
                      ref={nameRef}
                      type="text"
                      autoComplete="name"
                      className={`field-input ${errors.name ? 'error' : ''}`}
                      placeholder="e.g. Ravi Kumar"
                      value={customer.name}
                      onChange={e => set('name', e.target.value)}
                      onKeyDown={focusNext(emailRef)}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>

                  {/* Email + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="f-email" className="field-label">
                        <Mail className="w-3 h-3 inline mr-1" />Email Address *
                      </label>
                      <input
                        id="f-email"
                        ref={emailRef}
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        className={`field-input ${errors.email ? 'error' : ''}`}
                        placeholder="you@email.com"
                        value={customer.email}
                        onChange={e => set('email', e.target.value)}
                        onKeyDown={focusNext(phoneRef)}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="f-phone" className="field-label">
                        <Phone className="w-3 h-3 inline mr-1" />Mobile Number *
                      </label>
                      <input
                        id="f-phone"
                        ref={phoneRef}
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        maxLength={10}
                        className={`field-input ${errors.phone ? 'error' : ''}`}
                        placeholder="9876543210"
                        value={customer.phone}
                        onChange={e => set('phone', e.target.value.replace(/\D/g, ''))}
                        onKeyDown={focusNext(addressRef)}
                      />
                      {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="f-addr" className="field-label">
                      <MapPin className="w-3 h-3 inline mr-1" />Full Delivery Address *
                    </label>
                    <textarea
                      id="f-addr"
                      ref={addressRef}
                      rows={2}
                      autoComplete="street-address"
                      className={`field-input resize-none ${errors.address ? 'error' : ''}`}
                      placeholder="Door no, Street, Area, Landmark"
                      value={customer.address}
                      onChange={e => set('address', e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); cityRef.current?.focus() } }}
                    />
                    {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                  </div>

                  {/* City + Pincode + State */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label htmlFor="f-city" className="field-label">City *</label>
                      <input
                        id="f-city"
                        ref={cityRef}
                        type="text"
                        autoComplete="address-level2"
                        className={`field-input ${errors.city ? 'error' : ''}`}
                        placeholder="Chennai"
                        value={customer.city}
                        onChange={e => set('city', e.target.value)}
                        onKeyDown={focusNext(pincodeRef)}
                      />
                      {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                    </div>

                    <div>
                      <label htmlFor="f-pin" className="field-label">Pincode *</label>
                      <input
                        id="f-pin"
                        ref={pincodeRef}
                        type="text"
                        autoComplete="postal-code"
                        inputMode="numeric"
                        maxLength={6}
                        className={`field-input ${errors.pincode ? 'error' : ''}`}
                        placeholder="600001"
                        value={customer.pincode}
                        onChange={e => set('pincode', e.target.value.replace(/\D/g, ''))}
                        onKeyDown={focusNext(stateRef)}
                      />
                      {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>}
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="f-state" className="field-label">State</label>
                      <select
                        id="f-state"
                        ref={stateRef}
                        className="field-input"
                        value={customer.state}
                        onChange={e => set('state', e.target.value)}
                      >
                        {STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Continue button — type="button" prevents Enter-key accidental submit */}
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="w-full py-4 bg-[#0d1b4b] text-white font-bold rounded-xl hover:bg-[#1a3a8b] transition-colors text-sm active:scale-95 mt-2"
                  >
                    Continue to Payment →
                  </button>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════
                STEP 2 — PAYMENT
            ════════════════════════════════════ */}
            {step === 'payment' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#0d1b4b]">Secure Payment</h2>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Lock className="w-3.5 h-3.5 text-green-500" /> SSL Secured
                  </div>
                </div>

                {/* Payment methods */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
                  <p className="text-xs font-bold text-blue-800 mb-3 uppercase tracking-wide">Accepted Payment Methods</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Smartphone, label: 'UPI · GPay · PhonePe' },
                      { icon: CreditCard, label: 'Credit / Debit Card' },
                      { icon: Building2,  label: 'Net Banking' },
                      { icon: CreditCard, label: 'Wallets / EMI' },
                    ].map(m => (
                      <div key={m.label} className="flex items-center gap-2 bg-white border border-blue-100 rounded-xl p-2.5">
                        <m.icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-xs text-blue-700 font-medium">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Razorpay info */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl flex-shrink-0">💳</span>
                    <div>
                      <p className="text-sm font-bold text-amber-900">Powered by Razorpay</p>
                      <p className="text-xs text-amber-700 mt-0.5">India's most trusted gateway — 100% secure payment</p>
                    </div>
                  </div>
                </div>

                {/* Delivery summary */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Delivering to</p>
                  <p className="text-sm font-semibold text-[#0d1b4b]">{customer.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {customer.address}, {customer.city}, {customer.state} — {customer.pincode}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {customer.email} · {customer.phone}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors active:scale-95"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRazorpay}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-[#0d1b4b] font-bold py-4 rounded-xl text-sm hover:bg-amber-400 transition-colors disabled:opacity-60 active:scale-95"
                  >
                    {processing
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                      : <>Pay {formatPrice(total)} via Razorpay</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Order summary sidebar ── */}
          <div className="order-first lg:order-last">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
