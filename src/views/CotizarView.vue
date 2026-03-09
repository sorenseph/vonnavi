<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSeo } from '../composables/useSeo'
import { supabase } from '../lib/supabase'
import { paquetesEstaticos } from '@/data/paquetes'

const { t } = useI18n()

useSeo({
  title: 'Solicitar Cotización | Von Navi - Vuelo en Globo',
  description: 'Solicita tu cotización personalizada para vuelo en globo sobre Teotihuacán. Te contactaremos sin compromiso.'
})

const paquetes = paquetesEstaticos
const loading = ref(false)
const enviado = ref(false)

const form = ref({
  nombre: '',
  email: '',
  telefono: '',
  fecha_vuelo: '',
  num_pasajeros: 1,
  paquete_slug: paquetesEstaticos[0]?.slug || '',
  servicios_extra: [],
  mensaje: ''
})

const serviciosOpciones = [
  { key: 'champagne', dbValue: 'Champagne' },
  { key: 'breakfast', dbValue: 'Desayuno extra' },
  { key: 'mariachi', dbValue: 'Mariachi' },
  { key: 'flowers', dbValue: 'Ramo de flores' }
]

async function enviar() {
  if (!form.value.nombre || !form.value.email) return
  loading.value = true
  try {
    const folio = `COT-${Date.now().toString(36).toUpperCase()}`
    const paqueteSel = paquetes.find(p => p.slug === form.value.paquete_slug)

    const { error } = await supabase.from('cotizaciones').insert({
      folio,
      nombre: form.value.nombre,
      email: form.value.email,
      telefono: form.value.telefono || null,
      fecha_vuelo: form.value.fecha_vuelo || null,
      num_pasajeros: form.value.num_pasajeros,
      paquete_slug: form.value.paquete_slug || null,
      servicios_extra: form.value.servicios_extra.length ? form.value.servicios_extra : null,
      mensaje: form.value.mensaje || null,
      total_estimado: null
    }).select('id').single()

    if (error) throw error

    // Enviar correo de confirmación al cliente
    try {
      await supabase.functions.invoke('send-quote-email', {
        body: {
          folio,
          nombre: form.value.nombre,
          email: form.value.email,
          fecha_vuelo: form.value.fecha_vuelo || undefined,
          num_pasajeros: form.value.num_pasajeros,
          paquete_nombre: paqueteSel?.nombre
        }
      })
    } catch (_) {
      // No bloquear si falla el email
    }

    enviado.value = true
  } catch (e) {
    alert(t('quote.errorSubmit'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="cotizar-page py-16 md:py-24">
    <div class="container max-w-2xl mx-auto px-6">
      <h1 class="text-3xl md:text-4xl font-display font-semibold text-stone-800 text-center mb-2">{{ t('quote.title') }}</h1>
      <p class="text-stone-600 text-center mb-10">{{ t('quote.subtitle') }}</p>

      <form v-if="!enviado" @submit.prevent="enviar" class="cotizar-form">
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">{{ t('quote.name') }} *</label>
          <input v-model="form.nombre" required :placeholder="t('quote.name')" class="form-input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">{{ t('quote.email') }} *</label>
          <input v-model="form.email" type="email" required :placeholder="t('quote.placeholderEmail')" class="form-input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">{{ t('quote.phone') }}</label>
          <input
            :value="form.telefono"
            type="tel"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="15"
            :placeholder="t('quote.placeholderPhone')"
            class="form-input"
            @input="form.telefono = ($event.target.value || '').replace(/\D/g, '')"
            @paste.prevent="form.telefono = (($event.clipboardData?.getData('text') || '').replace(/\D/g, '')).slice(0, 15)"
            @keypress="(e) => !/[0-9]/.test(e.key) && e.preventDefault()"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1.5">{{ t('quote.date') }}</label>
            <input v-model="form.fecha_vuelo" type="date" class="form-input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1.5">{{ t('quote.passengers') }}</label>
            <input v-model.number="form.num_pasajeros" type="number" min="1" max="20" class="form-input" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">{{ t('quote.package') }}</label>
          <select v-model="form.paquete_slug" class="form-input">
            <option v-for="p in paquetes" :key="p.id" :value="p.slug">{{ p.nombre }} — ${{ Number(p.precio).toLocaleString('es-MX') }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">{{ t('quote.extras') }}</label>
          <div class="flex flex-wrap gap-4">
            <label v-for="opt in serviciosOpciones" :key="opt.key" class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" :value="opt.dbValue" v-model="form.servicios_extra" class="rounded border-stone-300 text-primary focus:ring-primary" />
              {{ t(`services.${opt.key}`) }}
            </label>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">{{ t('quote.message') }}</label>
          <textarea v-model="form.mensaje" rows="4" :placeholder="t('quote.placeholderMsg')" class="form-input resize-none"></textarea>
        </div>
        <button type="submit" class="w-full py-3.5 px-6 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary-dark transition-all disabled:opacity-60" :disabled="loading">
          {{ loading ? t('quote.sending') : t('quote.submit') }}
        </button>
      </form>

      <div v-else class="text-center py-12 bg-white rounded-2xl p-8 shadow-soft">
        <h2 class="text-2xl font-display font-semibold text-primary mb-3">{{ t('quote.success') }}</h2>
        <p class="text-stone-600 mb-6">{{ t('quote.successEmail', { email: form.email }) }}</p>
        <router-link to="/" class="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors">{{ t('quote.backHome') }}</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cotizar-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.06);
}

.cotizar-form .form-input,
.cotizar-form input,
.cotizar-form select,
.cotizar-form textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid rgba(0,0,0,0.12);
  border-radius: 10px;
  font-size: 1rem;
}

.cotizar-form input:focus,
.cotizar-form select:focus,
.cotizar-form textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

@media (max-width: 500px) {
  .grid-cols-2 { grid-template-columns: 1fr; }
}
</style>
