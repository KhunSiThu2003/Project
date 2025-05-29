import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  limit,
  getDoc,
  setDoc,
  writeBatch
} from 'firebase/firestore'
import { db } from '@/firebase/index'
import { useAuthStore } from './auth'
import { useToast } from '@/composables/useToast'

export const useFriendStore = defineStore('friend', () => {
  const friends = ref([])
  const friendRequests = ref([])
  const sentRequests = ref([])
  const loading = ref(false)
  const error = ref(null)
  const { showToast } = useToast()
  const authStore = useAuthStore()
  const unreadRequestCount = ref(0)
  const isSubscribed = ref(false)
  const unsubscribeFunctions = ref([])

  const pendingRequests = computed(() => 
    friendRequests.value
      .filter(request => 
        request.status === 'pending' && 
        request.receiverId === authStore.user?.uid
      )
      .sort((a, b) => {
        const timeA = a.createdAt?.toDate?.() || new Date(0)
        const timeB = b.createdAt?.toDate?.() || new Date(0)
        return timeB - timeA
      })
  )

  const pendingRequestsCount = computed(() => 
    friendRequests.value.filter(request => 
      request.status === 'pending' && 
      request.receiverId === authStore.user?.uid
    ).length
  )

  const acceptedRequests = computed(() => 
    friendRequests.value.filter(request => request.status === 'accepted')
  )

  // Listen for friend requests in real-time
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
        where('receiverId', '==', authStore.user.uid),
        where('status', '==', 'pending'),
        limit(50)
      )

      const unsubscribeReceived = onSnapshot(receivedQuery, 
        async (snapshot) => {
          try {
            const requests = []
            
            // Process each request
            await Promise.all(snapshot.docs.map(async (doc) => {
              const requestData = doc.data()
              try {
                // Get sender's user data
                const senderDoc = await getDoc(doc(db, 'users', requestData.senderId))
                if (senderDoc.exists()) {
                  const request = {
                    id: doc.id,
                    ...requestData,
                    sender: {
                      id: senderDoc.id,
                      ...senderDoc.data()
                    }
                  }
                  requests.push(request)
                }
              } catch (err) {
                console.error('Error fetching sender data:', err)
              }
            }))
            
            friendRequests.value = requests
            unreadRequestCount.value = requests.length

            // Show notification for new requests
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const request = change.doc.data()
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
            friendRequests.value = []
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

  // Listen for friends list in real-time
  const subscribeToFriends = () => {
    if (!authStore.user) return

    try {
      // Query for friends where current user is participant
      const q = query(
        collection(db, 'friends'),
        where('participants', 'array-contains', authStore.user.uid),
        limit(50)
      )

      const unsubscribe = onSnapshot(q, 
        async (snapshot) => {
          const friendsList = []
          
          for (const doc of snapshot.docs) {
            const data = doc.data()
            const friendId = data.participants.find(id => id !== authStore.user.uid)
            
            // Get friend's user data
            const userDoc = await getDocs(query(
              collection(db, 'users'),
              where('id', '==', friendId)
            ))
            
            if (!userDoc.empty) {
              friendsList.push({
                id: friendId,
                ...userDoc.docs[0].data(),
                friendshipId: doc.id,
                createdAt: data.createdAt
              })
            }
          }
          
          // Sort friends by creation time
          friendsList.sort((a, b) => {
            const timeA = a.createdAt?.toDate?.() || new Date(0)
            const timeB = b.createdAt?.toDate?.() || new Date(0)
            return timeB - timeA
          })
          
          friends.value = friendsList
        },
        (error) => {
          console.error('Error in friends subscription:', error)
          if (error.code === 'failed-precondition') {
            showToast('info', 'Setting Up', 'Please wait while we set up the database. This may take a few minutes.')
            friends.value = []
          } else {
            showToast('error', 'Error', 'Failed to load friends list')
          }
        }
      )

      unsubscribeFunctions.value.push(unsubscribe)
      return unsubscribe
    } catch (err) {
      console.error('Error setting up friends subscription:', err)
      showToast('error', 'Error', 'Failed to set up friends list')
      return null
    }
  }

  const sendFriendRequest = async (receiverId) => {
    loading.value = true
    error.value = null
    try {
      // Check if request already exists
      const existingRequest = sentRequests.value.find(
        request => request.receiverId === receiverId && request.status === 'pending'
      )

      if (existingRequest) {
        throw new Error('Friend request already sent')
      }

      // Check if already friends
      const existingFriend = friends.value.find(
        friend => friend.id === receiverId
      )

      if (existingFriend) {
        throw new Error('Already friends with this user')
      }

      const requestData = {
        senderId: authStore.user.uid,
        senderName: authStore.user.displayName,
        senderPhotoURL: authStore.user.photoURL,
        receiverId,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await addDoc(collection(db, 'friendRequests'), requestData)

    } catch (err) {
      error.value = err.message
      showToast('error', 'Error', err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  const cancelFriendRequest = async (requestId) => {
    loading.value = true
    error.value = null
    try {
      await deleteDoc(doc(db, 'friendRequests', requestId))

    } catch (err) {
      error.value = err.message
      showToast('error', 'Error', err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  const acceptFriendRequest = async (requestId) => {
    if (!authStore.user) {
      throw new Error('No authenticated user found')
    }

    loading.value = true
    error.value = null
    try {
      const request = friendRequests.value.find(r => r.id === requestId)
      if (!request) {
        throw new Error('Friend request not found')
      }

      // Check if friendship already exists
      const existingFriendship = await getDocs(query(
        collection(db, 'friends'),
        where('participants', 'array-contains', authStore.user.uid)
      ))

      const friendshipExists = existingFriendship.docs.some(doc => {
        const data = doc.data()
        return data.participants.includes(request.senderId)
      })

      if (friendshipExists) {
        throw new Error('Friendship already exists')
      }

      // Get both users' data
      const [senderDoc, receiverDoc] = await Promise.all([
        getDoc(doc(db, 'users', request.senderId)),
        getDoc(doc(db, 'users', authStore.user.uid))
      ])

      if (!senderDoc.exists() || !receiverDoc.exists()) {
        throw new Error('User data not found')
      }

      const timestamp = serverTimestamp()

      // Use a batch write to ensure all operations succeed or fail together
      const batch = writeBatch(db)

      // 1. Update the friend request status
      const requestRef = doc(db, 'friendRequests', requestId)
      batch.update(requestRef, {
        status: 'accepted',
        updatedAt: timestamp,
        read: true,
        readAt: timestamp
      })

      // 2. Create the friendship document
      const friendshipRef = doc(collection(db, 'friends'))
      batch.set(friendshipRef, {
        participants: [authStore.user.uid, request.senderId],
        participantsData: {
          [authStore.user.uid]: {
            name: receiverDoc.data().displayName,
            photoURL: receiverDoc.data().photoURL,
            email: receiverDoc.data().email
          },
          [request.senderId]: {
            name: senderDoc.data().displayName,
            photoURL: senderDoc.data().photoURL,
            email: senderDoc.data().email
          }
        },
        createdAt: timestamp,
        updatedAt: timestamp
      })

      // Commit all changes
      await batch.commit()

      // Update local state
      friendRequests.value = friendRequests.value.filter(r => r.id !== requestId)
      unreadRequestCount.value = Math.max(0, unreadRequestCount.value - 1)

    } catch (err) {
      console.error('Error in acceptFriendRequest:', err)
      error.value = err.message
      showToast('error', 'Error', err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  const rejectFriendRequest = async (requestId) => {
    if (!authStore.user) {
      throw new Error('No authenticated user found')
    }

    loading.value = true
    error.value = null
    try {
      const request = friendRequests.value.find(r => r.id === requestId)
      if (!request) {
        throw new Error('Friend request not found')
      }

      await updateDoc(doc(db, 'friendRequests', requestId), {
        status: 'rejected',
        updatedAt: serverTimestamp(),
        read: true,
        readAt: serverTimestamp()
      })

      // Update local state
      friendRequests.value = friendRequests.value.filter(r => r.id !== requestId)
      unreadRequestCount.value = Math.max(0, unreadRequestCount.value - 1)

    } catch (err) {
      console.error('Error in rejectFriendRequest:', err)
      error.value = err.message
      showToast('error', 'Error', err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeFriend = async (friendId) => {
    loading.value = true
    error.value = null
    try {
      // Find and delete the friendship document
      const friendshipQuery = query(
        collection(db, 'friends'),
        where('participants', 'array-contains', authStore.user.uid)
      )
      
      const snapshot = await getDocs(friendshipQuery)
      const friendship = snapshot.docs.find(doc => {
        const data = doc.data()
        return data.participants.includes(friendId)
      })

      if (friendship) {
        await deleteDoc(doc(db, 'friends', friendship.id))
        // Remove friend from local state immediately
        friends.value = friends.value.filter(f => f.id !== friendId)
      }

    } catch (err) {
      error.value = err.message
      showToast('error', 'Error', err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Mark friend request as read
  const markRequestAsRead = async (requestId) => {
    if (!authStore.user) return

    try {
      await updateDoc(doc(db, 'friendRequests', requestId), {
        read: true,
        readAt: serverTimestamp()
      })
    } catch (err) {
      console.error('Error marking request as read:', err)
    }
  }

  // Mark all friend requests as read
  const markAllRequestsAsRead = async () => {
    if (!authStore.user) return

    try {
      const batch = writeBatch(db)
      const unreadRequests = friendRequests.value.filter(
        request => request.status === 'pending' && !request.read
      )

      unreadRequests.forEach(request => {
        const requestRef = doc(db, 'friendRequests', request.id)
        batch.update(requestRef, {
          read: true,
          readAt: serverTimestamp()
        })
      })

      await batch.commit()
      unreadRequestCount.value = 0
    } catch (err) {
      console.error('Error marking all requests as read:', err)
    }
  }

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
    sentRequests.value = []
    unreadRequestCount.value = 0
    isSubscribed.value = false
  }

  return {
    friends,
    friendRequests,
    sentRequests,
    pendingRequests,
    acceptedRequests,
    loading,
    error,
    unreadRequestCount,
    pendingRequestsCount,
    isSubscribed,
    subscribeToFriendRequests,
    subscribeToFriends,
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    markRequestAsRead,
    markAllRequestsAsRead,
    cleanup
  }
}) 