import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

// Paths where we must never redirect to /choose-role, even for roleless users.
// Includes auth pages (would cause a loop) and choose-role itself.
const ROLE_EXEMPT_PATHS = ['/choose-role', '/login', '/register'];

const RootLayout = () => {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  // Wait for Firebase Auth to finish resolving before making any role decision.
  // Without this guard we would redirect on every hard refresh before the
  // onAuthStateChanged callback fires and sets the real user state.
  if (!loading && user && !user.role && !ROLE_EXEMPT_PATHS.includes(pathname)) {
    return <Navigate to="/choose-role" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default RootLayout;
