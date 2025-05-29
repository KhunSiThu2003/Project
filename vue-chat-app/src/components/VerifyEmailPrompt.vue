<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { getAuth, sendEmailVerification, signOut } from 'firebase/auth'

const authStore = useAuthStore()
const { t } = useI18n()
const router = useRouter()

const userEmail = computed(() => authStore.user?.email || '')
const loading = computed(() => authStore.loading)
const signingOut = ref(false)
const resendCooldown = ref(0)
const resendTimer = ref(null)

let intervalId = null

const checkEmailVerified = async () => {
  const auth = getAuth()
  if (auth.currentUser) {
    await auth.currentUser.reload()
    if (auth.currentUser.emailVerified) {
      authStore.user.emailVerified = true
      router.replace('/')
    }
  }
}

onMounted(() => {
  intervalId = setInterval(checkEmailVerified, 2000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (resendTimer.value) clearInterval(resendTimer.value)
})

const startResendCooldown = () => {
  resendCooldown.value = 60 // 60 seconds cooldown
  if (resendTimer.value) clearInterval(resendTimer.value)
  resendTimer.value = setInterval(() => {
    if (resendCooldown.value > 0) {
      resendCooldown.value--
    } else {
      clearInterval(resendTimer.value)
      resendTimer.value = null
    }
  }, 1000)
}

const handleResend = async () => {
  if (resendCooldown.value > 0) return
  
  try {
    await authStore.resendVerificationEmail()
    startResendCooldown()
  } catch (error) {
    console.error('Error resending verification email:', error)
  }
}

const handleSignUpAnother = async () => {
  signingOut.value = true
  try {
    await authStore.logout()
    window.location.href = '/register'
  } catch (error) {
    console.error('Error signing out:', error)
  } finally {
    signingOut.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
    <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8">
      <div class="flex flex-col items-center text-center">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-full p-5 mb-6 ring-4 ring-blue-100 dark:ring-blue-800/20">
          <svg class="h-12 w-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Verify Your Email Address
        </h1>
        
        <div class="space-y-4 text-gray-600 dark:text-gray-300">
          <p>
            We've sent a verification link to <span class="font-semibold text-blue-600 dark:text-blue-400">{{ userEmail }}</span>
          </p>
          
          <p>
            To complete your registration, please click the verification link in the email we just sent you.
          </p>
          
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 text-left rounded-r">
            <p class="text-sm text-yellow-700 dark:text-yellow-200">
              <span class="font-medium">Can't find the email?</span> Check your spam folder or wait a few minutes for it to arrive.
            </p>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <button
          @click="handleResend"
          :disabled="loading || resendCooldown > 0"
          class="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>
            {{ resendCooldown > 0 
              ? `Resend available in ${resendCooldown}s` 
              : loading 
                ? 'Sending email...' 
                : 'Resend Verification Email' 
            }}
          </span>
        </button>

        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div class="relative flex justify-center">
            <span class="px-3 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
              Need to use a different email?
            </span>
          </div>
        </div>

        <button
          @click="handleSignUpAnother"
          :disabled="signingOut"
          class="w-full px-6 py-3 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg v-if="signingOut" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>{{ signingOut ? 'Signing out...' : 'Register with different email' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>