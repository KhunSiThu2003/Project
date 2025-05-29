import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  onSnapshot
} from 'firebase/firestore'
import { db } from '@/firebase/index'
import { useAuthStore } from './auth'

export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  const searchUsers = async (searchTerm) => {
    loading.value = true
    error.value = null
    try {
      const q = query(
        collection(db, 'users'),
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff')
      )
      const querySnapshot = await getDocs(q)
      users.value = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(user => user.id !== authStore.user?.uid) // Exclude current user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getUserById = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data()
        }
      }
      return null
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const subscribeToUser = (userId, callback) => {
    if (!userId) return

    return onSnapshot(doc(db, 'users', userId), (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        })
      }
    })
  }

  return {
    users,
    loading,
    error,
    searchUsers,
    getUserById,
    subscribeToUser
  }
}) 