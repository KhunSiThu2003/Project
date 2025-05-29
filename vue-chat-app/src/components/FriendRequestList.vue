<template>
  <div class="friend-list-container">
    <!-- Pending Friend Requests Section -->
    <div v-if="friendStore.pendingRequests.length > 0" class="section-card">
      <div class="section-header">
        <h3 class="section-title">
          Friend Requests
          <span class="badge">
            {{ friendStore.pendingRequests.length }}
          </span>
        </h3>
      </div>
      
      <div class="list-container">
        <div 
          v-for="request in friendStore.pendingRequests" 
          :key="request.id"
          class="list-item"
        >
          <div class="user-info">
            <div class="avatar-container">
              <img 
                :src="request.senderPhotoURL || '/default-avatar.png'" 
                :alt="request.senderName"
                class="avatar"
              />
              <div class="status-indicator"></div>
            </div>
            <div class="user-details">
              <h4 class="user-name">
                {{ request.senderName }}
              </h4>
              <p class="timestamp">
                {{ formatDate(request.createdAt) }}
              </p>
            </div>
          </div>
          
          <div class="action-buttons">
            <button
              @click="handleAccept(request.id)"
              class="btn btn-accept"
              :disabled="friendStore.loading"
            >
              Accept
            </button>
            <button
              @click="handleReject(request.id)"
              class="btn btn-reject"
              :disabled="friendStore.loading"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Friends List Section -->
    <div class="section-card">
      <div class="section-header">
        <h3 class="section-title">
          Friends
          <span class="badge badge-purple">
            {{ friendStore.friends.length }}
          </span>
        </h3>
      </div>

      <div class="list-container">
        <div 
          v-for="friend in friendStore.friends" 
          :key="friend.id"
          class="list-item"
        >
          <div class="user-info">
            <div class="avatar-container">
              <img 
                :src="friend.friendPhotoURL || '/default-avatar.png'" 
                :alt="friend.friendName"
                class="avatar"
              />
              <div class="status-indicator"></div>
            </div>
            <div class="user-details">
              <h4 class="user-name">
                {{ friend.friendName }}
              </h4>
              <p class="timestamp">
                Added {{ formatDate(friend.createdAt) }}
              </p>
            </div>
          </div>

          <button
            @click="handleRemoveFriend(friend.friendId)"
            class="btn btn-remove"
            :disabled="friendStore.loading"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useFriendStore } from '@/stores/friend'
import { useToast } from '@/composables/useToast'

const friendStore = useFriendStore()
const { showToast } = useToast()

// Subscribe to friend requests and friends list when component is mounted
onMounted(() => {
  const unsubscribeRequests = friendStore.subscribeToFriendRequests()
  const unsubscribeFriends = friendStore.subscribeToFriends()
  
  onUnmounted(() => {
    if (unsubscribeRequests) unsubscribeRequests()
    if (unsubscribeFriends) unsubscribeFriends()
  })
})

const handleAccept = async (requestId) => {
  try {
    await friendStore.acceptFriendRequest(requestId)
  } catch (error) {
    console.error('Error accepting friend request:', error)
    showToast('error', 'Error', 'Failed to accept friend request')
  }
}

const handleReject = async (requestId) => {
  try {
    await friendStore.rejectFriendRequest(requestId)
  } catch (error) {
    console.error('Error rejecting friend request:', error)
    showToast('error', 'Error', 'Failed to reject friend request')
  }
}

const handleRemoveFriend = async (friendId) => {
  try {
    await friendStore.removeFriend(friendId)
  } catch (error) {
    console.error('Error removing friend:', error)
    showToast('error', 'Error', 'Failed to remove friend')
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
.friend-list-container {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.badge {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: #dbeafe;
  color: #1e40af;
  border-radius: 9999px;
}

.badge-purple {
  background-color: #f3e8ff;
  color: #6b21a8;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease-in-out;
}

.list-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  object-fit: cover;
  border: 2px solid white;
}

.status-indicator {
  position: absolute;
  bottom: -0.25rem;
  right: -0.25rem;
  width: 1rem;
  height: 1rem;
  background-color: #34d399;
  border: 2px solid white;
  border-radius: 9999px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.timestamp {
  font-size: 0.875rem;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-accept {
  background-color: #10b981;
  color: white;
}

.btn-accept:hover:not(:disabled) {
  background-color: #059669;
}

.btn-reject, .btn-remove {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-reject:hover:not(:disabled), .btn-remove:hover:not(:disabled) {
  background-color: #e5e7eb;
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
  .section-card {
    background-color: #1f2937;
  }

  .section-title {
    color: #f9fafb;
  }

  .list-item {
    background-color: rgba(31, 41, 55, 0.5);
    border-color: #4b5563;
  }

  .avatar {
    border-color: #1f2937;
  }

  .status-indicator {
    border-color: #1f2937;
  }

  .user-name {
    color: #f9fafb;
  }

  .timestamp {
    color: #9ca3af;
  }

  .btn-reject, .btn-remove {
    background-color: #4b5563;
    color: #e5e7eb;
  }

  .btn-reject:hover:not(:disabled), .btn-remove:hover:not(:disabled) {
    background-color: #6b7280;
  }
}
</style> 