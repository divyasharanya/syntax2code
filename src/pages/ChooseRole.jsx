import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoTerminalOutline, IoPersonOutline, IoBriefcaseOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';

const ChooseRole = () => {
  const { user, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState('');

  // If user already has a role, redirect to appropriate dashboard
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'company') {
        navigate('/dashboard/company', { replace: true });
      } else if (user.role === 'candidate') {
        navigate('/dashboard/candidate', { replace: true });
      }
      // role === null → stay here and pick
    }
  }, [user, loading, navigate]);

  const handleChooseRole = async (role) => {
    setError('');
    setSelecting(true);
    try {
      const res = await updateProfile({ role });
      if (!res.success) {
        setError('Failed to save your role. Please try again.');
        setSelecting(false);
        return;
      }
      // updateProfile updates local user state → useEffect above will redirect
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setSelecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 bg-slate-50/50">
      <div className="w-full max-w-lg flex flex-col gap-8">

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black text-slate-900">
            <div className="p-1.5 bg-primary rounded-lg text-white">
              <IoTerminalOutline size={22} />
            </div>
            <span>Micro<span className="text-primary font-bold">Intern</span></span>
          </Link>
          <div className="mt-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome, {user?.name?.split(' ')[0] || 'there'}! 👋
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              One last step — tell us how you'll be using MicroIntern.
            </p>
          </div>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Candidate card */}
          <button
            onClick={() => handleChooseRole('candidate')}
            disabled={selecting}
            className="group relative flex flex-col items-center gap-5 p-8 bg-white border-2 border-slate-100 rounded-2xl shadow-xs hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-left"
          >
            {/* Glow background on hover */}
            <div className="absolute inset-0 rounded-2xl bg-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

            <div className="relative z-10 flex flex-col items-center gap-4 w-full">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <IoPersonOutline size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-base font-black text-slate-900">I'm a Candidate</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Browse challenges, submit solutions, and earn interviews with top companies.
                </p>
              </div>
              <div className="flex flex-col gap-1.5 w-full text-xs text-slate-600">
                {['Browse open challenges', 'Submit code solutions', 'Earn skill points'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <IoCheckmarkCircleOutline size={14} className="text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </button>

          {/* Company card */}
          <button
            onClick={() => handleChooseRole('company')}
            disabled={selecting}
            className="group relative flex flex-col items-center gap-5 p-8 bg-white border-2 border-slate-100 rounded-2xl shadow-xs hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-left"
          >
            <div className="absolute inset-0 rounded-2xl bg-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

            <div className="relative z-10 flex flex-col items-center gap-4 w-full">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <IoBriefcaseOutline size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-base font-black text-slate-900">I'm a Company</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Post real-world challenges, review submissions, and identify top engineering talent.
                </p>
              </div>
              <div className="flex flex-col gap-1.5 w-full text-xs text-slate-600">
                {['Post coding challenges', 'Review submissions', 'Hire top candidates'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <IoCheckmarkCircleOutline size={14} className="text-indigo-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-xs text-red-600 font-semibold bg-red-50 border border-red-100 rounded-lg p-3">
            {error}
          </p>
        )}

        {/* Saving indicator */}
        {selecting && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Setting up your account...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChooseRole;
