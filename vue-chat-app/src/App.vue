<script setup>
import { computed } from 'vue'
import SideNavBar from './components/SideNavBar.vue'
import { useAuthStore } from '@/stores/auth'
import VerifyEmailPrompt from '@/components/VerifyEmailPrompt.vue'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const isAuthenticated = computed(() => authStore.isAuthenticated)

const shouldShowVerifyPrompt = computed(() => {
  return isAuthenticated.value && user.value && user.value.emailVerified === false
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
