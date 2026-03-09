<script setup>
import { useI18n } from 'vue-i18n'
import { usePackageI18n } from '../composables/usePackageI18n'
import { useSeo } from '../composables/useSeo'
import { useScrollReveal } from '../composables/useScrollReveal'
import { paquetesEstaticos } from '@/data/paquetes'
import vuelo1 from '@/assets/Vuelos/XpSlTlDl8LcZ8ClJwchoyfn8.avif'
import vuelo2 from '@/assets/Vuelos/8XPhplzHR2ipwvdsizVHVKgCg.avif'
import vuelo3 from '@/assets/Vuelos/UXdALwELL4smvYbj5CLWGbNtIE.avif'
import vuelo4 from '@/assets/Vuelos/UHbBNlDQcPx11KmOjg8SD3ifbt8.avif'

const { t } = useI18n()
const { getPackageName, getPackageDesc } = usePackageI18n()
useScrollReveal()

useSeo({
  title: 'Paquetes de Vuelo en Globo | Von Navi Teotihuacán',
  description: 'Paquetes de vuelo en globo: Básico, Desayuno, Gold y Plus. Los mejores precios para vivir Teotihuacán desde el cielo.'
})

const paquetes = paquetesEstaticos
const vueloImages = [vuelo1, vuelo2, vuelo3, vuelo4]

function getPackageImage(p, index) {
  return vueloImages[index % vueloImages.length]
}
</script>

<template>
  <div class="paquetes-page section section-bg-pattern">
    <div class="container">
      <h1 class="section-title">{{ t('packages.title') }}</h1>
      <p class="section-subtitle">{{ t('packages.subtitle') }}</p>

      <div class="paquetes-cards">
        <router-link
          v-for="(p, i) in paquetes"
          :key="p.id"
          :to="`/paquetes/${p.slug}`"
          class="paquete-card animate-on-scroll"
          :style="{ animationDelay: `${i * 0.1}s` }"
        >
          <div
            class="paquete-card__img"
            :style="{ backgroundImage: `url(${getPackageImage(p, i)})` }"
          >
            <div class="paquete-card__overlay"></div>
          </div>
          <div class="paquete-card__body">
            <h3 class="paquete-card__name">{{ getPackageName(p) }}</h3>
            <span class="paquete-card__price">${{ Number(p.precio).toLocaleString('es-MX') }}</span>
            <p v-if="getPackageDesc(p)" class="paquete-card__desc">{{ getPackageDesc(p) }}</p>
            <span class="paquete-card__cta">{{ t('packages.viewDetails') }} →</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.paquetes-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.paquete-card {
  display: block;
  text-decoration: none;
  border-radius: 20px;
  overflow: hidden;
  background: var(--color-bg-card);
  border: 1px solid rgba(0,0,0,0.06);
  transition: all 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.paquete-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 24px 48px rgba(0,0,0,0.12), 0 8px 24px rgba(214, 151, 49, 0.08);
}

.paquete-card:hover .paquete-card__cta {
  transform: translateX(6px);
}

.paquete-card__img {
  height: 300px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.paquete-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent 50%);
}

.paquete-card__body {
  padding: 1.5rem;
}

.paquete-card__name {
  font-size: 1.35rem;
  font-family: 'Outfit', system-ui, sans-serif;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.paquete-card__price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.paquete-card__desc {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.paquete-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
  font-size: 0.95rem;
  font-weight: 600;
  transition: transform 0.3s;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
}

.empty-packages {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
}

.empty-packages p {
  margin-bottom: 1.5rem;
}

</style>
