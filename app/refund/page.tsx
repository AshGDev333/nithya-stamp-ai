export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#0d1b4b] py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-4xl mb-4">💸</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">Refund Policy</h1>
          <p className="text-blue-200/70 text-sm">Last updated: January 2025 · Nithya Stamp AI, Alangulam</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-10 space-y-8 text-slate-600 text-sm leading-relaxed">

          {/* Quick summary */}
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: '✅', title: 'Eligible', desc: 'Wrong design printed, damaged item, or non-delivery' },
              { icon: '⏱️', title: '7-Day Window', desc: 'Raise a refund request within 7 days of delivery' },
              { icon: '💳', title: '5–7 Business Days', desc: 'Refunds processed back to original payment method' },
            ].map((c, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                <div className="text-2xl mb-2">{c.icon}</div>
                <p className="font-semibold text-[#0d1b4b] text-sm">{c.title}</p>
                <p className="text-xs text-slate-500 mt-1">{c.desc}</p>
              </div>
            ))}
          </div>

          <section>
            <h2 className="font-display text-xl font-bold text-[#0d1b4b] mb-3">1. Our Refund Commitment</h2>
            <p>At Nithya Stamp AI, we take pride in the quality of every stamp we produce. Since each stamp is a custom-made physical product manufactured to your specifications, our refund policy is designed to be fair to both parties while ensuring you receive exactly what you ordered.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-[#0d1b4b] mb-3">2. Eligible Refund Cases</h2>
            <p className="mb-3">You are entitled to a full refund or free replacement in the following cases:</p>
            <div className="space-y-3">
              {[
                { icon: '🖨️', title: 'Manufacturing Error', desc: 'The stamp was printed incorrectly — different text, shape, or size from what you ordered.' },
                { icon: '📦', title: 'Damaged in Transit', desc: 'The stamp arrived physically damaged or broken due to shipping.' },
                { icon: '🚫', title: 'Non-Delivery', desc: 'You did not receive your order within 15 business days of the confirmed dispatch date.' },
                { icon: '🔄', title: 'Wrong Item Shipped', desc: 'You received a completely different product from what you ordered.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-emerald-800 text-sm">{item.title}</p>
                    <p className="text-emerald-700 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-[#0d1b4b] mb-3">3. Non-Refundable Cases</h2>
            <p className="mb-3">Refunds are <strong>not applicable</strong> in the following situations:</p>
            <div className="space-y-3">
              {[
                { icon: '❌', title: 'Change of Mind', desc: 'You no longer want the stamp after the order is placed and production has started.' },
                { icon: '❌', title: 'Incorrect Details Provided', desc: 'You entered incorrect text, spelling, or address and the stamp was printed as per your submission.' },
                { icon: '❌', title: 'Design Preference', desc: 'You dislike the style or appearance of a stamp that matches your approved AI-generated design.' },
                { icon: '❌', title: 'Ink Refill Issues', desc: 'Running out of ink is normal wear and is not a manufacturing defect. Replacement ink pads are available separately.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-red-800 text-sm">{item.title}</p>
                    <p className="text-red-700 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-[#0d1b4b] mb-3">4. How to Request a Refund</h2>
            <div className="space-y-4">
              {[
                { num: '01', title: 'Contact Us Within 7 Days', desc: 'Email us at nithyapress92@gmail.com within 7 days of receiving your order. Include your order ID and a description of the issue.' },
                { num: '02', title: 'Send Photos', desc: 'Attach clear photos of the received stamp showing the defect or damage. This helps us process your request faster.' },
                { num: '03', title: 'Review & Decision', desc: 'Our team will review your request within 2 business days and confirm whether a refund or replacement is approved.' },
                { num: '04', title: 'Refund or Replacement', desc: 'If approved, your refund will be processed within 5–7 business days to your original payment method. Or we will ship a replacement at no charge.' },
              ].map((step, i) => (
                <div key={i} className="flex gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                  <div className="w-8 h-8 bg-[#0d1b4b] rounded-xl flex items-center justify-center flex-shrink-0 text-amber-400 font-bold text-xs">{step.num}</div>
                  <div>
                    <p className="font-semibold text-[#0d1b4b] text-sm">{step.title}</p>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-[#0d1b4b] mb-3">5. Cancellation Policy</h2>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚡</span>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">Within 2 Hours of Order</p>
                  <p className="text-amber-700 text-xs mt-0.5">Full refund available. Contact us immediately before production begins.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">🖨️</span>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">After Production Started</p>
                  <p className="text-amber-700 text-xs mt-0.5">Cancellations are not possible once your stamp enters the manufacturing stage.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-[#0d1b4b] mb-3">6. Refund Timeline</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-4 py-3 font-semibold text-[#0d1b4b] border border-slate-100">Payment Method</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#0d1b4b] border border-slate-100">Refund Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['UPI / GPay / PhonePe', '2–3 business days'],
                    ['Credit / Debit Card', '5–7 business days'],
                    ['Net Banking', '3–5 business days'],
                    ['Wallets (Paytm etc.)', '1–3 business days'],
                  ].map(([method, time], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-4 py-3 border border-slate-100 text-slate-600">{method}</td>
                      <td className="px-4 py-3 border border-slate-100 text-slate-600 font-medium">{time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-[#0d1b4b] mb-3">7. Contact for Refunds</h2>
            <div className="bg-slate-50 rounded-2xl p-5 space-y-2">
              <p className="font-semibold text-[#0d1b4b]">Nithya Stamp AI — Nithya Press</p>
              <p>📧 <a href="mailto:nithyapress92@gmail.com" className="text-blue-600 hover:underline">nithyapress92@gmail.com</a></p>
              <p>📞 <a href="tel:+919578820558" className="text-blue-600 hover:underline">+91 95788 20558</a></p>
              <p>📍 Alangulam, Tenkasi, Tamil Nadu, India</p>
              <p className="text-xs text-slate-400 mt-2">Response time: Within 24 hours on business days (Mon–Sat)</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
