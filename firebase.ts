// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwimx2UHGQR7drFxAt4QVnWgmRsLMOywE",
  authDomain: "trip-planner-nidhi-123.firebaseapp.com",
  projectId: "trip-planner-nidhi-123",
  storageBucket: "trip-planner-nidhi-123.firebasestorage.app",
  messagingSenderId: "676086413501",
  appId: "1:676086413501:web:6c5535a632c667445ddfd4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;