import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { IoEyeOutline, IoEyeOffOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { changePassword } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when modal state changes
  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [isOpen]);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200', textColor: 'text-slate-400' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) {
      return { score, label: 'Weak', color: 'bg-red-500 w-1/3', textColor: 'text-red-500' };
    } else if (score <= 4) {
      return { score, label: 'Medium', color: 'bg-amber-500 w-2/3', textColor: 'text-amber-500' };
    } else {
      return { score, label: 'Strong', color: 'bg-emerald-500 w-full', textColor: 'text-emerald-500' };
    }
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    // Mimic brief async transition for premium feel
    setTimeout(() => {
      const res = changePassword(currentPassword, newPassword);
      setLoading(false);
      if (res.success) {
        showToast('Password changed successfully.', 'success');
        onClose();
      } else {
        setError(res.error || 'Failed to change password');
      }
    }, 400);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password" className="dark:bg-slate-800 dark:border-slate-700">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="p-3.5 text-xs font-semibold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50 animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}

        {/* Current Password */}
        <div className="flex flex-col gap-1.5 relative">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Current Password</label>
          <div className="relative">
            <Input
              type={showCurrent ? 'text' : 'password'}
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="pr-10 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            >
              {showCurrent ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="flex flex-col gap-1.5 relative">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">New Password</label>
          <div className="relative">
            <Input
              type={showNew ? 'text' : 'password'}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            >
              {showNew ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
            </button>
          </div>

          {/* Strength Indicator */}
          {newPassword && (
            <div className="mt-2 flex flex-col gap-1 animate-in fade-in duration-200">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400 dark:text-slate-500">Password Strength:</span>
                <span className={`${strength.textColor} flex items-center gap-1`}>
                  <IoShieldCheckmarkOutline size={12} />
                  {strength.label}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${strength.color}`} />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5 relative">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Confirm New Password</label>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pr-10 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            >
              {showConfirm ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <Button variant="secondary" onClick={onClose} disabled={loading} className="dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600">
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
