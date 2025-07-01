// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDUNJWOSlydW9pl8ZzVcEkjhUUKfe8hiYE", // double-check this
  authDomain: "lovelink-6e437.firebaseapp.com",
  projectId: "lovelink-6e437",
  storageBucket: "lovelink-6e437.appspot.com", // this line might be wrong in yours
  messagingSenderId: "830524270896",
  appId: "1:830524270896:web:454845a1b0b79c751180f5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // 👈 Add this line
