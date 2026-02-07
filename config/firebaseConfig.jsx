// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "ai--short-generator-15492.firebaseapp.com",
  projectId: "ai--short-generator-15492",
  storageBucket: "ai--short-generator-15492.firebasestorage.app",
  messagingSenderId: "266592720870",
  appId: "1:266592720870:web:9b96d0db233a91f952e827",
  measurementId: "G-N1GES4T240"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);