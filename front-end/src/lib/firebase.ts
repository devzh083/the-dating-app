import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvmFy2IUGvBrlZgWqJs1_z1BKbrDOWdk0",
  authDomain: "dating-webapp-1399b.firebaseapp.com",
  projectId: "dating-webapp-1399b",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
