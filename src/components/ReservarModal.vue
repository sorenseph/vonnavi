<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useReservarModal } from '../composables/useReservarModal'
import { supabase } from '../lib/supabase'
import { paquetesEstaticos } from '@/data/paquetes'
import vuelo1 from '@/assets/Vuelos/XpSlTlDl8LcZ8ClJwchoyfn8.avif'
import vuelo2 from '@/assets/Vuelos/8XPhplzHR2ipwvdsizVHVKgCg.avif'
import vuelo3 from '@/assets/Vuelos/UXdALwELL4smvYbj5CLWGbNtIE.avif'
import vuelo4 from '@/assets/Vuelos/UHbBNlDQcPx11KmOjg8SD3ifbt8.avif'

const { t } = useI18n()
const { isOpen, initialParams, close } = useReservarModal()
const paquetes = paquetesEstaticos
const vueloImages = [vuelo1, vuelo2, vuelo3, vuelo4]
const loading = ref(false)
const enviado = ref(false)
const phoneError = ref('')
const dateError = ref('')

const form = ref({
  nombre: '',
  email: '',
  telefono: '',
  fecha_vuelo: '',
  num_adultos: 1,
  num_ninos: 0,
  paquete_slug: '',
  codigo_promocion: '',
  servicios_extra: [],
  mensaje: ''
})

const numPasajeros = ref(1)
const PHONE_REGEX = /^[0-9]{10}$/
const ADMIN_EMAIL = 'israelcardenas6@gmail.com'

function getPackageImage(p, index) {
  return vueloImages[index % vueloImages.length]
}

function validatePhone(val) {
  const digits = (val || '').replace(/\D/g, '')
  if (!digits) return ''
  if (!PHONE_REGEX.test(digits)) return t('book.invalidPhone')
  return ''
}

function validateDate(val) {
  if (!val) return ''
  const d = new Date(val)
  if (isNaN(d.getTime())) return t('book.invalidDate')
  return ''
}

watch(() => form.value.telefono, (val) => { phoneError.value = validatePhone(val) }, { immediate: true })
watch(() => form.value.fecha_vuelo, (val) => { dateError.value = validateDate(val) }, { immediate: true })
watch(() => [form.value.num_adultos, form.value.num_ninos], ([a, n]) => {
  numPasajeros.value = (Number(a) || 0) + (Number(n) || 0)
}, { immediate: true })

watch(isOpen, (open) => {
  if (open) {
    const p = initialParams.value || {}
    const pkg = paquetes.find(x => x.slug === p.paquete)
    form.value.paquete_slug = pkg?.slug || paquetes[0]?.slug || ''
    if (p.fecha) form.value.fecha_vuelo = p.fecha
    if (p.adultos != null) form.value.num_adultos = Math.min(20, Math.max(1, Number(p.adultos) || 1))
    if (p.ninos != null) form.value.num_ninos = Math.min(10, Math.max(0, Number(p.ninos) || 0))
    enviado.value = false
  }
})

const serviciosOpciones = [
  { key: 'champagne', dbValue: 'Champagne' },
  { key: 'breakfast', dbValue: 'Desayuno extra' },
  { key: 'mariachi', dbValue: 'Mariachi' },
  { key: 'flowers', dbValue: 'Ramo de flores' }
]

async function enviar() {
  phoneError.value = validatePhone(form.value.telefono)
  dateError.value = validateDate(form.value.fecha_vuelo)
  if (!form.value.nombre || !form.value.email || !form.value.telefono || !form.value.fecha_vuelo) {
    alert(t('book.fillRequired'))
    return
  }
  if (phoneError.value || dateError.value) return
  if (numPasajeros.value < 1) {
    alert(t('book.fillRequired'))
    return
  }

  loading.value = true
  try {
    const folio = `COT-${Date.now().toString(36).toUpperCase()}`
    const telefonoLimpio = form.value.telefono.replace(/\D/g, '')
    const paqueteSel = paquetes.find(p => p.slug === form.value.paquete_slug)

    const { error } = await supabase.from('cotizaciones').insert({
      folio,
      nombre: form.value.nombre,
      email: form.value.email,
      telefono: telefonoLimpio,
      fecha_vuelo: form.value.fecha_vuelo,
      num_pasajeros: numPasajeros.value,
      num_adultos: form.value.num_adultos,
      num_ninos: form.value.num_ninos,
      paquete_slug: form.value.paquete_slug || null,
      servicios_extra: form.value.servicios_extra?.length ? form.value.servicios_extra : null,
      mensaje: form.value.mensaje || null
    })
    if (error) throw error

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-quote-email`
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({
          folio,
          nombre: form.value.nombre,
          email: form.value.email,
          telefono: form.value.telefono,
          fecha_vuelo: form.value.fecha_vuelo,
          num_adultos: form.value.num_adultos,
          num_ninos: form.value.num_ninos,
          num_pasajeros: numPasajeros.value,
          paquete_nombre: paqueteSel?.nombre || form.value.paquete_slug,
          admin_email: ADMIN_EMAIL,
          servicios_extra: form.value.servicios_extra
        })
      })
    } catch (_) {}

    enviado.value = true
  } catch (e) {
    alert(t('book.errorSubmit'))
  } finally {
    loading.value = false
  }
}

function handleClose() {
  close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="reservar-modal">
      <div v-if="isOpen" class="reservar-modal-overlay" @click.self="handleClose">
        <div class="reservar-modal">
          <button type="button" class="reservar-modal__close" aria-label="Cerrar" @click="handleClose">×</button>
          <div class="reservar-modal__body">
            <h2 class="reservar-modal__title">{{ t('reserve.title') }}</h2>
            <p class="reservar-modal__subtitle">{{ t('reserve.subtitle') }}</p>

            <form v-if="!enviado" @submit.prevent="enviar" class="reservar-form">
              <div>
                <label class="block text-sm font-medium text-stone-700 mb-1.5">{{ t('book.name') }} *</label>
                <input v-model="form.nombre" required maxlength="30" :placeholder="t('book.name')" class="reservar-form__input" />
              </div>
              <div>
                <label class="block text-sm font-medium text-stone-700 mb-1.5">{{ t('book.email') }} *</label>
                <input v-model="form.email" type="email" required maxlength="30" :placeholder="t('book.placeholderEmail')" class="reservar-form__input" />
              </div>
              <div>
                <label class="block text-sm font-medium text-stone-700 mb-1.5">{{ t('book.phone') }} *</label>
                <input
                  :value="form.telefono"
                  type="tel"
                  required
                  inputmode="numeric"
                  maxlength="15"
                  :placeholder="t('book.placeholderPhone')"
                  class="reservar-form__input"
                  :class="{ 'reservar-form__input--error': phoneError }"
                  @input="form.telefono = ($event.target.value || '').replace(/\D/g, '').slice(0, 15)"
                  @keypress="(e) => !/[0-9]/.test(e.key) && e.preventDefault()"
                  @paste.prevent="form.telefono = (($event.clipboardData?.getData('text') || '').replace(/\D/g, '')).slice(0, 15)"
                />
                <p v-if="phoneError" class="text-sm text-red-500 mt-1">{{ phoneError }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-stone-700 mb-1.5">{{ t('book.date') }} *</label>
                <input
                  v-model="form.fecha_vuelo"
                  type="date"
                  required
                  :min="new Date().toISOString().split('T')[0]"
                  class="reservar-form__input"
                  :class="{ 'reservar-form__input--error': dateError }"
                />
                <p v-if="dateError" class="text-sm text-red-500 mt-1">{{ dateError }}</p>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-stone-700 mb-1.5">{{ t('book.adults') }}</label>
                  <select v-model.number="form.num_adultos" class="reservar-form__input">
                    <option v-for="n in 20" :key="n" :value="n">{{ n }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-stone-700 mb-1.5">{{ t('book.children') }}</label>
                  <select v-model.number="form.num_ninos" class="reservar-form__input">
                    <option v-for="n in 11" :key="n" :value="n - 1">{{ n - 1 }}</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-stone-700 mb-3">{{ t('book.package') }} *</label>
                <div class="reservar-paquetes">
                  <button
                    v-for="(p, i) in paquetes"
                    :key="p.id"
                    type="button"
                    class="reservar-paquete-card"
                    :class="{ 'reservar-paquete-card--selected': form.paquete_slug === p.slug }"
                    @click="form.paquete_slug = p.slug"
                  >
                    <div class="reservar-paquete-card__img" :style="{ backgroundImage: `url(${getPackageImage(p, i)})` }"></div>
                    <div class="reservar-paquete-card__body">
                      <span class="reservar-paquete-card__name">{{ p.nombre }}</span>
                      <span class="reservar-paquete-card__price">${{ Number(p.precio).toLocaleString('es-MX') }}</span>
                    </div>
                  </button>
                </div>
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
                <label class="block text-sm font-medium text-stone-700 mb-1.5">{{ t('book.notes') }}</label>
                <textarea v-model="form.mensaje" rows="3" :placeholder="t('book.placeholderNotes')" class="reservar-form__input resize-none"></textarea>
              </div>
              <button type="submit" class="reservar-form__submit" :disabled="loading">
                {{ loading ? t('book.sending') : t('reserve.submit') }}
              </button>
            </form>

            <div v-else class="reservar-success text-center py-8 rounded-2xl p-6">
              <div class="reservar-success__icon">🎈</div>
              <h3 class="text-xl font-semibold text-primary mb-2">{{ t('reserve.successTitle') }}</h3>
              <p class="text-stone-600 mb-4">{{ t('reserve.successText') }}</p>
              <button type="button" class="reservar-success__btn" @click="handleClose">{{ t('quote.backHome') }}</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.reservar-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  overflow-y: auto;
}

.reservar-modal {
  position: relative;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
}

.reservar-modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  line-height: 1;
  color: #666;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
}

.reservar-modal__close:hover {
  color: var(--color-text);
  background: rgba(0, 0, 0, 0.06);
}

.reservar-modal__body {
  padding: 2rem;
  padding-top: 2.5rem;
}

.reservar-modal__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.reservar-modal__subtitle {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.reservar-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reservar-form__input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  font-size: 1rem;
}

.reservar-form__input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.reservar-form__input--error {
  border-color: #dc2626;
}

.reservar-paquetes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.reservar-paquete-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.reservar-paquete-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.reservar-paquete-card--selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(214, 151, 49, 0.3);
}

.reservar-paquete-card__img {
  height: 80px;
  background-size: cover;
  background-position: center;
}

.reservar-paquete-card__body {
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.reservar-paquete-card__name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}

.reservar-paquete-card__price {
  font-size: 0.9rem;
  color: var(--color-primary);
  font-weight: 700;
}

.reservar-success {
  background: rgba(214, 151, 49, 0.08);
  border: 1px solid rgba(214, 151, 49, 0.2);
}

.reservar-success__icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.reservar-success__btn {
  display: inline-flex;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  background: var(--color-primary);
  color: #fff !important;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.25s;
}

.reservar-success__btn:hover {
  background: var(--color-primary-dark);
}

.reservar-form__submit {
  align-self: flex-start;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.25s;
}

.reservar-form__submit:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.reservar-form__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reservar-modal-enter-active,
.reservar-modal-leave-active {
  transition: opacity 0.25s ease;
}

.reservar-modal-enter-active .reservar-modal,
.reservar-modal-leave-active .reservar-modal {
  transition: transform 0.25s ease;
}

.reservar-modal-enter-from,
.reservar-modal-leave-to {
  opacity: 0;
}

.reservar-modal-enter-from .reservar-modal,
.reservar-modal-leave-to .reservar-modal {
  transform: scale(0.95) translateY(20px);
}

@media (max-width: 500px) {
  .reservar-paquetes { grid-template-columns: 1fr; }
}
</style>
