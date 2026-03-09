// Edge Function: translate-blog
// Traduce título y cuerpo del blog de español a en, fr, pt
// Usa LibreTranslate (https://libretranslate.com) - configurar API key si es necesario

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get'
const CHUNK_SIZE = 450

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type'
}

function chunkText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text]
  const chunks: string[] = []
  let remaining = text
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining)
      break
    }
    const slice = remaining.slice(0, maxLen)
    const lastSpace = slice.lastIndexOf(' ')
    const cut = lastSpace > maxLen * 0.5 ? lastSpace : maxLen
    chunks.push(remaining.slice(0, cut))
    remaining = remaining.slice(cut).trimStart()
  }
  return chunks
}

async function translateChunk(text: string, targetLang: string, sourceLang: string): Promise<string> {
  const pair = `${sourceLang}|${targetLang}`
  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=${pair}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`MyMemory ${res.status}`)
  const data = await res.json()
  const translated = data.responseData?.translatedText
  if (!translated && data.responseStatus !== 200) throw new Error(data.responseDetails || 'Translation failed')
  return translated || text
}

async function translateWithMyMemory(text: string, targetLang: string, sourceLang: string): Promise<string> {
  const chunks = chunkText(text, CHUNK_SIZE)
  const results: string[] = []
  for (let i = 0; i < chunks.length; i++) {
    results.push(await translateChunk(chunks[i], targetLang, sourceLang))
    if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 200))
  }
  return results.join(' ')
}

async function translateText(text: string, targetLang: string, sourceLang = 'es'): Promise<string> {
  if (!text?.trim()) return ''
  try {
    return await translateWithMyMemory(text, targetLang, sourceLang)
  } catch (e) {
    console.error('Translate error:', e)
    return text
  }
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  try {
    const { titulo, cuerpo } = (await req.json()) || {}
    if (!titulo && !cuerpo) {
      return new Response(JSON.stringify({ error: 'Faltan titulo o cuerpo' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }
    const [en, fr, pt] = await Promise.all([
      Promise.all([
        translateText(titulo || '', 'en'),
        translateText(cuerpo || '', 'en')
      ]),
      Promise.all([
        translateText(titulo || '', 'fr'),
        translateText(cuerpo || '', 'fr')
      ]),
      Promise.all([
        translateText(titulo || '', 'pt'),
        translateText(cuerpo || '', 'pt')
      ])
    ])
    return new Response(JSON.stringify({
      en: { titulo: en[0], cuerpo: en[1] },
      fr: { titulo: fr[0], cuerpo: fr[1] },
      pt: { titulo: pt[0], cuerpo: pt[1] }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
})
