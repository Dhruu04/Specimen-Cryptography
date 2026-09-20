import { initializeApp, getApps, getApp } from "firebase/app";

// Specimen Cryptography Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAbCA-m0TkwiXgfJKDveWw9Dq4EVucGEAs",
  authDomain: "specimen-cryptography.firebaseapp.com",
  projectId: "specimen-cryptography",
  storageBucket: "specimen-cryptography.firebasestorage.app",
  messagingSenderId: "590620134739",
  appId: "1:590620134739:web:56480fb113e101a5a5e5a6",
};

// Singleton Firebase App Initialization
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
