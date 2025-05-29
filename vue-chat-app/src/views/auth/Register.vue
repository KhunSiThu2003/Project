<template>
  <div class="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 ">
    <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
      <div>
        <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Create Account
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('auth.displayName') }}
            </label>
            <div class="relative">
              <input
                id="displayName"
                v-model="displayName"
                name="displayName"
                type="text"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                :placeholder="t('auth.displayName')"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <i class="fas fa-user text-gray-400"></i>
              </div>
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('auth.email') }}
            </label>
            <div class="relative">
              <input
                id="email"
                v-model="email"
                name="email"
                type="email"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                :placeholder="t('auth.email')"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <i class="fas fa-envelope text-gray-400"></i>
              </div>
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('auth.password') }}
            </label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                name="password"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700 pr-10"
                :placeholder="t('auth.password')"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 focus:outline-none"
                :title="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
            <!-- Password strength indicator -->
            <div class="mt-1">
              <div class="h-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  class="h-full transition-all duration-300"
                  :class="passwordStrengthClass"
                  :style="{ width: passwordStrength + '%' }"
                ></div>
              </div>
              <p class="mt-1 text-xs" :class="passwordStrengthTextClass">
                {{ passwordStrengthText }}
              </p>
            </div>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('auth.confirmPassword') }}
            </label>
            <div class="relative">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                v-model="confirmPassword"
                name="confirmPassword"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700 pr-10"
                :placeholder="t('auth.confirmPassword')"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 focus:outline-none"
                :title="showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')"
              >
                <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
            <p v-if="password && confirmPassword && password !== confirmPassword" class="mt-1 text-xs text-red-500">
              {{ t('auth.passwordsDoNotMatch') }}
            </p>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <i class="fas fa-user-plus"></i>
            </span>
            {{ loading ? t('common.loading') : t('auth.register') }}
          </button>
        </div>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">
              {{ t('auth.or') }}
            </span>
          </div>
        </div>

        <div>
          <button
            type="button"
            @click="handleGoogleSignIn"
            :disabled="loading"
            class="w-full flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <img
              class="h-5 w-5 mr-2"
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
            />
            {{ t('auth.signUpWithGoogle') }}
          </button>
        </div>

        <div class="text-sm text-center">
          <router-link
            to="/login"
            class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {{ t('auth.alreadyHaveAccount') }}
          </router-link>
        </div>
      </form>


    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const { showToast } = useToast()

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Password strength calculation
const calculatePasswordStrength = (pass) => {
  if (!pass) return 0
  let strength = 0
  if (pass.length >= 8) strength += 25
  if (/[A-Z]/.test(pass)) strength += 25
  if (/[a-z]/.test(pass)) strength += 25
  if (/[0-9]/.test(pass)) strength += 25
  return strength
}

const passwordStrength = computed(() => calculatePasswordStrength(password.value))

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 25) return 'bg-red-500'
  if (strength <= 50) return 'bg-yellow-500'
  if (strength <= 75) return 'bg-blue-500'
  return 'bg-green-500'
})

const passwordStrengthTextClass = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 25) return 'text-red-500'
  if (strength <= 50) return 'text-yellow-500'
  if (strength <= 75) return 'text-blue-500'
  return 'text-green-500'
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 25) return t('auth.weakPassword')
  if (strength <= 50) return t('auth.fairPassword')
  if (strength <= 75) return t('auth.goodPassword')
  return t('auth.strongPassword')
})

const isFormValid = computed(() => {
  return (
    displayName.value &&
    email.value &&
    password.value &&
    confirmPassword.value &&
    password.value === confirmPassword.value &&
    passwordStrength.value >= 50
  )
})

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    showToast('error', t('common.error'), t('auth.passwordsDoNotMatch'))
    return
  }

  loading.value = true
  try {
    await authStore.register(email.value, password.value, {
      displayName: displayName.value
    })
    showToast('success', t('common.success'), t('auth.verificationEmailSent'))
    router.push('/login')
  } catch (error) {
    console.error('Registration error:', error)
  } finally {
    loading.value = false
  }
}

const handleGoogleSignIn = async () => {
  loading.value = true
  try {
    await authStore.loginWithGoogle()
    router.push('/')
  } catch (error) {
    console.error('Google sign-in error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dark .dark\:bg-gray-800 {
  background-color: #1f2937;
}
.dark .dark\:text-white {
  color: #ffffff;
}
.dark .dark\:border-gray-600 {
  border-color: #4b5563;
}
.dark .dark\:bg-gray-700 {
  background-color: #374151;
}
.dark .dark\:hover\:bg-gray-600:hover {
  background-color: #4b5563;
}
</style> 