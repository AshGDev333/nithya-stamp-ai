'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Sparkles, Settings, Eye } from 'lucide-react'
import StampDesignForm from '@/components/stamp/StampDesignForm'
import StampPicker from '@/components/stamp/StampPicker'
import { GeneratedStamp, StampRequirements } from '@/types'
import { v4 as uuid } from 'uuid'
import { STAMP_SIZE_OPTIONS, getPriceBySize, getCart, saveCart } from '@/lib/utils'

export default function DesignPage() {
  const [stamps,    setStamps]    = useState<GeneratedStamp[]>([])
  const [loading,   setLoading]   = useState(false)
  const [tab,       setTab]       = useState<'form'|'preview'>('form')
  const [lastReq,   setLastReq]   = useState<StampRequirements|null>(null)
  // Live prices fetched from DB via API
  const [livePrices, setLivePrices] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/prices')
      .then(r => r.json())
      .then(d => { if (d.prices) setLivePrices(d.prices) })
      .catch(() => {/* silently fall back to hardcoded defaults */})
  }, [])

  // Get effective price: DB override first, then hardcoded default
  const getEffectivePrice = (sizeKey: string) =>
    livePrices[sizeKey] ?? getPriceBySize(sizeKey)

  const handleGenerate = async (req: StampRequirements) => {
    setLoading(true); setLastReq(req); setTab('preview')
    try {
      const res = await fetch('/api/generate-stamp', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(req)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      const generated: GeneratedStamp[] = data.svgs.map((svg: string, i: number) => ({
        id: uuid(), svg,
        designName: ['Classic','Modern','Premium'][i] || `Design ${i+1}`,
        requirements: req,
      }))
      setStamps(generated)
    } catch(e: any) {
      toast.error(e.message || 'Failed to generate stamps')
      setTab('form')
    } finally { setLoading(false) }
  }

  const handleAddToCart = (stamp: GeneratedStamp) => {
    if (!lastReq) return
    const sizeKey = (lastReq as any).sizeKey || '63x23'
    const price   = getEffectivePrice(sizeKey)
    // Store sizeKey in cart item so checkout can pass it to the server-side price lookup
    const item    = { id: uuid(), stamp, quantity: 1, price, sizeKey }

    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('stamp_last_email') || undefined : undefined
    const existing  = getCart(userEmail)
    saveCart([...existing, item], userEmail)

    window.dispatchEvent(new Event('cart_updated'))
    toast.success('Added to cart! 🎉', {
      description: 'Proceed to cart to complete your order',
      action: { label: 'View Cart', onClick: () => window.location.href = '/cart' }
    })
  }

  return (
    <div className="min-h-screen pb-12 animate-fade-in">
      <div className="bg-white border-b border-gray-100 py-6 sm:py-8 shadow-sm">
        <div className="container-app text-center">
          <div className="inline-flex items-center gap-2 bg-[#0d1b4b]/8 border border-[#0d1b4b]/12 rounded-full px-4 py-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#0d1b4b]" />
            <span className="text-xs font-semibold text-[#0d1b4b]">AI-Powered Stamp Designer</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#0d1b4b] mb-2">
            Create Your Custom Stamp
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            Describe your business — AI generates 3 professional stamp designs instantly
          </p>
        </div>
      </div>

      <div className="container-app pt-5 sm:pt-6">
        {/* Mobile tabs */}
        <div className="lg:hidden flex bg-white border border-gray-200 rounded-2xl p-1 mb-5 shadow-sm">
          {[
            { key:'form',    label:'Design Details', icon: Settings },
            { key:'preview', label:`Designs${stamps.length ? ` (${stamps.length})` : ''}`, icon: Eye },
          ].map(t => (
            <button key={t.key} type="button" onClick={() => setTab(t.key as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key ? 'bg-[#0d1b4b] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
          {/* Form */}
          <div className={`bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8 ${tab==='preview' ? 'hidden lg:block' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#0d1b4b] rounded-xl flex items-center justify-center flex-shrink-0">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="font-semibold text-[#0d1b4b] text-base sm:text-lg">Stamp Details</h2>
                <p className="text-gray-400 text-xs mt-0.5">Select size, type and fill your business info</p>
              </div>
            </div>
            <StampDesignForm onGenerate={handleGenerate} loading={loading} />
          </div>

          {/* Preview */}
          <div className={`bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8 ${tab==='form' && !loading && stamps.length===0 ? 'hidden lg:block' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-[#0d1b4b]" />
              </div>
              <div>
                <h2 className="font-semibold text-[#0d1b4b] text-base sm:text-lg">AI Generated Designs</h2>
                <p className="text-gray-400 text-xs mt-0.5">Click a design to select it</p>
              </div>
            </div>
            <StampPicker stamps={stamps} onSelect={handleAddToCart} loading={loading} />
          </div>
        </div>

        <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon:'🤖', t:'AI-Powered',      d:'Claude AI generates unique designs from your text'            },
            { icon:'🖨️', t:'Print-Ready SVG', d:'Infinite resolution — perfect for laser engraving'           },
            { icon:'📧', t:'Admin Notified',  d:'After payment, admin receives SVG for production immediately' },
          ].map(b => (
            <div key={b.t} className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <span className="text-xl flex-shrink-0">{b.icon}</span>
              <div>
                <h4 className="font-semibold text-[#0d1b4b] text-sm">{b.t}</h4>
                <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{b.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
