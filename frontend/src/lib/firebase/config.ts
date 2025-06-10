import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyBapnghAojsNOHxoaP47CH_CIq_N_nuVmE",
    authDomain: "call-center-2025.firebaseapp.com",
    projectId: "call-center-2025",
    storageBucket: "call-center-2025.firebasestorage.app",
    messagingSenderId: "875565522667",
    appId: "1:875565522667:web:4ab6573aa1bc90031a68ae",
    measurementId: "G-LLSW1KDKCR"
  };

// Initialize Firebase
// We check if an app is already initialized to prevent errors during hot-reloading in development.
let firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default firebase_app;
