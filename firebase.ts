import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAXpEztBmKpB1I5tTsDtWlfy-CpfivH7Ak",
  authDomain: "urban-b11d7.firebaseapp.com",
  databaseURL: "https://urban-b11d7-default-rtdb.firebaseio.com",
  projectId: "urban-b11d7",
  storageBucket: "urban-b11d7.firebasestorage.app",
  messagingSenderId: "978591641712",
  appId: "1:978591641712:web:d6627c4decdc22b22144b5",
  measurementId: "G-RES73Q22KZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let analytics = null;

// Safely initialize analytics only if supported in the current environment
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch((err) => {
  console.warn("Firebase Analytics is not supported in this environment:", err);
});

export { app, db, analytics };