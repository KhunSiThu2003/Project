<template>
  <button
    @click="handleAddFriend"
    class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
    :disabled="loading"
  >
    <span v-if="loading">Adding...</span>
    <span v-else>Add Friend</span>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { useFriendStore } from '@/stores/friend'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  receiverId: {
    type: String,
    required: true
  }
})

const friendStore = useFriendStore()
const { showToast } = useToast()
const loading = ref(false)

const handleAddFriend = async () => {
  loading.value = true
  try {
    await friendStore.sendFriendRequest(props.receiverId)
    showToast('success', 'Success', 'Friend request sent successfully!')
  } catch (error) {
    console.error('Error sending friend request:', error)
    showToast('error', 'Error', error.message || 'Failed to send friend request')
  } finally {
    loading.value = false
  }
}
</script> 