<template>
  <section class="w-full md:w-1/2 p-6">
    <!-- Language Selector -->
    <div class="p-4 absolute top-0 right-0 rtl:right-auto rtl:left-4 z-50 flex items-center space-x-2">
      <LanguageMenu />
      <!-- Theme Toggle -->
      <button @click="toggleTheme"
        class="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-all duration-200 group">
        <svg v-if="isDarkMode"
          class="w-5 h-5 text-primary-500 transition-transform duration-500 transform group-hover:rotate-180"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <svg v-else class="w-5 h-5 text-primary-500 transition-transform duration-500 transform group-hover:rotate-180"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>
    </div>

    <div class="w-32 mx-auto flex justify-center items-center mb-6">
      <img src="https://static.vecteezy.com/system/resources/thumbnails/022/832/845/small/speech-bubble-3d-icon-illustration-communication-dialog-bubble-png.png" alt="">
    </div>

    <!-- Forgot Password Form -->
    <form @submit.prevent="handleForgotPassword" class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
          {{ $t('auth.forgotPassword') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 text-center mb-8">
          {{ $t('auth.forgotPasswordDescription') }}
        </p>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ $t('auth.email') }}
        </label>
        <div class="mt-1">
          <input id="email" v-model="email" type="email" required
            class="appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
            :placeholder="$t('auth.emailPlaceholder')" />
        </div>
      </div>

      <div>
        <button type="submit" :disabled="loading"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
          <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {{ loading ? $t('common.loading') : $t('auth.sendResetLink') }}
        </button>
      </div>
    </form>

    <p class="text-center mt-3 text-sm text-gray-600 dark:text-gray-400">
      {{ $t('auth.rememberPassword') }}
      <router-link to="/login"
        class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
        {{ $t('auth.login') }}
      </router-link>
    </p>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import LanguageMenu from '@/components/LanguageMenu.vue'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
const { isDarkMode, toggleTheme } = useTheme()

const email = ref('')
const loading = ref(false)

const handleForgotPassword = async () => {
  try {
    loading.value = true
    await authStore.sendPasswordResetEmail(email.value)
    Swal.fire({
      icon: 'success',
      title: t('auth.resetLinkSent'),
      text: t('auth.resetLinkSentDescription'),
      confirmButtonText: t('common.ok'),
      confirmButtonColor: '#7c3aed'
    })
    router.push('/login')
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: t('common.error'),
      text: error.message,
      confirmButtonText: t('common.ok'),
      confirmButtonColor: '#7c3aed'
    })
  } finally {
    loading.value = false
  }
}
</script>