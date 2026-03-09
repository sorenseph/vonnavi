<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { supabase } from '../lib/supabase'
import LanguageSwitcher from './LanguageSwitcher.vue'
import logoImg from '@/assets/logo/7CotyrWR5Rxspd32kh56jj2tdNk.png'

const route = useRoute()
const { t } = useI18n()
const menuOpen = ref(false)
const user = ref(null)

supabase.auth.getSession().then(({ data: { session } }) => {
  user.value = session?.user
})
supabase.auth.onAuthStateChange((_, session) => {
  user.value = session?.user
})

const navLinks = [
  { path: '/', labelKey: 'nav.home' },
  { path: '/vonnavi', labelKey: 'nav.about' },
  { path: '/paquetes', labelKey: 'nav.packages' },
  { path: '/blog', labelKey: 'nav.blog' },
  { path: '/reservar', labelKey: 'nav.reserve' },
  { path: '/admin', labelKey: 'nav.admin', auth: true }
]

const filteredLinks = computed(() =>
  navLinks.filter(link => !link.auth || user.value)
)
</script>

<template>
  <header class="header-ref">
    <div class="container header-ref__inner">
      <router-link to="/" class="header-ref__brand">
        <img :src="logoImg" alt="Von Navi" class="header-ref__logo" />
      </router-link>

      <button
        class="header-ref__hamburger"
        :class="{ 'header-ref__hamburger--open': menuOpen }"
        aria-label="Menú"
        @click="menuOpen = !menuOpen"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav
        class="header-ref__nav"
        :class="{ 'header-ref__nav--open': menuOpen }"
      >
        <template v-for="link in filteredLinks" :key="link.path">
          <div v-if="link.subLinks" class="header-ref__dropdown">
            <span class="header-ref__link" :class="{ 'header-ref__link--active': link.subLinks.some(s => route.path === s.path) }">
              {{ t(link.labelKey) }} ▾
            </span>
            <div class="header-ref__dropdown-menu">
              <router-link v-for="s in link.subLinks" :key="s.path" :to="s.path" class="header-ref__dropdown-item" @click="menuOpen = false">
                {{ t(s.labelKey) }}
              </router-link>
            </div>
          </div>
          <router-link
            v-else
            :to="link.path"
            class="header-ref__link"
            :class="{ 'header-ref__link--active': route.path === link.path || (link.path !== '/' && route.path.startsWith(link.path)) }"
            @click="menuOpen = false"
          >
            {{ t(link.labelKey) }}
          </router-link>
        </template>
        <LanguageSwitcher class="header-ref__lang" />
        <router-link v-if="!user" to="/login" class="header-ref__btn-login">
          {{ t('nav.login') }}
        </router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header-ref {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

.header-ref__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
}

.header-ref__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
}

.header-ref__logo {
  height: 48px;
  width: auto;
  object-fit: contain;
}

.header-ref__brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.header-ref__title {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--color-text);
}

.header-ref__tagline {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.header-ref__nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-ref__link {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  transition: color 0.2s;
}

.header-ref__link:hover,
.header-ref__link--active {
  color: var(--color-primary);
}

.header-ref__btn-login {
  padding: 0.5rem 1.25rem;
  background: #2d2d2d;
  color: #fff !important;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.2s;
}

.header-ref__btn-login:hover {
  background: #1a1a1a;
}

.header-ref__hamburger {
  display: none;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
}
.header-ref__hamburger span {
  width: 24px;
  height: 2px;
  background: #333;
  border-radius: 1px;
  transition: all 0.3s;
}
.header-ref__hamburger--open span:nth-child(1) {
  transform: rotate(45deg) translateY(8px);
}
.header-ref__hamburger--open span:nth-child(2) {
  opacity: 0;
}
.header-ref__hamburger--open span:nth-child(3) {
  transform: rotate(-45deg) translateY(-8px);
}

.header-ref__dropdown { position: relative; }
.header-ref__dropdown:hover .header-ref__dropdown-menu { opacity: 1; visibility: visible; }
.header-ref__dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0.5rem;
  min-width: 140px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
  padding: 0.5rem;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  z-index: 100;
}
.header-ref__dropdown-item {
  display: block;
  padding: 0.6rem 1rem;
  color: var(--color-text);
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9rem;
}
.header-ref__dropdown-item:hover {
  background: rgba(214, 151, 49, 0.1);
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .header-ref__hamburger { display: flex; }
  .header-ref__dropdown { display: flex; flex-direction: column; }
  .header-ref__dropdown .header-ref__link { cursor: default; }
  .header-ref__dropdown .header-ref__dropdown-menu {
    position: static;
    transform: none;
    opacity: 1;
    visibility: visible;
    box-shadow: none;
    margin: 0.25rem 0 0;
    padding: 0;
  }
  .header-ref__nav {
    position: absolute;
    top: 80px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    padding: 1.5rem;
    background: rgba(255,255,255,0.98);
    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s;
  }
  .header-ref__nav--open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
