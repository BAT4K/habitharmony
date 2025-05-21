import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmlsL8lyPdrbvWNtmF0RPPahmRloAqrlc",
  authDomain: "habit-harmony-e8e94.firebaseapp.com",
  projectId: "habit-harmony-e8e94",
  storageBucket: "habit-harmony-e8e94.firebasestorage.app",
  messagingSenderId: "939583883917",
  appId: "1:939583883917:web:b9f7e6abbb26d700a930c4",
  measurementId: "G-K7MHCEEKW1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Get Firebase Auth instance
export const auth = getAuth(app);

// You can add other Firebase services here as needed (e.g., firestore, storage)