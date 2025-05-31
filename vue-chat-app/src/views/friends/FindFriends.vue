<template>
  <div class="h-screen w-full overflow-auto p-6 flex-1 space-y-6">
    <h1 class="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800 dark:text-white">
      {{ t('friends.findFriends') }}
    </h1>

    <!-- Search Bar -->
    <div class="mb-4 md:mb-6">
      <div class="relative">
        <input v-model="searchQuery" type="text" :placeholder="t('friends.searchPlaceholder')"
          class="w-full px-4 py-2 md:py-3 pl-10 rounded-lg md:rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          @input="handleSearch" />
        <div class="absolute left-3 top-2.5 md:top-3.5 text-gray-400">
          <i class="fas fa-search"></i>
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="searchResults.length > 0" class="space-y-3 md:space-y-4">
      <div v-for="user in searchResults" :key="user.id"
        class="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center space-x-3 md:space-x-4">
            <div class="relative">
              <img :src="user.photoURL || '/default-avatar.svg'" :alt="user.displayName"
                class="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2"
                :class="isOnline(user.id) ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'" />
              <div
                class="absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-white dark:border-gray-800"
                :class="isOnline(user.id) ? 'bg-green-500' : 'bg-gray-400'"></div>
            </div>
            <div class="flex flex-col">
              <h3 class="font-bold text-base md:text-xl text-gray-800 dark:text-white mb-1">
                {{ user.displayName }}
              </h3>
              <span class="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                {{ user.email }}
              </span>
              <span class="text-xs mt-1"
                :class="isOnline(user.id) ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'">
                <template v-if="isOnline(user.id)">
                  <i class="fas fa-circle text-xs mr-1"></i>
                  {{ t('chat.online') }}
                </template>
                <template v-else>
                  <i class="fas fa-clock text-xs mr-1"></i>
                  {{ formatLastSeen(user.id) }}
                </template>
              </span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 justify-end">
            <!-- Friend -->
            <template v-if="getUserStatus(user.id) === 'friend'">
              <button @click="startChat(user)"
                class="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-indigo-600 text-white rounded-lg md:rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center dark:bg-indigo-500 dark:hover:bg-indigo-600">
                <i class="fas fa-comment mr-1 md:mr-2"></i>
                {{ t('friends.startChat') }}
              </button>
              <button @click="removeFriend(user)"
                class="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-rose-500 text-white rounded-lg md:rounded-xl hover:bg-rose-600 transition-colors shadow-sm flex items-center justify-center dark:bg-rose-600 dark:hover:bg-rose-700">
                <i class="fas fa-user-minus mr-1 md:mr-2"></i>
                {{ t('friends.removeFriend') }}
              </button>
            </template>

            <!-- Pending Request -->
            <template v-else-if="getUserStatus(user.id) === 'request'">
              <button @click="acceptFriendRequest(user)"
                class="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-emerald-500 text-white rounded-lg md:rounded-xl hover:bg-emerald-600 transition-colors shadow-sm flex items-center justify-center dark:bg-emerald-600 dark:hover:bg-emerald-700">
                <i class="fas fa-check mr-1 md:mr-2"></i>
                {{ t('friends.accept') }}
              </button>
              <button @click="rejectFriendRequest(user)"
                class="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-rose-500 text-white rounded-lg md:rounded-xl hover:bg-rose-600 transition-colors shadow-sm flex items-center justify-center dark:bg-rose-600 dark:hover:bg-rose-700">
                <i class="fas fa-times mr-1 md:mr-2"></i>
                {{ t('friends.reject') }}
              </button>
            </template>

            <!-- Sent Request -->
            <template v-else-if="getUserStatus(user.id) === 'sent'">
              <button @click="cancelFriendRequest(user)"
                class="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-gray-500 text-white rounded-lg md:rounded-xl hover:bg-gray-600 transition-colors shadow-sm flex items-center justify-center dark:bg-gray-600 dark:hover:bg-gray-700">
                <i class="fas fa-times mr-1 md:mr-2"></i>
                UnRequest
              </button>
            </template>

            <!-- Not Friend -->
            <template v-else>
              <button @click="sendFriendRequest(user)"
                class="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-indigo-600 text-white rounded-lg md:rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center dark:bg-indigo-500 dark:hover:bg-indigo-600">
                <i class="fas fa-user-plus mr-1 md:mr-2"></i>
                {{ t('friends.addFriend') }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else-if="searchQuery && !loading"
      class="text-center py-8 md:py-16 bg-gray-50 rounded-lg md:rounded-2xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <i class="fas fa-search text-4xl md:text-6xl text-gray-300 dark:text-gray-600 mb-3 md:mb-4"></i>
      <p class="text-sm md:text-lg text-gray-600 dark:text-gray-300">{{ t('friends.noResults') }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8 md:py-16">
      <div class="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-indigo-500 mx-auto"></div>
    </div>
  </div>
</template>

<style scoped>
/* Add responsive touch targets */
button {
  @apply touch-manipulation;
  min-width: 100px;
}

/* Adjust transitions for mobile */
@media (max-width: 640px) {
  .transition-all {
    transition-duration: 200ms;
  }
}
</style>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/index'
import { useAuthStore } from '@/stores/auth'
import { useFriendsStore } from '@/stores/friends'
import { useToast } from '@/composables/useToast'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { formatDistanceToNow } from 'date-fns'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const friendsStore = useFriendsStore()
const { showToast } = useToast()

const searchQuery = ref('')
const searchResults = ref([])
const loading = ref(false)
const onlineStatus = ref({})
let unsubscribeFriends = null
let unsubscribeRequests = null
let unsubscribeSentRequests = null

const currentUser = computed(() => authStore.user)

const setupRealtimeListeners = () => {
  // Listen to friends collection
  const friendsQuery = query(
    collection(db, 'friends'),
    where('participants', 'array-contains', authStore.user.uid)
  )
  unsubscribeFriends = onSnapshot(friendsQuery, (snapshot) => {
    const friends = []
    snapshot.forEach((doc) => {
      friends.push({ id: doc.id, ...doc.data() })
    })
    friendsStore.friends = friends
    if (searchQuery.value.trim()) {
      handleSearch()
    }
  }, (error) => {
    console.error('Error listening to friends:', error)
    showToast('error', t('common.error'), error.message)
  })

  // Listen to received friend requests
  const receivedRequestsQuery = query(
    collection(db, 'friendRequests'),
    where('recipientId', '==', authStore.user.uid),
    where('status', '==', 'pending')
  )
  unsubscribeRequests = onSnapshot(receivedRequestsQuery, (snapshot) => {
    const requests = []
    snapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() })
    })
    friendsStore.pendingRequests = requests
    if (searchQuery.value.trim()) {
      handleSearch()
    }
  }, (error) => {
    console.error('Error listening to friend requests:', error)
    showToast('error', t('common.error'), error.message)
  })

  // Listen to sent friend requests
  const sentRequestsQuery = query(
    collection(db, 'friendRequests'),
    where('senderId', '==', authStore.user.uid),
    where('status', '==', 'pending')
  )
  unsubscribeSentRequests = onSnapshot(sentRequestsQuery, (snapshot) => {
    const sentRequests = []
    snapshot.forEach((doc) => {
      sentRequests.push({ id: doc.id, ...doc.data() })
    })
    friendsStore.sentRequests = sentRequests
    if (searchQuery.value.trim()) {
      handleSearch()
    }
  }, (error) => {
    console.error('Error listening to sent friend requests:', error)
    showToast('error', t('common.error'), error.message)
  })

  // Add status listener
  const statusRef = collection(db, 'status')
  const statusUnsubscribe = onSnapshot(statusRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const userId = change.doc.id
      if (change.type === 'added' || change.type === 'modified') {
        onlineStatus.value[userId] = change.doc.data()
      } else if (change.type === 'removed') {
        onlineStatus.value[userId] = { state: 'offline' }
      }
    })
  })

  // Update cleanup
  onUnmounted(() => {
    if (unsubscribeFriends) unsubscribeFriends()
    if (unsubscribeRequests) unsubscribeRequests()
    if (unsubscribeSentRequests) unsubscribeSentRequests()
    if (statusUnsubscribe) statusUnsubscribe()
  })
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  loading.value = true
  try {
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    const searchTerm = searchQuery.value.toLowerCase()

    searchResults.value = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user =>
        user.id !== authStore.user.uid &&
        user.displayName.toLowerCase().includes(searchTerm)
      )
  } catch (error) {
    console.error('Error searching users:', error)
    showToast('error', t('common.error'), error.message)
  } finally {
    loading.value = false
  }
}

const getUserStatus = (userId) => {
  // Check if already friends
  const isFriend = friendsStore.friends.some(friend =>
    friend.participants && friend.participants.includes(userId)
  )
  if (isFriend) return 'friend'

  // Check if there's a pending request from this user
  const receivedRequest = friendsStore.pendingRequests.find(request =>
    request.senderId === userId && request.recipientId === authStore.user.uid
  )
  if (receivedRequest) return 'request'

  // Check if we've sent a request to this user
  const sentRequest = friendsStore.sentRequests.find(request =>
    request.senderId === authStore.user.uid && request.recipientId === userId
  )
  if (sentRequest) return 'sent'

  return null
}

const startChat = (user) => {
  router.push(`/chat/${user.id}`)
}

const removeFriend = async (user) => {
  await friendsStore.removeFriend(user.id)
  searchResults.value = searchResults.value.filter(u => u.id !== user.id)
}

const sendFriendRequest = async (user) => {
  await friendsStore.sendFriendRequest(user.id)
  searchResults.value = searchResults.value.filter(u => u.id !== user.id)
}

const acceptFriendRequest = async (user) => {
  await friendsStore.acceptFriendRequest(user.id)
  searchResults.value = searchResults.value.filter(u => u.id !== user.id)
}

const rejectFriendRequest = async (user) => {
  await friendsStore.rejectFriendRequest(user.id)
  searchResults.value = searchResults.value.filter(u => u.id !== user.id)
}

const cancelFriendRequest = async (user) => {
  await friendsStore.cancelFriendRequest(user.id)
  searchResults.value = searchResults.value.filter(u => u.id !== user.id)
}

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

onMounted(() => {
  setupRealtimeListeners()
})
</script>