import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-[#070e2e] text-white">
      <div className="container-app py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

          {/* ── Brand ── */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#1e3a8a]">
                <img
                  src="/horse-logo-BGR.png"
                  alt="logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="font-display text-xl font-bold">
                Nithya <span className="text-blue-400">Stamp</span>
                <span className="text-amber-400"> AI</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-5">
              Tamil Nadu's AI-powered custom stamp platform. From design to your doorstep
              in 3–5 business days. Trusted by businesses, doctors, lawyers, and offices
              across Tamil Nadu.
            </p>
            <div className="space-y-2.5">
              {[
                { icon: Mail,   text: 'nithyapress92@gmail.com',    href: 'mailto:nithyapress92@gmail.com' },
                { icon: Phone,  text: '+91 95788 20558',             href: 'tel:+919578820558'              },
                { icon: MapPin, text: 'Alangulam, Tenkasi, Tamil Nadu', href: null                          },
              ].map(({ icon: Icon, text, href }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <Icon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  {href
                    ? <a href={href} className="hover:text-amber-400 transition-colors">{text}</a>
                    : <span>{text}</span>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/',       label: 'Home'         },
                { href: '/design', label: 'Design Stamp' },
                { href: '/cart',   label: 'My Cart'      },
                { href: '/orders', label: 'Track Order'  },
                /* Admin link → always goes to login first for security */
                { href: '/admin',  label: 'Admin Panel'  },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href}
                    className="text-slate-400 hover:text-amber-400 text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Stamp types ── */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">
              Stamp Types
            </h4>
            <ul className="space-y-2.5">
              {[
                'Address Stamps', 'Round Seal Stamps', 'Premium Stamps',
                'Logo Stamps', 'Professional Stamps', 'Proprietor Stamps',
              ].map(s => (
                <li key={s}>
                  <Link href="/design"
                    className="text-slate-400 hover:text-amber-400 text-sm transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs">
            © {year} Nithya Stamp AI. All rights reserved. | Nithya Press, Alangulam
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            {[
              { label: 'Privacy Policy',    href: '/privacy' },
              { label: 'Terms of Service',  href: '/terms'   },
              { label: 'Refund Policy',     href: '/refund'  },
            ].map(t => (
              <Link key={t.href} href={t.href}
                className="text-slate-500 text-xs hover:text-slate-300 transition-colors">
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
