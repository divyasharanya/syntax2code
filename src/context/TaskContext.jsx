import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TaskContext = createContext(null);

const DEFAULT_TASKS = [
  {
    id: 'task_1',
    title: 'Stripe Custom Checkout Flow',
    companyName: 'Stripe',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    description: `### Objective
Create a custom subscription payment flow with a clean UI, multi-tiered plan selection (Starter, Pro, Enterprise), and instant feedback upon successful/failed transactions.

### Requirements
1. **Plan Selection UI**: Users can toggle between monthly/yearly pricing and select a plan.
2. **Mock Payment Form**: Build a credit card form checking basic validity (Luhn algorithm or simple lengths).
3. **Success/Error States**: Show beautiful, animated alerts depending on the card number inputted:
   - Card ending in \`4242\` -> Success screen
   - Card ending in \`0000\` -> Declined message
4. **Clean Code**: Well-structured React components, reusable inputs.

### Deliverables
- A GitHub repository link containing the code.
- A live deployment URL (e.g., Vercel, Netlify).
- Self-evaluation notes explaining your design decisions.`,
    difficulty: 'Intermediate',
    duration: '4h',
    reward: 150,
    tags: ['React', 'Tailwind CSS', 'Stripe API'],
    companyId: 'user_comp_1',
    createdAt: '2026-07-01T12:00:00Z',
    status: 'open',
    applicantsCount: 14,
  },
  {
    id: 'task_2',
    title: 'Spotify Playback Controller Widget',
    companyName: 'Spotify',
    companyLogo: 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=150&auto=format&fit=crop&q=80',
    description: `### Objective
Design and implement an interactive music playback widget that fetches and controls track information. Use local audio files or mock data to simulate playback progress, cover art transitions, and sound wave animations.

### Requirements
1. **Interactive Controls**: Play, pause, skip, seek slider, and volume control.
2. **Dynamic UI**: Theme colors should adapt based on the cover art's primary colors (glassmorphic aesthetic).
3. **Sound Wave Animation**: Smooth CSS or SVG wave animations that bounce in sync with playback.
4. **Responsive Layout**: Adapts from sidebar width to full desktop viewports.`,
    difficulty: 'Easy',
    duration: '2h',
    reward: 100,
    tags: ['React', 'CSS Animations', 'Audio API'],
    companyId: 'user_spotify',
    createdAt: '2026-07-05T09:30:00Z',
    status: 'open',
    applicantsCount: 8,
  },
  {
    id: 'task_3',
    title: 'Airbnb-Style Interactive Map Search',
    companyName: 'Airbnb',
    companyLogo: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=150&auto=format&fit=crop&q=80',
    description: `### Objective
Build a split-pane interface with search filters on the left and a mock interactive map on the right. Clicking properties on the list highlights pins on the map, and hovering map pins opens preview cards.

### Requirements
1. **Split-Screen Design**: Fixed layout with scrollable results and persistent map space.
2. **Interactive Map**: Mock map using Leaflet, Mapbox, or custom Interactive SVG representing properties.
3. **Filter System**: Filter by price, rooms, and features in real-time.
4. **Smooth Transitions**: Smooth CSS animations for map pin states.`,
    difficulty: 'Advanced',
    duration: '8h',
    reward: 280,
    tags: ['React', 'Leaflet', 'Flexbox'],
    companyId: 'user_airbnb',
    createdAt: '2026-07-08T15:45:00Z',
    status: 'open',
    applicantsCount: 22,
  }
];

const DEFAULT_SUBMISSIONS = [
  {
    id: 'sub_1',
    taskId: 'task_2',
    taskTitle: 'Spotify Playback Controller Widget',
    companyName: 'Spotify',
    candidateId: 'user_cand_1',
    candidateName: 'Alex Rivera',
    candidateAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/alexrivera/spotify-widget-challenge',
    liveUrl: 'https://spotify-widget-challenge.vercel.app',
    notes: 'Implemented a custom SVG soundwave that reacts to playback state. Added full responsive design and keyboard hotkeys (Space to toggle play/pause). Used Tailwind CSS v4 styling!',
    status: 'Shortlisted',
    feedback: 'Fantastic implementation! The custom SVG animation and fluid transitions were superb. You clearly have a strong grasp of Tailwind CSS and layout engineering.',
    submittedAt: '2026-07-04T10:00:00Z',
    score: 95,
  },
  {
    id: 'sub_2',
    taskId: 'task_1',
    taskTitle: 'Stripe Custom Checkout Flow',
    companyName: 'Stripe',
    candidateId: 'user_cand_1',
    candidateName: 'Alex Rivera',
    candidateAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/alexrivera/stripe-checkout-internship',
    liveUrl: 'https://stripe-checkout-internship.vercel.app',
    notes: 'Used Tailwind CSS v4 for absolute layout flexibility. Handles responsive grids. Included Luhn validation checks on client form.',
    status: 'Applied',
    feedback: '',
    submittedAt: '2026-07-08T18:12:00Z',
    score: null,
  }
];

export const TaskProvider = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('microintern_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [submissions, setSubmissions] = useState(() => {
    const saved = localStorage.getItem('microintern_submissions');
    return saved ? JSON.parse(saved) : DEFAULT_SUBMISSIONS;
  });

  useEffect(() => {
    localStorage.setItem('microintern_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('microintern_submissions', JSON.stringify(submissions));
  }, [submissions]);

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

  const submitTask = (taskId, submissionData) => {
    if (!user || user.role !== 'candidate') return { success: false, error: 'Unauthorized' };

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return { success: false, error: 'Task not found' };

    // Check if already submitted
    const alreadySubmitted = submissions.some(
      (sub) => sub.taskId === taskId && sub.candidateId === user.id
    );
    if (alreadySubmitted) {
      return { success: false, error: 'You have already submitted a solution for this task.' };
    }

    const newSubmission = {
      id: `sub_${Date.now()}`,
      taskId,
      taskTitle: task.title,
      companyName: task.companyName,
      candidateId: user.id,
      candidateName: user.name,
      candidateAvatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      githubUrl: submissionData.githubUrl,
      liveUrl: submissionData.liveUrl,
      notes: submissionData.notes,
      status: 'Applied',
      feedback: '',
      submittedAt: new Date().toISOString(),
      score: null,
    };

    setSubmissions((prev) => [newSubmission, ...prev]);

    // Increment applicantsCount on the task
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId ? { ...t, applicantsCount: t.applicantsCount + 1 } : t
      )
    );

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
