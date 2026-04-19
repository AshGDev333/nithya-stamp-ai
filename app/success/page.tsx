'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Package, Mail, ArrowRight, Stamp } from 'lucide-react'
import { Button } from '@/components/ui'

export default function SuccessPage() {
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    const id = localStorage.getItem('last_order_id') || ''
    setOrderId(id)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center px-4 page-enter">
      <div className="max-w-lg w-full text-center">
        {/* Success animation */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
          <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
        </div>

        <h1 className="font-display text-4xl font-bold text-navy-950 mb-3">
          Order Confirmed! 🎉
        </h1>
        <p className="text-gray-500 text-lg mb-2">
          Your custom stamp is now in production.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          A confirmation email has been sent to you. You'll receive another email once your stamp is delivered.
        </p>

        {orderId && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-8 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Your Order ID</p>
            <p className="font-mono font-bold text-navy-950 text-sm break-all">{orderId}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 shadow-sm text-left">
          <h3 className="font-semibold text-navy-950 mb-4 text-sm">What happens next?</h3>
          <div className="space-y-4">
            {[
              { icon: Mail, color: 'bg-blue-100 text-blue-600', title: 'Admin Notified', desc: 'Our team has received your order with your stamp design via email.', done: true },
              { icon: Stamp, color: 'bg-purple-100 text-purple-600', title: 'Production', desc: 'Your stamp is laser engraved and assembled with precision.', done: false },
              { icon: Package, color: 'bg-amber-100 text-amber-600', title: 'Shipped & Delivered', desc: 'Dispatched within 24 hrs. Delivered in 3–5 business days.', done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${step.color}`}>
                  <step.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-navy-950 text-sm">{step.title}</h4>
                    {step.done && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Done ✓</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/orders" className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              Track Order
            </Button>
          </Link>
          <Link href="/design" className="flex-1">
            <Button variant="gold" size="lg" className="w-full">
              New Stamp <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
