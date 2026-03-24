import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, doc, onSnapshot, setDoc, getDoc, collection, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// TODO: Replace with your actual Firebase config
// You can get this from the Firebase Console (Project Settings > General)
const firebaseConfig = {
  apiKey: "AIzaSyDclftuUnz4KwWdDWQZCGeeAjsZdEF-1bw",
  authDomain: "wchfstn-vball.firebaseapp.com",
  projectId: "wchfstn-vball",
  storageBucket: "wchfstn-vball.firebasestorage.app",
  messagingSenderId: "875405978112",
  appId: "1:875405978112:web:e76304a73c4a3dc51ec6e5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, onSnapshot, setDoc, getDoc, collection, query, orderBy, limit };
