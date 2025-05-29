import { defineStore } from 'pinia'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
  limit,
  getDoc,
  setDoc
} from 'firebase/firestore'
import { db } from '@/firebase/index'
import { useAuthStore } from './auth'
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import { useActivityStore } from './activity'

export const useFriendsStore = defineStore('friends', () => {
  const friends = ref([])
  const friendRequests = ref([])
  const pendingRequests = ref([])
  const loading = ref(false)
  const error = ref(null)
  const onlineUsers = ref({}) // Track online status of users
  const lastSeen = ref({}) // Track last seen timestamps
  const { showToast } = useToast()
  const authStore = useAuthStore()
  const activityStore = useActivityStore()
  const unreadRequestCount = ref(0)
  const isSubscribed = ref(false)
  const unsubscribeFunctions = ref([])

  const fetchFriends = async (userId) => {
    loading.value = true
    error.value = null
    try {
      const friendsQuery = query(
        collection(db, 'friends'),
        where('status', '==', 'accepted'),
        where('participants', 'array-contains', userId)
      )
      const querySnapshot = await getDocs(friendsQuery)
      friends.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const fetchPendingRequests = async () => {
    loading.value = true
    error.value = null
    try {
      const authStore = useAuthStore()
      const q = query(
        collection(db, 'friendRequests'),
        where('recipientId', '==', authStore.user.uid),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      pendingRequests.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const sendFriendRequest = async (userId) => {
    loading.value = true
    error.value = null
    try {
      // Check if request already exists
      const existingRequest = await getDocs(query(
        collection(db, 'friendRequests'),
        where('senderId', '==', authStore.user.uid),
        where('recipientId', '==', userId),
        where('status', '==', 'pending')
      ))

      if (!existingRequest.empty) {
        throw new Error('Friend request already sent')
      }

      // Create friend request
      const requestRef = await addDoc(collection(db, 'friendRequests'), {
        senderId: authStore.user.uid,
        senderName: authStore.user.displayName,
        senderPhotoURL: authStore.user.photoURL,
        recipientId: userId,
        status: 'pending',
        createdAt: serverTimestamp()
      })

      // Log activity for sender
      await activityStore.addActivity({
        type: 'sent',
        userId: authStore.user.uid,
        senderId: userId,
        message: 'You sent a friend request'
      })

      // Log activity for recipient
      await activityStore.addActivity({
        type: 'received',
        userId: userId,
        senderId: authStore.user.uid,
        message: 'sent you a friend request'
      })

    } catch (err) {
      error.value = err.message
      showToast('error', 'Error', err.message)
    } finally {
      loading.value = false
    }
  }

  const acceptFriendRequest = async (requestId) => {
    loading.value = true
    error.value = null
    try {
      const request = pendingRequests.value.find(r => r.id === requestId)
      if (!request) throw new Error('Friend request not found')

      // Update request status
      await updateDoc(doc(db, 'friendRequests', requestId), {
        status: 'accepted',
        acceptedAt: serverTimestamp()
      })

      // Create friend relationship
      await addDoc(collection(db, 'friends'), {
        participants: [authStore.user.uid, request.senderId],
        status: 'accepted',
        createdAt: serverTimestamp()
      })

      // Update local state
      pendingRequests.value = pendingRequests.value.filter(r => r.id !== requestId)
      await fetchFriends(authStore.user.uid)

      // Log activity for acceptor
      await activityStore.addActivity({
        type: 'sent',
        userId: authStore.user.uid,
        senderId: request.senderId,
        message: 'You accepted a friend request'
      })

      // Log activity for sender
      await activityStore.addActivity({
        type: 'received',
        userId: request.senderId,
        senderId: authStore.user.uid,
        message: 'Accepted your friend request'
      })

    } catch (err) {
      error.value = err.message
      showToast('error', 'Error', err.message)
    } finally {
      loading.value = false
    }
  }

  const rejectFriendRequest = async (requestId) => {
    loading.value = true
    error.value = null
    try {
      const request = pendingRequests.value.find(r => r.id === requestId)
      if (!request) throw new Error('Friend request not found')

      await updateDoc(doc(db, 'friendRequests', requestId), {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      })

      // Update local state
      pendingRequests.value = pendingRequests.value.filter(r => r.id !== requestId)

      // Log activity for rejector
      await activityStore.addActivity({
        type: 'sent',
        userId: authStore.user.uid,
        senderId: request.senderId,
        message: 'You rejected a friend request'
      })

      // Log activity for sender
      await activityStore.addActivity({
        type: 'received',
        userId: request.senderId,
        senderId: authStore.user.uid,
        message: 'rejected your friend request'
      })

    } catch (err) {
      error.value = err.message
      showToast('error', 'Error', err.message)
    } finally {
      loading.value = false
    }
  }

  const removeFriend = async (friendId) => {
    loading.value = true
    error.value = null
    try {
      // Find the friendship document
      const friendsQuery = query(
        collection(db, 'friends'),
        where('participants', 'array-contains', authStore.user.uid)
      )
      const snapshot = await getDocs(friendsQuery)
      
      for (const doc of snapshot.docs) {
        const data = doc.data()
        if (data.participants.includes(friendId)) {
          await deleteDoc(doc.ref)
          break
        }
      }

      // Update local state
      friends.value = friends.value.filter(f => f.id !== friendId)

      // Log activity for remover
      await activityStore.addActivity({
        type: 'sent',
        userId: authStore.user.uid,
        senderId: friendId,
        message: 'You removed a friend'
      })

      // Log activity for removed friend
      await activityStore.addActivity({
        type: 'received',
        userId: friendId,
        senderId: authStore.user.uid,
        message: 'removed you from friends'
      })
    } catch (err) {
      error.value = err.message
      showToast('error', 'Error', err.message)
    } finally {
      loading.value = false
    }
  }

  const cancelFriendRequest = async (userId) => {
    loading.value = true
    error.value = null
    try {
      // Find the pending request
      const requestsQuery = query(
        collection(db, 'friendRequests'),
        where('senderId', '==', authStore.user.uid),
        where('recipientId', '==', userId),
        where('status', '==', 'pending')
      )
      
      const snapshot = await getDocs(requestsQuery)
      if (snapshot.empty) {
        throw new Error('No pending friend request found')
      }

      const requestDoc = snapshot.docs[0]
      const requestData = requestDoc.data()

      // Delete the request
      await deleteDoc(doc(db, 'friendRequests', requestDoc.id))

      // Update local state
      pendingRequests.value = pendingRequests.value.filter(r => r.id !== requestDoc.id)

      // Log activity for canceler
      await activityStore.addActivity({
        type: 'sent',
        userId: authStore.user.uid,
        senderId: userId,
        message: 'You cancelled a friend request'
      })

      // Log activity for recipient
      await activityStore.addActivity({
        type: 'received',
        userId: userId,
        senderId: authStore.user.uid,
        message: 'cancelled their friend request'
      })

      showToast('success', 'Success', 'Friend request cancelled successfully')
    } catch (err) {
      error.value = err.message
      showToast('error', 'Error', err.message)
    } finally {
      loading.value = false
    }
  }
  

  const searchUsers = async (query) => {
    loading.value = true
    error.value = null
    try {
      const usersRef = collection(db, 'users')
      const q = query(
        usersRef,
        where('displayName', '>=', query),
        where('displayName', '<=', query + '\uf8ff'),
        limit(10)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const clearFriends = () => {
    friends.value = []
    friendRequests.value = []
    pendingRequests.value = []
  }

  // Update current user's online status
  const updateOnlineStatus = async (isOnline) => {
    const authStore = useAuthStore()
    if (!authStore.user) return

    try {
      const userStatusRef = doc(db, 'status', authStore.user.uid)
      const statusData = {
        state: isOnline ? 'online' : 'offline',
        lastChanged: serverTimestamp(),
        lastSeen: isOnline ? serverTimestamp() : serverTimestamp()
      }

      await setDoc(userStatusRef, statusData, { merge: true })

      // Also update the user's document with last seen
      const userRef = doc(db, 'users', authStore.user.uid)
      await updateDoc(userRef, {
        lastSeen: serverTimestamp(),
        isOnline: isOnline
      })
    } catch (err) {
      console.error('Error updating online status:', err)
    }
  }

  // Subscribe to user's online status
  const subscribeToOnlineStatus = (userId) => {
    if (!userId) return null

    try {
      const userStatusRef = doc(db, 'status', userId)
      
      // Set up real-time listener for user's online status
      const unsubscribe = onSnapshot(userStatusRef, 
        (doc) => {
          if (doc.exists()) {
            const data = doc.data()
            onlineUsers.value[userId] = data.state === 'online'
            lastSeen.value[userId] = data.lastSeen
          } else {
            // If no status document exists, user is offline
            onlineUsers.value[userId] = false
            lastSeen.value[userId] = null
          }
        },
        (error) => {
          console.error('Error in online status subscription:', error)
          onlineUsers.value[userId] = false
          lastSeen.value[userId] = null
        }
      )

      return unsubscribe
    } catch (err) {
      console.error('Error setting up online status subscription:', err)
      return null
    }
  }

  // Get user's online status
  const isUserOnline = (userId) => {
    return onlineUsers.value[userId] || false
  }

  // Get user's last seen timestamp
  const getUserLastSeen = (userId) => {
    return lastSeen.value[userId] || null
  }

  // Subscribe to friend requests in real-time
  const subscribeToFriendRequests = async () => {
    if (!authStore.user) {
      console.error('No authenticated user found')
      return null
    }

    if (isSubscribed.value) {
      console.log('Already subscribed to friend requests')
      return null
    }

    try {
      // Query for received requests
      const receivedQuery = query(
        collection(db, 'friendRequests'),
        where('recipientId', '==', authStore.user.uid),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc'),
        limit(50)
      )

      const unsubscribeReceived = onSnapshot(receivedQuery, 
        async (snapshot) => {
          try {
            const requests = []
            
            // Process each request
            await Promise.all(snapshot.docs.map(async (requestDoc) => {
              const requestData = requestDoc.data()
              try {
                // Get sender's user data
                const senderDocRef = doc(db, 'users', requestData.senderId)
                const senderDocSnap = await getDoc(senderDocRef)
                if (senderDocSnap.exists()) {
                  const request = {
                    id: requestDoc.id,
                    ...requestData,
                    sender: {
                      id: senderDocSnap.id,
                      ...senderDocSnap.data()
                    }
                  }
                  requests.push(request)
                }
              } catch (err) {
                console.error('Error fetching sender data:', err)
              }
            }))
            
            // Sort requests by createdAt after fetching
            requests.sort((a, b) => {
              const timeA = a.createdAt?.toDate?.() || new Date(0)
              const timeB = b.createdAt?.toDate?.() || new Date(0)
              return timeB - timeA
            })
            
            pendingRequests.value = requests
            unreadRequestCount.value = requests.length

            // Show notification for new requests
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                // Emit event for new request
                window.dispatchEvent(new CustomEvent('new-friend-request'))
              }
            })
          } catch (err) {
            console.error('Error processing friend requests:', err)
            showToast('error', 'Error', 'Failed to process friend requests')
          }
        },
        (error) => {
          console.error('Error in friend requests subscription:', error)
          isSubscribed.value = false
          if (error.code === 'failed-precondition') {
            showToast('info', 'Setting Up', 'Please wait while we set up the database. This may take a few minutes.')
            pendingRequests.value = []
            unreadRequestCount.value = 0
          } else {
            showToast('error', 'Error', 'Failed to load friend requests')
          }
        }
      )

      unsubscribeFunctions.value.push(unsubscribeReceived)
      isSubscribed.value = true
      return unsubscribeReceived
    } catch (err) {
      console.error('Error setting up friend requests subscription:', err)
      isSubscribed.value = false
      showToast('error', 'Error', 'Failed to set up friend requests')
      return null
    }
  }

  // Cleanup function
  const cleanup = () => {
    // Unsubscribe from all listeners
    unsubscribeFunctions.value.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    })
    unsubscribeFunctions.value = []
    
    // Reset state
    friends.value = []
    friendRequests.value = []
    pendingRequests.value = []
    unreadRequestCount.value = 0
    isSubscribed.value = false
  }

  return {
    friends,
    friendRequests,
    pendingRequests,
    loading,
    error,
    onlineUsers,
    lastSeen,
    unreadRequestCount,
    isSubscribed,
    subscribeToFriendRequests,
    fetchFriends,
    fetchPendingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    searchUsers,
    clearFriends,
    cancelFriendRequest,
    subscribeToOnlineStatus,
    updateOnlineStatus,
    isUserOnline,
    getUserLastSeen,
    cleanup
  }
}) 