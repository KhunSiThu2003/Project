import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3SOI4m4IyJ95QFubLRvvlSocDvb3EcYM",
  authDomain: "chatting-application-fa399.firebaseapp.com",
  projectId: "chatting-application-fa399",
  storageBucket: "chatting-application-fa399.firebasestorage.app",
  messagingSenderId: "980963932139",
  appId: "1:980963932139:web:d01d63c8eb057dd2400bae"
};

// Initialize Firebase with custom settings
let app;
try {
  app = getApp();
} catch (e) {
  app = initializeApp(firebaseConfig);
}

// Initialize services with custom settings
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence for Firestore
const enableOffline = async () => {
  try {
    await enableIndexedDbPersistence(db, {
      synchronizeTabs: true // Enable multi-tab support
    });
  } catch (err) {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('Multiple tabs open, persistence enabled in first tab only');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.warn('The current browser doesn\'t support persistence');
    }
  }
};

// Only enable offline persistence if it hasn't been enabled before
if (typeof window !== 'undefined') {
  enableOffline().catch(console.error);
}

export { auth, db, storage }
export default app 