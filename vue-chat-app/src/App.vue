<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import SideNavBar from './components/SideNavBar.vue'
import { useAuthStore } from '@/stores/auth'
import VerifyEmailPrompt from '@/components/VerifyEmailPrompt.vue'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { onAuthStateChanged, getAuth } from 'firebase/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const isAuthenticated = computed(() => authStore.isAuthenticated)

const shouldShowVerifyPrompt = computed(() => {
  return isAuthenticated.value && user.value && user.value.emailVerified === false
})

// Function to update online status
const updateOnlineStatus = async (isOnline) => {
  if (!user.value?.uid) return

  try {
    const userStatusRef = doc(db, 'status', user.value.uid)
    const statusData = {
      state: isOnline ? 'online' : 'offline',
      lastChanged: serverTimestamp(),
      lastSeen: serverTimestamp()
    }

    await setDoc(userStatusRef, statusData, { merge: true })

    // Also update the user's document
    const userRef = doc(db, 'users', user.value.uid)
    await setDoc(userRef, {
      isOnline: isOnline,
      lastSeen: serverTimestamp()
    }, { merge: true })
  } catch (error) {
    console.error('Error updating online status:', error)
  }
}

// Set up presence system
onMounted(() => {
  // Handle authentication state changes
  const auth = getAuth()
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      updateOnlineStatus(true)
    }
  })

  // Set up online/offline listeners
  window.addEventListener('online', () => updateOnlineStatus(true))
  window.addEventListener('offline', () => updateOnlineStatus(false))
  
  // Set up beforeunload listener
  window.addEventListener('beforeunload', () => updateOnlineStatus(false))

  // Set up visibility change listener
  document.addEventListener('visibilitychange', () => {
    updateOnlineStatus(document.visibilityState === 'visible')
  })

  // Clean up on component unmount
  onUnmounted(() => {
    unsubscribeAuth()
    window.removeEventListener('online', () => updateOnlineStatus(true))
    window.removeEventListener('offline', () => updateOnlineStatus(false))
    window.removeEventListener('beforeunload', () => updateOnlineStatus(false))
    document.removeEventListener('visibilitychange', () => {
      updateOnlineStatus(document.visibilityState === 'visible')
    })
    
    // Set status to offline when component is unmounted
    updateOnlineStatus(false)
  })
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-dark-900">
    <VerifyEmailPrompt v-if="shouldShowVerifyPrompt" />
    <main v-if="!isAuthenticated" class="h-screen mx-auto max-w-4xl relative flex items-center justify-center bg-gray-50/50 dark:bg-dark-900">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <keep-alive>
            <component :is="Component" :key="$route.fullPath" />
          </keep-alive>
        </transition>
      </router-view>
    </main>
    
    <main v-if="isAuthenticated" class="flex h-screen w-screen bg-gray-50/50 dark:bg-dark-900">
      <SideNavBar></SideNavBar>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <keep-alive>
            <component :is="Component" :key="$route.fullPath" />
          </keep-alive>
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
.overflow-auto {
  scrollbar-width: none;
}

/* Add smooth transition for dark mode */
:root {
  transition: background-color 0.3s ease;
}
</style>
