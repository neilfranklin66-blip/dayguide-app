import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Replace these values with your Firebase project config.
// Get them from: Firebase Console > Project Settings > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyAttek2f2Iw-DTuvE4QCqyb-0vgSRlU_9g",
  authDomain: "dayguide-541ee.firebaseapp.com",
  projectId: "dayguide-541ee",
  storageBucket: "dayguide-541ee.firebasestorage.app",
  messagingSenderId: "529766313534",
  appId: "1:529766313534:web:53f28032a3a6fe69b96b6f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
