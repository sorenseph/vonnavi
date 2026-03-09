<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSeo } from '../composables/useSeo'
import { supabase } from '../lib/supabase'
import { paquetesEstaticos } from '@/data/paquetes'
const { t } = useI18n()
useSeo({ title: 'Panel Admin | Von Navi' })

const router = useRouter()
const tab = ref('quotations')
const user = ref(null)

const cotizaciones = ref([])
const reservaciones = ref([])
const promociones = ref([])

const loading = ref(true)

function getPaqueteNombre(c) {
  if (c.paquete_slug) {
    const p = paquetesEstaticos.find(x => x.slug === c.paquete_slug)
    return p ? p.nombre : c.paquete_slug
  }
  return c.paquete_id ? '-' : '-'
}

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    router.push('/login')
    return
  }
  user.value = session.user

  await cargarDatos()
})

async function cargarDatos() {
  loading.value = true
  try {
    const [cot, res, prom] = await Promise.all([
      supabase.from('cotizaciones').select('*').order('created_at', { ascending: false }),
      supabase.from('reservaciones').select('*').order('created_at', { ascending: false }),
      supabase.from('promociones').select('*').order('fecha_fin', { ascending: false })
    ])
    cotizaciones.value = cot.data || []
    reservaciones.value = res.data || []
    promociones.value = prom.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function logout() {
  await supabase.auth.signOut()
  router.push('/')
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

async function actualizarEstadoCotizacion(id, estado) {
  await supabase.from('cotizaciones').update({ estado }).eq('id', id)
  cargarDatos()
}

async function actualizarEstadoReservacion(id, estado) {
  await supabase.from('reservaciones').update({ estado }).eq('id', id)
  cargarDatos()
}

</script>

<template>
  <div class="admin-page section">
    <div class="container">
      <div class="admin-header">
        <h1>{{ t('admin.title') }}</h1>
        <div class="admin-header__actions">
          <router-link to="/admin/blog" class="btn btn-outline btn--sm">Blog</router-link>
          <span class="admin-user">{{ user?.email }}</span>
          <button class="btn btn-outline btn--sm" @click="logout">{{ t('admin.logout') }}</button>
        </div>
      </div>

      <div class="admin-tabs">
        <button
          v-for="tabKey in ['quotations', 'reservations', 'promotions']"
          :key="tabKey"
          class="admin-tab"
          :class="{ 'admin-tab--active': tab === tabKey }"
          @click="tab = tabKey"
        >
          {{ t(`admin.${tabKey}`) }}
        </button>
      </div>

      <div v-if="loading" class="loading">{{ t('admin.loading') }}</div>

      <!-- Cotizaciones -->
      <div v-else-if="tab === 'quotations'" class="admin-table-wrap">
        <h2>{{ t('admin.quotations') }}</h2>
        <table class="admin-table">
          <thead>
            <tr>
              <th>{{ t('admin.folio') }}</th>
              <th>{{ t('quote.name') }}</th>
              <th>{{ t('quote.email') }}</th>
              <th>{{ t('quote.package') }}</th>
              <th>{{ t('book.phone') }}</th>
              <th>{{ t('book.date') }}</th>
              <th>{{ t('book.passengers') }}</th>
              <th>{{ t('admin.state') }}</th>
              <th>{{ t('admin.date') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in cotizaciones" :key="c.id">
              <td>{{ c.folio || '-' }}</td>
              <td>{{ c.nombre }}</td>
              <td>{{ c.email }}</td>
              <td>{{ getPaqueteNombre(c) }}</td>
              <td>{{ c.telefono || '-' }}</td>
              <td>{{ formatDate(c.fecha_vuelo) }}</td>
              <td>{{ c.num_adultos != null || c.num_ninos != null ? `${c.num_adultos || 0} adultos, ${c.num_ninos || 0} niños` : c.num_pasajeros }}</td>
              <td>
                <select
                  :value="c.estado"
                  @change="actualizarEstadoCotizacion(c.id, $event.target.value)"
                >
                  <option value="pendiente">{{ t('admin.status.pendiente') }}</option>
                  <option value="contactado">{{ t('admin.status.contactado') }}</option>
                  <option value="confirmada">{{ t('admin.status.confirmada') }}</option>
                  <option value="cancelada">{{ t('admin.status.cancelada') }}</option>
                </select>
              </td>
              <td>{{ formatDate(c.created_at) }}</td>
            </tr>
            <tr v-if="!cotizaciones.length">
              <td colspan="9">{{ t('admin.noQuotations') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Reservaciones -->
      <div v-else-if="tab === 'reservations'" class="admin-table-wrap">
        <h2>{{ t('admin.reservations') }}</h2>
        <table class="admin-table">
          <thead>
            <tr>
              <th>{{ t('admin.folio') }}</th>
              <th>{{ t('quote.name') }}</th>
              <th>{{ t('book.phone') }}</th>
              <th>{{ t('book.date') }}</th>
              <th>{{ t('book.total') }}</th>
              <th>{{ t('admin.state') }}</th>
              <th>{{ t('admin.date') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in reservaciones" :key="r.id">
              <td>{{ r.folio || '-' }}</td>
              <td>{{ r.nombre }}</td>
              <td>{{ r.telefono }}</td>
              <td>{{ formatDate(r.fecha_vuelo) }}</td>
              <td>${{ Number(r.total).toLocaleString('es-MX') }}</td>
              <td>
                <select
                  :value="r.estado"
                  @change="actualizarEstadoReservacion(r.id, $event.target.value)"
                >
                  <option value="pendiente">{{ t('admin.status.pendiente') }}</option>
                  <option value="confirmada">{{ t('admin.status.confirmada') }}</option>
                  <option value="pagada">{{ t('admin.status.pagada') }}</option>
                  <option value="completada">{{ t('admin.status.completada') }}</option>
                  <option value="cancelada">{{ t('admin.status.cancelada') }}</option>
                </select>
              </td>
              <td>{{ formatDate(r.created_at) }}</td>
            </tr>
            <tr v-if="!reservaciones.length">
              <td colspan="7">{{ t('admin.noReservations') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Promociones -->
      <div v-else-if="tab === 'promotions'" class="admin-table-wrap">
        <h2>{{ t('admin.promotions') }}</h2>
        <table class="admin-table">
          <thead>
            <tr>
              <th>{{ t('admin.promoTitle') }}</th>
              <th>{{ t('quote.promoCode') }}</th>
              <th>{{ t('admin.promoDiscount') }}</th>
              <th>{{ t('admin.promoValidity') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pr in promociones" :key="pr.id">
              <td>{{ pr.titulo }}</td>
              <td>{{ pr.codigo }}</td>
              <td>
                {{ pr.descuento_porcentaje ? pr.descuento_porcentaje + '%' : '' }}
                {{ pr.descuento_monto ? '$' + pr.descuento_monto : '' }}
              </td>
              <td>{{ formatDate(pr.fecha_inicio) }} - {{ formatDate(pr.fecha_fin) }}</td>
            </tr>
            <tr v-if="!promociones.length">
              <td colspan="4">{{ t('admin.noPromotions') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.admin-header__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-user {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.admin-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.admin-tab {
  padding: 0.6rem 1.2rem;
  border: 1px solid rgba(0,0,0,0.12);
  background: var(--color-bg-card);
  color: var(--color-text);
  border-radius: 8px;
  cursor: pointer;
  font-family: var(--font-body);
  transition: all 0.2s;
}

.admin-tab:hover {
  background: rgba(214, 151, 49, 0.08);
  border-color: rgba(214, 151, 49, 0.3);
}

.admin-tab--active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.admin-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.admin-section-header h2 {
  font-size: 1.25rem;
  margin: 0;
}

.admin-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--color-bg-card);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 12px;
}

.admin-form input {
  padding: 0.5rem;
}

.admin-table-wrap h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-bg-card);
  border-radius: 12px;
  overflow: hidden;
}

.admin-table th,
.admin-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  color: var(--color-text);
}

.admin-table th {
  background: rgba(214, 151, 49, 0.08);
  font-weight: 600;
  color: var(--color-text);
}

.admin-table select {
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  width: auto;
}

.loading {
  padding: 3rem;
  text-align: center;
}

@media (max-width: 768px) {
  .admin-table {
    font-size: 0.85rem;
  }
  .admin-table th,
  .admin-table td {
    padding: 0.5rem;
  }
}
</style>
