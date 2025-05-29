<template>
  <div class="fixed top-4 right-4 z-50">
    <div v-if="pendingRequests.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Friend Requests
          <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">
            ({{ pendingRequests.length }})
          </span>
        </h3>
        <button
          @click="clearAllRequests"
          class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          :disabled="loading"
        >
          Clear All
        </button>
      </div>
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <div 
          v-for="request in pendingRequests" 
          :key="request.id" 
          class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
        >
          <div class="flex items-center space-x-2">
            <img 
              :src="request.senderPhotoURL || '/default-avatar.png'" 
              :alt="request.senderName"
              class="w-8 h-8 rounded-full object-cover"
            />
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ request.senderName }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatDate(request.createdAt) }}
              </span>
            </div>
          </div>
          <div class="flex space-x-2">
            <button
              @click="handleAccept(request.id)"
              class="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              :disabled="loading"
            >
              Accept
            </button>
            <button
              @click="handleReject(request.id)"
              class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              :disabled="loading"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useFriendStore } from '@/stores/friend'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/composables/useToast'

const friendStore = useFriendStore()
const userStore = useUserStore()
const { showToast } = useToast()
const { pendingRequests, loading, acceptFriendRequest, rejectFriendRequest } = friendStore

// Subscribe to friend requests when component is mounted
onMounted(() => {
  const unsubscribe = friendStore.subscribeToFriendRequests()
  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })
})

const handleAccept = async (requestId) => {
  try {
    await acceptFriendRequest(requestId)
  } catch (error) {
    console.error('Error accepting friend request:', error)
    showToast('error', 'Error', 'Failed to accept friend request')
  }
}

const handleReject = async (requestId) => {
  try {
    await rejectFriendRequest(requestId)
  } catch (error) {
    console.error('Error rejecting friend request:', error)
    showToast('error', 'Error', 'Failed to reject friend request')
  }
}

const clearAllRequests = async () => {
  try {
    for (const request of pendingRequests.value) {
      await rejectFriendRequest(request.id)
    }
    showToast('success', 'Success', 'All friend requests cleared')
  } catch (error) {
    console.error('Error clearing friend requests:', error)
    showToast('error', 'Error', 'Failed to clear friend requests')
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate()
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24)),
    'day'
  )
}
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}
</style> 