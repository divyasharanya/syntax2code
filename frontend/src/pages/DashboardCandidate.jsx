import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import SubmissionCard from '../components/SubmissionCard';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { IoTrophyOutline, IoCheckmarkCircleOutline, IoHourglassOutline, IoRocketOutline } from 'react-icons/io5';

const LEADERBOARD = [
  { rank: 1, name: 'Sofia Alvarez', points: 650, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80' },
  { rank: 2, name: 'Jordan Patel', points: 520, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  { rank: 3, name: 'Liam Smith', points: 410, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  { rank: 4, name: 'Alex Rivera', points: 350, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', isSelf: true },
  { rank: 5, name: 'Clara Vance', points: 280, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
];

const DashboardCandidate = () => {
  const { user } = useAuth();
  const { submissions } = useTasks();

  // Filter submissions corresponding to this candidate
  const candidateSubmissions = submissions.filter((sub) => String(sub.candidateId) === String(user.id));

  const stats = {
    points: user.points || 0,
    total: candidateSubmissions.length,
    offered: candidateSubmissions.filter((s) => s.status === 'Offered').length,
    pending: candidateSubmissions.filter((s) => s.status !== 'Offered' && s.status !== 'Rejected').length,
  };

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

        {/* Right Side: Competitive Leaderboard */}
        <aside className="flex flex-col gap-4">
          <Card className="border border-slate-100">
            <CardHeader className="py-4 flex items-center gap-2">
              <IoTrophyOutline className="text-amber-500" size={16} />
              <h3 className="font-extrabold text-slate-800 text-sm">Platform Leaderboard</h3>
            </CardHeader>
            <CardBody className="p-0">
              <div className="flex flex-col">
                {LEADERBOARD.map((item) => {
                  const points = item.isSelf ? stats.points : item.points;
                  return (
                    <div
                      key={item.name}
                      className={`flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-b-0 ${
                        item.isSelf ? 'bg-primary/5' : ''
                      }`}
                    >
                      <span className="w-5 text-xs font-black text-slate-400 text-center">#{item.rank}</span>
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-100"
                      />
                      <div className="flex-1 leading-tight">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          {item.name}
                          {item.isSelf && <Badge variant="blue" className="text-[8px] px-1 py-0 font-extrabold uppercase">You</Badge>}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-700">{points} pts</span>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default DashboardCandidate;
