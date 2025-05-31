<template>
  <div class="find-friends-container">
    <div class="search-section">
      <h2>Find Friends</h2>
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search by name or email..."
          @input="handleSearch"
        >
        <button class="search-btn" @click="handleSearch">
          Search
        </button>
      </div>
    </div>

    <div class="results-section">
      <div v-if="loading" class="loading">
        Searching...
      </div>
      <div v-else-if="searchResults.length === 0" class="empty-state">
        <p v-if="searchQuery">No users found matching "{{ searchQuery }}"</p>
        <p v-else>Start searching for friends!</p>
      </div>
      <div v-else class="user-cards">
        <div v-for="user in searchResults" :key="user.id" class="user-card">
          <div class="user-info">
            <img :src="user.avatar || '/default-avatar.png'" :alt="user.name" class="avatar">
            <div class="details">
              <h3>{{ user.name }}</h3>
              <p class="email">{{ user.email }}</p>
            </div>
          </div>
          <div class="actions">
            <button 
              v-if="user.friendStatus === 'none'"
              class="add-btn"
              @click="sendFriendRequest(user)"
            >
              Add Friend
            </button>
            <button 
              v-else-if="user.friendStatus === 'pending'"
              class="cancel-btn"
              @click="cancelFriendRequest(user)"
            >
              Cancel Request
            </button>
            <button 
              v-else-if="user.friendStatus === 'friends'"
              class="message-btn"
              @click="startChat(user)"
            >
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useFriendStore } from '../stores/friend'
import debounce from 'lodash.debounce'

const authStore = useAuthStore()
const friendStore = useFriendStore()

const searchQuery = ref('')
const searchResults = ref([])
const loading = ref(false)

// Debounce search to avoid too many API calls
const debouncedSearch = debounce(async (query) => {
  if (!query.trim()) {
    searchResults.value = []
    return
  }

  loading.value = true
  try {
    const results = await friendStore.searchUsers(query)
    // Add friend status to each user
    const usersWithStatus = await Promise.all(
      results.map(async (user) => {
        const status = await friendStore.getFriendStatus(user.id)
        return { ...user, friendStatus: status }
      })
    )
    searchResults.value = usersWithStatus
  } catch (error) {
    console.error('Error searching users:', error)
  } finally {
    loading.value = false
  }
}, 300)

const handleSearch = () => {
  debouncedSearch(searchQuery.value)
}

const sendFriendRequest = async (user) => {
  try {
    await friendStore.sendFriendRequest(user.id)
    // Update the user's status in the results
    const index = searchResults.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      searchResults.value[index].friendStatus = 'pending'
    }
  } catch (error) {
    console.error('Error sending friend request:', error)
  }
}

const cancelFriendRequest = async (user) => {
  try {
    await friendStore.cancelFriendRequest(user.id)
    // Update the user's status in the results
    const index = searchResults.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      searchResults.value[index].friendStatus = 'none'
    }
  } catch (error) {
    console.error('Error canceling friend request:', error)
  }
}

const startChat = (user) => {
  // Implement chat functionality
  console.log('Start chat with:', user)
}
</script>

<style scoped>
.find-friends-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.search-section {
  margin-bottom: 2rem;
}

.search-section h2 {
  margin-bottom: 1rem;
}

.search-box {
  display: flex;
  gap: 0.5rem;
}

input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.search-btn {
  padding: 0.75rem 1.5rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background-color: #1d4ed8;
}

.user-cards {
  display: grid;
  gap: 1rem;
}

.user-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.details h3 {
  margin: 0;
  font-size: 1rem;
}

.email {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn {
  background-color: #2563eb;
  color: white;
}

.add-btn:hover {
  background-color: #1d4ed8;
}

.cancel-btn {
  background-color: #6b7280;
  color: white;
}

.cancel-btn:hover {
  background-color: #4b5563;
}

.message-btn {
  background-color: #10b981;
  color: white;
}

.message-btn:hover {
  background-color: #059669;
}

.loading, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

@media (prefers-color-scheme: dark) {
  input {
    background-color: #1f2937;
    border-color: #374151;
    color: #f3f4f6;
  }

  .user-card {
    background-color: #1f2937;
  }

  .email {
    color: #9ca3af;
  }

  .loading, .empty-state {
    color: #9ca3af;
  }
}
</style> 