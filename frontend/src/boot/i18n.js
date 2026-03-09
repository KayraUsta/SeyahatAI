import { createI18n } from 'vue-i18n'
import en from 'src/i18n/en'
import tr from 'src/i18n/tr'

const i18n = createI18n({
  locale: 'tr',
  fallbackLocale: 'en',
  legacy: false,
  globalInjection: true,
  messages: { tr, en }
})

export default ({ app }) => {
  app.use(i18n)
}

export { i18n }
