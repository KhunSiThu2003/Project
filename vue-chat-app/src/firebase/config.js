import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3SOI4m4IyJ95QFubLRvvlSocDvb3EcYM",
  authDomain: "chatting-application-fa399.firebaseapp.com",
  projectId: "chatting-application-fa399",
  storageBucket: "chatting-application-fa399.firebasestorage.app",
  messagingSenderId: "980963932139",
  appId: "1:980963932139:web:d01d63c8eb057dd2400bae"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app 