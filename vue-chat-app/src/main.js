import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import './assets/main.css'

// Import translations
import en from './locales/en.json'
import ja from './locales/ja.json'
import zh from './locales/zh.json'
import th from './locales/th.json'
import ko from './locales/ko.json'
import my from './locales/my.json'

// Create Vue app
const app = createApp(App)

// Create Pinia store
const pinia = createPinia()
app.use(pinia)

// Initialize auth store
const authStore = useAuthStore()
await authStore.init()

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'en',
  messages: {
    en,    // English
    ja,    // Japanese
    zh,    // Chinese
    th,    // Thai
    ko,    // Korean
    my     // Burmese
  }
})
app.use(i18n)

// Use router
app.use(router)

// Mount app
app.mount('#app')
