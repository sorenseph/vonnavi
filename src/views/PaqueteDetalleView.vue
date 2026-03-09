<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useReservarModal } from '../composables/useReservarModal'
import { usePackageI18n } from '../composables/usePackageI18n'
import { useI18n } from 'vue-i18n'
import { useSeo } from '../composables/useSeo'
import { paquetesEstaticos } from '@/data/paquetes'
import vuelo1 from '@/assets/Vuelos/XpSlTlDl8LcZ8ClJwchoyfn8.avif'
import vuelo2 from '@/assets/Vuelos/8XPhplzHR2ipwvdsizVHVKgCg.avif'
import vuelo3 from '@/assets/Vuelos/UXdALwELL4smvYbj5CLWGbNtIE.avif'
import vuelo4 from '@/assets/Vuelos/UHbBNlDQcPx11KmOjg8SD3ifbt8.avif'

const vueloImages = [vuelo1, vuelo2, vuelo3, vuelo4]
const { t } = useI18n()
const { getPackageName, getPackageDesc, getPackageIncluye } = usePackageI18n()
const route = useRoute()
const { open: openReservarModal } = useReservarModal()
const paquete = computed(() =>
  paquetesEstaticos.find(p => p.slug === route.params.slug) || null
)
const heroImage = computed(() => {
  if (!paquete.value) return vueloImages[0]
  const idx = paquetesEstaticos.findIndex(p => p.slug === paquete.value.slug)
  return vueloImages[idx >= 0 ? idx % vueloImages.length : 0]
})

const metaTitle = computed(() =>
  paquete.value
    ? `${getPackageName(paquete.value)} | Von Navi - Vuelo en Globo Teotihuacán`
    : 'Paquete | Von Navi'
)

const metaDesc = computed(() =>
  paquete.value ? getPackageDesc(paquete.value) : 'Paquete de vuelo en globo Teotihuacán'
)
useSeo({ title: metaTitle, description: metaDesc })
</script>

<template>
  <div class="paquete-detail section">
    <div class="container">
      <div v-if="!paquete" class="error">
        <h2>{{ t('packages.notFound') }}</h2>
        <router-link to="/paquetes" class="btn btn-primary">{{ t('packages.viewAll') }}</router-link>
      </div>

      <div v-else class="paquete-detail__content">
        <div
          class="paquete-detail__hero"
          :style="{ backgroundImage: `url(${paquete.imagen_url || heroImage})` }"
        ></div>
        <div class="paquete-detail__header">
          <h1>{{ getPackageName(paquete) }}</h1>
          <p class="paquete-detail__price">${{ Number(paquete.precio).toLocaleString('es-MX') }}</p>
        </div>
        <p class="paquete-detail__desc">{{ getPackageDesc(paquete) }}</p>
        <div v-if="getPackageIncluye(paquete).length" class="paquete-detail__incluye">
          <h3>{{ t('packages.includes') }}</h3>
          <ul>
            <li v-for="(item, i) in getPackageIncluye(paquete)" :key="i">{{ item }}</li>
          </ul>
        </div>
        <div class="paquete-detail__actions">
          <button type="button" class="btn btn-primary" @click="openReservarModal({ paquete: paquete.slug })">
            {{ t('packages.reserve') }}
          </button>
          <button type="button" class="btn btn-outline" @click="openReservarModal({ paquete: paquete.slug })">
            {{ t('experience.requestQuote') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.paquete-detail__content {
  max-width: 640px;
  margin: 0 auto;
}

.paquete-detail__hero {
  height: 220px;
  border-radius: 16px;
  background-size: cover;
  background-position: center;
  margin-bottom: 2rem;
}

.paquete-detail__header {
  margin-bottom: 1.5rem;
}

.paquete-detail__header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.paquete-detail__price {
  font-size: 2rem;
  color: var(--color-primary);
  font-weight: 700;
}

.paquete-detail__desc {
  font-size: 1.1rem;
  color: var(--color-text-muted);
  margin-bottom: 2rem;
  line-height: 1.7;
}

.paquete-detail__incluye h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.paquete-detail__incluye ul {
  list-style: none;
  margin-bottom: 2rem;
}

.paquete-detail__incluye li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.paquete-detail__incluye li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-weight: bold;
}

.paquete-detail__actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
}

.error h2 {
  margin-bottom: 1rem;
}
</style>
