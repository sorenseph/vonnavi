<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSeo } from '../composables/useSeo'
import { supabase } from '../lib/supabase'
import RichTextEditor from '@/components/RichTextEditor.vue'
import { locales } from '@/i18n'

const { t } = useI18n()
const router = useRouter()
const user = ref(null)
const posts = ref([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref(null)
const form = ref({
  titulo_es: '',
  cuerpo_es: '',
  titulo_en: '',
  cuerpo_en: '',
  titulo_fr: '',
  cuerpo_fr: '',
  titulo_pt: '',
  cuerpo_pt: '',
  imagen_url: '',
  autor: '',
  publicado: false
})

useSeo({ title: 'Blog Admin | Von Navi' })

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    router.push('/login')
    return
  }
  user.value = session.user
  await cargarPosts()
})

const blogError = ref('')
const traduciendo = ref(false)

async function cargarPosts() {
  loading.value = true
  blogError.value = ''
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, blog_post_i18n(*)')
    .order('created_at', { ascending: false })
  if (error) {
    blogError.value = 'Las tablas del blog no existen. Ejecuta el script supabase/setup-completo.sql en el SQL Editor de Supabase.'
    posts.value = []
  } else {
    posts.value = data || []
  }
  loading.value = false
}

function generateSlug(text) {
  return (text || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'post-' + Date.now()
}

function nuevo() {
  editingId.value = null
  form.value = {
    titulo_es: '',
    cuerpo_es: '',
    titulo_en: '',
    cuerpo_en: '',
    titulo_fr: '',
    cuerpo_fr: '',
    titulo_pt: '',
    cuerpo_pt: '',
    imagen_url: '',
    autor: '',
    publicado: false
  }
  showForm.value = true
}

function editar(post) {
  editingId.value = post.id
  const es = post.blog_post_i18n?.find(i => i.locale === 'es')
  const en = post.blog_post_i18n?.find(i => i.locale === 'en')
  const fr = post.blog_post_i18n?.find(i => i.locale === 'fr')
  const pt = post.blog_post_i18n?.find(i => i.locale === 'pt')
  form.value = {
    titulo_es: es?.titulo || '',
    cuerpo_es: es?.cuerpo || '',
    titulo_en: en?.titulo || '',
    cuerpo_en: en?.cuerpo || '',
    titulo_fr: fr?.titulo || '',
    cuerpo_fr: fr?.cuerpo || '',
    titulo_pt: pt?.titulo || '',
    cuerpo_pt: pt?.cuerpo || '',
    imagen_url: post.imagen_url || '',
    autor: post.autor || '',
    publicado: post.publicado || false
  }
  showForm.value = true
}

async function guardar(publicar = false) {
  const slug = generateSlug(form.value.titulo_es)
  if (!form.value.titulo_es?.trim()) {
    alert('El título en español es obligatorio.')
    return
  }
  try {
    if (editingId.value) {
      await supabase.from('blog_posts').update({
        slug,
        imagen_url: form.value.imagen_url || null,
        autor: form.value.autor || null,
        publicado: publicar,
        updated_at: new Date().toISOString()
      }).eq('id', editingId.value)
      await upsertI18n(editingId.value)
    } else {
      const { data: post } = await supabase.from('blog_posts').insert({
        slug,
        imagen_url: form.value.imagen_url || null,
        autor: form.value.autor || null,
        publicado: publicar
      }).select('id').single()
      if (post) await upsertI18n(post.id)
    }
    showForm.value = false
    cargarPosts()
  } catch (e) {
    console.error(e)
    alert('Error al guardar.')
  }
}

async function upsertI18n(postId) {
  const localesData = [
    { locale: 'es', titulo: form.value.titulo_es, cuerpo: form.value.cuerpo_es },
    { locale: 'en', titulo: form.value.titulo_en, cuerpo: form.value.cuerpo_en },
    { locale: 'fr', titulo: form.value.titulo_fr, cuerpo: form.value.cuerpo_fr },
    { locale: 'pt', titulo: form.value.titulo_pt, cuerpo: form.value.cuerpo_pt }
  ].filter(l => l.titulo?.trim() || l.cuerpo?.trim())
  for (const l of localesData) {
    await supabase.from('blog_post_i18n').upsert({
      post_id: postId,
      locale: l.locale,
      titulo: l.titulo || '(Sin título)',
      cuerpo: l.cuerpo || ''
    }, { onConflict: 'post_id,locale' })
  }
}

async function traducir() {
  if (!form.value.titulo_es?.trim() || !form.value.cuerpo_es?.trim()) {
    alert('Escribe primero el contenido en español.')
    return
  }
  traduciendo.value = true
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-blog`
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`
      },
      body: JSON.stringify({
        titulo: form.value.titulo_es,
        cuerpo: form.value.cuerpo_es
      })
    })
    let data = {}
    try {
      const text = await res.text()
      data = text ? JSON.parse(text) : {}
    } catch {
      data = {}
    }
    if (res.ok && data?.en) {
      form.value.titulo_en = data.en.titulo ?? ''
      form.value.cuerpo_en = data.en.cuerpo ?? ''
      form.value.titulo_fr = data.fr?.titulo ?? ''
      form.value.cuerpo_fr = data.fr?.cuerpo ?? ''
      form.value.titulo_pt = data.pt?.titulo ?? ''
      form.value.cuerpo_pt = data.pt?.cuerpo ?? ''
      return true
    } else {
      alert('Error al traducir: ' + (data?.error || res.statusText || 'Intenta de nuevo.'))
    }
  } catch (e) {
    alert('Error de conexión: ' + (e.message || 'Verifica tu conexión e intenta de nuevo.'))
    return false
  } finally {
    traduciendo.value = false
  }
  return false
}

async function traducirYPublicar() {
  const ok = await traducir()
  if (ok) await guardar(true)
}

async function eliminar(id) {
  if (!confirm('¿Eliminar este artículo?')) return
  await supabase.from('blog_posts').delete().eq('id', id)
  cargarPosts()
}

async function logout() {
  await supabase.auth.signOut()
  router.push('/')
}

function getPostTitulo(post) {
  return post.blog_post_i18n?.find(i => i.locale === 'es')?.titulo || post.slug
}
</script>

<template>
  <div class="admin-blog section">
    <div class="container">
      <div class="admin-blog__header">
        <h1>Blog Admin</h1>
        <div class="admin-blog__actions">
          <router-link to="/admin" class="btn btn-outline btn--sm">← Panel</router-link>
          <span class="admin-user">{{ user?.email }}</span>
          <button class="btn btn-outline btn--sm" @click="logout">Cerrar sesión</button>
        </div>
      </div>

      <div v-if="loading" class="loading">Cargando...</div>

      <div v-else-if="blogError" class="blog-error">
        <p>{{ blogError }}</p>
      </div>

      <template v-else>
        <button class="btn btn-primary mb-4" @click="nuevo">+ Nuevo artículo</button>

        <div v-if="showForm" class="admin-blog-form">
          <h2>{{ editingId ? 'Editar' : 'Nuevo artículo' }}</h2>
          <p class="admin-blog-form__slug-hint" v-if="form.titulo_es">URL: /blog/{{ generateSlug(form.titulo_es) }}</p>
          <div class="form-grid form-grid--meta">
            <div>
              <label>URL imagen portada</label>
              <input v-model="form.imagen_url" placeholder="https://..." />
            </div>
            <div>
              <label>Autor</label>
              <input v-model="form.autor" placeholder="Von Navi" />
            </div>
          </div>
          <div class="form-tabs">
            <div v-for="loc in locales" :key="loc.code" class="form-tab">
              <h3>{{ loc.name }}</h3>
              <div v-if="loc.code === 'es'">
                <label>Título</label>
                <input v-model="form.titulo_es" />
                <label>Cuerpo</label>
                <RichTextEditor v-model="form.cuerpo_es" placeholder="Escribe el artículo..." />
              </div>
              <div v-else>
                <button type="button" class="btn btn-outline btn--sm mb-2" @click="traducir" :disabled="traduciendo" v-if="loc.code === 'en'">{{ traduciendo ? 'Traduciendo...' : 'Solo traducir' }}</button>
                <label>Título</label>
                <input v-model="form['titulo_' + loc.code]" />
                <label>Cuerpo</label>
                <RichTextEditor v-model="form['cuerpo_' + loc.code]" :placeholder="'Contenido en ' + loc.name" />
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn btn-outline" @click="showForm = false">Cancelar</button>
            <button class="btn btn-secondary" @click="guardar(false)">Guardar borrador</button>
            <button class="btn btn-primary" @click="traducirYPublicar" :disabled="traduciendo">Traducir y Publicar</button>
            <button class="btn btn-primary" @click="guardar(true)">Guardar y Publicar</button>
          </div>
        </div>

        <table v-if="!showForm" class="admin-table">
          <thead>
            <tr><th>Título</th><th>Slug</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in posts" :key="p.id">
              <td>{{ getPostTitulo(p) }}</td>
              <td>{{ p.slug }}</td>
              <td>{{ p.publicado ? 'Publicado' : 'Borrador' }}</td>
              <td>
                <button class="btn btn-outline btn--sm" @click="editar(p)">Editar</button>
                <button class="btn btn-outline btn--sm text-red-600" @click="eliminar(p.id)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>
  </div>
</template>

<style scoped>
.admin-blog {
  background: linear-gradient(180deg, #f8fafc 0%, #fff 100%);
  min-height: 100vh;
}
.admin-blog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
}
.admin-blog__header h1 {
  font-size: 1.75rem;
  color: var(--color-sky);
}
.admin-blog__actions { display: flex; align-items: center; gap: 1rem; }
.admin-user {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  padding: 0.5rem 0.75rem;
  background: #f1f5f9;
  border-radius: 8px;
}
.admin-blog-form {
  background: #fff;
  padding: 2.5rem;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
}
.admin-blog-form h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-sky);
}
.admin-blog-form__slug-hint {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  display: inline-block;
}
.form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
.form-grid--meta { margin-bottom: 2rem; }
.form-grid label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 500; color: var(--color-text); }
.form-grid input,
.form-tab input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}
.form-grid input:focus,
.form-tab input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(214, 151, 49, 0.15);
}
.form-tabs { display: flex; flex-direction: column; gap: 2rem; }
.form-tab {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
.form-tab h3 { font-size: 1.1rem; margin-bottom: 1rem; color: var(--color-sky); }
.form-tab label { display: block; margin-bottom: 0.5rem; margin-top: 1rem; font-size: 0.9rem; font-weight: 500; }
.form-tab input[type="text"],
.form-tab input[type="url"] { width: 100%; }
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
}
.form-actions .btn { min-width: 140px; }
.admin-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  border: 1px solid #e2e8f0;
}
.admin-table th, .admin-table td { padding: 1rem 1.25rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
.admin-table th {
  background: var(--color-sky);
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
}
.admin-table tbody tr:hover { background: #f8fafc; }
.admin-table .btn-outline { padding: 0.5rem 0.75rem; font-size: 0.85rem; }
.loading { padding: 3rem; text-align: center; color: var(--color-text-muted); }
.blog-error {
  padding: 2rem;
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.25);
  border-radius: 12px;
  color: #991b1b;
}
.mb-4 { margin-bottom: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
</style>
