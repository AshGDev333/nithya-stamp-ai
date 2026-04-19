'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, RefreshCw, LogOut, Package, Clock, Printer, Truck, CheckCircle, Mail, Eye, X, ChevronDown, TrendingUp, Settings } from "lucide-react"
import { formatPrice, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

const STATUSES = ['pending', 'processing', 'printing', 'shipped', 'delivered']
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  printing: 'bg-violet-100 text-violet-800 border-violet-200',
  shipped: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}
const STATUS_ICONS: Record<string, any> = {
  pending: Clock, processing: Package, printing: Printer,
  shipped: Truck, delivered: CheckCircle,
}

interface Order {
  id: string; customer_name: string; customer_email: string; customer_phone: string;
  customer_address: string; customer_city: string; customer_state: string; customer_pincode: string;
  stamp_svg: string; stamp_requirements: string; stamp_shape: string; stamp_size: number;
  stamp_color: string; quantity: number; price: number; total: number;
  status: string; created_at: string; admin_notified: number;
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [preview, setPreview] = useState<Order | null>(null)
  const [delivering, setDelivering] = useState<string | null>(null)

  const token = () => typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : ''

  const fetchData = useCallback(async () => {
    if (!token()) { router.push('/admin'); return }
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (statusFilter) params.set('status', statusFilter)
      const hdrs = { Authorization: `Bearer ${token()}` }
      const [oRes, sRes] = await Promise.all([
        fetch(`/api/admin/orders?${params}`, { headers: hdrs }),
        fetch('/api/admin/orders/stats', { headers: hdrs }),
      ])
      if (oRes.status === 401) { router.push('/admin'); return }
      const [oData, sData] = await Promise.all([oRes.json(), sRes.json()])
      setOrders(oData.orders || [])
      setStats(sData.stats || {})
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }, [query, statusFilter, router])

  useEffect(() => { fetchData() }, [fetchData])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed')
      setOrders(o => o.map(x => x.id === id ? { ...x, status } : x))
      toast.success(`Status → ${status}`)
    } catch { toast.error('Update failed') }
    finally { setUpdating(null) }
  }

  const markDelivered = async (order: Order) => {
    setDelivering(order.id)
    try {
      await updateStatus(order.id, 'delivered')
      const res = await fetch('/api/admin/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ orderId: order.id }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      toast.success(`✉️ Delivery email sent to ${order.customer_email}`)
      fetchData()
    } catch (e: any) { toast.error(e.message || 'Email failed') }
    finally { setDelivering(null) }
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    // Clear cookie so middleware also stops seeing the session
    document.cookie = 'admin_token=; path=/; max-age=0; SameSite=Strict'
    router.push('/admin')
  }

  const StatCard = ({ icon: Icon, label, value, accent }: any) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className={`w-10 h-10 ${accent} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="font-display text-2xl font-bold text-[#0d1b4b]">{value ?? 0}</div>
      <div className="text-slate-400 text-xs mt-0.5">{label}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin topbar */}
      <header className="bg-[#0d1b4b] text-white px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-[#1e3a8a]">
            <img src="/horse-logo-BGR.png" alt="logo" className="w-8 h-8 object-contain" />
          </div>
          <span className="font-display font-bold text-lg">
            Nithya Stamp AI <span className="text-amber-400 font-normal text-sm">Admin</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => router.push("/admin/settings")} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors mr-2"><Settings className="w-4 h-4" /> Settings</button>
          <button onClick={logout} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="container-app py-6 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard icon={Package}      label="Total Orders" value={stats.total}     accent="bg-[#0d1b4b]" />
          <StatCard icon={Clock}        label="Pending"      value={stats.pending}    accent="bg-amber-500" />
          <StatCard icon={Printer}      label="Production"   value={stats.processing} accent="bg-violet-500" />
          <StatCard icon={Truck}        label="Shipped"      value={stats.shipped}    accent="bg-cyan-500" />
          <StatCard icon={CheckCircle}  label="Delivered"    value={stats.delivered}  accent="bg-emerald-500" />
          <div className="bg-[#0d1b4b] rounded-2xl p-5 sm:col-span-1 col-span-2">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 text-xs font-medium">Revenue</span>
            </div>
            <div className="font-display text-xl sm:text-2xl font-bold text-amber-400">{formatPrice(stats.revenue || 0)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input className="field-input pl-9" placeholder="Search name, email, order ID…"
              value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="field-input sm:w-44">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-slate-200 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Stamp Preview', 'Customer', 'Order Info', 'Amount', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map(order => {
                    const Icon = STATUS_ICONS[order.status] || Package
                    const reqs = (() => { try { return JSON.parse(order.stamp_requirements) } catch { return {} } })()
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Stamp preview */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center p-1 flex-shrink-0 overflow-hidden">
                              <div dangerouslySetInnerHTML={{__html: order.stamp_svg}} style={{width:'100%',overflow:'hidden'}} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[#0d1b4b] truncate max-w-[120px]">{reqs.companyName || 'Stamp'}</p>
                              <p className="text-xs text-slate-400">{order.stamp_shape} · {order.stamp_size}mm</p>
                            </div>
                          </div>
                        </td>
                        {/* Customer */}
                        <td className="px-4 py-4">
                          <p className="font-medium text-[#0d1b4b]">{order.customer_name}</p>
                          <p className="text-xs text-slate-400">{order.customer_email}</p>
                          <p className="text-xs text-slate-400">{order.customer_phone}</p>
                        </td>
                        {/* Order */}
                        <td className="px-4 py-4">
                          <p className="font-mono text-xs text-slate-400 mb-1">{order.id.slice(0,18)}…</p>
                          <p className="text-xs text-slate-500">{formatDate(order.created_at)}</p>
                          <p className="text-xs text-slate-400">Qty: {order.quantity}</p>
                        </td>
                        {/* Amount */}
                        <td className="px-4 py-4">
                          <p className="font-bold text-[#0d1b4b]">{formatPrice(order.total)}</p>
                          <p className="text-xs text-emerald-600 font-medium">✓ Paid</p>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-4">
                          <div className="relative inline-block">
                            <select value={order.status}
                              onChange={e => updateStatus(order.id, e.target.value)}
                              disabled={updating === order.id}
                              className={`appearance-none pl-6 pr-7 py-1.5 rounded-full text-xs font-semibold border cursor-pointer ${STATUS_COLORS[order.status]} focus:outline-none`}>
                              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                            </select>
                            <Icon className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                          </div>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setPreview(order)}
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#0d1b4b] transition-colors" title="Preview">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => markDelivered(order)}
                              disabled={delivering === order.id || order.status === 'delivered'}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                                order.status === 'delivered'
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}>
                              {delivering === order.id
                                ? <RefreshCw className="w-3 h-3 animate-spin" />
                                : <Mail className="w-3 h-3" />}
                              {order.status === 'delivered' ? 'Delivered' : 'Mark Delivered'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setPreview(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full sm:max-w-lg shadow-2xl max-h-[95vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-bold text-[#0d1b4b]">Stamp Design</h3>
              <button onClick={() => setPreview(null)} className="p-2 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="rounded-2xl p-8 flex items-center justify-center mb-5"
              style={{background:'#fefefe', border:'2px solid #e8e8e8', minHeight:200}}>
              <div style={{width:'100%'}} dangerouslySetInnerHTML={{__html: preview.stamp_svg}} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs mb-5">
              {[
                ['Customer', preview.customer_name],
                ['Email', preview.customer_email],
                ['Phone', preview.customer_phone],
                ['Amount', formatPrice(preview.total)],
                ['Shape', `${preview.stamp_shape} · ${preview.stamp_size}mm`],
                ['Address', `${preview.customer_city}, ${preview.customer_state}`],
              ].map(([k,v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-slate-400 mb-0.5">{k}</p>
                  <p className="font-semibold text-[#0d1b4b] break-all">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPreview(null)}
                className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Close
              </button>
              <button
                onClick={() => { markDelivered(preview); setPreview(null) }}
                disabled={preview.status === 'delivered'}
                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                <Mail className="w-4 h-4" />
                {preview.status === 'delivered' ? 'Already Delivered' : 'Mark Delivered & Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
