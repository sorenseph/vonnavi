// Edge Function: envía correo al cliente y al admin
// Configurar: supabase secrets set RESEND_API_KEY=re_xxx
// supabase secrets set FROM_EMAIL="Von Navi <noreply@vonnavi.com.mx>"
// supabase secrets set SITE_URL="https://vonnavi.com.mx" (opcional, para logo)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Von Navi <noreply@vonnavi.com.mx>'
const SITE_URL = Deno.env.get('SITE_URL') || 'https://vonnavi.com.mx'
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'israelcardenas6@gmail.com'
const VONNAVI_PHONE = '(+52) 55 3550 1265'
const VONNAVI_WHATSAPP = 'https://wa.me/5215535501265'

interface QuotePayload {
  folio: string
  nombre: string
  email: string
  telefono?: string
  fecha_vuelo?: string
  num_adultos?: number
  num_ninos?: number
  num_pasajeros: number
  paquete_nombre?: string
  admin_email?: string
  servicios_extra?: string[]
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

function buildEmailHtml(payload: QuotePayload, isAdmin: boolean): string {
  const logo = `${SITE_URL}/logo.svg`
  const header = `
    <div style="text-align:center; padding:20px 0; border-bottom:1px solid #e5e7eb;">
      <img src="${logo}" alt="Von Navi" style="max-height:60px; width:auto;" onerror="this.style.display='none'" />
      <p style="margin:8px 0 0; font-size:1.2rem; font-weight:600; color:#0d3b66;">Von Navi</p>
      <p style="margin:4px 0; font-size:0.9rem; color:#64748b;">${VONNAVI_PHONE} · <a href="${VONNAVI_WHATSAPP}">WhatsApp</a></p>
    </div>
  `
  const saludo = isAdmin
    ? `<p>Nueva solicitud de cotización recibida:</p>`
    : `<p>Hola <strong>${payload.nombre}</strong>,</p><p>Gracias por tu interés en volar en globo sobre Teotihuacán.</p><p>Hemos recibido tu solicitud con los siguientes datos:</p>`
  const datos = `
    <ul style="line-height:1.8; padding-left:20px;">
      <li><strong>Fecha preferida:</strong> ${payload.fecha_vuelo || 'No especificada'}</li>
      <li><strong>Adultos:</strong> ${payload.num_adultos ?? payload.num_pasajeros}</li>
      <li><strong>Niños:</strong> ${payload.num_ninos ?? 0}</li>
      <li><strong>Paquete:</strong> ${payload.paquete_nombre || 'No especificado'}</li>
      ${payload.telefono ? `<li><strong>Teléfono:</strong> ${payload.telefono}</li>` : ''}
      ${isAdmin && payload.email ? `<li><strong>Email:</strong> ${payload.email}</li>` : ''}
    </ul>
  `
  const cierre = isAdmin
    ? `<p>Revisa el panel de administración para contactar al cliente.</p>`
    : `
    <p>Nuestro equipo revisará disponibilidad y te contactará en breve para confirmar tu vuelo.</p>
    <p>Si tienes dudas puedes responder este correo o escribirnos por <a href="${VONNAVI_WHATSAPP}">WhatsApp</a>.</p>
    <p>Saludos,<br /><strong>Equipo de reservas Von Navi</strong></p>
  `
  return `
    <div style="font-family:sans-serif; max-width:600px; margin:0 auto;">
      ${header}
      <div style="padding:24px;">
        ${saludo}
        ${datos}
        ${cierre}
      </div>
    </div>
  `
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    console.error('Resend error:', errText)
    return { ok: false, error: errText }
  }
  return { ok: true }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }
  try {
    const payload: QuotePayload = await req.json()
    if (!payload.email || !payload.nombre) {
      return json({ error: 'Faltan campos requeridos' }, 400)
    }
    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY no configurado')
      return json({ ok: true, skipped: 'no_api_key' })
    }

    const subjectCliente = 'Tu cotización de vuelo en globo en Teotihuacán 🎈'
    const subjectAdmin = `Nueva cotización: ${payload.nombre} - ${payload.folio || ''}`

    const [clienteRes, adminRes] = await Promise.all([
      sendEmail(payload.email, subjectCliente, buildEmailHtml(payload, false)),
      sendEmail(payload.admin_email || ADMIN_EMAIL, subjectAdmin, buildEmailHtml(payload, true)),
    ])

    return json({
      ok: true,
      cliente: clienteRes.ok,
      admin: adminRes.ok,
      ...(clienteRes.error && { clienteError: clienteRes.error }),
      ...(adminRes.error && { adminError: adminRes.error }),
    })
  } catch (e) {
    console.error(e)
    return json({ error: 'Error interno' }, 500)
  }
})
