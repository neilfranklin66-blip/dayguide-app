import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from './firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import i18n from './i18n';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const applyLanguage = (lang) => {
  i18n.changeLanguage(lang);
  localStorage.setItem('dayguide_language', lang);
};

const loadUserPrefs = async (uid) => {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
};

const saveUserPrefs = async (uid, prefs) => {
  try {
    await setDoc(doc(db, 'users', uid), prefs, { merge: true });
  } catch {
    // Firestore write failed — language still applied locally
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        localStorage.setItem('dayguide_user_email', user.email);
        const prefs = await loadUserPrefs(user.uid);
        if (prefs?.language) {
          applyLanguage(prefs.language);
        }
      } else {
        localStorage.removeItem('dayguide_user_email');
      }
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

  const signInWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signUpWithEmail = async (email, password, language) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (language) {
      applyLanguage(language);
      await saveUserPrefs(result.user.uid, { language });
    }
    return result;
  };

  const logout = () => signOut(auth);

  const value = { currentUser, signInWithGoogle, signInWithEmail, signUpWithEmail, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
