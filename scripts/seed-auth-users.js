/**
 * Script para crear usuarios de Auth en Supabase.
 * Carga .env automáticamente. Necesitas SUPABASE_SERVICE_ROLE_KEY en .env
 * Obtén la Service Role Key en: Supabase Dashboard → Settings → API
 * ⚠️ NUNCA expongas la service_role en el frontend.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Cargar .env o .env.local
const __dirname = dirname(fileURLToPath(import.meta.url))
for (const f of ['.env.local', '.env']) {
  const p = join(__dirname, '..', f)
  if (existsSync(p)) {
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
    }
    break
  }
}

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Añade a tu .env:\n  SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key\n\nObtén la key en: Supabase Dashboard → Settings → API')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

const users = [
  { email: 'admin@vonnavi.com', password: 'Admin123' },
  { email: 'ventas@vonnavi.com', password: 'Ventas123' }
]

async function main() {
  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true
    })
    if (error) {
      if (error.message?.includes('already been registered')) {
        console.log(`✓ ${u.email} ya existe`)
      } else {
        console.error(`✗ ${u.email}:`, error.message)
      }
    } else {
      console.log(`✓ Creado: ${u.email}`)
    }
  }
}

main().catch(console.error)
