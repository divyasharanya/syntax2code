import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoTerminal, IoMenu, IoClose, IoLogOutOutline, IoTrophyOutline } from 'react-icons/io5';
import Button from './ui/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const navLinks = [
    { label: 'Explore Tasks', path: '/tasks' },
  ];

  // Role-based links
  if (user) {
    if (user.role === 'candidate') {
      navLinks.push({ label: 'Candidate Board', path: '/dashboard/candidate' });
    } else if (user.role === 'company') {
      navLinks.push({ label: 'Company Console', path: '/dashboard/company' });
      navLinks.push({ label: 'Post a Task', path: '/tasks/create' });
    }
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-primary">
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                <IoTerminal size={22} />
              </div>
              <span className="tracking-tight text-slate-900 font-black">Micro<span className="text-primary font-bold">Intern</span></span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-primary'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
                {user.role === 'candidate' && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 text-xs font-semibold">
                    <IoTrophyOutline className="text-amber-500" size={14} />
                    <span>{user.points || 0} pts</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || user.companyLogo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  />
                  <div className="text-left leading-none">
                    <p className="text-xs font-bold text-slate-800">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                  title="Logout"
                >
                  <IoLogOutOutline size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
                <Link to="/login">
                  <Button variant="outline" size="sm">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              {isOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-sm">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive(link.path)
                  ? 'bg-primary/5 text-primary'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-3 px-3">
                <img
                  src={user.avatar || user.companyLogo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
                {user.role === 'candidate' && (
                  <div className="ml-auto flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100 text-xs font-semibold">
                    <IoTrophyOutline size={12} />
                    <span>{user.points || 0}</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-lg text-base font-medium cursor-pointer"
              >
                <IoLogOutOutline size={20} />
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2 px-3">
              <Link to="/login" onClick={() => setIsOpen(false)} className="w-full">
                <Button variant="outline" className="w-full">Log In</Button>
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="w-full">
                <Button variant="primary" className="w-full">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
