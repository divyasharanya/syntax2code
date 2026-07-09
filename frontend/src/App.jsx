import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';

// Layouts
import RootLayout from './layouts/RootLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import DashboardCandidate from './pages/DashboardCandidate';
import DashboardCompany from './pages/DashboardCompany';
import AdminDashboard from './pages/AdminDashboard';
import CreateTask from './pages/CreateTask';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              {/* Public Routes */}
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="tasks/:id" element={<TaskDetails />} />

              {/* Company Protected Creation Route */}
              <Route path="tasks/create" element={<CreateTask />} />

              {/* Protected Dashboards (DashboardLayout does auth checks) */}
              <Route path="dashboard" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/" replace />} />
                <Route path="candidate" element={<DashboardCandidate />} />
                <Route path="company" element={<DashboardCompany />} />
                <Route path="admin" element={<AdminDashboard />} />
              </Route>

              {/* Fallback 404 */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
