import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../config';

/**
 * Upload a file to Cloudinary using an unsigned upload preset.
 * Credentials are read from VITE_CLOUDINARY_* environment variables.
 * @param {File} file
 * @returns {string} secure_url of the uploaded file
 */
export const uploadFile = async (file) => {
  if (!file) throw new Error('No file provided.');
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary credentials are not configured. Check your .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Cloudinary upload failed.');
  }

  const data = await res.json();
  return data.secure_url;
};

/**
 * Submit a candidate's work for a task.
 * Guards:
 *  - Blocks if task deadline has passed
 * @param {string} taskId
 * @param {string} candidateId — user.uid
 * @param {Object} submissionData — { githubUrl, liveUrl, notes, fileUrl?, candidateName, candidateAvatar }
 * @returns {{ id: string, ...fields }}
 */
export const submitWork = async (taskId, candidateId, submissionData) => {
  // Fetch task to validate deadline and get company metadata
  const taskSnap = await getDoc(doc(db, 'tasks', taskId));
  if (!taskSnap.exists()) throw new Error('Task not found.');

  const task = taskSnap.data();

  // Deadline guard
  if (task.deadline) {
    const dl = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
    if (dl <= new Date()) throw new Error('Task deadline has passed. Submissions are closed.');
  }

  // At least one of githubUrl or fileUrl must be present
  if (!submissionData.githubUrl && !submissionData.fileUrl) {
    throw new Error('Please provide a GitHub link or upload a file (or both).');
  }

  const subDoc = {
    taskId,
    taskTitle: task.title,
    companyId: task.companyId,
    companyName: task.companyName || '',
    candidateId,
    candidateName: submissionData.candidateName || '',
    candidateAvatar:
      submissionData.candidateAvatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    githubUrl: submissionData.githubUrl || '',
    liveUrl: submissionData.liveUrl || '',
    notes: submissionData.notes || '',
    fileUrl: submissionData.fileUrl || null,
    status: 'Applied',
    feedback: '',
    score: null,
    submittedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, 'submissions'), subDoc);
  return { id: ref.id, ...subDoc };
};

/**
 * Get all submissions for a specific task (company review view).
 * @param {string} taskId
 * @returns {Array}
 */
export const getSubmissionsByTask = async (taskId) => {
  const q = query(
    collection(db, 'submissions'),
    where('taskId', '==', taskId),
    orderBy('submittedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Get all submissions made by a specific candidate.
 * @param {string} candidateId
 * @returns {Array}
 */
export const getSubmissionsByCandidate = async (candidateId) => {
  const q = query(
    collection(db, 'submissions'),
    where('candidateId', '==', candidateId),
    orderBy('submittedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
