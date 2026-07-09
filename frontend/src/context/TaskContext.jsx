import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const TaskContext = createContext(null);

const getErrorMessage = (err, defaultMsg) => {
  const data = err.response?.data;
  if (data) {
    if (data.error) return data.error;
    if (data.detail) return data.detail;
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const val = data[keys[0]];
        const cleanMsg = Array.isArray(val) ? val[0] : val;
        return `${keys[0]}: ${cleanMsg}`;
      }
    }
  }
  return defaultMsg;
};

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch open tasks
      // For companies, we want to fetch all their tasks if they query my_tasks
      const tasksUrl = user && user.role === 'company' ? '/api/tasks/?my_tasks=true' : '/api/tasks/';
      const tasksRes = await axios.get(tasksUrl);
      setTasks(tasksRes.data);

      // Fetch submissions if logged in
      if (user) {
        const subsRes = await axios.get('/api/submissions/');
        setSubmissions(subsRes.data);
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      console.error('Error fetching tasks or submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const addTask = async (taskData) => {
    if (!user || user.role !== 'company') return { success: false, error: 'Unauthorized' };

    try {
      const res = await axios.post('/api/tasks/', {
        title: taskData.title,
        description: taskData.description,
        difficulty: taskData.difficulty,
        duration: taskData.duration,
        reward: Number(taskData.reward),
        tags: taskData.tags || [],
      });
      setTasks((prev) => [res.data, ...prev]);
      return { success: true, task: res.data };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to create task') };
    }
  };

  const submitTask = async (taskId, submissionData) => {
    if (!user || user.role !== 'candidate') return { success: false, error: 'Unauthorized' };

    try {
      // 1. Proactively apply to the task (in case the candidate hasn't already)
      try {
        await axios.post(`/api/tasks/${taskId}/apply/`);
      } catch (applyErr) {
        console.log('Apply check:', applyErr.response?.data?.error || applyErr.message);
      }

      // 2. Submit the work
      await axios.post(`/api/tasks/${taskId}/submit/`, {
        githubUrl: submissionData.githubUrl,
        liveUrl: submissionData.liveUrl,
        notes: submissionData.notes,
      });

      // Reload data
      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to submit solution') };
    }
  };

  const reviewSubmission = async (submissionId, status, reviewData) => {
    if (!user || user.role !== 'company') return { success: false, error: 'Unauthorized' };

    try {
      await axios.post(`/api/submissions/${submissionId}/review/`, {
        status,
        feedback: reviewData.feedback,
        score: reviewData.score,
      });

      // Reload data
      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to submit review') };
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        submissions,
        loading,
        addTask,
        submitTask,
        reviewSubmission,
        refresh: fetchData,
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
