import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoShieldCheckmarkOutline, IoPeopleOutline, IoListOutline, IoDocumentTextOutline, IoLogOutOutline } from 'react-icons/io5';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const stats = [
    { label: 'Manage Users', icon: <IoPeopleOutline size={28} />, desc: 'View and deactivate user accounts', color: 'bg-blue-50 text-blue-600', href: '#users' },
    { label: 'Manage Tasks', icon: <IoListOutline size={28} />, desc: 'Deactivate or audit posted challenges', color: 'bg-indigo-50 text-indigo-600', href: '#tasks' },
    { label: 'Submissions', icon: <IoDocumentTextOutline size={28} />, desc: 'Audit all candidate submissions', color: 'bg-violet-50 text-violet-600', href: '#submissions' },
  ];

  return (
    <div className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
            <IoShieldCheckmarkOutline size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Console</h1>
            <p className="text-xs text-slate-400">Signed in as <span className="font-bold text-slate-600">{user?.email}</span></p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
        >
          <IoLogOutOutline size={16} />
          Sign Out
        </button>
      </div>

      {/* Access confirmation banner */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4">
        <IoShieldCheckmarkOutline size={24} className="text-red-500 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-red-800 text-sm">Admin Access Active</h3>
          <p className="text-xs text-red-600 mt-0.5">
            Your account ({user?.email}) has full administrative access. This role is granted by
            email match only — it cannot be selected by regular users.
          </p>
        </div>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="group flex flex-col gap-4 p-6 bg-white border border-slate-100 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-200 transition-all"
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-200`}>
              {item.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{item.label}</h3>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Placeholder notice */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700 font-medium">
        ⚠️ Admin panel features (user/task management) will be wired in a future phase. The
        route guard, email-based role detection, and layout are fully set up and ready.
      </div>

      {/* Nav back */}
      <div className="text-center">
        <Link to="/" className="text-xs text-slate-400 hover:text-primary transition-colors">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
