<template>
  <div class="h-screen flex items-center justify-center dark:from-gray-900 dark:to-gray-800">
    <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
      <div class="text-center">
        <h2 class="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Login
        </h2>
        
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('auth.email') }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-envelope text-gray-400"></i>
              </div>
              <input
                id="email"
                v-model="email"
                name="email"
                type="email"
                required
                class="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                :placeholder="t('auth.emailPlaceholder')"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('auth.password') }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-lock text-gray-400"></i>
              </div>
              <input
                id="password"
                v-model="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="appearance-none block w-full pl-10 pr-12 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                :placeholder="t('auth.passwordPlaceholder')"
                :aria-label="t('auth.password')"
              />
              <button
                type="button"
                @click="togglePassword"
                @keydown="handleKeyPress"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-r-lg transition-colors duration-200"
                :title="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
                :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
                tabindex="0"
              >
                <component
                  :is="showPassword ? EyeSlashIcon : EyeIcon"
                  class="h-5 w-5 transition-transform duration-200"
                  :class="{ 'transform scale-110': showPassword }"
                />
              </button>
            </div>
            <div class="mt-1 text-left">
              <button
                type="button"
                @click="handleForgotPassword"
                class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-200"
              >
                Forgot Password ?
              </button>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-sign-in-alt mr-2"></i>
            {{ loading ? t('common.loading') : t('auth.signIn') }}
          </button>
        </div>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              {{ t('auth.or') }}
            </span>
          </div>
        </div>

        <div>
          <button
            type="button"
            @click="handleGoogleSignIn"
            :disabled="loading"
            class="w-full flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <img
              class="h-5 w-5 mr-2"
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
            />
            {{ t('auth.signInWithGoogle') }}
          </button>
        </div>

        <div class="text-center">
          <router-link
            to="/register"
            class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-200"
          >
            {{ t('auth.noAccount') }}
          </router-link>
        </div>
      </form>

      <div v-if="showResendVerification" class="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {{ t('auth.emailNotVerified') }}
            </h3>
            <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <p>{{ t('auth.pleaseVerifyEmail') }}</p>
            </div>
            <div class="mt-4">
              <button
                type="button"
                @click="handleResendVerification"
                :disabled="loading"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-yellow-700 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/50 hover:bg-yellow-200 dark:hover:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
              >
                <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
                <i v-else class="fas fa-paper-plane mr-2"></i>
                {{ loading ? t('common.loading') : t('auth.resendVerificationEmail') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div v-if="showForgotPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ t('auth.resetPassword') }}
          </h3>
          <button
            @click="showForgotPasswordModal = false"
            class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label for="resetEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('auth.email') }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-envelope text-gray-400"></i>
              </div>
              <input
                id="resetEmail"
                v-model="resetEmail"
                type="email"
                required
                class="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                :placeholder="t('auth.emailPlaceholder')"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showForgotPasswordModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="button"
              @click="handleResetPassword"
              :disabled="loading || !resetEmail"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ t('auth.resetPassword') }}
            </button>
          </div>
        </div>
      </div>
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

const email = ref('')
const password = ref('')
const loading = ref(false)
const showResendVerification = ref(false)
const showPassword = ref(false)
const showForgotPasswordModal = ref(false)
const resetEmail = ref('')

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleKeyPress = (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    togglePassword()
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (error) {
    if (error.message === 'auth/email-not-verified') {
      showResendVerification.value = true
      showToast('warning', t('auth.emailNotVerified'), t('auth.pleaseVerifyEmail'))
    } else {
      showToast('error', t('common.error'), error.message)
    }
    console.error('Login error:', error)
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

const handleResendVerification = async () => {
  loading.value = true
  try {
    await authStore.resendVerificationEmail()
    showToast('success', t('common.success'), t('auth.verificationEmailSent'))
    showResendVerification.value = false
  } catch (error) {
    showToast('error', t('common.error'), error.message)
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  resetEmail.value = email.value // Pre-fill with the email from login form if available
  showForgotPasswordModal.value = true
}

const handleResetPassword = async () => {
  if (!resetEmail.value) {
    showToast('error', t('common.error'), t('auth.enterEmailForReset'))
    return
  }

  loading.value = true
  try {
    console.log('Sending password reset email to:', resetEmail.value)
    const result = await authStore.sendPasswordResetEmail(resetEmail.value)
    console.log('Password reset result:', result)
    
    if (result.success) {
      showToast('success', t('common.success'), t('auth.resetPasswordEmailSent'))
      showForgotPasswordModal.value = false
      resetEmail.value = ''
    } else {
      let errorMessage = t('auth.resetPasswordError')
      if (result.errorCode === 'auth/user-not-found') {
        errorMessage = t('auth.userNotFound')
      } else if (result.errorCode === 'auth/invalid-email') {
        errorMessage = t('auth.invalidEmail')
      } else if (result.errorCode === 'auth/too-many-requests') {
        errorMessage = t('auth.tooManyRequests')
      }
      console.error('Password reset failed:', result.errorCode, result.errorMessage)
      showToast('error', t('common.error'), errorMessage)
    }
  } catch (error) {
    console.error('Password reset error:', error)
    showToast('error', t('common.error'), t('auth.resetPasswordError'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Remove the old styles since we're using Tailwind classes directly */
</style> 