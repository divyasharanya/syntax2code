import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import SubmissionCard from '../components/SubmissionCard';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { IoTrophyOutline, IoCheckmarkCircleOutline, IoHourglassOutline, IoRocketOutline, IoMedalOutline } from 'react-icons/io5';

// Avatar initials component
const InitialsAvatar = ({ name, isSelf, size = 'sm' }) => {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  const colors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-teal-500',
  ];
  const color = colors[name?.charCodeAt(0) % colors.length] || 'bg-slate-400';
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';
  return (
    <div className={`${sizeClass} ${color} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${isSelf ? 'ring-2 ring-primary ring-offset-1' : ''}`}>
      {initials}
    </div>
  );
};

const RANK_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

const DashboardCandidate = () => {
  const { user } = useAuth();
  const { submissions } = useTasks();
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  // Filter submissions corresponding to this candidate
  const candidateSubmissions = submissions.filter((sub) => sub.candidateId === user.uid);

  const stats = {
    points: user.points || 0,
    total: candidateSubmissions.length,
    offered: candidateSubmissions.filter((s) => s.status === 'Offered').length,
    pending: candidateSubmissions.filter((s) => s.status !== 'Offered' && s.status !== 'Rejected').length,
  };

  // Fetch real leaderboard from Firestore
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'candidate'));
        const snap = await getDocs(q);

        const allCandidates = snap.docs
          .map((d) => ({ uid: d.id, ...d.data() }))
          .sort((a, b) => (b.points || 0) - (a.points || 0))
          .map((c, idx) => ({ ...c, rank: idx + 1 }));

        // Find current user's rank
        const meInList = allCandidates.find((c) => c.uid === user.uid);
        if (meInList && meInList.rank > 10) {
          setCurrentUserRank(meInList);
        } else {
          setCurrentUserRank(null);
        }

        setLeaderboard(allCandidates.slice(0, 10));
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user.uid, user.points]); // re-fetch when user's own points change

  return (
    <div className="flex flex-col gap-6">
      {/* Header welcome banner */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Candidate Dashboard</h1>
        <p className="text-xs text-slate-400">Welcome back, {user.name}. Build solutions and earn your interview recommendations.</p>
      </div>

      {/* Metric Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Points widget */}
        <Card className="bg-amber-50/20 border-amber-100/50">
          <CardBody className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <IoTrophyOutline size={22} />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Skill Points</span>
              <span className="text-lg font-black text-amber-700">{stats.points}</span>
            </div>
          </CardBody>
        </Card>

        {/* Total Solutions */}
        <Card>
          <CardBody className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-primary rounded-xl">
              <IoRocketOutline size={22} />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Submissions</span>
              <span className="text-lg font-black text-slate-800">{stats.total}</span>
            </div>
          </CardBody>
        </Card>

        {/* Offered */}
        <Card className="bg-emerald-50/20 border-emerald-100/50">
          <CardBody className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <IoCheckmarkCircleOutline size={22} />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Offered</span>
              <span className="text-lg font-black text-emerald-700">{stats.offered}</span>
            </div>
          </CardBody>
        </Card>

        {/* In Review */}
        <Card className="bg-amber-50/10 border-amber-50/50">
          <CardBody className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-amber-50/50 text-amber-500 rounded-xl">
              <IoHourglassOutline size={22} />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">In Funnel</span>
              <span className="text-lg font-black text-amber-600">{stats.pending}</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Submission List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="font-extrabold text-slate-800 text-sm">Submission History</h3>
          
          {candidateSubmissions.length > 0 ? (
            <div className="flex flex-col gap-4">
              {candidateSubmissions.map((sub) => (
                <SubmissionCard key={sub.id} submission={sub} />
              ))}
            </div>
          ) : (
            <Card className="border border-slate-100 p-8 text-center bg-white rounded-xl">
              <CardBody className="flex flex-col items-center gap-3">
                <div className="p-3.5 bg-slate-50 text-slate-400 rounded-full">
                  <IoRocketOutline size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">No submissions yet</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Explore open challenges, submit your code repo, and get reviewed.</p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right Side: Live Leaderboard */}
        <aside className="flex flex-col gap-4">
          <Card className="border border-slate-100">
            <CardHeader className="py-4 flex items-center gap-2">
              <IoTrophyOutline className="text-amber-500" size={16} />
              <h3 className="font-extrabold text-slate-800 text-sm">Platform Leaderboard</h3>
            </CardHeader>
            <CardBody className="p-0">
              {leaderboardLoading ? (
                <div className="flex flex-col gap-2 p-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-5 h-3 bg-slate-100 rounded" />
                      <div className="w-7 h-7 bg-slate-100 rounded-full" />
                      <div className="flex-1 h-3 bg-slate-100 rounded" />
                      <div className="w-10 h-3 bg-slate-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-xs text-slate-400 text-center p-6">
                  <IoMedalOutline size={28} className="mx-auto mb-2 text-slate-300" />
                  No rankings yet — be the first to earn points!
                </div>
              ) : (
                <div className="flex flex-col">
                  {leaderboard.map((item) => {
                    const isSelf = item.uid === user.uid;
                    return (
                      <div
                        key={item.uid}
                        className={`flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-b-0 transition-colors ${
                          isSelf ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                        }`}
                      >
                        <span className="w-5 text-center text-sm">
                          {RANK_MEDAL[item.rank] || (
                            <span className="text-xs font-black text-slate-400">#{item.rank}</span>
                          )}
                        </span>
                        <InitialsAvatar name={item.name} isSelf={isSelf} />
                        <div className="flex-1 leading-tight min-w-0">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1 truncate">
                            {item.name || 'Anonymous'}
                            {isSelf && (
                              <Badge variant="blue" className="text-[8px] px-1 py-0 font-extrabold uppercase flex-shrink-0">You</Badge>
                            )}
                          </span>
                        </div>
                        <span className={`text-xs font-black flex-shrink-0 ${isSelf ? 'text-primary' : 'text-slate-700'}`}>
                          {item.points || 0} pts
                        </span>
                      </div>
                    );
                  })}

                  {/* Show current user below if outside top 10 */}
                  {currentUserRank && (
                    <>
                      <div className="flex items-center justify-center py-1">
                        <span className="text-[9px] text-slate-300 font-bold tracking-widest">• • •</span>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border-l-2 border-l-primary">
                        <span className="w-5 text-xs font-black text-slate-400 text-center">#{currentUserRank.rank}</span>
                        <InitialsAvatar name={currentUserRank.name} isSelf />
                        <div className="flex-1 leading-tight min-w-0">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1 truncate">
                            {currentUserRank.name}
                            <Badge variant="blue" className="text-[8px] px-1 py-0 font-extrabold uppercase flex-shrink-0">You</Badge>
                          </span>
                        </div>
                        <span className="text-xs font-black text-primary flex-shrink-0">
                          {currentUserRank.points || 0} pts
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default DashboardCandidate;
