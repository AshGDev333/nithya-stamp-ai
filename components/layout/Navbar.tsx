'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, Menu, X, Package, Sparkles, Home } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0)
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHero   = pathname === '/'

  useEffect(() => {
    const sync = () => {
      try {
        const items = JSON.parse(
          localStorage.getItem(
            localStorage.getItem('stamp_cart_key') || 'stamp_cart_guest'
          ) || '[]'
        )
        setCartCount(items.reduce((s: number, i: any) => s + (i.quantity || 1), 0))
      } catch { setCartCount(0) }
    }
    sync()
    window.addEventListener('cart_updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('cart_updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  const solid = !isHero || scrolled

  const links = [
    { href: '/',       label: 'Home',         icon: Home     },
    { href: '/design', label: 'Design Stamp', icon: Sparkles },
    { href: '/orders', label: 'Track Order',  icon: Package  },
  ]

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        solid ? 'bg-white shadow-sm border-b border-slate-200/80' : 'bg-transparent'
      }`}>
        <div className="container-app">
          <div className="flex items-center h-[60px] sm:h-[66px]">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 mr-6 lg:mr-10">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden transition-colors ${
                solid ? 'bg-[#1e3a8a]' : 'bg-white/10 border border-white/20'
              }`}>
                <img
                  src="/horse-logo-BGR.png"
                  alt="logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className={`font-display text-base sm:text-lg font-bold leading-none transition-colors ${
                solid ? 'text-[#0d1b4b]' : 'text-white'
              }`}>
                Nithya <span className="text-blue-600">Stamp</span>
                <span className="text-amber-400"> AI</span>
              </span>
            </Link>

            {/* ── Desktop nav ── */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {links.map(l => {
                const active = pathname === l.href
                return (
                  <Link key={l.href} href={l.href}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                      active
                        ? solid ? 'bg-[#0d1b4b] text-white' : 'bg-white/20 text-white'
                        : solid ? 'text-slate-600 hover:text-[#0d1b4b] hover:bg-slate-50'
                               : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}>
                    <l.icon className="w-4 h-4" />{l.label}
                  </Link>
                )
              })}
            </nav>

            {/* ── Right side ── */}
            <div className="flex items-center gap-2 ml-auto">
              <Link href="/cart"
                className={`relative p-2.5 rounded-xl transition-colors ${
                  solid ? 'hover:bg-slate-100' : 'hover:bg-white/15'
                }`}>
                <ShoppingCart className={`w-5 h-5 ${solid ? 'text-[#0d1b4b]' : 'text-white'}`} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-500 text-[#0d1b4b] text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              <Link href="/design"
                className="hidden md:flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-[#0d1b4b] font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm active:scale-95">
                <Sparkles className="w-4 h-4" />Create Stamp
              </Link>
              <button
                onClick={() => setOpen(v => !v)}
                className={`md:hidden p-2.5 rounded-xl transition-colors ${
                  solid ? 'hover:bg-slate-100' : 'hover:bg-white/15'
                }`}
                aria-label="Toggle menu">
                {open
                  ? <X    className={`w-5 h-5 ${solid ? 'text-[#0d1b4b]' : 'text-white'}`} />
                  : <Menu className={`w-5 h-5 ${solid ? 'text-[#0d1b4b]' : 'text-white'}`} />
                }
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${open ? 'max-h-80' : 'max-h-0'}`}>
          <div className="bg-white border-t border-slate-100 shadow-lg">
            <div className="container-app py-3 flex flex-col gap-1">
              {links.map(l => {
                const active = pathname === l.href
                return (
                  <Link key={l.href} href={l.href}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                      active ? 'bg-[#0d1b4b] text-white' : 'text-slate-700 hover:bg-slate-50'
                    }`}>
                    <l.icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-amber-500'}`} />
                    {l.label}
                  </Link>
                )
              })}
              <Link href="/design"
                className="flex items-center justify-center gap-2 mx-1 mt-1 mb-2 py-3.5 bg-amber-500 text-[#0d1b4b] font-bold rounded-xl text-sm hover:bg-amber-400 transition-colors active:scale-95">
                <Sparkles className="w-4 h-4" />Create Your Stamp — Free
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className={`${isHero ? 'h-0' : 'h-[60px] sm:h-[66px]'}`} />
    </>
  )
}
