import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA4gqnmsU2iRwXNvmAfU0qSb6eCoiMwx94",
  authDomain: "microintern-4d081.firebaseapp.com",
  projectId: "microintern-4d081",
  storageBucket: "microintern-4d081.firebasestorage.app",
  messagingSenderId: "577880603793",
  appId: "1:577880603793:web:e27ca662ecfe3f8c325330",
};

// Initialize Firebase app (singleton)
export const app = initializeApp(firebaseConfig);

// Firebase Auth instance
export const auth = getAuth(app);

// Firestore instance
export const db = getFirestore(app);
