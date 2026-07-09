import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoListOutline, IoTrophyOutline, IoSettingsOutline, IoPersonOutline, IoCreateOutline, IoBarChartOutline } from 'react-icons/io5';

const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isCandidate = user.role === 'candidate';
  const isAdmin = user.role === 'admin';

  const menuItems = isAdmin
    ? [
        {
          label: 'Admin Console',
          path: '/dashboard/admin',
          icon: <IoBarChartOutline size={18} />,
        },
        {
          label: 'Skill Challenges',
          path: '/tasks',
          icon: <IoListOutline size={18} />,
        },
      ]
    : isCandidate
    ? [
        {
          label: 'Overview Board',
          path: '/dashboard/candidate',
          icon: <IoBarChartOutline size={18} />,
        },
        {
          label: 'Skill Challenges',
          path: '/tasks',
          icon: <IoListOutline size={18} />,
        },
      ]
    : [
        {
          label: 'Company Overview',
          path: '/dashboard/company',
          icon: <IoBarChartOutline size={18} />,
        },
        {
          label: 'Create New Challenge',
          path: '/tasks/create',
          icon: <IoCreateOutline size={18} />,
        },
      ];

  return (
    <div className="flex-grow flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
      {/* Sidebar Panel */}
      <aside className="w-full md:w-64 flex flex-col gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar || user.companyLogo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-100"
            />
            <div className="leading-tight">
              <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{user.name}</h3>
              <p className="text-xs text-slate-400 capitalize font-medium">{user.role === 'candidate' ? user.title : user.companyName}</p>
            </div>
          </div>
          
          {isCandidate && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Skill Points:</span>
              <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100 flex items-center gap-1">
                <IoTrophyOutline size={13} /> {user.points || 0}
              </span>
            </div>
          )}

          <nav className="flex flex-col gap-1 border-t border-slate-50 pt-4">
            {menuItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-primary/5 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Primary Dashboard Content Panel */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
