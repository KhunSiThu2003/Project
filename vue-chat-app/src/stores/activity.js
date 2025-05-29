import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  collection, addDoc, serverTimestamp, query, 
  where, orderBy, limit, getDoc, doc, onSnapshot 
} from 'firebase/firestore'
import { db } from '@/firebase/config'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref([])
  const loading = ref(false)
  const error = ref(null)
  let unsubscribeActivity = null

  const addActivity = async ({ type, userId, senderId, message }) => {
    try {
      const activityData = {
        type,
        userId,
        senderId,
        timestamp: serverTimestamp(),
        message
      }

      await addDoc(collection(db, 'activity'), activityData)
    } catch (error) {
      console.error('Error adding activity:', error)
      return false
    }
    return true
  }

  const fetchActivities = async (userId) => {
    loading.value = true
    error.value = null
    try {
      // Clear any existing subscription
      if (unsubscribeActivity) {
        unsubscribeActivity()
      }

      const activityQuery = query(
        collection(db, 'activity'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(5)
      )
      
      // Set up real-time listener
      unsubscribeActivity = onSnapshot(activityQuery, async (snapshot) => {
        const updatedActivities = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const activityData = docSnapshot.data()
            let userProfile = null
            
            try {
              const userDocRef = doc(db, 'users', activityData.senderId)
              const userDocSnap = await getDoc(userDocRef)
              userProfile = userDocSnap.data()
            } catch (err) {
              console.error('Error fetching user profile:', err)
            }

            return {
              id: docSnapshot.id,
              ...activityData,
              userPhotoURL: userProfile?.photoURL || '/default-avatar.svg',
              userName: userProfile?.displayName || 'Unknown User'
            }
          })
        )
        
        activities.value = updatedActivities
      })
      
      return activities.value
    } catch (error) {
      console.error('Error setting up activity listener:', error)
      error.value = error
      return []
    } finally {
      loading.value = false
    }
  }

  // Clean up listener when store is destroyed
  const unsubscribe = () => {
    if (unsubscribeActivity) {
      unsubscribeActivity()
      unsubscribeActivity = null
    }
    activities.value = []
  }

  const logFriendRequest = async (senderId, recipientId) => {
    try {
      await addActivity({
        type: 'friend_request',
        userId: recipientId,
        senderId,
        message: 'sent you a friend request'
      })
    } catch (error) {
      console.error('Error logging friend request:', error)
    }
  }

  const logFriendAccepted = async (userId, friendId) => {
    try {
      await addActivity({
        type: 'friend_accepted',
        userId,
        senderId: friendId,
        message: 'accepted your friend request'
      })
    } catch (error) {
      console.error('Error logging friend acceptance:', error)
    }
  }

  const logFriendRemoved = async (userId, friendId) => {
    try {
      await addActivity({
        type: 'friend_removed',
        userId,
        senderId: friendId,
        message: 'removed you from friends'
      })
    } catch (error) {
      console.error('Error logging friend removal:', error)
    }
  }

  const logNewChatMessage = async (userId, otherUserId) => {
    try {
      await addActivity({
        type: 'chat',
        userId,
        senderId: otherUserId,
        message: 'sent you a new message'
      })
    } catch (error) {
      console.error('Error logging chat message:', error)
    }
  }

  return {
    activities,
    loading,
    error,
    addActivity,
    fetchActivities,
    unsubscribe,
    logFriendRequest,
    logFriendAccepted,
    logFriendRemoved,
    logNewChatMessage
  }
})