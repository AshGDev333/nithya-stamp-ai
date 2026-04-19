import nodemailer from 'nodemailer'
import { getAdminEmail } from './db'

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

export async function sendAdminOrderNotification(order: {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  customerState: string
  customerPincode: string
  stampSvg: string
  stampShape: string
  stampSize: number
  stampColor: string
  stampRequirements: string
  quantity: number
  total: number
  createdAt: string
}) {
  const adminEmail = await getAdminEmail()
  if (!adminEmail) return

  const requirements = (() => {
    try { return JSON.parse(order.stampRequirements) } catch { return {} }
  })()

  // Convert SVG to high-quality PNG-ready format (embed in HTML for print)
  const stampHtml = `
    <div style="display:inline-block; padding:20px; background:#fff; border:2px solid #ccc;">
      ${order.stampSvg}
    </div>
  `

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Georgia', serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0a0f2e 0%, #1a3a6b 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; letter-spacing: 2px; }
    .header p { margin: 8px 0 0; opacity: 0.8; font-size: 14px; }
    .badge { display: inline-block; background: #f59e0b; color: #0a0f2e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 10px; }
    .section { padding: 24px 30px; border-bottom: 1px solid #eee; }
    .section h2 { color: #1a3a6b; font-size: 16px; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #f59e0b; padding-bottom: 8px; display: inline-block; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field { background: #f8f9fa; padding: 10px 14px; border-radius: 8px; border-left: 3px solid #1a3a6b; }
    .field label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px; }
    .field span { font-size: 15px; color: #1a1a2e; font-weight: 600; }
    .stamp-section { padding: 24px 30px; text-align: center; background: #f0f4ff; }
    .stamp-section h2 { color: #1a3a6b; font-size: 16px; margin: 0 0 20px; text-transform: uppercase; letter-spacing: 1px; }
    .stamp-container { display: inline-block; padding: 30px; background: white; border: 2px dashed #1a3a6b; border-radius: 12px; }
    .print-note { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin-top: 16px; color: #92400e; font-size: 13px; }
    .footer { background: #1a1a2e; color: #888; padding: 20px 30px; text-align: center; font-size: 12px; }
    .total { font-size: 22px; color: #1a3a6b; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🖊 NEW STAMP ORDER</h1>
      <p>A new order has been placed and requires printing</p>
      <span class="badge">ORDER #${order.id.slice(0, 8).toUpperCase()}</span>
    </div>
    
    <div class="section">
      <h2>Customer Details</h2>
      <div class="grid">
        <div class="field">
          <label>Name</label>
          <span>${order.customerName}</span>
        </div>
        <div class="field">
          <label>Phone</label>
          <span>${order.customerPhone}</span>
        </div>
        <div class="field" style="grid-column: 1/-1;">
          <label>Email</label>
          <span>${order.customerEmail}</span>
        </div>
        <div class="field" style="grid-column: 1/-1;">
          <label>Delivery Address</label>
          <span>${order.customerAddress}, ${order.customerCity}, ${order.customerState} - ${order.customerPincode}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Stamp Specifications</h2>
      <div class="grid">
        <div class="field">
          <label>Shape</label>
          <span>${order.stampShape.toUpperCase()}</span>
        </div>
        <div class="field">
          <label>Size</label>
          <span>${order.stampSize}mm</span>
        </div>
        <div class="field">
          <label>Ink Color</label>
          <span>${order.stampColor.toUpperCase()}</span>
        </div>
        <div class="field">
          <label>Quantity</label>
          <span>${order.quantity} piece(s)</span>
        </div>
        <div class="field">
          <label>Company Name</label>
          <span>${requirements.companyName || 'N/A'}</span>
        </div>
        <div class="field">
          <label>Total Amount</label>
          <span class="total">₹${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="stamp-section">
      <h2>🖨 High-Quality Stamp Design (For Printing)</h2>
      <div class="stamp-container">
        ${order.stampSvg}
      </div>
      <div class="print-note">
        ⚠️ <strong>Print Instructions:</strong> The SVG stamp design above is print-ready at any resolution. 
        Use for laser engraving or rubber stamp production. Minimum print size: ${order.stampSize}mm.
      </div>
    </div>

    <div class="section">
      <h2>Order Summary</h2>
      <div class="grid">
        <div class="field">
          <label>Order ID</label>
          <span>${order.id}</span>
        </div>
        <div class="field">
          <label>Order Date</label>
          <span>${new Date(order.createdAt || Date.now()).toLocaleString('en-IN')}</span>
        </div>
        <div class="field">
          <label>Status</label>
          <span style="color: #f59e0b;">⏳ PENDING PRODUCTION</span>
        </div>
        <div class="field">
          <label>Amount</label>
          <span style="color: #16a34a; font-size: 18px;">₹${order.total.toFixed(2)} ✅ PAID</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Nithya Stamp AI Admin System | Please process this order promptly</p>
      <p>Login to admin panel to update order status: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin" style="color: #f59e0b;">${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin</a></p>
    </div>
  </div>
</body>
</html>
  `

  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"Nithya Stamp AI System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🖊 New Stamp Order #${order.id.slice(0, 8).toUpperCase()} - ${order.customerName} - ₹${order.total.toFixed(2)}`,
    html,
    attachments: [
      {
        filename: `stamp-${order.id.slice(0, 8)}.svg`,
        content: order.stampSvg,
        contentType: 'image/svg+xml',
      }
    ]
  })
}

export async function sendDeliveryConfirmationEmail(order: {
  id: string
  customerName: string
  customerEmail: string
  stampSvg: string
  stampShape: string
  stampSize: number
  stampColor: string
  quantity: number
  total: number
  customerAddress: string
  customerCity: string
  customerState: string
  customerPincode: string
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Georgia', serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 40px 30px; text-align: center; }
    .header .emoji { font-size: 48px; display: block; margin-bottom: 12px; }
    .header h1 { margin: 0; font-size: 26px; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 15px; }
    .body { padding: 30px; }
    .greeting { font-size: 18px; color: #1a1a2e; margin-bottom: 16px; }
    .message { color: #444; line-height: 1.7; margin-bottom: 24px; }
    .order-card { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .order-card h3 { color: #1a3a6b; margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e0f2fe; font-size: 14px; }
    .detail-row:last-child { border: none; font-weight: bold; color: #1a3a6b; }
    .detail-row .label { color: #555; }
    .stamp-preview { text-align: center; margin: 24px 0; padding: 20px; background: #fafafa; border-radius: 12px; border: 2px dashed #ddd; }
    .stamp-preview p { font-size: 12px; color: #888; margin-top: 12px; }
    .cta-button { display: block; background: linear-gradient(135deg, #1a3a6b, #1a55ff); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; text-align: center; font-size: 15px; font-weight: bold; margin: 20px 0; }
    .footer { background: #1a1a2e; color: #888; padding: 20px 30px; text-align: center; font-size: 12px; }
    .stars { color: #f59e0b; font-size: 20px; letter-spacing: 2px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="emoji">📦✅</span>
      <h1>Your Stamp Has Been Delivered!</h1>
      <p>Order #${order.id.slice(0, 8).toUpperCase()} — Delivered Successfully</p>
    </div>
    
    <div class="body">
      <div class="greeting">Dear ${order.customerName},</div>
      
      <div class="message">
        Great news! Your custom stamp order has been delivered to your address. 
        We hope you love your new stamp! 🎉<br><br>
        If you haven't received your package yet, please allow a few hours for the courier 
        to complete delivery, or contact us immediately.
      </div>

      <div class="order-card">
        <h3>Order Details</h3>
        <div class="detail-row">
          <span class="label">Order ID</span>
          <span>#${order.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <div class="detail-row">
          <span class="label">Stamp Type</span>
          <span>${order.stampShape} • ${order.stampSize}mm • ${order.stampColor} ink</span>
        </div>
        <div class="detail-row">
          <span class="label">Quantity</span>
          <span>${order.quantity} piece(s)</span>
        </div>
        <div class="detail-row">
          <span class="label">Delivered To</span>
          <span>${order.customerAddress}, ${order.customerCity}</span>
        </div>
        <div class="detail-row">
          <span class="label">Total Paid</span>
          <span>₹${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div class="stamp-preview">
        <p style="font-size: 13px; color: #666; margin-bottom: 16px; font-weight: bold;">Your Stamp Design</p>
        ${order.stampSvg}
        <p>Your beautiful custom stamp — crafted with precision</p>
      </div>

      <div class="message">
        <strong>How to care for your stamp:</strong><br>
        • Store in a cool, dry place away from direct sunlight<br>
        • Clean with a damp cloth after use<br>
        • Keep cap on when not in use<br>
        • Refill ink when impression becomes faint
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <div class="stars">★★★★★</div>
        <p style="color: #666; font-size: 14px; margin-top: 8px;">Happy with your order? Leave us a review!</p>
      </div>

      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders" class="cta-button">
        View All My Orders →
      </a>
    </div>

    <div class="footer">
      <p>Thank you for choosing <strong>Nithya Stamp AI</strong> 🖊</p>
      <p>Questions? Email us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #f59e0b;">${process.env.EMAIL_USER || 'support@stampai.com'}</a></p>
    </div>
  </div>
</body>
</html>
  `

  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"Nithya Stamp AI" <${process.env.EMAIL_USER}>`,
    to: order.customerEmail,
    subject: `📦 Your Stamp Has Been Delivered! Order #${order.id.slice(0, 8).toUpperCase()}`,
    html,
  })
}

export async function sendOrderConfirmationEmail(order: {
  id: string
  customerName: string
  customerEmail: string
  total: number
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0a0f2e, #1a3a6b); color: white; padding: 30px; text-align: center; }
    .body { padding: 30px; color: #333; line-height: 1.7; }
    .footer { background: #1a1a2e; color: #888; padding: 20px; text-align: center; font-size: 12px; }
    .highlight { background: #f0f4ff; border-left: 4px solid #1a3a6b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0">✅ Order Confirmed!</h1>
      <p style="margin:8px 0 0; opacity:0.8">Order #${order.id.slice(0, 8).toUpperCase()}</p>
    </div>
    <div class="body">
      <p>Dear ${order.customerName},</p>
      <p>Thank you for your order! We've received your payment and our team will begin production shortly.</p>
      <div class="highlight">
        <strong>Order ID:</strong> #${order.id.slice(0, 8).toUpperCase()}<br>
        <strong>Amount Paid:</strong> ₹${order.total.toFixed(2)}<br>
        <strong>Expected Delivery:</strong> 3-5 business days
      </div>
      <p>You will receive another email when your stamp is delivered. You can track your order at any time using your email address.</p>
      <p>Best regards,<br><strong>The Nithya Stamp AI Team</strong></p>
    </div>
    <div class="footer">Nithya Stamp AI — Premium Custom Stamps</div>
  </div>
</body>
</html>
  `

  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"Nithya Stamp AI" <${process.env.EMAIL_USER}>`,
    to: order.customerEmail,
    subject: `✅ Order Confirmed #${order.id.slice(0, 8).toUpperCase()} — Nithya Stamp AI`,
    html,
  })
}
