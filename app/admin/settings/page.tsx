'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Save, RefreshCw, Mail, IndianRupee, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { STAMP_SIZE_OPTIONS } from '@/lib/utils'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [tab,           setTab]           = useState<'prices' | 'email'>('prices')
  const [saving,        setSaving]        = useState(false)
  const [loading,       setLoading]       = useState(true)
  const [prices,        setPrices]        = useState<Record<string, number>>({})
  const [adminEmail,    setAdminEmail]    = useState('')
  const [savedEmail,    setSavedEmail]    = useState('')
  const [savedPrices,   setSavedPrices]   = useState<Record<string, number>>({})
  const [testSending,   setTestSending]   = useState(false)
  const [testResult,    setTestResult]    = useState<{ ok: boolean; msg: string } | null>(null)

  // Always read token from localStorage (client only)
  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '')

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  }), [])

  // ── Load settings from API on mount ──
  useEffect(() => {
    if (!getToken()) { router.push('/admin'); return }

    fetch('/api/admin/settings', { headers: authHeaders() })
      .then(r => {
        if (r.status === 401) { router.push('/admin'); return null }
        return r.json()
      })
      .then(data => {
        if (!data) return
        // Merge DB values with hardcoded defaults
        const merged: Record<string, number> = {}
        STAMP_SIZE_OPTIONS.forEach(opt => {
          merged[opt.value] = data.prices?.[opt.value] ?? opt.price
        })
        setPrices(merged)
        setAdminEmail(data.adminEmail || '')
        setSavedEmail(data.adminEmail || '')
        setSavedPrices(data.prices || {})
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [router, authHeaders])

  // ── Save prices ──
  const savePrices = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ prices }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Save failed')
      }
      toast.success('✅ Prices saved — now applying to all new orders!')
      setSavedPrices({...prices})
    } catch (err: any) {
      toast.error(err.message || 'Failed to save prices')
    } finally {
      setSaving(false)
    }
  }

  // ── Save email ──
  const saveEmail = async () => {
    if (!adminEmail.includes('@')) { toast.error('Enter a valid email address'); return }
    setSaving(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ adminEmail }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Save failed')
      }
      toast.success('✅ Admin email saved!')
      setSavedEmail(adminEmail)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save email')
    } finally {
      setSaving(false)
    }
  }

  // ── Send test email ──
  const sendTestEmail = async () => {
    if (!adminEmail.includes('@')) { toast.error('Save a valid email first'); return }
    setTestSending(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/admin/settings/email/test', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ email: adminEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setTestResult({ ok: true, msg: `Test email sent to ${data.sentTo}` })
      toast.success('Test email sent!')
    } catch (err: any) {
      setTestResult({ ok: false, msg: err.message || 'Failed to send test email' })
      toast.error(err.message || 'Failed to send test email')
    } finally {
      setTestSending(false)
    }
  }

  const resetPrice = (key: string) => {
    const original = STAMP_SIZE_OPTIONS.find(o => o.value === key)?.price || 299
    setPrices(p => ({ ...p, [key]: original }))
    toast.info('Price reset to default')
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-slate-300 animate-spin" />
    </div>
  )

  const rectSizes   = STAMP_SIZE_OPTIONS.filter(o => o.shape === 'rectangle')
  const circleSizes = STAMP_SIZE_OPTIONS.filter(o => o.shape === 'circle')

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#0d1b4b] text-white px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/orders')} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-[#1e3a8a]">
            <img src="/horse-logo-BGR.png" alt="logo" className="w-8 h-8 object-contain" />
          </div>
          <span className="font-display font-bold text-lg">
            Nithya Stamp AI <span className="text-amber-400 font-normal text-sm">· Settings</span>
          </span>
        </div>
        {tab === 'prices' && (
          <button onClick={savePrices} disabled={saving}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-[#0d1b4b] font-bold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-40 active:scale-95">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Prices'}
          </button>
        )}
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        {/* Tab switcher */}
        <div className="flex gap-2 mb-6 bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm">
          {[
            { id: 'prices', label: 'Stamp Pricing',  icon: IndianRupee },
            { id: 'email',  label: 'Admin Email',     icon: Mail },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id ? 'bg-[#0d1b4b] text-white shadow-sm' : 'text-slate-500 hover:text-[#0d1b4b] hover:bg-slate-50'
              }`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* ── Prices tab ── */}
        {tab === 'prices' && (
          <div className="space-y-5">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
              <IndianRupee className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-800 font-semibold text-sm">Size-Based Pricing Control</p>
                <p className="text-blue-600 text-xs mt-0.5">Edit prices below. Saved changes apply to all new orders immediately — prices are stored in the database.</p>
              </div>
            </div>

            {[
              { label: 'Rectangle / Address Stamps', emoji: '⬜', sizes: rectSizes },
              { label: 'Round / Circle Seal Stamps',  emoji: '🔵', sizes: circleSizes },
            ].map(group => (
              <div key={group.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-semibold text-[#0d1b4b] text-sm">{group.emoji} {group.label}</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {group.sizes.map(opt => (
                    <div key={opt.value} className="px-5 py-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#0d1b4b] text-sm">{opt.label}</p>
                          {opt.tag && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{opt.tag}</span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{opt.dims} · {opt.lines}</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">₹</span>
                          <input
                            type="number" min="1" max="99999"
                            value={prices[opt.value] ?? opt.price}
                            onChange={e => setPrices(p => ({ ...p, [opt.value]: Number(e.target.value) }))}
                            className="w-28 pl-7 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-[#0d1b4b] focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                        <div className="w-14 text-center">
                          {prices[opt.value] !== opt.price ? (
                            <button onClick={() => resetPrice(opt.value)} className="text-xs text-red-400 hover:text-red-600 transition-colors font-medium">Reset</button>
                          ) : (
                            <span className="text-xs text-emerald-500 font-medium">Default</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Price summary */}
            <div className="bg-[#0d1b4b] rounded-2xl p-5 text-white">
              <p className="text-sm font-semibold mb-3 text-slate-300">Current Price Summary</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {STAMP_SIZE_OPTIONS.map(opt => (
                  <div key={opt.value} className="bg-white/10 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-slate-400 truncate">{opt.dims}</p>
                    <p className="font-bold text-amber-400">₹{prices[opt.value] ?? opt.price}</p>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={savePrices} disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-[#0d1b4b] text-white font-bold py-4 rounded-2xl hover:bg-[#1a3a8b] transition-colors disabled:opacity-60 active:scale-[0.98] text-sm">
              {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'Saving to Database...' : 'Save All Prices'}
            </button>
          </div>
        )}

        {/* ── Email tab ── */}
        {tab === 'email' && (
          <div className="space-y-5">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 font-semibold text-sm">Order Notification Email</p>
                <p className="text-amber-700 text-xs mt-0.5">New order alerts and SVG stamp files will be emailed to this address. Saved to database.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#0d1b4b] mb-2">Admin Notification Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={e => { setAdminEmail(e.target.value); setTestResult(null) }}
                  placeholder="nithyapress92@gmail.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Currently saved: <strong className="text-[#0d1b4b]">{savedEmail || '(not set)'}</strong>
                </p>
              </div>

              {testResult && (
                <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${testResult.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {testResult.ok ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  {testResult.msg}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={saveEmail} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0d1b4b] text-white font-bold py-3 rounded-xl hover:bg-[#1a3a8b] transition-colors disabled:opacity-60 active:scale-[0.98] text-sm">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Email'}
                </button>
                <button onClick={sendTestEmail} disabled={testSending}
                  className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-60">
                  {testSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {testSending ? 'Sending...' : 'Test'}
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: '📦', title: 'New Order Alert',    desc: 'Sent when customer completes payment.' },
                { icon: '🖨️', title: 'SVG Design File',    desc: 'Stamp SVG attached for printing.' },
                { icon: '✅', title: 'Delivery Confirm',   desc: 'Customer notified when marked delivered.' },
                { icon: '📋', title: 'Full Order Details', desc: 'Name, address, size, color included.' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-[#0d1b4b] text-sm">{item.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
