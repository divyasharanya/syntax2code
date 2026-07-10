import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { 
  IoTerminal, 
  IoMenu, 
  IoClose, 
  IoLogOutOutline, 
  IoTrophyOutline, 
  IoPersonOutline, 
  IoLockClosedOutline, 
  IoMoonOutline, 
  IoSunnyOutline 
} from 'react-icons/io5';
import Button from './ui/Button';
import ProfileDropdown from './ProfileDropdown';
import ChangePasswordModal from './ChangePasswordModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
    setIsDropdownOpen(false);
    showToast('Signed out successfully.', 'success');
  };

  const navLinks = [
    { label: 'Explore Tasks', path: '/tasks' },
  ];

  if (user) {
    if (user.role === 'candidate') {
      navLinks.push({ label: 'Candidate Board', path: '/dashboard/candidate' });
    } else if (user.role === 'company') {
      navLinks.push({ label: 'Company Console', path: '/dashboard/company' });
      navLinks.push({ label: 'Post a Task', path: '/tasks/create' });
    }
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-primary">
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                <IoTerminal size={22} />
              </div>
              <span className="tracking-tight text-slate-900 dark:text-white font-black">
                Micro<span className="text-primary font-bold">Intern</span>
              </span>
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
                    : 'text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-4 relative">
                {user.role === 'candidate' && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-900/30 text-xs font-semibold">
                    <IoTrophyOutline className="text-amber-500" size={14} />
                    <span>{user.points || 0} pts</span>
                  </div>
                )}
                
                {/* Profile Trigger */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 rounded-xl transition-all cursor-pointer text-left focus:outline-none"
                >
                  <img
                    src={user.avatar || user.companyLogo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                  />
                  <div className="leading-none hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize mt-0.5">{user.role}</p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                <ProfileDropdown
                  isOpen={isDropdownOpen}
                  onClose={() => setIsDropdownOpen(false)}
                  onChangePasswordClick={() => setIsPasswordModalOpen(true)}
                  onLogout={handleLogout}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-slate-100 dark:border-slate-800 pl-4">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-850">Log In</Button>
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
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {isOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1 shadow-sm transition-colors duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive(link.path)
                  ? 'bg-primary/5 text-primary'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          {user ? (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-3 px-3 pb-2">
                <img
                  src={user.avatar || user.companyLogo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
                {user.role === 'candidate' && (
                  <div className="ml-auto flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-900/30 text-xs font-semibold">
                    <IoTrophyOutline size={12} />
                    <span>{user.points || 0}</span>
                  </div>
                )}
              </div>
              
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-semibold"
              >
                <IoPersonOutline size={18} />
                My Profile
              </Link>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsPasswordModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-semibold cursor-pointer text-left"
              >
                <IoLockClosedOutline size={18} />
                Change Password
              </button>

              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-semibold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? <IoSunnyOutline size={18} /> : <IoMoonOutline size={18} />}
                  <span>Dark Mode</span>
                </div>
                <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                  theme === 'dark' ? 'bg-primary justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'
                }`}>
                  <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                </div>
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-sm font-semibold cursor-pointer"
              >
                <IoLogOutOutline size={18} />
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2 px-3">
              <Link to="/login" onClick={() => setIsOpen(false)} className="w-full">
                <Button variant="outline" className="w-full dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-850">Log In</Button>
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="w-full">
                <Button variant="primary" className="w-full">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Global Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
