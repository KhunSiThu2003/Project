<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { useLanguage } from '@/composables/useLanguage'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useHead } from '@vueuse/head'
import { useDark, useToggle } from '@vueuse/core'
import { useFriendStore } from '@/stores/friend'
import { useFriendsStore } from '@/stores/friends'
import LanguageMenu from '@/components/LanguageMenu.vue'
import { collection, query, where, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

const authStore = useAuthStore()
const { t } = useI18n()
const router = useRouter()
const { isDarkMode, toggleTheme } = useTheme()
const { currentLocale, changeLocale } = useLanguage()
const friendStore = useFriendStore()
const friendsStore = useFriendsStore()

const isDark = useDark()
const toggleDark = useToggle(isDark)

const showProfileMenu = ref(false)
const showMobileMenu = ref(false)
const user = computed(() => authStore.user)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const pendingRequestsCount = computed(() => friendsStore.pendingRequests.length)

const shouldShowVerifyPrompt = computed(() => {
  return isAuthenticated.value && user.value && user.value.emailVerified === false
})

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const handleLogout = async () => {
  const result = await Swal.fire({
    title: t('auth.logout'),
    text: t('auth.logoutConfirm'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel')
  })

  if (result.isConfirmed) {
    try {
      await authStore.logout()
      window.location.href = '/'
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('common.error'),
        text: t('errors.logoutFailed')
      })
    }
  }
}

const handleClickOutside = (event) => {
  if (showProfileMenu.value && !event.target.closest('.profile-dropdown')) {
    showProfileMenu.value = false
  }
  if (showMobileMenu.value && !event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-button')) {
    showMobileMenu.value = false
  }
}

const receiveSound = ref(null)
const friendRequestSound = ref(null)
const unreadMessagesCount = ref(0)
const messageListeners = ref([])

const setupMessageListeners = async () => {
  if (!authStore.user) return

  try {
    const friendsQuery = query(
      collection(db, 'friends'),
      where('participants', 'array-contains', authStore.user.uid)
    )

    const friendsSnapshot = await getDocs(friendsQuery)

    friendsSnapshot.docs.forEach(async (doc) => {
      const data = doc.data()
      const friendId = data.participants.find(id => id !== authStore.user.uid)
      const chatId = [authStore.user.uid, friendId].sort().join('_')

      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        where('senderId', '==', friendId),
        where('read', '==', false)
      )

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        unreadMessagesCount.value = snapshot.docs.length
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            playReceiveSound()
          }
        })
      })

      messageListeners.value.push(unsubscribe)
    })
  } catch (error) {
    console.error(t('errors.messageListenerSetupFailed'), error)
  }
}

const cleanupMessageListeners = () => {
  messageListeners.value.forEach(unsubscribe => unsubscribe())
  messageListeners.value = []
  unreadMessagesCount.value = 0
}

const playReceiveSound = () => {
  if (receiveSound.value) {
    receiveSound.value.currentTime = 0
    receiveSound.value.play().catch(error => {
      console.error(t('errors.playSoundFailed'), error)
    })
  }
}

const playFriendRequestSound = () => {
  if (friendRequestSound.value) {
    friendRequestSound.value.currentTime = 0
    friendRequestSound.value.play().catch(error => {
      console.error(t('errors.playSoundFailed'), error)
    })
  }
}

const handleNewFriendRequest = () => {
  playFriendRequestSound()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('new-friend-request', handleNewFriendRequest)

  try {
    receiveSound.value = new Audio('/src/assets/sounds/app-get-message.mp3')
    receiveSound.value.load()
    friendRequestSound.value = new Audio('/src/assets/sounds/app-get-message.mp3')
    friendRequestSound.value.load()
  } catch (error) {
    console.error(t('errors.soundInitFailed'), error)
  }

  authStore.init()
  if (authStore.isAuthenticated) {
    friendStore.subscribeToFriends()
    friendsStore.subscribeToFriendRequests()
    setupMessageListeners()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('new-friend-request', handleNewFriendRequest)
  cleanupMessageListeners()
  friendStore.cleanup()
  friendsStore.cleanup()

  if (receiveSound.value) {
    receiveSound.value.pause()
    receiveSound.value = null
  }
  if (friendRequestSound.value) {
    friendRequestSound.value.pause()
    friendRequestSound.value = null
  }
})

router.beforeEach((to, from, next) => {
  if (from.path.startsWith('/chat')) {
    friendStore.cleanup()
  }
  showMobileMenu.value = false
  next()
})

useHead({
  title: t('common.appName'),
  meta: [
    { name: 'description', content: t('common.appDescription') },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' }
  ]
})
</script>


<template>
  <div class="bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col md:flex-row"
    :dir="currentLocale === 'ar' ? 'rtl' : 'ltr'">

    <!-- Mobile Header - Updated Design -->
    <header 
      class="md:hidden sticky w-full left-0 top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center space-x-4 rtl:space-x-reverse">
          <button @click.stop="toggleMobileMenu"
            class="mobile-menu-button p-2 rounded-lg text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 focus:outline-none transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <router-link to="/"
            class="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            {{ $t('common.appName') }}
          </router-link>
        </div>

        <div class="flex items-center space-x-3 rtl:space-x-reverse">
          <!-- Messages Button -->
          <router-link to="/chat"
            class="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span v-if="unreadMessagesCount > 0 && !$route.path.startsWith('/chat')"
              class="notification-badge absolute top-1 right-1 rtl:right-auto rtl:left-1 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">
              {{ unreadMessagesCount }}
            </span>
          </router-link>

          <!-- Friend Requests Button -->
          <router-link to="/friend-requests"
            class="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span v-if="pendingRequestsCount > 0"
              class="notification-badge absolute top-1 right-1 rtl:right-auto rtl:left-1 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">
              {{ pendingRequestsCount }}
            </span>
          </router-link>

          <!-- Profile Button -->
          <button @click.stop="toggleProfileMenu"
            class="relative p-1 rounded-full ring-2 ring-primary-500/50 ring-offset-2 dark:ring-offset-gray-800 hover:ring-primary-500/70 transition-all duration-300 focus:outline-none">
            <img :src="user.photoURL || '/default-avatar.svg'" :alt="user.displayName"
              class="w-7 h-7 rounded-full object-cover" />
            <div
              class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full">
              <div class="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
            </div>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Profile Dropdown Menu -->
    <transition enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0" enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in" leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0">
      <div v-if="showProfileMenu && isAuthenticated"
        class="md:hidden fixed top-16 inset-x-4 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-2">
        <!-- User Info -->
        <div class="px-3 py-2 border-b border-gray-200/50 dark:border-gray-700/50">
          <div class="flex items-center space-x-3 rtl:space-x-reverse">
            <img :src="user.photoURL || '/default-avatar.svg'" :alt="user.displayName"
              class="w-12 h-12 rounded-full ring-2 ring-primary-500/50" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ user.displayName }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ user.email }}
              </p>
            </div>
          </div>
        </div>

        <!-- Menu Items -->
        <div class="py-2">
          <router-link to="/profile" class="mobile-dropdown-item group" @click="showProfileMenu = false">
            <svg class="w-5 h-5 text-gray-400 group-hover:text-primary-500" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{{ $t('nav.profile') }}</span>
          </router-link>

          <router-link to="/settings" class="mobile-dropdown-item group" @click="showProfileMenu = false">
            <svg class="w-5 h-5 text-gray-400 group-hover:text-primary-500" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{{ $t('nav.settings') }}</span>
          </router-link>

          <div v-if="isAdmin">
            <router-link to="/admin" class="mobile-dropdown-item group" @click="showProfileMenu = false">
              <svg class="w-5 h-5 text-gray-400 group-hover:text-primary-500" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>{{ $t('nav.admin') }}</span>
            </router-link>
          </div>

          <div class="border-t border-gray-200/50 dark:border-gray-700/50 my-1"></div>

          <button class="mobile-dropdown-item group text-red-600 dark:text-red-500 w-full" @click="handleLogout">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{{ $t('nav.logout') }}</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- Mobile Menu - Updated Design -->
    <transition :name="currentLocale === 'ar' ? 'slide-rtl' : 'slide'">
      <div v-if="showMobileMenu && isAuthenticated"
        class="mobile-menu fixed inset-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm md:hidden pt-20 overflow-y-auto">
        <div class="px-5 py-3 space-y-2">
          <router-link to="/" class="mobile-nav-link" @click="toggleMobileMenu"
            :class="{ 'active': $route.path === '/' }">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>{{ $t('nav.home') }}</span>
          </router-link>

          <router-link to="/find-friends" class="mobile-nav-link" @click="toggleMobileMenu"
            :class="{ 'active': $route.path === '/find-friends' }">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>{{ $t('friends.findFriends') }}</span>
          </router-link>

          <router-link to="/friend-requests" class="mobile-nav-link relative" @click="toggleMobileMenu"
            :class="{ 'active': $route.path === '/friend-requests' }">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>{{ $t('friends.friendRequests') }}</span>
            <span v-if="pendingRequestsCount > 0"
              class="notification-badge absolute right-4 rtl:right-auto rtl:left-4 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
              {{ pendingRequestsCount }}
            </span>
          </router-link>

          <router-link to="/chat" class="mobile-nav-link relative" @click="toggleMobileMenu"
            :class="{ 'active': $route.path.startsWith('/chat') }">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{{ $t('nav.chat') }}</span>
            <span v-if="unreadMessagesCount > 0 && !$route.path.startsWith('/chat')"
              class="notification-badge absolute right-4 rtl:right-auto rtl:left-4 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
              {{ unreadMessagesCount }}
            </span>
          </router-link>
        </div>

        <div class="px-5 py-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-4">
          <!-- Language Selection -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ $t('profile.language') }}
            </label>
            <LanguageMenu class="w-full" />
          </div>

          <!-- Theme Toggle -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ $t('profile.theme') }}
            </label>
            <button @click="toggleTheme"
              class="w-full flex items-center justify-between p-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
              <span class="flex items-center">
                <svg v-if="isDarkMode" class="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <svg v-else class="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {{ isDarkMode ? $t('settings.theme.dark') : $t('settings.theme.light') }}
              </span>
              <span
                class="text-xs px-2 py-1 rounded-full bg-white/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                {{ isDarkMode ? $t('settings.theme.dark') : $t('settings.theme.light') }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Side Navigation (Desktop) - Updated Design -->
    <nav v-if="isAuthenticated"
      class="hidden md:flex md:w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 h-screen sticky top-0 flex-col">
      <!-- Logo Section -->
      <div class="p-5 border-b border-gray-200/50 dark:border-gray-700/50">
        <router-link to="/"
          class="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity flex items-center">
          <span class="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center mr-3 rtl:mr-0 rtl:ml-3">
            <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </span>
          {{ $t('common.appName') }}
        </router-link>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <router-link to="/" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-xl"
          :class="{ 'active': $route.path === '/' }">
          <span
            class="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700/50 group-[.active]:bg-primary-500/10">
            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 group-[.active]:text-primary-500" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </span>
          <span>{{ $t('nav.home') }}</span>
        </router-link>

        <router-link to="/find-friends" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-xl"
          :class="{ 'active': $route.path === '/find-friends' }">
          <span
            class="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700/50 group-[.active]:bg-primary-500/10">
            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 group-[.active]:text-primary-500" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <span>{{ $t('friends.findFriends') }}</span>
        </router-link>

        <router-link to="/friend-requests" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-xl relative"
          :class="{ 'active': $route.path === '/friend-requests' }">
          <span
            class="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700/50 group-[.active]:bg-primary-500/10">
            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 group-[.active]:text-primary-500" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </span>
          <span>{{ $t('friends.friendRequests') }}</span>
          <span v-if="pendingRequestsCount > 0"
            class="absolute right-4 inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-red-500 rounded-full">
            {{ pendingRequestsCount }}
          </span>
        </router-link>

        <router-link to="/chat" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-xl"
          :class="{ 'active': $route.path.startsWith('/chat') }">
          <span
            class="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700/50 group-[.active]:bg-primary-500/10">
            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 group-[.active]:text-primary-500" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </span>
          <span>{{ $t('nav.chat') }}</span>
          <span v-if="unreadMessagesCount > 0 && !$route.path.startsWith('/chat')"
            class="absolute right-4 inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-red-500 rounded-full">
            {{ unreadMessagesCount }}
          </span>
        </router-link>
      </div>

      <!-- Bottom Section -->
      <div class="p-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-4">
        <!-- Language Selection -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {{ $t('profile.language') }}
          </label>
          <LanguageMenu class="w-full" />
        </div>

        <!-- Theme Toggle -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {{ $t('profile.theme') }}
          </label>
          <button @click="toggleTheme"
            class="w-full flex items-center justify-between p-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
            <span class="flex items-center">
              <svg v-if="isDarkMode" class="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <svg v-else class="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {{ isDarkMode ? $t('settings.theme.dark') : $t('settings.theme.light') }}
            </span>
            <span
              class="text-xs px-2 py-1 rounded-full bg-white/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
              {{ isDarkMode ? $t('settings.theme.dark') : $t('settings.theme.light') }}
            </span>
          </button>
        </div>

        <!-- Profile Section -->
        <div class="relative profile-dropdown">
          <button @click="toggleProfileMenu"
            class="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-800 group">
            <div class="relative">
              <div
                class="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500/20 to-primary-600/20 blur-sm group-hover:blur-md transition-all duration-300">
              </div>
              <img :src="user.photoURL || '/default-avatar.svg'" :alt="user.displayName"
                class="w-10 h-10 relative rounded-full ring-2 ring-primary-500/50 ring-offset-2 dark:ring-offset-gray-800 transition-all duration-300 group-hover:scale-105 group-hover:ring-primary-500/70" />
              <div
                class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm group-hover:shadow-md transition-all duration-300">
                <div class="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
              </div>
            </div>
            <div class="flex-1 min-w-0 text-left">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ user.displayName }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ user.email }}
              </p>
            </div>
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200"
              :class="{ 'transform rotate-180': showProfileMenu }" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Profile Dropdown Menu -->
          <transition enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-150 ease-in" leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0">
            <div v-if="showProfileMenu"
              class="absolute left-0 bottom-full mb-2 w-full rounded-xl shadow-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/10 transform origin-bottom-left z-[60]">
              <div class="py-2 px-1">
                <router-link to="/profile" class="dropdown-item group" @click="showProfileMenu = false">
                  <span class="flex items-center">
                    <svg class="w-5 h-5 mr-3 text-gray-400 group-hover:text-primary-500 transition-colors duration-200"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span
                      class="group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                      {{ $t('nav.profile') }}
                    </span>
                  </span>
                </router-link>

                <router-link to="/settings" class="dropdown-item group" @click="showProfileMenu = false">
                  <span class="flex items-center">
                    <svg class="w-5 h-5 mr-3 text-gray-400 group-hover:text-primary-500 transition-colors duration-200"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span
                      class="group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                      {{ $t('nav.settings') }}
                    </span>
                  </span>
                </router-link>

                <router-link v-if="isAdmin" to="/admin" class="dropdown-item group" @click="showProfileMenu = false">
                  <span class="flex items-center">
                    <svg class="w-5 h-5 mr-3 text-gray-400 group-hover:text-primary-500 transition-colors duration-200"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span
                      class="group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                      {{ $t('nav.admin') }}
                    </span>
                  </span>
                </router-link>

                <div class="border-t border-gray-200/50 dark:border-gray-700/50 my-1"></div>

                <button class="dropdown-item group w-full text-left" @click="handleLogout">
                  <span class="flex items-center">
                    <svg class="w-5 h-5 mr-3 text-red-500 group-hover:text-red-600 transition-colors duration-200"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span
                      class="text-red-600 group-hover:text-red-700 dark:text-red-500 dark:group-hover:text-red-400 transition-colors duration-200">
                      {{ $t('nav.logout') }}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </nav>
  </div>
</template>

<style>
.nav-link {
  @apply text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200;
}

.nav-link.active {
  @apply bg-primary-50/50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium;
}

.mobile-nav-link {
  @apply flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200;
}

.mobile-nav-link.active {
  @apply bg-primary-50/50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium;
}

.dropdown-item {
  @apply block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200;
}

.dropdown-item:active {
  @apply bg-gray-100 dark:bg-gray-700;
}

/* RTL Support */
.slide-rtl-enter-active,
.slide-rtl-leave-active {
  transition: transform 0.3s ease;
}

.slide-rtl-enter-from,
.slide-rtl-leave-to {
  transform: translateX(100%);
}

@media (min-width: 768px) {

  .slide-rtl-enter-from,
  .slide-rtl-leave-to {
    transform: translateX(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease-out;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

@media (min-width: 768px) {

  .slide-enter-from,
  .slide-leave-to {
    transform: translateX(0);
  }
}

/* Improved responsive behavior */
@media (max-width: 767px) {
  .main-content {
    padding-top: 64px;
    /* Account for mobile header height */
  }
}

/* Better touch targets for mobile */
button,
.nav-link,
.mobile-nav-link,
.dropdown-item {
  @apply touch-manipulation;
}

/* Notification badge */
.notification-badge {
  @apply transform scale-100 animate-pulse;
}

/* Glass morphism effect */
.bg-glass {
  @apply bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm;
}

.mobile-dropdown-item {
  @apply flex items-center space-x-3 rtl:space-x-reverse px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200;
}

.mobile-dropdown-item:active {
  @apply bg-gray-100 dark:bg-gray-700;
}
</style>