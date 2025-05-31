<template>

  <section class="h-screen w-full p-6 flex-1 space-y-6 overflow-auto">
    <!-- Welcome Section -->
    <div
      class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-sm p-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {{ $t('home.welcome', { name: user.displayName }) }} 👋
          </h1>
          <p class="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">
            {{ $t('home.welcomeMessage') }}
          </p>
        </div>
        <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
          <button @click="handleStartChat" class="btn-primary flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                clip-rule="evenodd" />
            </svg>
            {{ $t('home.startChat') }}
          </button>
          <router-link to="/find-friends" class="btn-secondary flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
            </svg>
            {{ $t('home.findFriends') }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
        <div class="flex items-center">
          <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <div class="ml-4">
            <h2 class="text-base font-medium text-gray-500 dark:text-gray-400">
              {{ $t('home.activeChats') }}
            </h2>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ stats.activeChats }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
        <div class="flex items-center">
          <div class="p-3 rounded-xl bg-green-50 dark:bg-green-900/30">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <h2 class="text-base font-medium text-gray-500 dark:text-gray-400">
              {{ $t('home.friends') }}
            </h2>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ stats.friends }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
        <div class="flex items-center">
          <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30">
            <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div class="ml-4">
            <h2 class="text-base font-medium text-gray-500 dark:text-gray-400">
              {{ $t('home.pendingRequests') }}
            </h2>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ stats.pendingRequests }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <div class="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20"
              fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clip-rule="evenodd" />
            </svg>
          </div>
          {{ $t('home.recentActivity') }}
        </h2>
        <router-link to="/activity"
          class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 flex items-center gap-1">
          View All
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd" />
          </svg>
        </router-link>
      </div>
      <div class="divide-y divide-gray-100 dark:divide-gray-700">
        <div v-if="activityStore.loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent">
          </div>
          <p class="mt-2 text-gray-500 dark:text-gray-400">{{ $t('home.loadingActivities') }}</p>
        </div>
        <div v-else-if="recentActivity.length === 0" class="p-8 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-gray-500 dark:text-gray-400">{{ $t('home.noActivity') }}</p>
        </div>
        <div v-else>
          <div v-for="activity in recentActivity" :key="activity.id"
            class="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
            <div class="flex items-start gap-4">
              <div class="relative">
                <img :src="activity.userPhotoURL" :alt="activity.userName"
                  class="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-800" />

              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900 dark:text-white">
                  <span class="font-semibold">{{ activity.userName }}</span>
                  <span class="text-gray-600 dark:text-gray-300">{{ activity.message }}</span>
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clip-rule="evenodd" />
                  </svg>
                  {{ formatDate(activity.timestamp) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import SideNavBar from '../components/SideNavBar.vue'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFriendsStore } from '@/stores/friends'
import { useActivityStore } from '@/stores/activity'
import { useI18n } from 'vue-i18n'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const friendsStore = useFriendsStore()
const activityStore = useActivityStore()
const { t } = useI18n()
const { showToast } = useToast()

const stats = ref({
  activeChats: 0,
  friends: 0,
  pendingRequests: 0
})

const recentActivity = computed(() => activityStore.activities)
const user = computed(() => authStore.user)

// Set up real-time listeners for stats
const setupRealtimeListeners = () => {
  if (!user.value?.uid) return

  // Chats listener
  const chatsQuery = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', user.value.uid)
  )
  const chatsUnsubscribe = onSnapshot(chatsQuery, (snapshot) => {
    stats.value.activeChats = snapshot.size
  })

  // Friends listener
  const friendsQuery = query(
    collection(db, 'friends'),
    where('participants', 'array-contains', user.value.uid)
  )
  const friendsUnsubscribe = onSnapshot(friendsQuery, (snapshot) => {
    stats.value.friends = snapshot.size
  })

  // Friend requests listener
  const requestsQuery = query(
    collection(db, 'friendRequests'),
    where('recipientId', '==', user.value.uid)
  )
  const requestsUnsubscribe = onSnapshot(requestsQuery, (snapshot) => {
    stats.value.pendingRequests = snapshot.size
  })

  return () => {
    chatsUnsubscribe()
    friendsUnsubscribe()
    requestsUnsubscribe()
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('default', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date.toDate())
}

const handleStartChat = () => {
  router.push('/chat')
}

let unsubscribeStats = null

onMounted(async () => {
  if (user.value?.uid) {
    await activityStore.fetchActivities(user.value.uid)
    unsubscribeStats = setupRealtimeListeners()
  }
})

onUnmounted(() => {
  if (unsubscribeStats) {
    unsubscribeStats()
  }
  activityStore.unsubscribe()
})

// Watch for user changes
watch(() => user.value?.uid, async (newUid) => {
  if (newUid) {
    await activityStore.fetchActivities(newUid)
    if (unsubscribeStats) {
      unsubscribeStats()
    }
    unsubscribeStats = setupRealtimeListeners()
  }
})

// Watch for pending requests changes from friends store
watch(() => friendsStore.pendingRequests, (newRequests) => {
  stats.value.pendingRequests = newRequests.length
})
</script>

<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex-1 sm:flex-none;
}

.btn-secondary {
  @apply px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors duration-200 flex-1 sm:flex-none;
}
</style>