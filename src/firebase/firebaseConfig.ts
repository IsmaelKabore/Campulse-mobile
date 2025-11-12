// src/firebase/firebaseConfig.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB-A4W74Rk4fRLI0Jp5oqGAQN2n3jceyOI",
  authDomain: "event-d5bf2.firebaseapp.com",
  projectId: "event-d5bf2",
  storageBucket: "event-d5bf2.firebasestorage.app",
  messagingSenderId: "1065158537191",
  appId: "1:1065158537191:web:33ecf5ff2c978be159d742",
  measurementId: "G-XT2C89BR7W",
};

// Avoid re-init in dev HMR
const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
