import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import pt from './locales/pt.json'

const savedLocale = localStorage.getItem('vonnavi-locale') || 'es'

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'es',
  messages: {
    es,
    en,
    fr,
    pt
  }
})

export const locales = [
  { code: 'es', name: 'ES Español', shortCode: 'ES' },
  { code: 'en', name: 'English', shortCode: 'GB' },
  { code: 'fr', name: 'Français', shortCode: 'FR' },
  { code: 'pt', name: 'Português', shortCode: 'BR' }
]
