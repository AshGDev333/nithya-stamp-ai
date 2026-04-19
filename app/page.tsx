'use client'
import Link from 'next/link'
import {
  Sparkles, Zap, Shield, Truck,
  CheckCircle, ArrowRight, Star, Clock,
} from 'lucide-react'

const FEATURES = [
  { icon: Sparkles, title: 'AI-Powered Design', desc: 'Claude AI generates professional designs from your business details instantly',               color: 'bg-violet-500', light: 'bg-violet-50' },
  { icon: Zap,      title: 'Instant Preview',   desc: 'See 3 different stamp styles before ordering — pick the perfect one',                        color: 'bg-amber-500',  light: 'bg-amber-50'  },
  { icon: Shield,   title: 'Print-Quality SVG', desc: 'Vector files sent to admin — laser-engraved at any resolution for perfect results',           color: 'bg-emerald-500',light: 'bg-emerald-50'},
  { icon: Truck,    title: 'Fast Delivery',      desc: 'Delivered to your doorstep within 3–5 business days across India',                           color: 'bg-blue-500',   light: 'bg-blue-50'   },
]

const STEPS = [
  { num: '01', icon: '📝', title: 'Describe Your Stamp',  desc: 'Enter company name, address, phone, pick color & style'              },
  { num: '02', icon: '🤖', title: 'AI Creates 3 Designs', desc: 'Claude AI generates professional stamp designs instantly'            },
  { num: '03', icon: '✅', title: 'Choose & Pay',          desc: 'Select your favourite design, checkout securely via Razorpay'       },
  { num: '04', icon: '📦', title: 'Delivered to You',     desc: 'Nithya Press prints & ships — you get a delivery email confirmation' },
]

const STAMP_TYPES = [
  { emoji: '🏢', label: 'Address Stamps',  sub: 'Company + address + phone' },
  { emoji: '⭐', label: 'Premium Header',  sub: 'Bold filled-header design'  },
  { emoji: '🔵', label: 'Circle Seals',    sub: 'Traditional round seals'    },
  { emoji: '🖼',  label: 'Logo Stamps',    sub: 'Logo + business details'    },
  { emoji: '✍️', label: 'Proprietor',      sub: 'Signature / authorised'     },
  { emoji: '👨‍⚕️',label: 'Professional',  sub: 'Doctors, advocates, etc.'   },
]

const REVIEWS = [
  { name: 'Ravi Kumar',   place: 'Chennai',    text: 'The AI stamp design was perfect for my shop. Received in 4 days!',            stars: 5 },
  { name: 'Priya S.',     place: 'Coimbatore', text: 'Amazing quality. The round seal looks exactly like what I wanted.',            stars: 5 },
  { name: 'Mohammed Ali', place: 'Madurai',    text: 'Very easy to use. My doctor stamp came out professional and clean.',           stars: 5 },
]

export default function Home() {
  return (
    <div className="animate-fade-in">

      {/* ── HERO ── */}
      <section className="relative bg-hero overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage:'linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)', backgroundSize:'60px 60px' }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="container-app relative py-16 sm:py-20 lg:py-28 xl:py-36">

          {/* Hero logo block */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1e3a8a] flex items-center justify-center shadow-2xl flex-shrink-0 overflow-hidden">
                <img
                  src="/horse-logo-BGR.png"
                  alt="logo"
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                />
              </div>
              <div className="text-left">
                <div className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                  Nithya <span className="text-blue-300">Stamp</span>
                  <span className="text-amber-400"> AI</span>
                </div>
                <div className="text-blue-200/60 text-xs mt-0.5">by Nithya Press, Alangulam</div>
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-white/90 text-xs sm:text-sm font-medium">
                AI-Powered Stamp Generator · Alangulam, Tamil Nadu
              </span>
            </div>
          </div>

          <h1 className="font-display text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] mb-5 sm:mb-6">
            Custom Stamps<br className="hidden sm:block" />
            <span className="text-amber-400"> Designed by AI</span>
          </h1>
          <p className="text-center text-blue-200/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4">
            Enter your business details — AI generates 3 professional stamp designs in seconds.
            Order and receive at home in 3–5 days.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link href="/design"
              className="inline-flex items-center justify-center gap-2.5 bg-amber-500 text-[#0d1b4b] font-bold px-7 py-4 rounded-2xl hover:bg-amber-400 transition-all hover:scale-105 text-base shadow-lg shadow-amber-500/25 active:scale-95">
              <Sparkles className="w-5 h-5" />Create Your Stamp — Free<ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/orders"
              className="inline-flex items-center justify-center gap-2.5 bg-white/10 border border-white/25 text-white font-semibold px-7 py-4 rounded-2xl hover:bg-white/20 transition-all text-base active:scale-95">
              <Clock className="w-4 h-4" />Track My Order
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-14 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto px-4">
            {[
              { v: '10K+', l: 'Stamps Delivered' },
              { v: '4.9★', l: 'Customer Rating'  },
              { v: '3–5d', l: 'Fast Delivery'    },
              { v: '100%', l: 'Print-Ready SVG'  },
            ].map(s => (
              <div key={s.l} className="bg-white/8 border border-white/12 rounded-2xl p-4 text-center backdrop-blur-sm">
                <div className="font-display text-xl sm:text-2xl font-bold text-amber-400">{s.v}</div>
                <div className="text-blue-200/60 text-xs mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT STRIP ── */}
      <section className="bg-[#0d1b4b] py-4 border-t border-white/10">
        <div className="container-app">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-blue-200/70">
            <a href="mailto:nithyapress92@gmail.com" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
              <span>📧</span> nithyapress92@gmail.com
            </a>
            <a href="tel:+919578820558" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
              <span>📞</span> +91 95788 20558
            </a>
            <span className="flex items-center gap-2"><span>📍</span> Alangulam, Tenkasi, Tamil Nadu</span>
          </div>
        </div>
      </section>

      {/* ── STAMP TYPES ── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="container-app">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0d1b4b] mb-2">6 Stamp Styles</h2>
            <p className="text-slate-500 text-base sm:text-lg">AI designs all types — exactly like real Indian stamps</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {STAMP_TYPES.map((t, i) => (
              <Link href="/design" key={i}
                className="card-lift group bg-slate-50 hover:bg-[#0d1b4b] border border-slate-100 rounded-2xl p-4 sm:p-5 text-center transition-all duration-200">
                <div className="text-2xl sm:text-3xl mb-2.5">{t.emoji}</div>
                <div className="font-semibold text-[#0d1b4b] group-hover:text-white text-sm transition-colors">{t.label}</div>
                <div className="text-slate-400 group-hover:text-blue-200 text-xs mt-1 transition-colors">{t.sub}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-14 sm:py-20 bg-section-alt">
        <div className="container-app">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0d1b4b] mb-2">Why Nithya Stamp AI?</h2>
            <p className="text-slate-500 text-base sm:text-lg">Professional rubber stamps without visiting a shop</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className={`card-lift ${f.light} border border-white rounded-2xl p-6 sm:p-7`}>
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center text-white mb-5`}>
                  <f.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-semibold text-[#0d1b4b] text-base mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="container-app">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0d1b4b] mb-2">How It Works</h2>
            <p className="text-slate-500 text-base sm:text-lg">Order your stamp in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
            {STEPS.map((step, i) => (
              <div key={i} className="relative text-center group">
                <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[#0d1b4b] rounded-2xl text-3xl sm:text-4xl mx-auto mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {step.icon}
                  <span className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 bg-amber-500 text-[#0d1b4b] text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-semibold text-[#0d1b4b] text-base mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 sm:top-10 left-[62%] w-[38%] h-px bg-gradient-to-r from-[#0d1b4b]/20 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="py-14 sm:py-20 bg-section-alt">
        <div className="container-app">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0d1b4b] mb-2">Customer Reviews</h2>
            <p className="text-slate-500">Trusted by businesses across Tamil Nadu</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-4xl mx-auto">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex gap-0.5 mb-3">
                  {Array(r.stars).fill(0).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">"{r.text}"</p>
                <div className="font-semibold text-[#0d1b4b] text-sm">{r.name}</div>
                <div className="text-slate-400 text-xs">{r.place}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24 bg-hero">
        <div className="container-app text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#1e3a8a] flex items-center justify-center shadow-xl overflow-hidden">
              <img src="/horse-logo-BGR.png" alt="logo" className="w-14 h-14 object-contain" />
            </div>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Order Your Stamp?
          </h2>
          <p className="text-blue-200/80 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Describe your business — AI designs your stamp in seconds. Pay online, get delivered home by Nithya Press.
          </p>
          <Link href="/design"
            className="inline-flex items-center gap-3 bg-amber-500 text-[#0d1b4b] font-bold px-8 sm:px-10 py-4 sm:py-5 rounded-2xl hover:bg-amber-400 transition-all hover:scale-105 text-base sm:text-lg shadow-xl shadow-amber-500/25 active:scale-95">
            <Sparkles className="w-5 h-5" />Start Designing Now<ArrowRight className="w-5 h-5" />
          </Link>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-blue-200/60">
            {['No design skills needed', 'AI generates 3 options', 'Razorpay secure payment', 'Delivered by Nithya Press'].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />{t}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
