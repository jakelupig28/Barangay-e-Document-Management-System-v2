
// src/firebase/config.js
// NOTE:
// This project currently runs in local JSON mode.
// Keep Firebase imports safe so legacy components do not crash app startup.
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: '',
  authDomain: 'barangayinfomation.firebaseapp.com',
  projectId: 'barangayinfomation',
  storageBucket: 'barangayinfomation.firebasestorage.app',
  messagingSenderId: '1000726748836',
  appId: '1:1000726748836:web:fea7353fdeb7ebedcc5031',
  measurementId: 'G-C8EFQXWWT6',
};

let auth;
let db;
let storage;

try {
  if (!firebaseConfig.apiKey) {
    throw new Error('Missing Firebase API key');
  }
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  // Fallback stubs for local-only mode.
  auth = {
    currentUser: null,
    authStateReady: () => Promise.resolve(),
    onAuthStateChanged: (cb) => {
      if (typeof cb === 'function') cb(null);
      return () => {};
    },
    signOut: () => Promise.resolve(),
  };
  db = {};
  storage = {};
}

export { auth, db, storage };