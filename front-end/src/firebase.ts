// front-end/src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvmFy2IUGvBrlZgWqJs1_z1BKbrDOWdk0",
  authDomain: "dating-webapp-1399b.firebaseapp.com",
  projectId: "dating-webapp-1399b",
  storageBucket: "dating-webapp-1399b.firebasestorage.app",
  messagingSenderId: "533235224376",
  appId: "1:533235224376:web:e0b060601680c7d8efbbcd",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
