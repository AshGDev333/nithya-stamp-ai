export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#0d1b4b] py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-blue-200/70 text-sm">Last updated: January 2025 · Nithya Stamp AI, Alangulam</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-10 space-y-8 text-slate-600 text-sm leading-relaxed">

          <section>
            <h2 className="font-display text-xl font-bold text-[#0d1b4b] mb-3">1. Information We Collect</h2>
            <p>When you use Nithya Stamp AI, we collect the following information to process your stamp order:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><strong>Personal details:</strong> Your full name, email address, and mobile phone number</li>
              <li><strong>Delivery address:</strong> Street address, city, state, and PIN code</li>
              <li><strong>Stamp content:</strong> Company name, address, phone number, and other text you enter for your stamp design</li>
              <li><strong>Payment information:</strong> Processed securely via Razorpay; we do not store card details</li>
              <li><strong>Device data:</strong> Browser type and IP address for security purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-[#0d1b4b] mb-3">2. How We Use Your Information</h2>
            <p>Your information is used exclusively to:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Design and manufacture your custom rubber stamp</li>
              <li>Process your payment and generate order confirmation</li>
              <li>Ship your stamp to your delivery address</li>
              <li>Send you order status updates via email</li>
              <li>Resolve any customer service queries or disputes</li>
            </ul>
            <p className="mt-3 text-slate-500">We do <strong>not</strong> sell, rent, or share your personal information with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-[#0d1b4b] mb-3">3. Data Storage & Security</h2>
            <p>Your data is stored securely on our servers. We use industry-standard SSL encryption for all data transmitted through our website. Stamp designs (SVG files) are stored and sent to our production team for manufacturing, then archived securely.</p>
            <p className="mt-3">Payment transactions are handled entirely by Razorpay, a PCI-DSS compliant payment gateway. We never store your credit or debit card information.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-[#0d1b4b] mb-3">4. Cookies</h2>
            <p>Our website uses minimal cookies to:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Remember your cart items during your session</li>
              <li>Keep you logged in to your order tracking session</li>
            </ul>
            <p className="mt-3">You may disable cookies in your browser settings, though this may affect cart functionality.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-[#0d1b4b] mb-3">5. AI Design Generation</h2>
            <p>The text you enter to design your stamp is sent to an AI service (Anthropic Claude API) to generate stamp designs. This data is processed securely and is not used to train AI models. We do not share your business details with any other parties.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-[#0d1b4b] mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Request access to the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (subject to legal requirements)</li>
              <li>Withdraw consent for non-essential data processing</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-[#0d1b4b] mb-3">7. Data Retention</h2>
            <p>We retain order records for 3 years for business and tax compliance purposes. After this period, personal data is anonymised or deleted. Stamp design SVG files are retained for 1 year in case of reorder requests.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-[#0d1b4b] mb-3">8. Contact Us</h2>
            <p>For any privacy concerns or data requests, please contact:</p>
            <div className="mt-3 bg-slate-50 rounded-2xl p-4 space-y-1">
              <p className="font-semibold text-[#0d1b4b]">Nithya Stamp AI — Nithya Press</p>
              <p>📧 nithyapress92@gmail.com</p>
              <p>📞 +91 95788 20558</p>
              <p>📍 Alangulam, Tenkasi, Tamil Nadu, India</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
