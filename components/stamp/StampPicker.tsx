'use client'
import { useState } from 'react'
import { Check, ShoppingCart, ZoomIn, X, Download } from 'lucide-react'
import { GeneratedStamp } from '@/types'

interface Props { stamps: GeneratedStamp[]; onSelect: (s: GeneratedStamp) => void; loading: boolean }

const LABELS = ['Variation 1', 'Variation 2', 'Variation 3']
const DESCS  = ['First style of your selected stamp type', 'Second style — different layout', 'Third style — alternate design']

function scaleSvg(svg: string, w: number): string {
  if (!svg) return ''
  const vb = svg.match(/viewBox=["']([^"']+)["']/)
  const wm = svg.match(/\swidth=["']([^"'px]+)["']/)
  const hm = svg.match(/\sheight=["']([^"'px]+)["']/)
  let sw = wm ? parseFloat(wm[1]) : 300
  let sh = hm ? parseFloat(hm[1]) : 200
  if (vb) { const p = vb[1].trim().split(/[\s,]+/); if (p.length===4) { sw=+p[2]; sh=+p[3] } }
  const newH = Math.round(w * sh / sw)
  return svg
    .replace(/\swidth=["'][^"']*["']/g,'').replace(/\sheight=["'][^"']*["']/g,'')
    .replace('<svg',`<svg width="${w}" height="${newH}"`)
    + (!svg.includes('viewBox') ? '' : '')
}

function dlSvg(svg: string, name: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([svg], {type:'image/svg+xml'}))
  a.download = name; a.click()
}

export default function StampPicker({ stamps, onSelect, loading }: Props) {
  const [sel, setSel] = useState<string|null>(null)
  const [zoom, setZoom] = useState<GeneratedStamp|null>(null)

  if (loading) return (
    <div className="space-y-4">
      <div className="text-center py-8 sm:py-10">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4">
          <div className="absolute inset-0 bg-[#0d1b4b]/10 rounded-2xl animate-ping" />
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#0d1b4b] rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg">🖊</div>
        </div>
        <p className="font-semibold text-[#0d1b4b] text-base">Creating your stamp designs…</p>
        <p className="text-gray-400 text-sm mt-1">AI building 3 professional layouts</p>
        <div className="flex justify-center gap-1.5 mt-3">
          {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-[#0d1b4b]/30 rounded-full animate-bounce" style={{animationDelay:`${i*.18}s`}} />)}
        </div>
      </div>
      {[1,2,3].map(i => <div key={i} className="h-40 sm:h-48 shimmer rounded-2xl" />)}
    </div>
  )

  if (!stamps.length) return (
    <div className="flex flex-col items-center justify-center py-14 sm:py-20 text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center mb-4">
        <span className="text-2xl sm:text-3xl">🎨</span>
      </div>
      <p className="font-semibold text-gray-600 text-sm sm:text-base">Fill the form and click Generate</p>
      <p className="text-xs sm:text-sm text-gray-400 mt-1">3 ready-to-print designs appear here</p>
    </div>
  )

  return (
    <>
      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#0d1b4b] text-base sm:text-lg">Choose Your Design</h3>
          <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-semibold">
            ✓ {stamps.length} ready
          </span>
        </div>

        {stamps.map((stamp, i) => (
          <div key={stamp.id}
            onClick={() => setSel(sel === stamp.id ? null : stamp.id)}
            className={`rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden ${
              sel === stamp.id ? 'border-[#0d1b4b] shadow-lg' : 'border-gray-200 bg-white hover:border-[#1a3a8b]/40 hover:shadow-md'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 pt-3.5 pb-2">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{LABELS[i]}</p>
                <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{DESCS[i]}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={e => {e.stopPropagation(); setZoom(stamp)}}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#0d1b4b] transition-colors">
                  <ZoomIn className="w-4 h-4" />
                </button>
                {sel === stamp.id && (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#0d1b4b] rounded-full flex items-center justify-center">
                    <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Stamp impression preview */}
            <div className="mx-4 sm:mx-5 mb-3.5 sm:mb-4 rounded-xl overflow-hidden flex items-center justify-center py-5 sm:py-6 px-3 sm:px-4"
              style={{background:'#fefefe', border:'1px solid #e0e0e0', boxShadow:'inset 0 1px 3px rgba(0,0,0,.05)', minHeight:140}}>
              <div style={{width:'100%', display:'flex', justifyContent:'center', alignItems:'center'}}
                dangerouslySetInnerHTML={{__html: scaleSvg(stamp.svg, Math.min(360, 360))}} />
            </div>

            {sel === stamp.id && (
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2">
                <button
                  onClick={e => {e.stopPropagation(); onSelect(stamp)}}
                  className="w-full flex items-center justify-center gap-2 bg-[#0d1b4b] text-white font-semibold py-3 rounded-xl text-sm hover:bg-[#1a3a8b] transition-colors active:scale-95">
                  <ShoppingCart className="w-4 h-4" /> Order This Stamp Design
                </button>
                <button
                  onClick={e => {e.stopPropagation(); dlSvg(stamp.svg, `stamp-design-${i+1}.svg`)}}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs text-gray-400 hover:text-[#0d1b4b] transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download SVG
                </button>
              </div>
            )}
          </div>
        ))}

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 text-xs text-amber-800 leading-relaxed">
          <strong>📌 How ordering works:</strong> After payment, admin receives your high-res SVG by email and produces the physical stamp. You get a delivery email when it ships.
        </div>
      </div>

      {/* Full-screen zoom modal */}
      {zoom && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setZoom(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full sm:max-w-2xl shadow-2xl max-h-[95vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-[#0d1b4b] text-lg">Full Preview</h3>
                <p className="text-xs text-gray-400 mt-0.5">Print-ready SVG — any size, zero pixelation</p>
              </div>
              <button onClick={() => setZoom(null)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="rounded-2xl flex items-center justify-center py-8 sm:py-10 px-4 sm:px-6"
              style={{background:'#fff', border:'2px solid #e8e8e8', minHeight:220}}>
              <div style={{width:'100%'}} dangerouslySetInnerHTML={{__html: scaleSvg(zoom.svg, 540)}} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-center">
              {[['🔢','Vector SVG','Infinite resolution'],['🖨️','Print Ready','Sent to admin'],['⚡','Laser Engraved','Perfect quality']].map(([e,t,d]) => (
                <div key={t} className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 sm:p-3">
                  <div className="text-base mb-1">{e}</div>
                  <div className="font-semibold text-[#0d1b4b]">{t}</div>
                  <div className="text-gray-400 mt-0.5">{d}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => setZoom(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Close</button>
              <button onClick={() => dlSvg(zoom.svg, 'stamp.svg')} className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
                <Download className="w-4 h-4" /> SVG
              </button>
              <button onClick={() => {setSel(zoom.id); setZoom(null)}}
                className="flex-1 py-3 bg-amber-500 text-[#0d1b4b] rounded-xl text-sm font-bold hover:bg-amber-400 transition-colors active:scale-95">
                Select & Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
