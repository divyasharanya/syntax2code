import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import ProfileCard from '../components/ProfileCard';
import ProfileForm from '../components/ProfileForm';
import Card, { CardBody } from '../components/ui/Card';
import { IoArrowBackOutline, IoSettingsOutline } from 'react-icons/io5';

const Profile = () => {
  const { user, loading, updateProfile } = useAuth();
  const { tasks } = useTasks();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);

  // Authentication gate redirect
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh] bg-slate-50/50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Fetch company specific challenges if applicable
  const activeChallenges = user.role === 'company' 
    ? tasks.filter((t) => t.companyId === user.id)
    : [];

  const handleSaveProfile = (updatedFields) => {
    const result = updateProfile(updatedFields);
    if (result.success) {
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } else {
      showToast('Failed to update profile details.', 'error');
    }
  };

  return (
    <div className="flex-grow bg-slate-50/30 dark:bg-slate-950/20 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Page Sub-navigation Backbar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <IoArrowBackOutline size={16} />
            Back
          </button>
          
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500">
            <IoSettingsOutline size={14} className="animate-spin-slow" />
            <span>Account Settings</span>
          </div>
        </div>

        {/* Edit View Title Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isEditing ? 'Edit Profile Details' : 'My Profile'}
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {isEditing 
              ? 'Update your personal credentials, image placeholders, and portfolios.'
              : 'View and manage your MicroIntern credentials, points, and challenges.'}
          </p>
        </div>

        {/* Dynamic State Layout (Card view vs Form view) */}
        {isEditing ? (
          <Card className="border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardBody className="p-6 sm:p-8">
              <ProfileForm
                user={user}
                onSave={handleSaveProfile}
                onCancel={() => setIsEditing(false)}
              />
            </CardBody>
          </Card>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ProfileCard
              user={user}
              activeChallenges={activeChallenges}
              onEditClick={() => setIsEditing(true)}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
