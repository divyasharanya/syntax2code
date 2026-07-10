import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

/**
 * Apply a candidate to a task.
 * Guards:
 *  - Blocks duplicate applications (same taskId + candidateId)
 *  - Blocks if the task's deadline has passed
 * @param {string} taskId
 * @param {string} candidateId — user.uid of the candidate
 * @returns {{ id: string, ...fields }}
 */
export const applyToTask = async (taskId, candidateId) => {
  // 1. Fetch the task to get companyId and validate deadline
  const taskSnap = await getDoc(doc(db, 'tasks', taskId));
  if (!taskSnap.exists()) throw new Error('Task not found.');

  const task = taskSnap.data();

  // Deadline guard
  if (task.deadline) {
    const dl = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
    if (dl <= new Date()) throw new Error('This task deadline has passed. Applications are closed.');
  }

  // Duplicate application guard
  const dupQ = query(
    collection(db, 'applications'),
    where('taskId', '==', taskId),
    where('candidateId', '==', candidateId)
  );
  const dupSnap = await getDocs(dupQ);
  if (!dupSnap.empty) throw new Error('You have already applied to this task.');

  // 2. Write application doc
  const appDoc = {
    taskId,
    candidateId,
    companyId: task.companyId,
    status: 'pending',
    appliedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, 'applications'), appDoc);
  return { id: ref.id, ...appDoc };
};

/**
 * Get all applications for a given task (company view).
 * @param {string} taskId
 * @returns {Array}
 */
export const getApplicationsByTask = async (taskId) => {
  const q = query(
    collection(db, 'applications'),
    where('taskId', '==', taskId),
    orderBy('appliedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Get all applications submitted by a given candidate.
 * @param {string} candidateId
 * @returns {Array}
 */
export const getApplicationsByCandidate = async (candidateId) => {
  const q = query(
    collection(db, 'applications'),
    where('candidateId', '==', candidateId),
    orderBy('appliedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Update an application's status, feedback, and score.
 * Verifies that the currently signed-in user is the company owner of the application.
 * @param {string} appId
 * @param {string} status
 * @param {string} feedback
 * @param {number|null} score
 */
export const updateApplicationStatus = async (appId, status, feedback, score) => {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) throw new Error('Not authenticated.');

  const appSnap = await getDoc(doc(db, 'applications', appId));
  if (!appSnap.exists()) throw new Error('Application not found.');

  const app = appSnap.data();
  if (app.companyId !== currentUid) {
    throw new Error('Unauthorized: only the task owner can update application status.');
  }

  await updateDoc(doc(db, 'applications', appId), {
    status,
    feedback: feedback || '',
    score: score !== undefined && score !== null ? Number(score) : null,
  });
};
