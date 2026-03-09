<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { locales } from '../i18n'
import flagMexico from '@/assets/images/flags/mexico.png'
import flagFrance from '@/assets/images/flags/france.png'
import flagUnitedStates from '@/assets/images/flags/united-states.png'
import flagBrazil from '@/assets/images/flags/brazil.png'

const flagByCode = { es: flagMexico, fr: flagFrance, en: flagUnitedStates, pt: flagBrazil }

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
      <img
        :src="flagByCode[currentLocale.code]"
        :alt="currentLocale.name"
        class="lang-switcher__flag"
      />
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
          <img
            v-if="flagByCode[loc.code]"
            :src="flagByCode[loc.code]"
            :alt="loc.name"
            class="lang-switcher__option-flag"
          />
          <span class="lang-switcher__option-name">{{ loc.name }}</span>
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
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  color: #2d2d2d;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.lang-switcher__trigger:hover {
  background: #fafaf8;
  border-color: rgba(0, 0, 0, 0.12);
}

.lang-switcher__flag {
  width: 22px;
  height: 16px;
  object-fit: cover;
  border-radius: 3px;
  flex-shrink: 0;
}

.lang-switcher__chevron {
  margin-left: 0.15rem;
  transition: transform 0.25s;
  color: #666;
}

.lang-switcher__chevron--open {
  transform: rotate(180deg);
}

.lang-switcher__dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 160px;
  background: #fefcf8;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 0.4rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  z-index: 100;
}

.lang-switcher__option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem 0.9rem;
  border: none;
  background: transparent;
  color: #444;
  font-size: 0.9rem;
  text-align: left;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-switcher__option:hover {
  background: rgba(214, 151, 49, 0.08);
}

.lang-switcher__option--active {
  background: rgba(214, 151, 49, 0.12);
}

.lang-switcher__option-flag {
  width: 22px;
  height: 16px;
  object-fit: cover;
  border-radius: 3px;
  flex-shrink: 0;
}

.lang-switcher__option--active .lang-switcher__option-name {
  color: #2d2d2d;
  font-weight: 500;
}

.lang-switcher__option-name {
  color: #555;
}

.lang-drop-enter-active,
.lang-drop-leave-active {
  transition: all 0.2s ease;
}

.lang-drop-enter-from,
.lang-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
