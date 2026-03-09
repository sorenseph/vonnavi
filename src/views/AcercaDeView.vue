<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSeo } from '../composables/useSeo'
import { useScrollReveal } from '../composables/useScrollReveal'
import globoColorido from '@/assets/globos/pngtree-beautiful-colorful-hot-air-balloon-isolated-on-white-background-png-image_11928860.png'
import globoDoble from '@/assets/globos/transparent-of-two-hot-air-balloons-png.png'

const { t, tm } = useI18n()
useScrollReveal()

useSeo({
  title: 'Acerca De Von Navi | Vuelo en Globo Teotihuacán',
  description: 'Conoce Globopuerto Von Navi. Experiencias únicas e inolvidables en vuelo en globo sobre Teotihuacán. Misión, visión y lo que dicen nuestros clientes.'
})

const videoModules = import.meta.glob('@/assets/images/wallpapervideo/*.mp4', { eager: true, import: 'default' })
const wallpaperImg = import.meta.glob('@/assets/images/wallpapervideo/*.{jpg,jpeg,png,avif}', { eager: true, import: 'default' })
const heroVideo = Object.values(videoModules)[0] || null
const heroBgImg = Object.values(wallpaperImg)[0] || null

const clientTestimonials = [
  { quote: 'Estuve buscando una empresa segura, y sobre todo que me lo demostrara, ahora puedo decir que Von Navi Vuelos en Globo es la mejor empresa para realizar esta actividad.', author: 'Roger Newland', role: 'Designer' },
  { quote: 'La Mejor Vista de Teotihuacán desde el globo más imponente, definitivamente mi mejor experiencia de vida!', author: 'Sara G. Helvey', role: 'Teacher' },
  { quote: 'Toda mi familia se quedó sorprendida de lo profesional y excelente del vuelo en globo, vamos a regresar el próximo año', author: 'Katheryn Thrall', role: 'Entrepreneur' }
]

// Carrusel intro: slides con el texto completo
const introSlides = [
  'En Globopuerto Von Navi, cada vuelo se convierte en una experiencia única e inolvidable.',
  'Gracias al cuidado y dedicación de nuestro equipo, nos aseguramos de que cada cliente disfrute de cada momento.',
  'Transmitiendo nuestro compromiso y pasión en todo lo que hacemos.'
]

const carouselIndex = ref(0)
let carouselInterval = null

onMounted(() => {
  carouselInterval = setInterval(() => {
    carouselIndex.value = (carouselIndex.value + 1) % introSlides.length
  }, 4000)
})

onUnmounted(() => {
  if (carouselInterval) clearInterval(carouselInterval)
})

const globosFlotantes = [
  { src: globoColorido, top: '8%', right: '10%', size: '6%', delay: '0s' },
  { src: globoDoble, top: '45%', left: '5%', size: '7%', delay: '2s' },
  { src: globoColorido, bottom: '15%', right: '8%', size: '5%', delay: '1s' },
  { src: globoDoble, top: '70%', right: '15%', size: '6%', delay: '3s' }
]

const faqItems = computed(() => tm('about.faq') || [])
const faqOpen = ref(null)

function toggleFaq(i) {
  faqOpen.value = faqOpen.value === i ? null : i
}
</script>

<template>
  <div class="about-page">
    <!-- Hero -->
    <section class="about-hero">
      <div v-if="heroVideo" class="about-hero__media">
        <video autoplay muted loop playsinline>
          <source :src="heroVideo" type="video/mp4" />
        </video>
      </div>
      <div v-else-if="heroBgImg" class="about-hero__media about-hero__media--img" :style="{ backgroundImage: `url(${heroBgImg})` }"></div>
      <div v-else class="about-hero__media about-hero__media--fallback"></div>
      <div class="about-hero__overlay"></div>
      <h1 class="about-hero__title">{{ t('about.title') }}</h1>
    </section>

    <!-- Intro carrusel + Misión -->
    <section class="about-section about-section--alt">

      <div class="container">
        <div class="about-intro-carousel animate-on-scroll">
          <div class="about-intro-carousel__track">
            <p
              v-for="(slide, i) in introSlides"
              :key="i"
              class="about-intro-carousel__slide"
              :class="{ 'about-intro-carousel__slide--active': carouselIndex === i }"
            >
              {{ slide }}
            </p>
          </div>
          <div class="about-intro-carousel__dots">
            <button
              v-for="(_, i) in introSlides"
              :key="i"
              type="button"
              :aria-label="`Slide ${i + 1}`"
              class="about-intro-carousel__dot"
              :class="{ 'about-intro-carousel__dot--active': carouselIndex === i }"
              @click="carouselIndex = i"
            />
          </div>
        </div>
        <router-link to="/reservar" class="btn btn-primary about-cta">{{ t('about.reserveCta') }}</router-link>
        <div class="about-mission animate-on-scroll">
          <h2>{{ t('about.missionTitle') }}</h2>
          <p>{{ t('about.missionText') }}</p>
        </div>
      </div>
    </section>

    <!-- Visión -->
    <section class="about-section section-bg-warm">
      <div class="container about-vision animate-on-scroll">
        <h2>{{ t('about.visionTitle') }}</h2>
        <p>{{ t('about.visionText') }}</p>
      </div>
    </section>

    <!-- Clientes -->
    <section class="about-section about-section--alt">
      <div class="container">
        <h2 class="section-title">{{ t('about.clientsTitle') }}</h2>
        <div class="about-testimonials">
          <div v-for="(item, i) in clientTestimonials" :key="i" class="about-testimonial animate-on-scroll">
            <blockquote>"{{ item.quote }}"</blockquote>
            <cite>— {{ item.author }} <span class="about-testimonial__role">{{ item.role }}</span></cite>
          </div>
        </div>
      </div>
    </section>

    <!-- Ubicación -->
    <section class="about-section section-bg-pattern">
      <div class="container">
        <h2 class="section-title animate-on-scroll">{{ t('about.locationTitle') }}</h2>
        <p class="section-subtitle animate-on-scroll">Globopuerto Von Navi · Teotihuacán, Estado de México</p>
        <div class="about-location animate-on-scroll">
          <div class="about-location__map">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-98.88%2C19.65%2C-98.78%2C19.72&layer=mapnik&marker=19.6925%2C-98.8439"
              width="100%"
              height="320"
              style="border:0;border-radius:20px;"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Ubicación Von Navi Teotihuacán"
            ></iframe>
          </div>
          <div class="about-location__card">
            <div class="about-location__card-inner">
              <h3 class="about-location__card-title">{{ t('footer.contact') }}</h3>
              <div class="about-location__item">
                <span class="about-location__icon">📍</span>
                <p class="about-location__address">{{ t('footer.addressValue') }}</p>
              </div>
              <div class="about-location__item">
                <span class="about-location__icon">📞</span>
                <a href="tel:+525535501265">(+52) 55 3550 1265</a>
              </div>
              <div class="about-location__item">
                <span class="about-location__icon">✉️</span>
                <a href="mailto:ventas@vonnavi.com.mx">ventas@vonnavi.com.mx</a>
              </div>
              <a href="https://www.google.com/maps/search/?api=1&query=19.6925,-98.8439" target="_blank" rel="noopener" class="btn btn-primary about-location__btn">
                Ver en Google Maps →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="about-section section-bg-warm">
      <div class="container">
        <h2 class="section-title animate-on-scroll">{{ t('about.faqTitle') }}</h2>
        <div class="about-faq">
          <div
            v-for="(item, i) in faqItems"
            :key="i"
            class="about-faq__item animate-on-scroll"
            :class="{ 'about-faq__item--open': faqOpen === i }"
          >
            <button type="button" class="about-faq__question" @click="toggleFaq(i)">
              <span>{{ item.q }}</span>
              <span class="about-faq__icon">{{ faqOpen === i ? '−' : '+' }}</span>
            </button>
            <Transition name="faq">
              <div v-show="faqOpen === i" class="about-faq__answer">
                <p>{{ item.a }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  padding-top: 80px;
}

.about-hero {
  position: relative;
  min-height: 55vh;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
}

.about-hero__media {
  position: absolute;
  inset: 0;
}

.about-hero__media video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-hero__media--img {
  background-size: cover;
  background-position: center;
}

.about-hero__media--fallback {
  background: linear-gradient(135deg, var(--color-sky), var(--color-sky-light));
}

.about-hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(13,59,102,0.75) 0%, rgba(214,151,49,0.2) 40%, transparent 70%);
}

.about-hero__title {
  position: relative;
  z-index: 1;
  color: #fff;
  font-size: clamp(2.25rem, 5vw, 3.75rem);
  padding: 2.5rem 2rem;
  text-shadow: 0 2px 24px rgba(0,0,0,0.5);
  font-family: 'Outfit', system-ui, sans-serif;
}

.about-section {
  padding: 5rem 0;
  position: relative;
}

.about-section--alt {
  background: linear-gradient(180deg, #fefcf8 0%, #f8f5f0 100%);
}

.about-section__globos {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.about-globo {
  position: absolute;
  width: var(--g-size, 6%);
  top: var(--g-top, auto);
  left: var(--g-left, auto);
  right: var(--g-right, auto);
  bottom: var(--g-bottom, auto);
  opacity: 0.75;
  object-fit: contain;
  animation: floatGlobo 18s ease-in-out infinite;
  animation-delay: var(--g-delay, 0s);
}

@keyframes floatGlobo {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(10px, -12px); }
  66% { transform: translate(-8px, -6px); }
}

/* Carrusel intro */
.about-intro-carousel {
  position: relative;
  min-height: 120px;
  margin-bottom: 2rem;
}

.about-intro-carousel__track {
  position: relative;
}

.about-intro-carousel__slide {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  font-size: 1.25rem;
  line-height: 1.9;
  max-width: 800px;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.5s, transform 0.5s;
  pointer-events: none;
}

.about-intro-carousel__slide--active {
  position: relative;
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.about-intro-carousel__dots {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.about-intro-carousel__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s;
}

.about-intro-carousel__dot:hover,
.about-intro-carousel__dot--active {
  background: var(--color-primary);
}

.about-cta {
  margin-bottom: 2rem;
}

.about-mission {
  margin-top: 3rem;
}

.about-mission {
  background: #fff;
  padding: 2.5rem 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  border-left: 4px solid var(--color-primary);
}

.about-mission h2,
.about-section h2 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.about-section--alt .about-section h2:first-child,
.about-section .container > h2:first-child {
  margin-top: 0;
}

/* Visión con card */
.about-vision {
  background: #fff;
  padding: 2.5rem 3rem;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  border: 1px solid rgba(214, 151, 49, 0.12);
}

.about-testimonials {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.about-testimonial {
  background: #fff;
  padding: 2rem;
  border-radius: 20px;
  border-left: 4px solid var(--color-primary);
  box-shadow: 0 8px 32px rgba(0,0,0,0.06);
  transition: transform 0.35s, box-shadow 0.35s;
}

.about-testimonial:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(214, 151, 49, 0.12);
}

.about-testimonial blockquote {
  font-style: italic;
  margin-bottom: 1rem;
}

.about-testimonial__role {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

/* Ubicación */
.section-subtitle {
  text-align: center;
  color: var(--color-text-muted);
  margin-bottom: 2.5rem;
  font-size: 1.05rem;
}

.about-location {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2.5rem;
  margin-top: 1rem;
  align-items: stretch;
}

@media (max-width: 900px) {
  .about-location {
    grid-template-columns: 1fr;
  }
}

.about-location__map {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(0,0,0,0.1);
  min-height: 320px;
  background: #e8e8e8;
}

.about-location__map iframe {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 320px;
}

.about-location__card {
  display: flex;
  align-items: stretch;
}

.about-location__card-inner {
  width: 100%;
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 12px 40px rgba(0,0,0,0.08);
  border: 1px solid rgba(214, 151, 49, 0.15);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.about-location__card-title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-size: 1.35rem;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.about-location__item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.about-location__icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.about-location__address,
.about-location__item a {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);
  text-decoration: none;
}

.about-location__item a:hover {
  color: var(--color-primary);
}

.about-location__btn {
  margin-top: auto;
  width: 100%;
  justify-content: center;
}

/* FAQ acordeón */
.about-faq {
  max-width: 750px;
  margin-top: 2rem;
}

.about-faq__item {
  background: #fff;
  border-radius: 16px;
  margin-bottom: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  transition: box-shadow 0.3s;
}

.about-faq__item:hover {
  box-shadow: 0 8px 28px rgba(214, 151, 49, 0.12);
}

.about-faq__item--open {
  box-shadow: 0 8px 32px rgba(214, 151, 49, 0.15);
}

.about-faq__question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-text);
  font-family: inherit;
  transition: color 0.3s;
}

.about-faq__question:hover {
  color: var(--color-primary);
}

.about-faq__icon {
  font-size: 1.5rem;
  color: var(--color-primary);
  flex-shrink: 0;
  margin-left: 1rem;
}

.about-faq__answer {
  border-top: 1px solid rgba(0,0,0,0.08);
}

.about-faq__answer p {
  padding: 1rem 1.5rem 1.25rem;
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.7;
}

.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
