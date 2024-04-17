import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { getDatabase, ref, onValue } from "firebase/database"
import { collection, collectionGroup, query, where, doc, getDoc, startAfter, startAt, setDoc, onSnapshot, updateDoc, endAt, getFirestore, getDocs, orderBy, limit, getCountFromServer, or } from 'firebase/firestore'
import { getStorage, getDownloadURL, uploadBytes, updateMetadata, listAll, list } from "firebase/storage";
import { ref as sRef } from "firebase/storage"
import { getAnalytics, setUserId } from "firebase/analytics";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZyeUByTWEDsG3URLqwbwIfiX0aP12j3w",
  authDomain: "nebulae-1a84d.firebaseapp.com",
  projectId: "nebulae-1a84d",
  storageBucket: "nebulae-1a84d.appspot.com",
  messagingSenderId: "32654930601",
  appId: "1:32654930601:web:14044a75878d4e72546fb8",
  measurementId: "G-XV6EZFE9R4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const functions = getFunctions(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, auth, functions, analytics, startAfter, startAt, onSnapshot, signInAnonymously, endAt, httpsCallable, updateDoc, db, getDocs, setDoc, ref, onValue, or, listAll, collection, query, where, doc, getDoc, storage, getStorage, getDownloadURL, uploadBytes, updateMetadata, connectFunctionsEmulator, sRef, list, orderBy, limit, getCountFromServer, collectionGroup} 