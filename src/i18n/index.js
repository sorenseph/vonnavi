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
  { code: 'es', name: 'ES Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' }
]
