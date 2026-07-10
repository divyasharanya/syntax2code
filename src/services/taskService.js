import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Create a new task in Firestore.
 * @param {Object} taskData — form fields from CreateTask
 * @param {Object} user     — Firebase-enriched user from AuthContext
 * @returns {{ id: string, ...taskFields }}
 */
export const createTask = async (taskData, user) => {
  // Validate deadline is in the future if provided
  if (taskData.deadline) {
    const deadlineDate = new Date(taskData.deadline);
    if (deadlineDate <= new Date()) {
      throw new Error('Deadline must be a future date.');
    }
  }

  const taskDoc = {
    title: taskData.title,
    description: taskData.description,
    difficulty: taskData.difficulty,
    duration: taskData.duration,
    reward: Number(taskData.reward),
    tags: taskData.tags || [],
    companyId: user.uid,
    companyName: user.companyName || user.name || '',
    companyLogo:
      user.companyLogo ||
      'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
    status: 'open',
    applicantsCount: 0,
    deadline: taskData.deadline ? Timestamp.fromDate(new Date(taskData.deadline)) : null,
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, 'tasks'), taskDoc);
  return { id: ref.id, ...taskDoc };
};

/**
 * Get all open tasks (status == 'open'), ordered newest first.
 * Tasks with a past deadline are excluded via JS filter (Firestore compound
 * inequality on two fields requires a composite index — filter client-side).
 * @returns {Array}
 */
export const getOpenTasks = async () => {
  const q = query(
    collection(db, 'tasks'),
    where('status', '==', 'open'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  const now = new Date();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((t) => {
      // Exclude tasks whose deadline has passed
      if (!t.deadline) return true; // no deadline = always open
      const dl = t.deadline.toDate ? t.deadline.toDate() : new Date(t.deadline);
      return dl > now;
    });
};

/**
 * Get a single task by ID.
 * @param {string} taskId
 * @returns {Object|null}
 */
export const getTaskById = async (taskId) => {
  const snap = await getDoc(doc(db, 'tasks', taskId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

/**
 * Get all tasks posted by a given company.
 * @param {string} companyId — user.uid of the company
 * @returns {Array}
 */
export const getTasksByCompany = async (companyId) => {
  const q = query(
    collection(db, 'tasks'),
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Soft-delete a task by setting its status to 'inactive'.
 * @param {string} taskId
 */
export const deactivateTask = async (taskId) => {
  await updateDoc(doc(db, 'tasks', taskId), { status: 'inactive' });
};
