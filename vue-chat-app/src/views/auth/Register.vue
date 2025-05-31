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

    <!-- Registration Form -->
    <form @submit.prevent="handleRegister" class="space-y-6">
      <div>
        <label for="displayName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ $t('auth.displayName') }}
        </label>
        <div class="mt-1 ">
          <input id="displayName" v-model="form.displayName" type="text" required
            class="appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
            :placeholder="$t('auth.displayNamePlaceholder')" />
        </div>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ $t('auth.email') }}
        </label>
        <div class="mt-1">
          <input id="email" v-model="form.email" type="email" required
            class="appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
            :placeholder="$t('auth.emailPlaceholder')" />
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ $t('auth.password') }}
        </label>
        <div class="mt-1 relative">
          <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" required
            class="appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
            :placeholder="$t('auth.passwordPlaceholder')" />
          <button type="button" @click="showPassword = !showPassword"
            class="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pr-0 rtl:pl-3 flex items-center">
            <svg v-if="showPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </button>
        </div>
      </div>

      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ $t('auth.confirmPassword') }}
        </label>
        <div class="mt-1 relative">
          <input id="confirmPassword" v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
            required
            class="appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
            :placeholder="$t('auth.confirmPasswordPlaceholder')" />
          <button type="button" @click="showConfirmPassword = !showConfirmPassword"
            class="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pr-0 rtl:pl-3 flex items-center">
            <svg v-if="showConfirmPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </button>
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
          {{ loading ? $t('common.loading') : $t('auth.register') }}
        </button>
      </div>

      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-gray-50 dark:bg-dark-900 text-gray-500">{{ $t('auth.or') }}</span>
        </div>
      </div>

      <div>
        <button type="button" @click="handleGoogleRegister" :disabled="loading"
          class="w-full flex items-center justify-center py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
          <img src="@/assets/google.svg" alt="Google" class="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
          {{ $t('auth.signUpWithGoogle') }}
        </button>
      </div>
    </form>

    <p class="text-center mt-3 text-sm text-gray-600 dark:text-gray-400">
      {{ $t('auth.haveAccount') }}
      <router-link to="/login"
        class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
        {{ $t('auth.login') }}
      </router-link>
    </p>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
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

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const isPasswordMatch = computed(() => {
  return form.password === form.confirmPassword && form.password.length >= 6
})

const handleRegister = async () => {
  if (!isPasswordMatch.value) {
    Swal.fire({
      icon: 'error',
      title: t('common.error'),
      text: t('auth.passwordsDoNotMatch')
    })
    return
  }

  try {
    loading.value = true
    await authStore.register(form.email, form.password, form.displayName)
    router.push('/')
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: t('common.error'),
      text: error.message
    })
  } finally {
    loading.value = false
  }
}

const handleGoogleRegister = async () => {
  try {
    loading.value = true
    await authStore.loginWithGoogle()
    router.push('/')
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: t('common.error'),
      text: error.message
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dark .dark\:bg-dark-800 {
  background-color: #1f2937;
}

.dark .dark\:text-white {
  color: #ffffff;
}

.dark .dark\:border-gray-600 {
  border-color: #4b5563;
}

.dark .dark\:bg-dark-700 {
  background-color: #374151;
}

.dark .dark\:hover\:bg-dark-600:hover {
  background-color: #4b5563;
}
</style>