import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ADMIN_EMAIL } from '../config';

const AuthContext = createContext(null);

// ─── Helper: determine effective role ────────────────────────────────────────
// Admin is granted purely by email match — never via Firestore role field.
function resolveRole(email, firestoreRole) {
  if (ADMIN_EMAIL && email === ADMIN_EMAIL) return 'admin';
  return firestoreRole ?? undefined;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          let profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (!profileSnap.exists()) {
            // First-time sign-in (Google or otherwise without a profile yet).
            // Create a minimal profile with role: null so the user is sent to /choose-role.
            const minimalProfile = {
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              role: null,
              bio: '',
              active: true,
              createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), minimalProfile);
            // Re-read so we get the server timestamp back
            profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          }

          const profileData = profileSnap.data() || {};
          const effectiveRole = resolveRole(firebaseUser.email, profileData.role);

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...profileData,
            role: effectiveRole, // Admin override applied here
          });
        } catch (err) {
          console.error('Error fetching/creating user profile:', err);
          // Fallback: set minimal user so the app doesn't hang on loading
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: undefined });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged handles everything — including admin role resolution
      return { success: true };
    } catch (err) {
      const message = friendlyAuthError(err.code);
      setError(message);
      return { success: false, error: message };
    }
  };

  // ─── Register ──────────────────────────────────────────────────────────────
  const register = async (registerData) => {
    setError('');
    const { name, email, password, role, companyName, title } = registerData;

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = credential.user;

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
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              points: 0,
            }
          : {
              companyName: companyName || 'My Startup',
              companyLogo:
                'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
              companyUrl: '',
            };

      // Write the full profile — onAuthStateChanged will see it on next read
      await setDoc(doc(db, 'users', uid), { ...baseProfile, ...roleProfile });
      return { success: true };
    } catch (err) {
      const message = friendlyAuthError(err.code);
      setError(message);
      return { success: false, error: message };
    }
  };

  // ─── Google Sign-In ────────────────────────────────────────────────────────
  // SIMPLIFIED: only opens the popup. Profile creation + role resolution is
  // handled entirely in onAuthStateChanged above — no race condition possible.
  const signInWithGoogle = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged fires, fetches/creates the profile, sets user state
      return { success: true };
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, error: null }; // User dismissed — not an error
      }
      const message = friendlyAuthError(err.code);
      setError(message);
      return { success: false, error: message };
    }
  };

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    setError('');
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // ─── Update Profile ────────────────────────────────────────────────────────
  const updateProfile = async (updatedFields) => {
    if (!user) return { success: false };
    try {
      await updateDoc(doc(db, 'users', user.uid), updatedFields);
      // Re-apply admin override in case role field was updated
      const newRole = resolveRole(user.email, updatedFields.role ?? user.role);
      setUser((prev) => ({ ...prev, ...updatedFields, role: newRole }));
      return { success: true };
    } catch (err) {
      console.error('Profile update error:', err);
      return { success: false, error: err.message };
    }
  };

  const changePassword = (currentPassword, newPassword) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const fullUser = users.find((u) => u.id === user.id);
    if (!fullUser) return { success: false, error: 'User not found' };

    if (fullUser.password !== currentPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === user.id ? { ...u, password: newPassword } : u))
    );

    return { success: true };
  };

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
        signInWithGoogle,
        changePassword,
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

// ─── Helper: map Firebase error codes to readable messages ───────────────────
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
