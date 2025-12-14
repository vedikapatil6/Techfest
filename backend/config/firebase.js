import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyATRgJgXtm5QtDS45UbFnk9RCTkBTV2qqA",
    authDomain: "techfest-85e3b.firebaseapp.com",
    projectId: "techfest-85e3b",
    storageBucket: "techfest-85e3b.firebasestorage.app",
    messagingSenderId: "598204517872",
    appId: "1:598204517872:web:d1cf9fced4396d61b5e135",
    measurementId: "G-4H4KF436P5"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;