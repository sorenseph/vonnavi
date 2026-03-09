<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { locales } from '../i18n'

const { locale } = useI18n()
const open = ref(false)

const currentLocale = computed(() =>
  locales.find(l => l.code === locale.value) || locales[0]
)

function setLocale(code) {
  locale.value = code
  localStorage.setItem('vonnavi-locale', code)
  open.value = false
}

function handleClickOutside(e) {
  if (!e.target.closest('.lang-switcher')) open.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div class="lang-switcher">
    <button
      class="lang-switcher__trigger"
      :aria-label="currentLocale.name"
      @click="open = !open"
    >
      <svg class="lang-switcher__globe" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
      <span class="lang-switcher__flag">{{ currentLocale.flag }}</span>
      <span class="lang-switcher__name">{{ currentLocale.name }}</span>
      <svg class="lang-switcher__chevron" :class="{ 'lang-switcher__chevron--open': open }" width="12" height="12" viewBox="0 0 12 12">
        <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
    </button>
    <Transition name="lang-drop">
      <div v-if="open" class="lang-switcher__dropdown">
        <button
          v-for="loc in locales"
          :key="loc.code"
          class="lang-switcher__option"
          :class="{ 'lang-switcher__option--active': locale === loc.code }"
          @click="setLocale(loc.code)"
        >
          <span class="lang-switcher__flag">{{ loc.flag }}</span>
          <span>{{ loc.name }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.lang-switcher {
  position: relative;
}

.lang-switcher__trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(248, 248, 248, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  color: var(--color-text);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;
}

.lang-switcher__trigger:hover {
  background: rgba(214, 151, 49, 0.15);
  border-color: var(--color-primary);
}

.lang-switcher__globe {
  flex-shrink: 0;
  color: var(--color-primary);
}

.lang-switcher__flag {
  font-size: 1.1rem;
  line-height: 1;
}

.lang-switcher__name {
  font-weight: 500;
}

.lang-switcher__chevron {
  margin-left: 0.25rem;
  transition: transform 0.25s;
  color: var(--color-text-muted);
}

.lang-switcher__chevron--open {
  transform: rotate(180deg);
}

.lang-switcher__dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 180px;
  background: var(--color-bg);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.12);
  z-index: 100;
}

.lang-switcher__option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.7rem 1rem;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 0.95rem;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-switcher__option:hover {
  background: rgba(214, 151, 49, 0.08);
}

.lang-switcher__option--active {
  color: var(--color-primary);
  background: rgba(214, 151, 49, 0.12);
  font-weight: 600;
}

.lang-drop-enter-active,
.lang-drop-leave-active {
  transition: all 0.2s ease;
}

.lang-drop-enter-from,
.lang-drop-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
