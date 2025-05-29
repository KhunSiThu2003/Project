<template>
  <div class="max-w-4xl mx-auto px-4 py-4 md:py-6">
    <div class="transition-all duration-200">
      <!-- Header with unread count -->
      <div class="flex justify-between items-center mb-4 md:mb-8">
        <h1 class="text-xl md:text-2xl font-bold dark:text-white bg-clip-text text-transparent">
          {{ t('friends.friendRequests') }}
        </h1>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-8 md:py-12 space-y-3 md:space-y-4">
        <div class="relative">
          <div class="w-10 h-10 md:w-12 md:h-12 border-4 border-primary-200 dark:border-primary-800 rounded-full"></div>
          <div class="absolute top-0 left-0 w-10 h-10 md:w-12 md:h-12 border-4 border-primary-500 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400">{{ t('common.loading') }}</p>
      </div>

      <!-- No Requests -->
      <div
        v-else-if="!isLoading && pendingRequests.length === 0"
        class="flex flex-col items-center justify-center py-8 md:py-12 text-center"
      >
        <div class="relative w-16 h-16 md:w-24 md:h-24 mb-3 md:mb-4">
          <div class="absolute inset-0 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-sm md:blur-xl"></div>
          <svg class="relative w-16 h-16 md:w-24 md:h-24 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h3 class="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-1 md:mb-2">{{ t('friends.noPendingRequests') }}</h3>
        <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-xs md:max-w-sm">
          {{ t('friends.noPendingRequestsDesc') }}
        </p>
        <router-link
          to="/find-friends"
          class="mt-3 md:mt-4 inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
        >
          <svg class="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {{ t('friends.findFriends') }}
        </router-link>
      </div>

      <!-- Requests List -->
      <div v-else class="space-y-3 md:space-y-4">
        <div
          v-for="request in pendingRequests"
          :key="request.id"
          v-show="request.sender"
          class="group bg-white dark:bg-gray-700 rounded-lg md:rounded-xl shadow-sm p-3 md:p-4 flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-600"
          :class="{ 'ring-2 ring-primary-500/50': !request.read }"
        >
          <!-- User Avatar and Info -->
          <div class="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
            <div class="relative">
              <div class="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 to-primary-600/20 blur-sm group-hover:blur-sm md:group-hover:blur-md transition-all duration-300"></div>
              <img
                :src="request.sender?.photoURL || '/default-avatar.svg'"
                :alt="request.sender?.displayName || 'User'"
                class="relative w-10 h-10 md:w-14 md:h-14 rounded-full ring-2 ring-offset-2 dark:ring-offset-gray-800 transition-all duration-300 group-hover:scale-105"
                :class="isOnline(request.sender?.id) ? 'ring-green-500/50 group-hover:ring-green-500/70' : 'ring-gray-300/50 group-hover:ring-gray-300/70'"
                @error="$event.target.src = '/default-avatar.svg'"
              />
              <div 
                class="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-white dark:border-gray-800"
                :class="isOnline(request.sender?.id) ? 'bg-green-500' : 'bg-gray-400'"
              ></div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-1 md:space-x-2">
                <p class="text-sm md:text-base font-medium text-gray-900 dark:text-white truncate">
                  {{ request.sender?.displayName || 'Unknown User' }}
                </p>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(request.createdAt) }}
                </span>
              </div>
              <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                {{ request.sender?.email || '' }}
              </p>
              <span class="text-xs mt-1" :class="isOnline(request.sender?.id) ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'">
                <template v-if="isOnline(request.sender?.id)">
                  <i class="fas fa-circle text-xs mr-1"></i>
                  {{ t('chat.online') }}
                </template>
                <template v-else>
                  <i class="fas fa-clock text-xs mr-1"></i>
                  {{ formatLastSeen(request.sender?.id) }}
                </template>
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-2 justify-end">
            <button
              @click="handleAcceptRequest(request)"
              class="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
              :disabled="isLoading"
            >
              <svg class="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ t('friends.accept') }}
            </button>
            <button
              @click="handleRejectRequest(request)"
              class="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg hover:from-rose-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
              :disabled="isLoading"
            >
              <svg class="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {{ t('friends.reject') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* Responsive adjustments */
@media (max-width: 640px) {
  .flex-col {
    flex-direction: column;
  }
  
  .gap-3 {
    gap: 0.75rem;
  }
  
  button {
    min-width: 80px;
    padding: 0.5rem 0.75rem;
  }
}

/* Better touch targets */
button {
  @apply touch-manipulation;
}
</style>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useFriendsStore } from '@/stores/friends'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, onSnapshot, updateDoc, writeBatch, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/index'
import { useToast } from '@/composables/useToast'

import { formatDistanceToNow } from 'date-fns'

const { t } = useI18n()
const friendsStore = useFriendsStore()
const authStore = useAuthStore()
const { showToast } = useToast()

const pendingRequests = computed(() => friendsStore.pendingRequests)
const unreadCount = computed(() => friendsStore.pendingRequests.filter(request => !request.read).length)
const isLoading = ref(false)
let unsubscribeFriendRequests = null
let statusUnsubscribe = null

// Add these refs after other refs
const onlineStatus = ref({})

// Add isOnline function
const isOnline = (userId) => {
  if (!userId) return false
  const status = onlineStatus.value[userId]
  if (!status) return false
  
  // Check if the last status update was within the last 30 seconds
  const lastChanged = status.lastChanged?.toDate()
  if (!lastChanged) return false
  
  const now = new Date()
  const timeDiff = now.getTime() - lastChanged.getTime()
  return status.state === 'online' && timeDiff < 30000 // 30 seconds threshold
}

// Add formatLastSeen function
const formatLastSeen = (userId) => {
  if (!userId) return t('chat.offline')
  const status = onlineStatus.value[userId]
  if (!status?.lastChanged) return t('chat.offline')
  
  const lastChanged = status.lastChanged.toDate()
  const now = new Date()
  const timeDiff = now.getTime() - lastChanged.getTime()
  
  // If last seen was less than 30 seconds ago and status is online, show online
  if (timeDiff < 30000 && status.state === 'online') {
    return t('chat.online')
  }
  
  return formatDistanceToNow(lastChanged, { addSuffix: true })
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate?.() || new Date(timestamp)
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const setupFriendRequestsListener = async () => {
  if (!authStore.user) return

  try {
    isLoading.value = true
    
    const requestsQuery = query(
      collection(db, 'friendRequests'),
      where('recipientId', '==', authStore.user.uid),
      where('status', '==', 'pending')
    )

    unsubscribeFriendRequests = onSnapshot(requestsQuery, async (snapshot) => {
      try {
        const senderPromises = snapshot.docs.map(async (requestDoc) => {
          const requestData = requestDoc.data()
          const senderDocRef = doc(db, 'users', requestData.senderId)
          const senderDocSnap = await getDoc(senderDocRef)
          
          if (!senderDocSnap.exists()) return null

          const senderData = senderDocSnap.data()
          return {
            id: requestDoc.id,
            ...requestData,
            sender: {
              uid: senderData.uid,
              displayName: senderData.displayName || 'Unknown User',
              email: senderData.email || '',
              photoURL: senderData.photoURL || '/default-avatar.svg'
            }
          }
        })

        const results = await Promise.all(senderPromises)
        friendsStore.pendingRequests = results.filter(Boolean)
        
        // Handle new requests
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && change.doc.data().status === 'pending') {
            const request = change.doc.data()

          }
        })

        // Setup status listener
        if (!statusUnsubscribe) {
          const statusRef = collection(db, 'status')
          statusUnsubscribe = onSnapshot(statusRef, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              const userId = change.doc.id
              onlineStatus.value[userId] = change.type === 'removed' 
                ? { state: 'offline' }
                : change.doc.data()
            })
          })
        }

      } catch (error) {
        console.error('Error processing friend requests:', error)
        showToast('error', t('common.error'), 'Failed to process friend requests')
      }
    }, (error) => {
      console.error('Error in friend requests listener:', error)
      showToast(
        error.code === 'failed-precondition' ? 'info' : 'error',
        error.code === 'failed-precondition' ? t('common.settingUp') : t('common.error'),
        error.code === 'failed-precondition' ? t('common.setupMessage') : error.message
      )
      if (error.code === 'failed-precondition') {
        friendsStore.pendingRequests = []
      }
    })

  } catch (error) {
    console.error('Error setting up friend requests:', error)
    showToast('error', t('common.error'), error.message)
  } finally {
    isLoading.value = false
  }
}

const handleAcceptRequest = async (request) => {
  if (isLoading.value) return
  await friendsStore.acceptFriendRequest(request.id)
}

const handleRejectRequest = async (request) => {
  if (isLoading.value) return
  await friendsStore.rejectFriendRequest(request.id)
}

onMounted(async () => {
  await setupFriendRequestsListener()
})

onUnmounted(() => {
  if (unsubscribeFriendRequests) {
    unsubscribeFriendRequests()
  }
  if (statusUnsubscribe) {
    statusUnsubscribe()
  }
})
</script>

