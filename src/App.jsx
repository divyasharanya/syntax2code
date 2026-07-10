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
import ChooseRole from './pages/ChooseRole';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import DashboardCandidate from './pages/DashboardCandidate';
import DashboardCompany from './pages/DashboardCompany';
import CreateTask from './pages/CreateTask';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

// Route guards
import AdminRoute from './components/AdminRoute';

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
              <Route path="choose-role" element={<ChooseRole />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="tasks/:id" element={<TaskDetails />} />

              {/* Company Protected Creation Route */}
              <Route path="tasks/create" element={<CreateTask />} />

              {/* Admin — protected by AdminRoute guard */}
              <Route
                path="admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Protected Dashboards (DashboardLayout does auth checks) */}
              <Route path="dashboard" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/" replace />} />
                <Route path="candidate" element={<DashboardCandidate />} />
                <Route path="company" element={<DashboardCompany />} />
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
