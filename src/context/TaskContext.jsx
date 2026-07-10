import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { createTask } from '../services/taskService';
import { submitWork } from '../services/submissionService';
import { updateUser } from '../services/userService';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();

  // ─── State ────────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  // ─── Real-time listener: open tasks (all users see this) ─────────────────
  useEffect(() => {
    const q = query(
      collection(db, 'tasks'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const now = new Date();
        const docs = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              ...data,
              id: d.id,
              // Expose uid-style companyId and also keep id on the object
              // Convert Firestore Timestamps to ISO strings for easy UI consumption
              createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt,
              deadline: data.deadline?.toDate?.()?.toISOString?.() ?? data.deadline,
            };
          })
          // Filter out tasks with expired deadlines client-side
          .filter((t) => !t.deadline || new Date(t.deadline) > now);
        setTasks(docs);
        setTasksLoading(false);
      },
      (err) => {
        console.error('Tasks snapshot error:', err);
        setTasksLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // ─── Real-time listener: submissions (role-aware) ─────────────────────────
  useEffect(() => {
    if (!user?.uid) {
      setSubmissions([]);
      setSubmissionsLoading(false);
      return;
    }

    let q;
    if (user.role === 'candidate') {
      // Candidate sees their own submissions
      q = query(
        collection(db, 'submissions'),
        where('candidateId', '==', user.uid),
        orderBy('submittedAt', 'desc')
      );
    } else if (user.role === 'company') {
      // Company sees submissions for their tasks
      q = query(
        collection(db, 'submissions'),
        where('companyId', '==', user.uid),
        orderBy('submittedAt', 'desc')
      );
    } else {
      setSubmissions([]);
      setSubmissionsLoading(false);
      return;
    }

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => {
          const data = d.data();
          return {
            ...data,
            id: d.id,
            submittedAt: data.submittedAt?.toDate?.()?.toISOString?.() ?? data.submittedAt,
          };
        });
        setSubmissions(docs);
        setSubmissionsLoading(false);
      },
      (err) => {
        console.error('Submissions snapshot error:', err);
        setSubmissionsLoading(false);
      }
    );

    return () => unsub();
  }, [user?.uid, user?.role]);

  // ─── addTask (company creates a task) ─────────────────────────────────────
  // Keeps the same synchronous-looking API: returns { success, task?, error? }
  // but is now async internally. Pages that call addTask must await it.
  const addTask = useCallback(
    async (taskData) => {
      if (!user || user.role !== 'company') {
        return { success: false, error: 'Unauthorized' };
      }
      try {
        const task = await createTask(taskData, user);
        // onSnapshot will pick up the new task automatically
        return { success: true, task };
      } catch (err) {
        console.error('addTask error:', err);
        return { success: false, error: err.message };
      }
    },
    [user]
  );

  // ─── submitTask (candidate submits work) ───────────────────────────────────
  const submitTask = useCallback(
    async (taskId, submissionData) => {
      if (!user || user.role !== 'candidate') {
        return { success: false, error: 'Unauthorized' };
      }

      // Check for duplicate locally before hitting Firestore (fast UX path)
      const alreadySubmitted = submissions.some(
        (sub) => sub.taskId === taskId && sub.candidateId === user.uid
      );
      if (alreadySubmitted) {
        return { success: false, error: 'You have already submitted a solution for this task.' };
      }

      try {
        await submitWork(taskId, user.uid, {
          ...submissionData,
          candidateName: user.name,
          candidateAvatar:
            user.avatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        });

        // Increment applicantsCount on the task doc
        await updateDoc(doc(db, 'tasks', taskId), {
          applicantsCount: increment(1),
        });

        // onSnapshot will update submissions array automatically
        return { success: true };
      } catch (err) {
        console.error('submitTask error:', err);
        return { success: false, error: err.message };
      }
    },
    [user, submissions]
  );

  // ─── reviewSubmission (company updates status/feedback/score) ──────────────
  const reviewSubmission = useCallback(
    async (submissionId, status, reviewData) => {
      if (!user || user.role !== 'company') {
        return { success: false, error: 'Unauthorized' };
      }

      try {
        const subRef = doc(db, 'submissions', submissionId);

        // Find the current submission for points logic
        const currentSub = submissions.find((s) => s.id === submissionId);
        const oldStatus = currentSub?.status;

        await updateDoc(subRef, {
          status,
          feedback: reviewData.feedback || '',
          score:
            reviewData.score !== undefined && reviewData.score !== null
              ? Number(reviewData.score)
              : null,
        });

        // Award points to candidate on first review transition (Applied → Reviewed)
        if (currentSub && oldStatus === 'Applied' && status === 'Reviewed') {
          const task = tasks.find((t) => t.id === currentSub.taskId);
          const pointsToAward = task ? task.reward : 100;

          // Update candidate's points in their Firestore profile
          await updateDoc(doc(db, 'users', currentSub.candidateId), {
            points: pointsToAward,
          });
        }

        // onSnapshot will update submissions array automatically
        return { success: true };
      } catch (err) {
        console.error('reviewSubmission error:', err);
        return { success: false, error: err.message };
      }
    },
    [user, submissions, tasks]
  );

  // ─── Context value — same API surface as before ───────────────────────────
  return (
    <TaskContext.Provider
      value={{
        tasks,
        submissions,
        tasksLoading,
        submissionsLoading,
        addTask,
        submitTask,
        reviewSubmission,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
