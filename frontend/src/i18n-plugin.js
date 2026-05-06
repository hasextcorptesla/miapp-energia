import { useI18n } from './i18n-simple'

export default {
  install(app) {
    const { t } = useI18n()
    app.config.globalProperties.$t = t
    app.provide('i18n', { t })
  }
}