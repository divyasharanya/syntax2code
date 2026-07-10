import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // enriched user object (Firebase user + Firestore profile)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ─── Listen for Firebase Auth state changes ───────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch the Firestore profile to get role, name, etc.
        try {
          const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileSnap.exists()) {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...profileSnap.data() });
          } else {
            // Profile doc not created yet — use minimal data
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will update `user` automatically
      return { success: true };
    } catch (err) {
      const message = friendlyAuthError(err.code);
      setError(message);
      return { success: false, error: message };
    }
  };

  // ─── Register ─────────────────────────────────────────────────────────────
  const register = async (registerData) => {
    setError('');
    const { name, email, password, role, companyName, title } = registerData;

    try {
      // 1. Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = credential.user;

      // 2. Build the Firestore profile doc
      const baseProfile = {
        name,
        email,
        role,
        bio: '',
        active: true,
        createdAt: serverTimestamp(),
      };

      const roleProfile =
        role === 'candidate'
          ? {
              title: title || 'Developer',
              skills: [],
              portfolioUrl: '',
              avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
              points: 0,
            }
          : {
              companyName: companyName || 'My Startup',
              companyLogo:
                'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
              companyUrl: '',
            };

      const profile = { ...baseProfile, ...roleProfile };

      // 3. Write users/{uid} document
      await setDoc(doc(db, 'users', uid), profile);

      // onAuthStateChanged will pick up the new user + profile automatically
      return { success: true };
    } catch (err) {
      const message = friendlyAuthError(err.code);
      setError(message);
      return { success: false, error: message };
    }
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    setError('');
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // ─── Update Profile ───────────────────────────────────────────────────────
  const updateProfile = async (updatedFields) => {
    if (!user) return { success: false };
    try {
      await updateDoc(doc(db, 'users', user.uid), updatedFields);
      setUser((prev) => ({ ...prev, ...updatedFields }));
      return { success: true };
    } catch (err) {
      console.error('Profile update error:', err);
      return { success: false, error: err.message };
    }
  };

  // ─── Context value (same API as before) ───────────────────────────────────
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ─── Helper: map Firebase error codes to readable messages ─────────────────
function friendlyAuthError(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'Authentication failed. Please try again.';
  }
}
