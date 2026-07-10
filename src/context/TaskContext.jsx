import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const TaskContext = createContext(null);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extracts a human-readable error message from an axios error, consistent
 * with the backend's { error: '...' } / { detail: '...' } response shape.
 */
const getErrorMessage = (err, defaultMsg = 'An unexpected error occurred.') => {
  const data = err?.response?.data;
  if (!data) return err?.message || defaultMsg;
  return data.error || data.detail || JSON.stringify(data);
};

export const TaskProvider = ({ children }) => {
  const { user, updateProfile } = useAuth();

  // Always start empty — real data is fetched from the API on mount.
  // Do NOT seed from localStorage or mock constants; stale/fake task IDs
  // (e.g. 'task_1') would be rendered as clickable tasks and cause 404s
  // when the backend is hit with a non-existent ID.
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  /**
   * Refresh tasks and submissions from the server.
   * Called after a successful submit so the UI reflects the real backend state.
   */
  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, subsRes] = await Promise.all([
        axios.get('/api/tasks/'),
        axios.get('/api/submissions/'),
      ]);
      setTasks(tasksRes.data?.results ?? tasksRes.data ?? []);
      setSubmissions(subsRes.data?.results ?? subsRes.data ?? []);
    } catch (err) {
      // Non-fatal — local state is still coherent even if the refresh fails
      console.warn('fetchData failed:', getErrorMessage(err));
    }
  }, []);

  // Load real tasks and submissions from the API as soon as the context mounts.
  // This replaces the empty initial state with live server data so that only
  // tasks with real backend IDs are ever rendered as clickable/navigable items.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addTask = (taskData) => {
    if (!user || user.role !== 'company') return { success: false, error: 'Unauthorized' };

    const newTask = {
      id: `task_${Date.now()}`,
      title: taskData.title,
      companyName: user.companyName,
      companyLogo: user.companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
      description: taskData.description,
      difficulty: taskData.difficulty,
      duration: taskData.duration,
      reward: Number(taskData.reward),
      tags: taskData.tags || [],
      companyId: user.id,
      createdAt: new Date().toISOString(),
      status: 'open',
      applicantsCount: 0,
    };

    setTasks((prev) => [newTask, ...prev]);
    return { success: true, task: newTask };
  };

  const submitTask = async (taskId, submissionData) => {
    if (!user || user.role !== 'candidate') return { success: false, error: 'Unauthorized' };

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return { success: false, error: 'Task not found' };

    // Local duplicate-submission guard — the backend enforces this too
    const alreadySubmitted = submissions.some(
      (sub) => sub.taskId === taskId && sub.candidateId === user.id
    );
    if (alreadySubmitted) {
      return { success: false, error: 'You have already submitted a solution for this task.' };
    }

    // ------------------------------------------------------------------
    // 1. Apply-then-submit safety step
    //    The backend requires an existing Application record before a
    //    Submission can be created. Candidates may click Submit without
    //    having explicitly applied first, so we attempt apply() here.
    //    A 400 error means they already applied — that is fine, continue.
    // ------------------------------------------------------------------
    try {
      await axios.post(`/api/tasks/${taskId}/apply/`);
    } catch (applyErr) {
      console.log('Apply check:', applyErr.response?.data?.error || applyErr.message);
    }

    // ------------------------------------------------------------------
    // 2. Submit — multipart (file) or JSON (no file)
    //    Do NOT set Content-Type manually; axios sets the multipart
    //    boundary automatically when given a FormData body.
    // ------------------------------------------------------------------
    try {
      if (submissionData.file) {
        // --- Multipart path ---
        const formData = new FormData();
        formData.append('githubUrl', submissionData.githubUrl || '');
        formData.append('liveUrl', submissionData.liveUrl || '');
        formData.append('notes', submissionData.notes || '');
        formData.append('file', submissionData.file);
        await axios.post(`/api/tasks/${taskId}/submit/`, formData);
      } else {
        // --- JSON path (existing behavior unchanged) ---
        await axios.post(`/api/tasks/${taskId}/submit/`, {
          githubUrl: submissionData.githubUrl,
          liveUrl: submissionData.liveUrl,
          notes: submissionData.notes,
        });
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to submit solution.') };
    }

    // ------------------------------------------------------------------
    // 3. Refresh tasks and submissions from the server
    // ------------------------------------------------------------------
    await fetchData();

    return { success: true };
  };

  const reviewSubmission = (submissionId, status, reviewData) => {
    if (!user || user.role !== 'company') return { success: false, error: 'Unauthorized' };

    let targetSubmission = null;
    let oldStatus = '';

    setSubmissions((prevSubs) =>
      prevSubs.map((sub) => {
        if (sub.id === submissionId) {
          oldStatus = sub.status;
          targetSubmission = {
            ...sub,
            status,
            feedback: reviewData.feedback || sub.feedback,
            score: reviewData.score !== undefined && reviewData.score !== null ? Number(reviewData.score) : sub.score,
          };
          return targetSubmission;
        }
        return sub;
      })
    );

    // Award points to candidate upon review completion (transitioning from Applied to Reviewed for the first time)
    if (targetSubmission && oldStatus === 'Applied' && status === 'Reviewed') {
      const task = tasks.find((t) => t.id === targetSubmission.taskId);
      const pointsToAward = task ? task.reward : 100;

      const savedUsers = JSON.parse(localStorage.getItem('microintern_users') || '[]');
      const updatedUsers = savedUsers.map((u) => {
        if (u.id === targetSubmission.candidateId) {
          return { ...u, points: (u.points || 0) + pointsToAward };
        }
        return u;
      });
      localStorage.setItem('microintern_users', JSON.stringify(updatedUsers));
    }

    return { success: true };
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        submissions,
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
