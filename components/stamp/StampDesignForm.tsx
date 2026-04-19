'use client'
import { useState, useRef, useEffect } from 'react'
import { Sparkles, Loader2, Upload, X, Info } from 'lucide-react'
import { StampRequirements } from '@/types'
import { STAMP_SIZE_OPTIONS, formatPrice, getPriceBySize } from '@/lib/utils'
import { splitAddress } from '@/lib/stampGenerator'

interface Props { onGenerate: (r: StampRequirements) => void; loading: boolean }

const STAMP_TYPES = [
  { value: 'address',      label: '📋 Address Stamp',   sub: 'Name + address + phone (most popular)' },
  { value: 'premium',      label: '⭐ Premium Header',   sub: 'Bold filled header with address below'  },
  { value: 'logo-left',    label: '🖼 Logo Stamp',       sub: 'Logo on left + name/address on right'  },
  { value: 'seal',         label: '🔵 Round Seal',       sub: 'Circle stamp with name on arc'          },
  { value: 'professional', label: '👨‍⚕️ Professional',   sub: 'Doctor, lawyer, advocate, teacher'     },
  { value: 'signature',    label: '✍️ Signature Stamp',  sub: '"For [Company] / Proprietor"'           },
]

const COLORS = [
  { value: 'blue',   dot: '#1a3a8b', label: 'Blue'   },
  { value: 'red',    dot: '#8b0000', label: 'Red'    },
  { value: 'black',  dot: '#111',    label: 'Black'  },
  { value: 'green',  dot: '#145214', label: 'Green'  },
  { value: 'purple', dot: '#4a0e8f', label: 'Purple' },
]

export default function StampDesignForm({ onGenerate, loading }: Props) {
  const [form, setForm] = useState<any>({
    stampType: 'address',
    shape: 'rectangle',
    sizeKey: '63x23',
    color: 'blue',
    size: 38,
    style: 'classic',
    companyName: '', line2: '', line3: '', phone: '', email: '', website: '', customText: '',
  })
  const [logoPreview,  setLogoPreview]  = useState('')
  const [logoSvg,      setLogoSvg]      = useState('')
  const [logoErr,      setLogoErr]      = useState('')
  const [showSizeInfo, setShowSizeInfo] = useState(false)
  // Live prices from DB
  const [livePrices,   setLivePrices]   = useState<Record<string, number>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/prices')
      .then(r => r.json())
      .then(d => { if (d.prices) setLivePrices(d.prices) })
      .catch(() => {})
  }, [])

  // Effective price: DB override → hardcoded default
  const getPrice = (sizeKey: string) => livePrices[sizeKey] ?? getPriceBySize(sizeKey)

  // Build display options with live prices merged in
  const sizeOptionsWithPrice = STAMP_SIZE_OPTIONS.map(o => ({ ...o, price: getPrice(o.value) }))

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const setStampType = (v: string) => {
    const isCircle = v === 'seal'
    set('stampType', v)
    set('shape', isCircle ? 'circle' : 'rectangle')
    if (isCircle && !form.sizeKey.startsWith('r')) set('sizeKey', 'r30p')
    if (!isCircle && form.sizeKey.startsWith('r')) set('sizeKey', '63x23')
  }

  const selectedSize = sizeOptionsWithPrice.find(s => s.value === form.sizeKey)

  const availSizes = sizeOptionsWithPrice.filter(s =>
    form.shape === 'circle' ? s.shape === 'circle' : s.shape === 'rectangle'
  )

  const onLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setLogoErr('')
    if (file.size > 2 * 1024 * 1024) { setLogoErr('Max 2MB'); return }
    const reader = new FileReader()
    if (file.type === 'image/svg+xml') {
      reader.onload = () => {
        const txt = reader.result as string
        setLogoSvg(txt.replace(/<\?xml[^>]*\?>/g, '').replace(/<svg[^>]*>/, '').replace(/<\/svg>/, ''))
        setLogoPreview(URL.createObjectURL(file))
      }
      reader.readAsText(file)
    } else {
      reader.onload = () => {
        const b64 = reader.result as string
        setLogoSvg(`<image href="${b64}" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet"/>`)
        setLogoPreview(b64)
      }
      reader.readAsDataURL(file)
    }
  }
  const clearLogo = () => { setLogoSvg(''); setLogoPreview(''); setLogoErr(''); if (fileRef.current) fileRef.current.value = '' }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.companyName?.trim()) return
    onGenerate({
      ...form,
      shape: form.shape,
      size: selectedSize ? parseInt(selectedSize.dims.split('×')[0]) : 38,
      logoSvg: logoSvg || undefined,
    } as StampRequirements)
  }

  const showLogo = !['seal', 'signature'].includes(form.stampType)
  const isSeal   = form.stampType === 'seal'

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

      {/* ── Stamp Type ── */}
      <div>
        <p className="field-label">Stamp Type *</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {STAMP_TYPES.map(t => (
            <label key={t.value}
              className={`radio-card cursor-pointer ${form.stampType === t.value ? 'selected' : ''}`}>
              <input type="radio" name="stampType" value={t.value}
                checked={form.stampType === t.value}
                onChange={e => setStampType(e.target.value)}
                className="hidden" />
              <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${form.stampType === t.value ? 'bg-[#0d1b4b]' : 'bg-gray-300'}`} />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#0d1b4b] truncate">{t.label}</div>
                <div className="text-xs text-gray-400 truncate">{t.sub}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ── Size Selection — Real Trodat catalog ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="field-label mb-0">Stamp Size *</p>
          <button type="button" onClick={() => setShowSizeInfo(!showSizeInfo)}
            className="text-xs text-[#0d1b4b] flex items-center gap-1 hover:text-[#1a3a8b]">
            <Info className="w-3.5 h-3.5" /> Size guide
          </button>
        </div>

        {/* Size guide popup */}
        {showSizeInfo && (
          <div className="mb-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 space-y-1.5">
            <p className="font-bold mb-2">📐 Size Guide (Trodat Flashy Series)</p>
            {STAMP_SIZE_OPTIONS.map(s => (
              <div key={s.value} className="flex items-center justify-between">
                <span>{s.dims} — {s.lines}</span>
                <span className="font-bold">{formatPrice(s.price)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {availSizes.map(s => (
            <label key={s.value}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                form.sizeKey === s.value
                  ? 'border-[#0d1b4b] bg-[#eef3ff]'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
              <input type="radio" name="sizeKey" value={s.value}
                checked={form.sizeKey === s.value}
                onChange={() => set('sizeKey', s.value)}
                className="hidden" />
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${form.sizeKey === s.value ? 'bg-[#0d1b4b]' : 'bg-gray-300'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-[#0d1b4b]">{s.dims}</span>
                  {s.tag && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                      {s.tag}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{s.lines}</div>
              </div>
              <div className="text-sm font-bold text-[#0d1b4b] flex-shrink-0">{formatPrice(s.price)}</div>
            </label>
          ))}
        </div>

        {selectedSize && (
          <div className="mt-2 p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600 flex items-center justify-between">
            <span>Selected: <strong>{selectedSize.label}</strong> — {selectedSize.dims}</span>
            <span className="font-bold text-[#0d1b4b]">{formatPrice(selectedSize.price)}</span>
          </div>
        )}
      </div>

      {/* ── Logo Upload ── */}
      {showLogo && (
        <div>
          <p className="field-label">Company Logo <span className="normal-case font-normal text-gray-400">(optional · PNG/JPG/SVG · max 2MB)</span></p>
          {!logoPreview ? (
            <label className="flex flex-col items-center gap-2.5 p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#1a3a8b] cursor-pointer bg-gray-50 hover:bg-blue-50 transition-all">
              <Upload className="w-7 h-7 text-gray-300" />
              <span className="text-sm text-gray-500 font-medium">Click to upload logo</span>
              <span className="text-xs text-gray-400">Will appear on your stamp</span>
              <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.svg" onChange={onLogoUpload} className="hidden" />
            </label>
          ) : (
            <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-xl">
              <img src={logoPreview} alt="logo" className="w-14 h-14 object-contain rounded-lg border border-green-100 bg-white p-1" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800">Logo uploaded ✓</p>
                <p className="text-xs text-green-600 mt-0.5">Will appear on your stamp design</p>
              </div>
              <button type="button" onClick={clearLogo} className="p-1.5 rounded-lg hover:bg-green-100">
                <X className="w-4 h-4 text-green-600" />
              </button>
            </div>
          )}
          {logoErr && <p className="mt-1 text-xs text-red-500">{logoErr}</p>}
        </div>
      )}

      {/* ── Business Info ── */}
      <div>
        <p className="field-label">Business Information</p>
        <div className="space-y-3">
          <div>
            <label className="field-label">Company / Name *</label>
            <input className="field-input"
              placeholder={isSeal ? 'e.g. REALTEK SYSTEMS' : 'e.g. Chinna Durai Store'}
              value={form.companyName}
              onChange={e => set('companyName', e.target.value)} required />
          </div>
          <div>
            <label className="field-label">
              {form.stampType === 'professional' ? 'Qualification / Designation'
               : form.stampType === 'signature' ? 'Role (e.g. Proprietor)'
               : form.stampType === 'seal' ? 'Tagline / Business Type'
               : 'Business Type / Tagline'}
            </label>
            <input className="field-input"
              placeholder={form.stampType === 'professional' ? 'e.g. MBBS, MD, BDS'
                : form.stampType === 'signature' ? 'PROPRIETOR'
                : form.stampType === 'seal' ? 'e.g. HOME BAKERS'
                : 'e.g. Wholesale & Retail'}
              value={form.line2} onChange={e => set('line2', e.target.value)} />
          </div>
          {form.stampType !== 'signature' && (
            <div>
              <label className="field-label">{isSeal ? 'City / Location' : 'Full Address'}</label>
              <input className="field-input"
                placeholder={isSeal ? 'e.g. TRICHY' : 'e.g. 12, Main Street, T.Nagar, Chennai - 600017'}
                value={form.line3} onChange={e => set('line3', e.target.value)} />
              {!isSeal && form.line3 && (() => {
                const lines = splitAddress(form.line3, 28)
                return lines.length > 1 ? (
                  <div className="mt-1.5 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                    <span className="font-semibold">Stamp lines:</span>
                    {lines.map((l, i) => (
                      <span key={i} className="block mt-0.5 font-mono">Line {i + 1}: {l}</span>
                    ))}
                  </div>
                ) : null
              })()}
            </div>
          )}
          {form.stampType !== 'signature' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="field-label">Phone / WhatsApp</label>
                <input className="field-input" placeholder="98765 43210"
                  value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Email (optional)</label>
                <input className="field-input" type="email" placeholder="info@company.com"
                  value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
            </div>
          )}
          {['address', 'premium', 'logo-left'].includes(form.stampType) && (
            <div>
              <label className="field-label">Website (optional)</label>
              <input className="field-input" placeholder="www.company.com"
                value={form.website} onChange={e => set('website', e.target.value)} />
            </div>
          )}
        </div>
      </div>

      {/* ── Ink Color ── */}
      <div>
        <p className="field-label">Ink Color</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <button key={c.value} type="button" onClick={() => set('color', c.value)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-sm font-medium transition-all active:scale-95 ${
                form.color === c.value
                  ? 'border-[#0d1b4b] bg-[#0d1b4b] text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.dot }} />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Special Instructions ── */}
      <div>
        <label className="field-label">Special Instructions (optional)</label>
        <textarea className="field-input resize-none" rows={2}
          placeholder="e.g. Add GSTIN, use Tamil text for line 2, add 'RECEIVED' header…"
          value={form.customText} onChange={e => set('customText', e.target.value)} />
      </div>

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 bg-amber-500 text-[#0d1b4b] font-bold py-4 rounded-xl text-base hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-amber-200">
        {loading
          ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating designs…</>
          : <><Sparkles className="w-5 h-5" /> Generate 3 Stamp Designs</>
        }
      </button>
      <p className="text-center text-xs text-gray-400">
        Free to generate · Pay only when you order · Price: {selectedSize ? formatPrice(selectedSize.price) : '—'}
      </p>
    </form>
  )
}
