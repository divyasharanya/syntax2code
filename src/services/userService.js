import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Fetch a single user profile from Firestore.
 * @param {string} uid
 * @returns {Object|null} user data (with id field) or null
 */
export const getUser = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, uid: snap.id, ...snap.data() };
};

/**
 * Update specific fields on a user profile doc.
 * @param {string} uid
 * @param {Object} data  — partial fields to merge
 */
export const updateUser = async (uid, data) => {
  await updateDoc(doc(db, 'users', uid), data);
};
