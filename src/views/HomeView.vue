<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReservarModal } from '../composables/useReservarModal'
import { usePackageI18n } from '../composables/usePackageI18n'
import { useI18n } from 'vue-i18n'
import { useSeo } from '../composables/useSeo'
import { supabase } from '@/lib/supabase'
import { useScrollReveal } from '../composables/useScrollReveal'
import { paquetesEstaticos } from '@/data/paquetes'
import { service1, service2, service3, service4 } from '@/assets/index.js'
import vuelo1 from '@/assets/Vuelos/XpSlTlDl8LcZ8ClJwchoyfn8.avif'
import vuelo2 from '@/assets/Vuelos/8XPhplzHR2ipwvdsizVHVKgCg.avif'
import vuelo3 from '@/assets/Vuelos/UXdALwELL4smvYbj5CLWGbNtIE.avif'
import vuelo4 from '@/assets/Vuelos/UHbBNlDQcPx11KmOjg8SD3ifbt8.avif'

// Imagen para sección "Vive el Amanecer" (usa vuelo1 para consistencia)

// Hero: solo nube transparente (3x) y 2 globos transparentes
import nubeTransparente from '@/assets/globos/3d-rendering-style-white-cloud-atmospheric-isolated-on-a-transparent-background-png.png'
import globoColorido from '@/assets/globos/pngtree-beautiful-colorful-hot-air-balloon-isolated-on-white-background-png-image_11928860.png'
import globoDoble from '@/assets/globos/transparent-of-two-hot-air-balloons-png.png'

const heroFlotantes = [
  { src: nubeTransparente, top: '12%', left: '5%', size: '14%', delay: '0s', type: 'nube' },
  { src: nubeTransparente, top: '35%', right: '8%', left: 'auto', size: '18%', delay: '2s', type: 'nube' },
  { src: nubeTransparente, top: '60%', left: '12%', size: '12%', delay: '4s', type: 'nube' },
  { src: globoColorido, top: '25%', right: '15%', left: 'auto', size: '11%', delay: '1s', type: 'globo' },
  { src: globoDoble, bottom: '20%', right: '5%', left: 'auto', top: 'auto', size: '13%', delay: '3s', type: 'globo' }
]

// Hero background: imagen principal original
const heroBg = '/images/hero/w8WbWesAlNfQ9l18Xs37B7heHU.avif'

// Video para fondo de testimonios (wallpaper)
import testimonialVideoSrc from '@/assets/images/wallpapervideo/6347578_Hot Air Balloon Clouds Dusk Rocky_By_Piotrek_Naumowicz_Artlist_HD.mp4'
const testimonialVideo = testimonialVideoSrc

// Imágenes de personas para avatares (por género)
const personImageModules = import.meta.glob('@/assets/images/persons/*', { eager: true, import: 'default' })
const allPersonEntries = Object.entries(personImageModules)
const testimonialPersonImagesFemale = allPersonEntries.filter(([path]) => path.includes('mujer')).map(([, v]) => v)
const testimonialPersonImagesMale = allPersonEntries.filter(([path]) => path.includes('hombre')).map(([, v]) => v)

const { t, tm, locale } = useI18n()
const { getPackageName, getPackageDesc, getPackageIncluye } = usePackageI18n()
const testimonialItems = computed(() => tm('testimonial.items') || [])
useScrollReveal()

const { open: openReservarModal } = useReservarModal()
const heroSearch = ref({ fecha: '', adultos: 2, ninos: 0 })
const totalPassengers = computed(() => heroSearch.value.adultos + heroSearch.value.ninos)
const minDate = new Date().toISOString().split('T')[0]
const heroQuery = computed(() => {
  const q = { adultos: heroSearch.value.adultos, ninos: heroSearch.value.ninos }
  if (heroSearch.value.fecha) q.fecha = heroSearch.value.fecha
  return q
})
function adjustGuests(delta) {
  const total = heroSearch.value.adultos + heroSearch.value.ninos
  const newTotal = Math.max(1, Math.min(20, total + delta))
  heroSearch.value.adultos = newTotal
  heroSearch.value.ninos = 0
}

useSeo({
  title: 'Vuelo en Globo Teotihuacán | Von Navi - Vive el Amanecer',
  description: 'Descubre el mejor vuelo en globo Teotihuacán. Contempla el amanecer desde las alturas sobre las pirámides. Experiencia segura e inolvidable con piloto certificado.'
})

const paquetes = paquetesEstaticos
const blogPosts = ref([])
onMounted(async () => {
  const { data } = await supabase
    .from('blog_posts')
    .select('*, blog_post_i18n(*)')
    .eq('publicado', true)
    .order('created_at', { ascending: false })
    .limit(3)
  blogPosts.value = data || []
})
function getBlogContent(post, loc = 'es') {
  const i = post.blog_post_i18n?.find(x => x.locale === loc)
  return i || post.blog_post_i18n?.find(x => x.locale === 'es') || post.blog_post_i18n?.[0]
}
const serviceImages = [service1, service2, service3, service4]
const vueloImages = [vuelo1, vuelo2, vuelo3, vuelo4]
const servicePlaceholders = [
  'https://placehold.co/400x300/d69631/fff?text=Champagne',
  'https://placehold.co/400x300/0d3b66/fff?text=Desayuno',
  'https://placehold.co/400x300/1a5f8a/fff?text=Mariachi',
  'https://placehold.co/400x300/d69631/fff?text=Flores'
]

/* Orden: service1→Desayuno, service2→Mariachi, service3→Flores, service4→Champagne */
const servicios = [
  { key: 'breakfast', descKey: 'breakfastDesc', icon: 'breakfast' },
  { key: 'mariachi', descKey: 'mariachiDesc', icon: 'mariachi' },
  { key: 'flowers', descKey: 'flowersDesc', icon: 'flowers' },
  { key: 'champagne', descKey: 'champagneDesc', icon: 'champagne' }
]

function getPackageImage(p, index) {
  return vueloImages[index % vueloImages.length]
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(/[\s.]+/).filter(Boolean).slice(0, 2).map(s => s[0] || '').join('').toUpperCase() || '?'
}

function getTestimonialAvatar(item, items, idx) {
  const isFemale = item?.gender === 'f' || ['maría', 'maria', 'ana', 'laura'].includes((item?.author || '').split(/[\s.]+/)[0]?.toLowerCase())
  const arr = isFemale ? testimonialPersonImagesFemale : testimonialPersonImagesMale
  if (!arr?.length) return null
  const genderIndex = items.slice(0, idx + 1).filter((x) => {
    const f = x?.gender === 'f' || ['maría', 'maria', 'ana', 'laura'].includes((x?.author || '').split(/[\s.]+/)[0]?.toLowerCase())
    return f === isFemale
  }).length - 1
  return arr[genderIndex % arr.length]
}
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero__bg" :style="{ backgroundImage: `url(${heroBg})` }">
        <div class="hero__gradient"></div>
      
      </div>
      <div class="hero__content container">
        <p class="hero__welcome animate-fade-in">{{ t('hero.welcome') }}</p>
        <h1 class="hero__title animate-fade-in" v-html="t('hero.title')"></h1>
        <p class="hero__text animate-fade-in animate-delay-1">
          {{ t('hero.subtitle') }}
        </p>
        <div class="hero__ctas animate-fade-in animate-delay-1">
          <button type="button" class="btn btn-primary" @click="openReservarModal()">{{ t('hero.bookNow') }}</button>
          <router-link to="/paquetes" class="btn btn-outline">{{ t('hero.viewPackages') }}</router-link>
        </div>
        <!-- Barra de reserva - Trevilo/INDOTRAVI: blanca, simple, 3 campos -->
        <form class="hero-search animate-fade-in animate-delay-2">
          <div class="hero-search__bar">
            <div class="hero-search__field">
              <svg class="hero-search__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span class="hero-search__label">Teotihuacán</span>
            </div>
            <div class="hero-search__field hero-search__field--date">
              <svg class="hero-search__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div class="hero-search__date-wrap">
                <input v-model="heroSearch.fecha" type="date" class="hero-search__input" :min="minDate" />
                <span v-if="!heroSearch.fecha" class="hero-search__date-placeholder">dd/mm/aaaa</span>
              </div>
            </div>
            <div class="hero-search__field">
              <svg class="hero-search__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span class="hero-search__label">{{ totalPassengers }} Pas.</span>
              <div class="hero-search__guests">
                <button type="button" @click="adjustGuests(-1)" :disabled="totalPassengers <= 1">−</button>
                <button type="button" @click="adjustGuests(1)" :disabled="totalPassengers >= 20">+</button>
              </div>
            </div>
            <button type="button" class="hero-search__btn" @click="openReservarModal({ fecha: heroSearch.fecha, adultos: heroSearch.adultos, ninos: heroSearch.ninos })">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              {{ t('nav.quote') }}
            </button>
          </div>
        </form>
        <p class="hero__note animate-fade-in animate-delay-3">
          {{ t('hero.note') }}
        </p>
      </div>
      <div class="hero__scroll">
        <span class="hero__scroll-text">{{ t('common.scroll') }}</span>
        <div class="hero__scroll-line"></div>
      </div>
    </section>

    <!-- Experiencia - Intro -->
    <section class="section experience-intro section-bg-warm">
      <div class="container">
        <h2 class="section-title animate-on-scroll">{{ t('experience.title') }}</h2>
        <p class="experience-intro__text animate-on-scroll">
          {{ t('experience.subtitle') }}
        </p>
      </div>
    </section>

    <!-- Experiencia - Amanecer (2 columnas) -->
    <section class="section experience-dawn">
      <div class="container experience-dawn__grid">
        <div class="experience-dawn__content animate-on-scroll">
          <h2 class="experience-dawn__title">{{ t('experience.dawnTitle') }}</h2>
          <p>{{ t('experience.text1') }}</p>
          <h4 class="experience-dawn__sub">{{ t('experience.fromSky') }}</h4>
          <ul>
            <li>{{ t('experience.item1') }}</li>
            <li>{{ t('experience.item2') }}</li>
            <li>{{ t('experience.item3') }}</li>
          </ul>
          <p>{{ t('experience.extra') }}</p>
          <router-link to="/paquetes" class="btn btn-outline">{{ t('experience.requestQuote') }}</router-link>
        </div>
        <div class="experience-dawn__img animate-on-scroll">
          <img :src="vuelo1" alt="Vuelo en globo Teotihuacán" />
        </div>
      </div>
    </section>

    <!-- Servicios Premium - carrusel infinito auto-deslizante -->
    <section class="section services-section">
      <div class="services-section__header container">
        <h2 class="section-title services-section__title animate-on-scroll">{{ t('services.title') }}</h2>
        <p class="section-subtitle animate-on-scroll">{{ t('services.subtitle') }}</p>
      </div>
      <div class="services-carousel-viewport container">
        <div class="services-carousel-track">
          <div
            v-for="(copy, copyIdx) in 2"
            :key="copyIdx"
            class="services-carousel-set"
          >
            <div
              v-for="(srv, i) in servicios"
              :key="`${copyIdx}-${srv.key}`"
              class="services-card"
            >
              <div class="services-card__img">
                <img
                  :src="serviceImages[i] || servicePlaceholders[i]"
                  :alt="t(`services.${srv.key}`)"
                  @error="($event.target).src = servicePlaceholders[i]"
                />
                <div class="services-card__overlay">
                  <span class="services-card__label">{{ t(`services.${srv.descKey}`) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonios - carrusel infinito auto-deslizante -->
    <section class="section testimonial">
      <div v-if="testimonialVideo" class="testimonial__video-wrap">
        <video class="testimonial__video" autoplay muted loop playsinline>
          <source :src="testimonialVideo" type="video/mp4" />
        </video>
        <div class="testimonial__video-overlay"></div>
      </div>
      <div class="container testimonial__content">
        <h2 class="section-title testimonial__title">{{ t('testimonial.sectionTitle') }}</h2>
        <div class="testimonial__badge">★ {{ t('testimonial.badge') }}</div>
        <div class="testimonial-carousel-viewport">
          <div class="testimonial-carousel-track">
            <div
              v-for="(copy, copyIdx) in 2"
              :key="copyIdx"
              class="testimonial-carousel-set"
            >
              <div
                v-for="(item, i) in testimonialItems"
                :key="`${copyIdx}-${i}`"
                class="testimonial-card"
              >
                <div class="testimonial-card__avatar-wrap">
                  <img v-if="getTestimonialAvatar(item, testimonialItems, i)" :src="getTestimonialAvatar(item, testimonialItems, i)" :alt="item.author" class="testimonial-card__avatar-img" />
                  <span v-else>{{ getInitials(item.author) }}</span>
                </div>
                <span class="testimonial-card__quotes">"</span>
                <blockquote class="testimonial-card__quote">{{ item.quote }}</blockquote>
                <cite class="testimonial-card__author">— {{ item.author }}</cite>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Blog - 3 notas más recientes -->
    <section v-if="blogPosts.length" class="section blog-home">
      <div class="container">
        <h2 class="section-title">{{ t('blog.title') }}</h2>
        <p class="section-subtitle">{{ t('blog.subtitle') }}</p>
        <div class="blog-home__grid" :key="locale">
          <router-link
            v-for="(p, i) in blogPosts"
            :key="p.id"
            :to="`/blog/${p.slug}`"
            class="blog-home__card"
          >
            <div v-if="p.imagen_url" class="blog-home__img" :style="{ backgroundImage: `url(${p.imagen_url})` }"></div>
            <div v-else class="blog-home__img blog-home__img--placeholder"></div>
            <div class="blog-home__body">
              <h3 class="blog-home__title">{{ getBlogContent(p, locale)?.titulo || p.slug }}</h3>
              <p class="blog-home__excerpt">{{ getBlogContent(p, locale)?.cuerpo?.replace(/<[^>]+>/g, '').slice(0, 100) }}...</p>
              <span class="blog-home__date">{{ new Date(p.created_at).toLocaleDateString('es-MX') }}</span>
            </div>
          </router-link>
        </div>
        <div class="text-center" style="margin-top: 2rem;">
          <router-link to="/blog" class="btn btn-outline">{{ t('blog.viewAll') }}</router-link>
        </div>
      </div>
    </section>

    <!-- Paquetes - Cards clickeables -->
    <section class="section packages-section section-bg-pattern">
      <div class="container">
        <h2 class="section-title animate-on-scroll">{{ t('packages.title') }}</h2>
        <p class="section-subtitle animate-on-scroll">{{ t('packages.subtitle') }}</p>
        <div class="paquetes-grid">
          <router-link
            v-for="(p, i) in paquetes"
            :key="p.id"
            :to="`/paquetes/${p.slug}`"
            class="paquete-card animate-on-scroll"
            :style="{ animationDelay: `${i * 0.1}s` }"
          >
            <div class="paquete-card__img" :style="{ backgroundImage: `url(${getPackageImage(p, i)})` }">
              <div class="paquete-card__overlay"></div>
              <div class="paquete-card__hover-info">
                <p class="paquete-card__hover-desc">{{ getPackageDesc(p) }}</p>
                <ul v-if="getPackageIncluye(p).length" class="paquete-card__hover-incluye">
                  <li v-for="(inc, j) in getPackageIncluye(p).slice(0, 4)" :key="j">✓ {{ inc }}</li>
                </ul>
              </div>
            </div>
            <div class="paquete-card__body">
              <h4 class="paquete-card__name">{{ getPackageName(p) }}</h4>
              <p class="paquete-card__price">${{ Number(p.precio).toLocaleString('es-MX') }}</p>
              <span class="paquete-card__cta">{{ t('packages.viewDetails') }} →</span>
            </div>
          </router-link>
        </div>
        <div class="text-center" style="margin-top: 2rem;">
          <router-link to="/paquetes" class="btn btn-primary">{{ t('packages.viewAll') }}</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-color: var(--color-sky);
}

.hero__gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(214, 151, 49, 0.2) 0%, rgba(13, 59, 102, 0.4) 50%, rgba(26, 95, 138, 0.3) 100%);
}

.hero__flotantes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.hero__flotante {
  position: absolute;
  width: var(--flotante-size, 12%);
  top: var(--flotante-top, auto);
  left: var(--flotante-left, auto);
  right: var(--flotante-right, auto);
  bottom: var(--flotante-bottom, auto);
  opacity: 0.92;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2));
  animation: floatGlobo 14s ease-in-out infinite;
  animation-delay: var(--flotante-delay, 0s);
}

/* Hero search bar - Trevilo/INDOTRAVI: blanca semi-transparente, simple */
.hero-search {
  width: 100%;
  max-width: 680px;
  margin: 0 0 2rem;
}

.hero-search__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 0.5rem 0.5rem 0.5rem 1rem;
  border-radius: 20px;
  box-shadow: 0 12px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5) inset;
}

.hero-search__field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  min-width: 0;
  flex: 1 1 120px;
}

.hero-search__icon {
  flex-shrink: 0;
  color: #64748b;
}

.hero-search__label {
  color: #334155;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-search__date-wrap {
  position: relative;
  min-width: 110px;
}

.hero-search__input {
  background: transparent !important;
  border: none !important;
  color: #334155 !important;
  padding: 0 !important;
  font-size: 0.95rem;
  min-width: 110px;
}

.hero-search__date-placeholder {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.95rem;
  pointer-events: none;
}

.hero-search__input:focus {
  box-shadow: none !important;
}

.hero-search__guests {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
}

.hero-search__guests button {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: all 0.2s;
}

.hero-search__guests button:hover:not(:disabled) {
  background: #e2e8f0;
}

.hero-search__guests button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.hero-search__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: var(--color-primary);
  color: #fff !important;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.25s;
  flex-shrink: 0;
}

.hero-search__btn:hover {
  background: var(--color-primary-dark);
  color: #fff !important;
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .hero-search {
    max-width: none;
    width: calc(100% + 7rem);
    margin-left: -1.5rem;
    margin-right: -1.5rem;
    padding: 0 1.5rem;
  }
  .hero-search__bar {
    flex-direction: column;
    padding: 1rem;
    border-radius: 16px;
  }
  .hero-search__field { flex: 1 1 100%; }
  .hero-search__btn { width: 100%; justify-content: center; }
}

@keyframes floatGlobo {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(8px, -15px) scale(1.02); }
  50% { transform: translate(-5px, -8px) scale(0.98); }
  75% { transform: translate(12px, -20px) scale(1.01); }
}

.hero__content {
  position: relative;
  text-align: left;
  z-index: 1;
  width: 100%;
}

.hero__content .container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.hero__welcome {
  font-family: 'Outfit', system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 0.5rem;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
}

.hero__title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 1.2;
  margin-bottom: 1rem;
  color: #fff;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
}

.hero__text {
  font-family: 'Outfit', system-ui, sans-serif;
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.95);
  max-width: 540px;
  margin: 0 0 1.5rem;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.3);
}

.hero__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.hero__ctas .btn-outline {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.9);
}

.hero__ctas .btn-outline:hover {
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  border-color: #fff;
}

.hero__note {
  font-size: 0.9rem;
  font-family: 'Outfit', system-ui, sans-serif;
  color: rgba(255, 255, 255, 0.9);
  max-width: 540px;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
}

.hero__scroll-text {
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.8);
}

.hero__scroll-line {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, var(--color-primary), transparent);
}

.experience-intro {
  position: relative;
}

.experience-intro__text {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  font-size: 1.1rem;
  color: var(--color-text-muted);
  line-height: 1.8;
}

.experience-dawn {
  background: var(--color-bg);
}

.experience-dawn__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

@media (max-width: 900px) {
  .experience-dawn__grid {
    grid-template-columns: 1fr;
  }
}

.experience-dawn__title {
  font-size: 1.75rem;
  font-family: 'Outfit', system-ui, sans-serif;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.experience-dawn__sub {
  color: var(--color-primary);
  margin: 1.25rem 0 0.5rem;
}

.experience-dawn__content ul {
  list-style: none;
  padding-left: 0;
}

.experience-dawn__content li {
  padding: 0.25rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.experience-dawn__content li::before {
  content: '✦';
  color: var(--color-primary);
  position: absolute;
  left: 0;
}

.experience-dawn__content p {
  margin-bottom: 1rem;
  color: var(--color-text-muted);
}

.experience-dawn__content .btn {
  margin-top: 0.5rem;
}

.experience-dawn__img {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.12);
}

.experience-dawn__img img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

/* Servicios Premium - carrusel infinito auto-deslizante */
.services-section {
  background: linear-gradient(180deg, #fff 0%, #fafaf8 100%);
}

.services-section__title {
  font-family: 'Outfit', system-ui, sans-serif;
}

.services-carousel-viewport {
  overflow: hidden;
  padding: 0.5rem 0;
}

.services-carousel-track {
  display: flex;
  width: max-content;
  animation: servicesScroll 35s linear infinite;
}

.services-carousel-track:hover {
  animation-play-state: paused;
}

.services-carousel-set {
  display: flex;
  gap: 1.25rem;
  flex-shrink: 0;
}

@keyframes servicesScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.services-card {
  flex: 0 0 280px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(214, 151, 49, 0.2);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.services-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(214, 151, 49, 0.15);
}

.services-card__img {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.services-card__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.services-card__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), rgb(0 0 0 / 0%))
}

.services-card__icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  object-fit: contain;
  filter: brightness(0) invert(1);
  opacity: 0.95;
}

.services-card__label {
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.02em;
  text-align: center;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
}

.testimonial {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(214, 151, 49, 0.08), rgba(13, 59, 102, 0.1));
}

.testimonial__video-wrap {
  position: absolute;
  inset: 0;
}

.testimonial__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.testimonial__video-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(13, 59, 102, 0.6) 100%);
}

.testimonial__content {
  position: relative;
  z-index: 1;
}

.testimonial .section-title,
.testimonial .testimonial__badge,
.testimonial .testimonial__grid {
  position: relative;
}

.testimonial:has(.testimonial__video-wrap) .section-title,
.testimonial:has(.testimonial__video-wrap) .testimonial__badge {
  color: #fff;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.testimonial:has(.testimonial__video-wrap) .testimonial-card {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(8px);
}

.testimonial__title {
  margin-bottom: 0.5rem;
}

.testimonial__badge {
  text-align: center;
  font-size: 0.95rem;
  color: var(--color-primary);
  font-weight: 600;
  margin-bottom: 2rem;
}

.testimonial-carousel-viewport {
  overflow: hidden;
  padding: 0.5rem 0;
}

.testimonial-carousel-track {
  display: flex;
  width: max-content;
  animation: testimonialScroll 40s linear infinite;
}

.testimonial-carousel-track:hover {
  animation-play-state: paused;
}

.testimonial-carousel-set {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

@keyframes testimonialScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.testimonial-card__avatar-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-weight: 700;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  overflow: hidden;
  flex-shrink: 0;
}
.testimonial-card__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.testimonial-card {
  flex: 0 0 310px;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(8px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(214, 151, 49, 0.2);
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(214, 151, 49, 0.12);
}

.testimonial-card__quotes {
  font-size: 2rem;
  font-family: 'Outfit', system-ui, sans-serif;
  color: var(--color-primary);
  opacity: 0.4;
  line-height: 1;
  position: absolute;
  top: 1rem;
  left: 1.25rem;
}

.testimonial-card__quote {
  font-size: 1rem;
  color: var(--color-text);
  line-height: 1.6;
  margin: 1.5rem 0 1rem;
  font-style: italic;
}

.testimonial-card__author {
  display: block;
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.9rem;
  font-style: normal;
}

/* Paquetes - Cards clickeables */
.paquetes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
  border-color: rgba(214, 151, 49, 0.15);
}

.paquete-card__img {
  height: 280px;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
}

.paquete-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.5), transparent 50%);
}

.paquete-card__hover-info {
  position: absolute;
  inset: 0;
background: rgb(0 0 0 / 65%);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.3s;
}

.paquete-card:hover .paquete-card__hover-info {
  opacity: 1;
}

.paquete-card__hover-desc {
  color: #fff;
  font-size: 0.85rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.paquete-card__hover-incluye {
  list-style: none;
  padding: 0;
  margin: 0;
  color: rgba(255,255,255,0.95);
  font-size: 0.8rem;
  line-height: 1.5;
}

.paquete-card__hover-incluye li {
  padding: 0.15rem 0;
}

.paquete-card__body {
  padding: 1.25rem;
}

.paquete-card__name {
  font-size: 1.2rem;
  font-family: 'Outfit', system-ui, sans-serif;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.paquete-card__price {
  font-size: 1.3rem;
  color: var(--color-primary);
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.paquete-card__cta {
  font-size: 0.9rem;
  color: var(--color-primary);
  font-weight: 600;
  transition: transform 0.3s;
}

.paquete-card:hover .paquete-card__cta {
  transform: translateX(6px);
}

/* Blog home section */
.blog-home {
  background: linear-gradient(180deg, #fefcf8 0%, #f8f5f0 100%);
  position: relative;
  overflow: hidden;
}

.blog-home__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
.blog-home__card {
  display: block;
  text-decoration: none;
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
}
.blog-home__card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(214, 151, 49, 0.12);
  border-color: rgba(214, 151, 49, 0.25);
}
.blog-home__img {
  height: 180px;
  background-size: cover;
  background-position: center;
}
.blog-home__img--placeholder {
  background: var(--color-primary);
  opacity: 0.4;
}
.blog-home__body {
  padding: 1.25rem;
}
.blog-home__title {
  font-size: 1.15rem;
  font-family: 'Outfit', system-ui, sans-serif;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.blog-home__excerpt {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.blog-home__date {
  font-size: 0.8rem;
  color: var(--color-primary);
  font-weight: 500;
}
</style>
