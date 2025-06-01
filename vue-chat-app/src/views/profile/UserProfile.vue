<template>
  <div class="min-h-screen w-full  bg-gray-50 dark:bg-gray-900">
    <!-- Cover Image -->
    <div class="relative h-48 md:h-64 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
      <div class="absolute inset-0 bg-black/10"></div>
      <!-- Back Button -->
      <button @click="router.back()" 
        class="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2">
        <i class="fas fa-arrow-left"></i>
        <span>{{ t('common.back') }}</span>
      </button>
    </div>

    <div class="container mx-auto px-4 -mt-20">
      <div class="max-w-3xl mx-auto">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <!-- Profile Header -->
          <div class="text-center relative px-6 pt-6">
            <div class="relative inline-block">
              <img
                :src="user?.photoURL || '/default-avatar.svg'"
                :alt="user?.displayName"
                class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white dark:border-gray-800"
                :class="isOnline ? 'ring-4 ring-green-500' : 'ring-4 ring-gray-200 dark:ring-gray-700'"
              />
              <div
                class="absolute bottom-3 right-3 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800"
                :class="isOnline ? 'bg-green-500' : 'bg-gray-400'"
              ></div>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ user?.displayName }}
            </h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">{{ user?.email }}</p>
            <p class="text-sm mt-2" :class="isOnline ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'">
              <template v-if="isOnline">
                <i class="fas fa-circle text-xs mr-1"></i>
                {{ t('chat.online') }}
              </template>
              <template v-else>
                <i class="fas fa-clock text-xs mr-1"></i>
                {{ formatLastSeen }}
              </template>
            </p>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 px-6 py-4 mt-4 border-t border-b border-gray-100 dark:border-gray-700">
            <div class="text-center">
              <div class="text-xl font-bold text-gray-900 dark:text-white">{{ friendsCount }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ t('profile.friends') }}</div>
            </div>
            <div class="text-center border-x border-gray-100 dark:border-gray-700">
              <div class="text-xl font-bold text-gray-900 dark:text-white">{{ chatsCount }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ t('profile.chats') }}</div>
            </div>
            <div class="text-center">
              <div class="text-xl font-bold text-gray-900 dark:text-white">{{ daysJoined }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ t('profile.daysJoined') }}</div>
            </div>
          </div>

          <!-- User Info -->
          <div class="p-6 space-y-6">
            <!-- Bio -->
            <div v-if="user?.bio" class="text-center">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{{ t('profile.bio') }}</h3>
              <p class="text-gray-700 dark:text-gray-300">
                "{{ user.bio }}"
              </p>
            </div>

            <!-- Additional Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ t('profile.joinedOn') }}</h3>
                <p class="text-gray-700 dark:text-gray-300">{{ formatJoinDate }}</p>
              </div>
              <div class="space-y-2">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ t('profile.lastActive') }}</h3>
                <p class="text-gray-700 dark:text-gray-300">{{ formatLastActive }}</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap justify-center gap-4 pt-4">
              <!-- Friend -->
              <template v-if="userStatus === 'friend'">
                <button
                  @click="startChat"
                  class="btn-primary flex items-center space-x-2"
                >
                  <i class="fas fa-comment"></i>
                  <span>{{ t('friends.startChat') }}</span>
                </button>
                <button
                  @click="showRemoveFriendConfirm"
                  class="btn-danger flex items-center space-x-2"
                >
                  <i class="fas fa-user-minus"></i>
                  <span>{{ t('friends.removeFriend') }}</span>
                </button>
              </template>

              <!-- Pending Request -->
              <template v-else-if="userStatus === 'request'">
                <button
                  @click="acceptFriendRequest"
                  class="btn-success flex items-center space-x-2"
                >
                  <i class="fas fa-check"></i>
                  <span>{{ t('friends.accept') }}</span>
                </button>
                <button
                  @click="rejectFriendRequest"
                  class="btn-danger flex items-center space-x-2"
                >
                  <i class="fas fa-times"></i>
                  <span>{{ t('friends.reject') }}</span>
                </button>
              </template>

              <!-- Sent Request -->
              <template v-else-if="userStatus === 'sent'">
                <button
                  @click="cancelFriendRequest"
                  class="btn-secondary flex items-center space-x-2"
                >
                  <i class="fas fa-times"></i>
                  <span>{{ t('friends.cancelRequest') }}</span>
                </button>
              </template>

              <!-- Not Friend -->
              <template v-else>
                <button
                  @click="sendFriendRequest"
                  class="btn-primary flex items-center space-x-2"
                >
                  <i class="fas fa-user-plus"></i>
                  <span>{{ t('friends.addFriend') }}</span>
                </button>
              </template>

              <!-- Report Button -->
              <button
                @click="showReportDialog"
                class="btn-outline flex items-center space-x-2"
              >
                <i class="fas fa-flag"></i>
                <span>{{ t('profile.report') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useFriendsStore } from '@/stores/friends'
import { useAuthStore } from '@/stores/auth'
import { formatDistanceToNow, format } from 'date-fns'
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/index'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()
const friendsStore = useFriendsStore()
const authStore = useAuthStore()

const user = ref(null)
const userStatus = ref(null)
const isOnline = ref(false)
const lastSeen = ref(null)
const friendsCount = ref(0)
const chatsCount = ref(0)

// Computed Properties
const formatLastSeen = computed(() => {
  if (!lastSeen.value) return t('chat.offline')
  return formatDistanceToNow(lastSeen.value.toDate(), { addSuffix: true })
})

const formatJoinDate = computed(() => {
  if (!user.value?.createdAt) return '-'
  return format(user.value.createdAt.toDate(), 'PPP')
})

const formatLastActive = computed(() => {
  if (!user.value?.lastActive) return '-'
  return formatDistanceToNow(user.value.lastActive.toDate(), { addSuffix: true })
})

const daysJoined = computed(() => {
  if (!user.value?.createdAt) return 0
  const createdAt = user.value.createdAt.toDate()
  const now = new Date()
  return Math.floor((now - createdAt) / (1000 * 60 * 60 * 24))
})

// Methods
const startChat = () => {
  router.push(`/chat/${route.params.userId}`)
}

const showRemoveFriendConfirm = () => {
  Swal.fire({
    title: t('friends.confirmRemove'),
    text: t('friends.confirmRemoveMessage'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: t('common.yes'),
    cancelButtonText: t('common.cancel')
  }).then((result) => {
    if (result.isConfirmed) {
      removeFriend()
    }
  })
}

const showReportDialog = () => {
  Swal.fire({
    title: t('profile.reportUser'),
    input: 'textarea',
    inputLabel: t('profile.reportReason'),
    inputPlaceholder: t('profile.reportPlaceholder'),
    showCancelButton: true,
    confirmButtonText: t('profile.submit'),
    cancelButtonText: t('common.cancel'),
    showLoaderOnConfirm: true,
    preConfirm: (reason) => {
      // Here you would implement the report functionality
      console.log('Report submitted:', reason)
      return new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        t('profile.reportSubmitted'),
        t('profile.reportThanks'),
        'success'
      )
    }
  })
}

const sendFriendRequest = async () => {
  await friendsStore.sendFriendRequest(route.params.userId)
  userStatus.value = 'sent'
}

const acceptFriendRequest = async () => {
  await friendsStore.acceptFriendRequest(route.params.userId)
  userStatus.value = 'friend'
  await fetchFriendsCount()
}

const rejectFriendRequest = async () => {
  await friendsStore.rejectFriendRequest(route.params.userId)
  userStatus.value = null
}

const cancelFriendRequest = async () => {
  await friendsStore.cancelFriendRequest(route.params.userId)
  userStatus.value = null
}

const removeFriend = async () => {
  await friendsStore.removeFriend(route.params.userId)
  userStatus.value = null
  await fetchFriendsCount()
}

const updateUserStatus = () => {
  // Check if already friends
  const isFriend = friendsStore.friends.some(friend =>
    friend.participants && friend.participants.includes(route.params.userId)
  )
  if (isFriend) {
    userStatus.value = 'friend'
    return
  }

  // Check if there's a pending request from this user
  const receivedRequest = friendsStore.pendingRequests.find(request =>
    request.senderId === route.params.userId && request.recipientId === authStore.user.uid
  )
  if (receivedRequest) {
    userStatus.value = 'request'
    return
  }

  // Check if we've sent a request to this user
  const sentRequest = friendsStore.sentRequests.find(request =>
    request.senderId === authStore.user.uid && request.recipientId === route.params.userId
  )
  if (sentRequest) {
    userStatus.value = 'sent'
    return
  }

  userStatus.value = null
}

const fetchFriendsCount = async () => {
  const friendsQuery = query(
    collection(db, 'friends'),
    where('participants', 'array-contains', route.params.userId)
  )
  const snapshot = await getDocs(friendsQuery)
  friendsCount.value = snapshot.size
}

const fetchChatsCount = async () => {
  const chatsQuery = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', route.params.userId)
  )
  const snapshot = await getDocs(chatsQuery)
  chatsCount.value = snapshot.size
}

let unsubscribeStatus = null

onMounted(async () => {
  try {
    // Fetch user data
    const userData = await userStore.getUserById(route.params.userId)
    if (!userData) {
      router.push('/404')
      return
    }
    user.value = userData

    // Subscribe to user's online status
    unsubscribeStatus = onSnapshot(doc(db, 'status', route.params.userId), (doc) => {
      if (doc.exists()) {
        const status = doc.data()
        const lastChanged = status.lastChanged?.toDate()
        if (lastChanged) {
          const now = new Date()
          const timeDiff = now.getTime() - lastChanged.getTime()
          isOnline.value = status.state === 'online' && timeDiff < 30000 // 30 seconds threshold
          lastSeen.value = status.lastChanged
        }
      }
    })

    updateUserStatus()
    await Promise.all([
      fetchFriendsCount(),
      fetchChatsCount()
    ])
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
})

onUnmounted(() => {
  if (unsubscribeStatus) {
    unsubscribeStatus()
  }
})
</script>

<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors;
}

.btn-danger {
  @apply px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors;
}

.btn-success {
  @apply px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors;
}

.btn-outline {
  @apply px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors;
}
</style> 