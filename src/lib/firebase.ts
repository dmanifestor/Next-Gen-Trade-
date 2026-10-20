// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { 
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError
} from "firebase/auth";

// Your web app's Firebase configuration
// Configured for project: yewoapp-906a5
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAmGLPEoLoNxZp2GDJOf6H9QlipBpwtFM8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "yewoapp-906a5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "yewoapp-906a5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "yewoapp-906a5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "450161449655",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:450161449655:web:d2d492e86e49a2b8170b32",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Analytics is optional and lazily initialized to prevent Firebase Installations errors (400 INVALID_ARGUMENT) in sandboxed/iframe environments
export let analytics: ReturnType<typeof getAnalytics> | null = null;

export async function getSafeAnalytics() {
  if (typeof window === "undefined" || analytics) return analytics;
  try {
    const supported = await isSupported();
    if (supported && firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
      return analytics;
    }
  } catch (err) {
    console.warn("Firebase Analytics not initialized:", err);
  }
  return null;
}

// Initialize Firebase Authentication, Firestore & Storage
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleAuthProvider = new GoogleAuthProvider();

// Friendly error message parser for Firebase Auth errors
export function formatAuthError(error: unknown): string {
  if (!error) return "An unexpected error occurred. Please try again.";
  
  const authErr = error as AuthError;
  const code = authErr?.code || '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return "Invalid email or password. Please check your credentials or create an account.";
    case 'auth/email-already-in-use':
      return "An account with this email address already exists. Please sign in instead.";
    case 'auth/weak-password':
      return "The password is too weak. Please use at least 6 characters.";
    case 'auth/invalid-email':
      return "Please enter a valid email address.";
    case 'auth/popup-closed-by-user':
      return "Google Sign-In popup was closed before completing.";
    case 'auth/popup-blocked':
      return "Sign-in popup was blocked by your browser. Please allow popups for this site.";
    case 'auth/operation-not-allowed':
      return "This sign-in provider is not enabled in the Firebase console. Please enable it under Firebase Authentication > Sign-in method.";
    case 'auth/too-many-requests':
      return "Too many unsuccessful attempts. Access temporarily restricted. Try again later.";
    case 'auth/network-request-failed':
      return "Network connection failed. Please check your internet connection and try again.";
    case 'auth/requires-recent-login':
      return "This operation requires a recent sign-in. Please log out and sign in again.";
    default:
      return authErr?.message || "Authentication error occurred. Please try again.";
  }
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  onAuthStateChanged,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
};
export type { FirebaseUser };
