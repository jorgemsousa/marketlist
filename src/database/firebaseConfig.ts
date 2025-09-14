// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDfhYOKC1jAZ8NzQDuMd2Dz6gj8_EjAr_s",
  authDomain: "marketlist-26e37.firebaseapp.com",
  projectId: "marketlist-26e37",
  storageBucket: "marketlist-26e37.appspot.com", 
  messagingSenderId: "41443072478",
  appId: "1:41443072478:web:8e2e7bb60828e0eaaee54f"
};

// Evita múltiplas inicializações
const app = initializeApp(firebaseConfig);

// Exporta Auth e Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };