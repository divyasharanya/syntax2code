import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
  IoPersonOutline, 
  IoLockClosedOutline, 
  IoLogOutOutline, 
  IoMoonOutline, 
  IoSunnyOutline 
} from 'react-icons/io5';

const ProfileDropdown = ({ isOpen, onClose, onChangePasswordClick, onLogout }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const isCandidate = user.role === 'candidate';

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200"
    >
      {/* User Info Header */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 rounded-t-2xl">
        <img
          src={user.avatar || user.companyLogo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
          alt={user.name}
          className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800 flex-shrink-0"
        />
        <div className="leading-tight overflow-hidden flex-1">
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate">{user.name}</h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Menu Actions */}
      <div className="p-2 flex flex-col gap-1">
        {/* My Profile */}
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary dark:hover:text-primary transition-all cursor-pointer"
        >
          <IoPersonOutline size={16} className="text-slate-400 dark:text-slate-500" />
          <span>My Profile</span>
        </Link>

        {/* Change Password */}
        <button
          onClick={() => {
            onClose();
            onChangePasswordClick();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary dark:hover:text-primary transition-all cursor-pointer text-left"
        >
          <IoLockClosedOutline size={16} className="text-slate-400 dark:text-slate-500" />
          <span>Change Password</span>
        </button>

        {/* Dark Mode Toggle inside dropdown */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary dark:hover:text-primary transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {theme === 'light' ? (
              <IoMoonOutline size={16} className="text-slate-400 dark:text-slate-500" />
            ) : (
              <IoSunnyOutline size={16} className="text-slate-400 dark:text-slate-500" />
            )}
            <span>Dark Theme</span>
          </div>
          
          {/* Custom Switch Visual */}
          <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
            theme === 'dark' ? 'bg-primary justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'
          }`}>
            <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
          </div>
        </button>

        {/* Divider */}
        <div className="my-1 border-t border-slate-50 dark:border-slate-750" />

        {/* Sign Out */}
        <button
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer text-left"
        >
          <IoLogOutOutline size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
