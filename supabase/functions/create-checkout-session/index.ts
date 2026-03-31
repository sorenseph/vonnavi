import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const SITE_URL = Deno.env.get('SITE_URL') || ''

type CartItem = {
  slug: string
  qty: number
  addons?: Record<string, boolean>
}

type Payload = {
  items: CartItem[]
  /** Origen real del navegador (ej. https://www.tudominio.com) para success/cancel URLs */
  client_origin?: string
  /** Base de Vite (import.meta.env.BASE_URL), ej. "/" o "/subpath/" */
  client_base?: string
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  })
}

// Fuente de verdad (por ahora): precios fijos en función.
// Si luego migras paquetes/aditamentos a DB, aquí se valida contra DB.
const PACKAGE_CATALOG: Record<string, { name: string; price_mxn: number }> = {
  basico: { name: 'Vuelos Básico', price_mxn: 2750 },
  desayuno: { name: 'Paquete Desayuno', price_mxn: 2970 },
  gold: { name: 'Paquete Gold', price_mxn: 3355 },
  plus: { name: 'Paquete Plus', price_mxn: 4290 },
}

const ADDON_CATALOG: Record<string, { name: string; price_mxn: number }> = {
  champagne: { name: 'Champagne', price_mxn: 0 },
  breakfast: { name: 'Desayuno extra', price_mxn: 0 },
  mariachi: { name: 'Mariachi', price_mxn: 0 },
  flowers: { name: 'Ramo de flores', price_mxn: 0 },
}

function toCentsMXN(price_mxn: number): number {
  // Stripe requiere enteros en la moneda (centavos)
  return Math.round((Number(price_mxn) || 0) * 100)
}

function normalizeOrigin(raw: string): string | null {
  const s = raw.trim().replace(/\/$/, '')
  if (!s || !/^https?:\/\//i.test(s)) return null
  try {
    const u = new URL(s)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return u.origin
  } catch {
    return null
  }
}

function resolvePublicOrigin(req: Request, payload: Payload): string | null {
  const fromBody = normalizeOrigin(payload.client_origin || '')
  if (fromBody) return fromBody
  const fromHeader = normalizeOrigin(req.headers.get('origin') || '')
  if (fromHeader) return fromHeader
  const fromEnv = normalizeOrigin(SITE_URL)
  if (fromEnv) return fromEnv
  return null
}

function resolvePathPrefix(payload: Payload): string {
  const b = typeof payload.client_base === 'string' ? payload.client_base.trim() : '/'
  if (!b || b === '/') return ''
  const withSlash = b.startsWith('/') ? b : `/${b}`
  return withSlash.replace(/\/$/, '') || ''
}

async function createCheckoutSession(params: URLSearchParams) {
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
  const data = await res.json()
  if (!res.ok) {
    console.error('Stripe error:', data)
    throw new Error(data?.error?.message || 'Stripe error')
  }
  return data
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }
  if (!STRIPE_SECRET_KEY) {
    return json({ error: 'STRIPE_SECRET_KEY no configurado en secretos de Supabase' }, 500)
  }

  try {
    const payload: Payload = await req.json()
    const items = Array.isArray(payload?.items) ? payload.items : []
    if (!items.length) return json({ error: 'Carrito vacío' }, 400)

    const origin = resolvePublicOrigin(req, payload)
    if (!origin) return json({ error: 'No se pudo determinar el origen del sitio (client_origin / Origin / SITE_URL)' }, 400)
    const prefix = resolvePathPrefix(payload)
    const appBase = `${origin}${prefix}`

    // Construir line items.
    // Regla: el paquete es "por persona" (qty) + cada aditamento seleccionado se cobra también por persona (qty).
    const lineItems: Array<{ name: string; unit_amount: number; quantity: number }> = []
    for (const it of items) {
      const slug = String(it.slug || '').trim()
      const qty = Math.min(20, Math.max(1, Number(it.qty) || 1))
      const pkg = PACKAGE_CATALOG[slug]
      if (!pkg) return json({ error: `Paquete inválido: ${slug}` }, 400)

      lineItems.push({
        name: pkg.name,
        unit_amount: toCentsMXN(pkg.price_mxn),
        quantity: qty,
      })

      const addons = it.addons && typeof it.addons === 'object' ? it.addons : {}
      for (const [key, enabled] of Object.entries(addons)) {
        if (!enabled) continue
        const addon = ADDON_CATALOG[key]
        if (!addon) return json({ error: `Aditamento inválido: ${key}` }, 400)
        if ((Number(addon.price_mxn) || 0) <= 0) continue
        lineItems.push({
          name: addon.name,
          unit_amount: toCentsMXN(addon.price_mxn),
          quantity: qty,
        })
      }
    }

    const params = new URLSearchParams()
    params.set('mode', 'payment')
    // Volver a checkout: mismo origen que abrió el pago (evita www vs apex y carrito “vacío” por otro localStorage)
    params.set('success_url', `${appBase}/checkout?success=1&session_id={CHECKOUT_SESSION_ID}`)
    params.set('cancel_url', `${appBase}/checkout?canceled=1`)
    params.set('currency', 'mxn')

    // Para cada line item:
    lineItems.forEach((li, idx) => {
      params.set(`line_items[${idx}][quantity]`, String(li.quantity))
      params.set(`line_items[${idx}][price_data][currency]`, 'mxn')
      params.set(`line_items[${idx}][price_data][unit_amount]`, String(li.unit_amount))
      params.set(`line_items[${idx}][price_data][product_data][name]`, li.name)
    })

    const session = await createCheckoutSession(params)
    return json({ ok: true, url: session.url, id: session.id })
  } catch (e) {
    console.error(e)
    return json({ error: 'Error creando sesión de pago' }, 500)
  }
})

