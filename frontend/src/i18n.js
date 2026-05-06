import { createI18n } from 'vue-i18n'
import es from '../locales/es.json'
import en from '../locales/en.json'

function getDefaultLocale() {
  const navLang = navigator.language || navigator.userLanguage || 'es'
  const lang = navLang.split('-')[0]
  return ['es', 'en'].includes(lang) ? lang : 'es'
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'es',
  messages: {
    es,
    en
  }
})

export default i18n