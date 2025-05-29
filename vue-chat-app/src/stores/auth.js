import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  applyActionCode,
  checkActionCode,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/index'
import { useToast } from '@/composables/useToast'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const { showToast } = useToast()

  const auth = getAuth()
  const googleProvider = new GoogleAuthProvider()

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const init = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
            if (userDoc.exists()) {
              user.value = {
                uid: firebaseUser.uid,
                ...userDoc.data()
              }
            } else {
              // Create user document if it doesn't exist
              const userData = {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: 'user',
                createdAt: new Date(),
                lastActive: new Date()
              }
              await setDoc(doc(db, 'users', firebaseUser.uid), userData)
              user.value = {
                uid: firebaseUser.uid,
                ...userData
              }
            }
          } catch (err) {
            console.error('Error fetching user data:', err)
            error.value = err.message
          }
        } else {
          user.value = null
        }
        resolve()
      })
    })
  }

  const register = async (email, password, userData) => {
    loading.value = true
    error.value = null
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Send verification email
      await sendEmailVerification(userCredential.user)
      
      const newUserData = {
        email,
        ...userData,
        role: 'user',
        emailVerified: false,
        createdAt: new Date(),
        lastActive: new Date()
      }
      await setDoc(doc(db, 'users', userCredential.user.uid), newUserData)
      user.value = {
        uid: userCredential.user.uid,
        ...newUserData
      }
      showToast('success', 'Success', 'Account created! Please check your email to verify your account.')
    } catch (err) {
      error.value = getErrorMessage(err.code)
      showToast('error', 'Error', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const login = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        await signOut(auth) // Sign out the user if email is not verified
        throw new Error('auth/email-not-verified')
      }

      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
      if (userDoc.exists()) {
        user.value = {
          uid: userCredential.user.uid,
          ...userDoc.data(),
          emailVerified: userCredential.user.emailVerified
        }
        showToast('success', 'Success', 'Logged in successfully!')
      }
    } catch (err) {
      error.value = getErrorMessage(err.code)
      showToast('error', 'Error', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const loginWithGoogle = async () => {
    loading.value = true
    error.value = null
    try {
      const { user: firebaseUser } = await signInWithPopup(auth, googleProvider)
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        const userData = {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: 'user',
          createdAt: new Date(),
          lastActive: new Date()
        }
        await setDoc(doc(db, 'users', firebaseUser.uid), userData)
        user.value = {
          uid: firebaseUser.uid,
          ...userData
        }
      } else {
        user.value = {
          uid: firebaseUser.uid,
          ...userDoc.data()
        }
      }
      showToast('success', 'Success', 'Logged in with Google successfully!')
    } catch (err) {
      error.value = getErrorMessage(err.code)
      showToast('error', 'Error', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    error.value = null
    try {
      await signOut(auth)
      user.value = null
      showToast('success', 'Success', 'Logged out successfully!')
    } catch (err) {
      error.value = getErrorMessage(err.code)
      showToast('error', 'Error', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUserProfile = async (data) => {
    loading.value = true
    error.value = null
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, data)
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          ...data,
          lastActive: new Date()
        }, { merge: true })

        // Update local user state
        user.value = {
          ...user.value,
          ...data
        }
        showToast('success', 'Success', 'Profile updated successfully!')
      }
    } catch (err) {
      error.value = getErrorMessage(err.code)
      showToast('error', 'Error', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const resendVerificationEmail = async () => {
    loading.value = true
    error.value = null
    try {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await sendEmailVerification(auth.currentUser)
        showToast('success', 'Success', 'Verification email sent! Please check your inbox.')
      } else {
        throw new Error('auth/no-user-to-verify')
      }
    } catch (err) {
      error.value = getErrorMessage(err.code)
      showToast('error', 'Error', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const verifyEmail = async (actionCode) => {
    loading.value = true
    error.value = null
    try {
      // Verify the email verification code
      await checkActionCode(auth, actionCode)
      await applyActionCode(auth, actionCode)
      
      // Update user document
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          emailVerified: true
        }, { merge: true })
        
        // Update local user state
        if (user.value) {
          user.value.emailVerified = true
        }
      }
      
      showToast('success', 'Success', 'Email verified successfully! You can now log in.')
    } catch (err) {
      error.value = getErrorMessage(err.code)
      showToast('error', 'Error', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const sendPasswordResetEmail = async (email) => {
    loading.value = true
    error.value = null
    try {
      // Use the renamed Firebase function
      await firebaseSendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/login',
        handleCodeInApp: true
      })
      return { success: true }
    } catch (err) {
      console.error('Password reset error:', err) // Add logging
      error.value = getErrorMessage(err.code)
      return { 
        success: false, 
        errorCode: err.code,
        errorMessage: getErrorMessage(err.code)
      }
    } finally {
      loading.value = false
    }
  }

  // Helper function to get user-friendly error messages
  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/invalid-email': 'Invalid email address',
      'auth/user-disabled': 'This account has been disabled',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'Email is already registered',
      'auth/weak-password': 'Password is too weak',
      'auth/operation-not-allowed': 'Operation not allowed',
      'auth/account-exists-with-different-credential': 'An account already exists with the same email address but different sign-in credentials',
      'auth/popup-closed-by-user': 'Sign-in popup was closed before completing the sign-in',
      'auth/cancelled-popup-request': 'Multiple popup requests were made',
      'auth/popup-blocked': 'Popup was blocked by the browser',
      'auth/network-request-failed': 'Network error occurred. Please check your internet connection',
      'auth/email-not-verified': 'Please verify your email before logging in. Check your inbox for the verification link.',
      'auth/invalid-action-code': 'The verification link is invalid or has expired.',
      'auth/no-user-to-verify': 'No user found to verify email.',
      'auth/expired-action-code': 'The verification link has expired. Please request a new one.',
      'auth/invalid-verification-code': 'Invalid verification code.',
      'auth/missing-verification-code': 'Missing verification code.',
      'auth/too-many-requests': 'Too many attempts. Please try again later'
    }
    return errorMessages[errorCode] || 'An error occurred during password reset'
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    init,
    register,
    login,
    loginWithGoogle,
    logout,
    updateUserProfile,
    resendVerificationEmail,
    verifyEmail,
    sendPasswordResetEmail
  }
}) 