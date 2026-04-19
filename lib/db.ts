/**
 * lib/db.ts — Turso / libsql edition
 *
 * Setup: https://app.turso.tech → Create DB → copy URL + Token
 * Add to Vercel env vars:
 *   TURSO_DATABASE_URL  =  libsql://your-db-name.turso.io
 *   TURSO_AUTH_TOKEN    =  your-token-here
 *
 * For local dev only:
 *   TURSO_DATABASE_URL=file:./stamp-ai.db  (no auth token needed)
 */

import { createClient, type Client } from '@libsql/client'

let _client: Client | null = null

function getClient(): Client {
  if (_client) return _client
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url) {
    throw new Error(
      'TURSO_DATABASE_URL is not set. Add it in Vercel → Settings → Environment Variables. ' +
      'Get it from https://app.turso.tech after creating a free database.'
    )
  }

  _client = createClient({ url, authToken })
  return _client
}

// ── Schema initialisation ────────────────────────────────────────────────────
// FIX: Use batch() with individual statements instead of executeMultiple()
// executeMultiple() can silently fail on Turso — batch() is reliable.

let _initialized = false

export async function ensureSchema(): Promise<void> {
  if (_initialized) return
  const db = getClient()

  // Run each DDL statement individually — safest approach for Turso
  const statements = [
    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      customer_city TEXT NOT NULL,
      customer_state TEXT NOT NULL,
      customer_pincode TEXT NOT NULL,
      stamp_svg TEXT NOT NULL,
      stamp_requirements TEXT NOT NULL,
      stamp_shape TEXT NOT NULL,
      stamp_size INTEGER NOT NULL,
      stamp_color TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_id TEXT,
      admin_notified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      created_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders(status)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_email   ON orders(customer_email)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at)`,
  ]

  await db.batch(
    statements.map(sql => ({ sql, args: [] })),
    'write'
  )

  _initialized = true
}

// ── Orders ───────────────────────────────────────────────────────────────────

export async function createOrder(order: {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  customerState: string
  customerPincode: string
  stampSvg: string
  stampRequirements: string
  stampShape: string
  stampSize: number
  stampColor: string
  quantity: number
  price: number
  total: number
  paymentId?: string
}): Promise<void> {
  await ensureSchema()
  const db = getClient()
  await db.execute({
    sql: `INSERT INTO orders (
      id, customer_name, customer_email, customer_phone,
      customer_address, customer_city, customer_state, customer_pincode,
      stamp_svg, stamp_requirements, stamp_shape, stamp_size, stamp_color,
      quantity, price, total, payment_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      order.id, order.customerName, order.customerEmail, order.customerPhone,
      order.customerAddress, order.customerCity, order.customerState, order.customerPincode,
      order.stampSvg, order.stampRequirements, order.stampShape, order.stampSize, order.stampColor,
      order.quantity, order.price, order.total, order.paymentId ?? null,
    ],
  })
}

export async function getOrderById(id: string): Promise<any | null> {
  await ensureSchema()
  const db = getClient()
  const result = await db.execute({ sql: 'SELECT * FROM orders WHERE id = ?', args: [id] })
  return result.rows[0] ?? null
}

export async function getOrdersByEmail(email: string): Promise<any[]> {
  await ensureSchema()
  const db = getClient()
  const result = await db.execute({
    sql: 'SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC',
    args: [email],
  })
  return result.rows as any[]
}

export async function getAllOrders(limit = 100, offset = 0): Promise<any[]> {
  await ensureSchema()
  const db = getClient()
  const result = await db.execute({
    sql: 'SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?',
    args: [limit, offset],
  })
  return result.rows as any[]
}

export async function getOrderStats(): Promise<{
  total: number; pending: number; processing: number
  shipped: number; delivered: number; revenue: number
}> {
  await ensureSchema()
  const db = getClient()
  const [total, pending, processing, shipped, delivered, revenue] = await Promise.all([
    db.execute('SELECT COUNT(*) as count FROM orders'),
    db.execute("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"),
    db.execute("SELECT COUNT(*) as count FROM orders WHERE status IN ('processing','printing')"),
    db.execute("SELECT COUNT(*) as count FROM orders WHERE status = 'shipped'"),
    db.execute("SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'"),
    db.execute('SELECT COALESCE(SUM(total), 0) as sum FROM orders'),
  ])
  return {
    total:      Number(total.rows[0].count),
    pending:    Number(pending.rows[0].count),
    processing: Number(processing.rows[0].count),
    shipped:    Number(shipped.rows[0].count),
    delivered:  Number(delivered.rows[0].count),
    revenue:    Number(revenue.rows[0].sum),
  }
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  await ensureSchema()
  const db = getClient()
  await db.execute({
    sql: "UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?",
    args: [status, id],
  })
}

export async function markAdminNotified(id: string): Promise<void> {
  await ensureSchema()
  const db = getClient()
  await db.execute({
    sql: "UPDATE orders SET admin_notified = 1, updated_at = datetime('now') WHERE id = ?",
    args: [id],
  })
}

export async function searchOrders(query: string): Promise<any[]> {
  await ensureSchema()
  const db = getClient()
  const q = `%${query}%`
  const result = await db.execute({
    sql: `SELECT * FROM orders
          WHERE customer_name LIKE ? OR customer_email LIKE ? OR id LIKE ?
          ORDER BY created_at DESC`,
    args: [q, q, q],
  })
  return result.rows as any[]
}

// ── Settings ─────────────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  await ensureSchema()
  const db = getClient()
  const result = await db.execute({ sql: 'SELECT value FROM settings WHERE key = ?', args: [key] })
  return (result.rows[0]?.value as string) ?? null
}

export async function setSetting(key: string, value: string): Promise<void> {
  await ensureSchema()
  const db = getClient()
  await db.execute({
    sql: `INSERT INTO settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
    args: [key, value],
  })
}

export async function deleteSetting(key: string): Promise<void> {
  await ensureSchema()
  const db = getClient()
  await db.execute({ sql: 'DELETE FROM settings WHERE key = ?', args: [key] })
}

export async function getStoredPrice(sizeKey: string): Promise<number | null> {
  const val = await getSetting(`price_${sizeKey}`)
  if (val === null) return null
  const n = parseFloat(val)
  return isNaN(n) || n <= 0 ? null : n
}

export async function getAllStoredPrices(): Promise<Record<string, number>> {
  await ensureSchema()
  const db = getClient()
  const result = await db.execute("SELECT key, value FROM settings WHERE key LIKE 'price_%'")
  const out: Record<string, number> = {}
  for (const row of result.rows) {
    const n = parseFloat(row.value as string)
    if (!isNaN(n) && n > 0) {
      out[(row.key as string).replace('price_', '')] = n
    }
  }
  return out
}

export async function getAdminEmail(): Promise<string> {
  return (await getSetting('admin_email')) || process.env.ADMIN_EMAIL || process.env.EMAIL_USER || ''
}
