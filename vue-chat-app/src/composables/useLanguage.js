import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export function useLanguage() {
  const { locale } = useI18n()
  const currentLocale = ref(locale.value)

  watch(currentLocale, (newLocale) => {
    locale.value = newLocale
    localStorage.setItem('language', newLocale)
  })

  const changeLocale = (event) => {
    currentLocale.value = event.target.value
  }

  // Initialize from localStorage if available
  const savedLocale = localStorage.getItem('language')
  if (savedLocale) {
    currentLocale.value = savedLocale
  }

  return {
    currentLocale,
    changeLocale
  }
} 