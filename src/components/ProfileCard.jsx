import React from 'react';
import Card, { CardBody } from './ui/Card';
import Badge from './ui/Badge';
import { 
  IoGlobeOutline, 
  IoMailOutline, 
  IoBriefcaseOutline, 
  IoHardwareChipOutline,
  IoPencilOutline,
  IoTrophyOutline,
  IoBookmarkOutline,
  IoTimeOutline,
  IoPeopleOutline
} from 'react-icons/io5';
import { Link } from 'react-router-dom';

const ProfileCard = ({ user, activeChallenges = [], onEditClick }) => {
  const isCandidate = user.role === 'candidate';

  return (
    <Card className="overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
      {/* Decorative Premium Banner */}
      <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 to-indigo-600 relative flex items-end px-6 pb-4">
        {/* Absolute styling or ambient shapes */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
          <button
            onClick={onEditClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/25 hover:bg-white/35 backdrop-blur-md text-white rounded-xl text-xs font-bold transition-all shadow-xs border border-white/20 cursor-pointer"
          >
            <IoPencilOutline size={14} />
            Edit Profile
          </button>
        </div>
      </div>

      <CardBody className="relative pt-0 px-4 sm:px-8 pb-8">
        {/* Profile Avatar Overlapping the Banner */}
        <div className="-mt-16 sm:-mt-20 mb-4 sm:mb-6 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-md bg-slate-50 dark:bg-slate-900 flex-shrink-0">
            <img
              src={user.avatar || user.companyLogo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="text-center sm:text-left pb-1 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                {isCandidate ? user.name : user.companyName}
              </h2>
              <div className="inline-flex items-center justify-center sm:justify-start">
                <Badge variant={isCandidate ? 'blue' : 'purple'} className="capitalize text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-full">
                  {user.role}
                </Badge>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 capitalize">
              {isCandidate ? user.title || 'Developer' : `Primary contact: ${user.name}`}
            </p>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Details & contact sidebar */}
          <div className="flex flex-col gap-5 lg:border-r lg:border-slate-100 lg:dark:border-slate-800 lg:pr-8">
            {/* Points / Reputation widget for Candidate */}
            {isCandidate && (
              <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-xl">
                    <IoTrophyOutline size={20} />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Skill Points</span>
                    <span className="text-base font-black text-amber-700 dark:text-amber-400">{user.points || 0} pts</span>
                  </div>
                </div>
              </div>
            )}

            {/* Email contact */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <IoMailOutline size={12} /> Email Address
              </span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 break-all">{user.email}</span>
            </div>

            {/* Links */}
            {((isCandidate && user.portfolioUrl) || (!isCandidate && user.companyUrl)) && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                  <IoGlobeOutline size={12} /> Website / Links
                </span>
                <a
                  href={isCandidate ? user.portfolioUrl : user.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-primary hover:text-primary-dark transition-all inline-flex items-center gap-1 hover:underline"
                >
                  {isCandidate ? user.portfolioUrl : user.companyUrl}
                  <IoGlobeOutline size={14} className="flex-shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* Main content body (bio, skills or company tasks) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* About / Description */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <IoBriefcaseOutline size={14} />
                {isCandidate ? 'About Me' : 'About Stripe'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                {user.bio || (isCandidate 
                  ? 'No bio provided yet. Click edit to write about yourself!' 
                  : 'No company description provided yet. Click edit to tell candidates about your platform!')}
              </p>
            </div>

            {/* Skills Badges for Candidate */}
            {isCandidate && (
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <IoHardwareChipOutline size={14} /> Core Skillsets
                </h3>
                {user.skills && user.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">No skills listed yet.</p>
                )}
              </div>
            )}

            {/* Company Active Challenges list */}
            {!isCandidate && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <IoBookmarkOutline size={14} /> Active Challenges ({activeChallenges.length})
                </h3>
                {activeChallenges.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeChallenges.map((task) => (
                      <Link 
                        key={task.id} 
                        to={`/tasks/${task.id}`}
                        className="group flex flex-col gap-2 p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600 transition-all shadow-2xs hover:shadow-xs"
                      >
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs line-clamp-1 group-hover:text-primary transition-colors">
                          {task.title}
                        </h4>
                        
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                          <span className="flex items-center gap-1">
                            <IoTimeOutline size={12} /> {task.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <IoPeopleOutline size={12} /> {task.applicantsCount || 0} applicants
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-50 dark:border-slate-800">
                          <span className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-500 flex items-center gap-0.5">
                            <IoTrophyOutline size={11} /> {task.reward} pts
                          </span>
                          <Badge variant={task.difficulty === 'Advanced' ? 'red' : task.difficulty === 'Intermediate' ? 'blue' : 'green'} className="text-[8px] px-1.5">
                            {task.difficulty}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2">
                    <IoBookmarkOutline size={20} className="text-slate-300 dark:text-slate-600" />
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No active challenges posted yet.</p>
                    <Link to="/tasks/create">
                      <Button variant="outline" size="sm" className="mt-1">Post a Challenge</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProfileCard;
