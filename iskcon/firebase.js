import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDRtIwRII-aDjleOl6HPq4z7dg4Gn1xOG0",
  authDomain: "project1-57556.firebaseapp.com",
  projectId: "project1-57556",
  storageBucket: "project1-57556.appspot.com",
  messagingSenderId: "380178553935",
  appId: "1:380178553935:web:cfd0e2b6ce1bad1b409e3a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // ✅ Add Firestore instance
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();


export { auth, db, doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc, collection, onAuthStateChanged };