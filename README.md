# 🐎 Nithya Stamp AI — v2.0

**AI-powered custom rubber stamp designer & ordering platform**
Built for: **Nithya Press, Alangulam, Tenkasi, Tamil Nadu**

---

## 📬 Business Contact
- **Email:** nithyapress92@gmail.com
- **Phone:** +91 95788 20558
- **Address:** Alangulam, Tenkasi, Tamil Nadu

---

## ✅ What's New in v2.0

| Feature | Details |
|---|---|
| 🐎 New Logo & Branding | Blue horse logo (gradient blue→purple), "Nithya Stamp AI" name throughout |
| 📬 Contact Info | All pages show nithyapress92@gmail.com / 95788 20558 / Alangulam |
| ⚙️ Admin Price Settings | `/admin/settings` → change price per stamp size (rectangle + round) |
| 📧 Admin Email Settings | Change order notification email from admin panel |
| 🔒 Privacy Policy | `/privacy` — full privacy policy page |
| 📜 Terms of Service | `/terms` — complete terms of service |
| 💸 Refund Policy | `/refund` — detailed refund & cancellation policy |
| 🔗 Footer Policy Links | All 3 policy pages linked in footer |

---

## 🚀 Quick Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment (.env.local)
```env
ANTHROPIC_API_KEY=your_claude_api_key
EMAIL_USER=nithyapress92@gmail.com
EMAIL_PASS=your_gmail_app_password
ADMIN_EMAIL=nithyapress92@gmail.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 3. Run development server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
npm start
```

---

## 🔑 Admin Panel

- **Login:** `/admin`
- **Orders:** `/admin/orders`
- **Settings:** `/admin/settings`
  - **Prices Tab:** Set custom price for each of the 9 stamp sizes
  - **Email Tab:** Change admin notification email

---

## 📄 Pages

| URL | Description |
|---|---|
| `/` | Home page with hero, features, reviews |
| `/design` | AI stamp design form |
| `/cart` | Shopping cart |
| `/checkout` | Payment checkout (Razorpay) |
| `/orders` | Order tracking |
| `/admin` | Admin login |
| `/admin/orders` | Admin orders management |
| `/admin/settings` | Prices & email settings |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Service |
| `/refund` | Refund Policy |

---

## 🏷️ Stamp Sizes & Default Prices

### Rectangle / Address Stamps
| Size | Dimensions | Price |
|---|---|---|
| Pocket | 60×20mm | ₹199 |
| Standard | 63×23mm | ₹249 |
| Medium | 52×33mm | ₹299 |
| Large | 67×32mm | ₹349 |
| Massive | 80×50mm | ₹499 |

### Round / Circle Seals
| Size | Dimensions | Price |
|---|---|---|
| Round Pocket | Ø30mm | ₹249 |
| Round Std | Ø30mm | ₹299 |
| Round Medium | Ø40mm | ₹399 |
| Round Large | Ø40mm | ₹449 |

> All prices editable from Admin Settings → Stamp Pricing

---

## 📧 Gmail App Password Setup
1. Go to Google Account → Security → 2-Step Verification → App Passwords
2. Create app password for "Mail"
3. Paste into `EMAIL_PASS` in `.env.local`

