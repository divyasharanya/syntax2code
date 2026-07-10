import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { IoListOutline, IoPeopleOutline, IoTimeOutline, IoCheckmarkCircleOutline, IoHourglassOutline, IoLogoGithub, IoOpenOutline, IoRibbonOutline } from 'react-icons/io5';

const DashboardCompany = () => {
  const { user } = useAuth();
  const { tasks, submissions, reviewSubmission } = useTasks();

  const [activeTab, setActiveTab] = useState('submissions'); // 'challenges' or 'submissions'
  const [selectedSubId, setSelectedSubId] = useState(null); // Active candidate review detail view ID
  const [reviewForm, setReviewForm] = useState({ score: '90', feedback: '' });
  const [error, setError] = useState('');

  // Get tasks posted by this company (uid-based match)
  const companyTasks = tasks.filter((t) => t.companyId === user.uid);
  const companyTaskIds = companyTasks.map((t) => t.id);

  // Get submissions corresponding to this company's tasks
  const companySubmissions = submissions.filter((sub) => companyTaskIds.includes(sub.taskId));

  const stats = {
    challenges: companyTasks.length,
    submissions: companySubmissions.length,
    pending: companySubmissions.filter((s) => s.status === 'Applied').length,
  };

  const handleOpenReviewPage = (sub) => {
    setSelectedSubId(sub.id);
    setReviewForm({
      score: sub.score !== null && sub.score !== undefined ? String(sub.score) : '90',
      feedback: sub.feedback || '',
    });
    setError('');
  };

  const handleUpdateStatus = async (newStatus) => {
    setError('');

    if (Number(reviewForm.score) < 0 || Number(reviewForm.score) > 100) {
      setError('Score must be between 0 and 100');
      return;
    }

    if (!reviewForm.feedback.trim()) {
      setError('Evaluation / Interview notes are required to change status.');
      return;
    }

    const res = await reviewSubmission(selectedSubId, newStatus, {
      score: reviewForm.score,
      feedback: reviewForm.feedback,
    });

    if (!res.success) {
      setError(res.error || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'offered':
        return (
          <Badge variant="green" className="flex items-center gap-1 text-[10px]">
            <IoCheckmarkCircleOutline size={12} /> Offered
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="red" className="flex items-center gap-1 text-[10px]">
            <IoHourglassOutline size={12} /> Rejected
          </Badge>
        );
      case 'applied':
        return (
          <Badge variant="blue" className="flex items-center gap-1 text-[10px]">
            <IoHourglassOutline size={12} /> Applied
          </Badge>
        );
      case 'reviewed':
        return (
          <Badge variant="blue" className="flex items-center gap-1 text-[10px]">
            <IoCheckmarkCircleOutline size={12} /> Reviewed
          </Badge>
        );
      case 'shortlisted':
        return (
          <Badge variant="purple" className="flex items-center gap-1 text-[10px]">
            <IoRibbonOutline size={12} /> Shortlisted
          </Badge>
        );
      case 'interview':
        return (
          <Badge variant="purple" className="flex items-center gap-1 text-[10px]">
            <IoPeopleOutline size={12} /> Interview
          </Badge>
        );
      default:
        return (
          <Badge variant="yellow" className="flex items-center gap-1 text-[10px]">
            <IoHourglassOutline size={12} /> {status}
          </Badge>
        );
    }
  };

  // Dedicated Candidate Review Detail Page
  if (selectedSubId) {
    const sub = submissions.find((s) => s.id === selectedSubId);
    if (!sub) {
      setSelectedSubId(null);
      return null;
    }

    const status = sub.status || 'Applied';
    const isApplied = true;
    const isReviewed = ['reviewed', 'shortlisted', 'interview', 'offered'].includes(status.toLowerCase());
    const isShortlisted = ['shortlisted', 'interview', 'offered'].includes(status.toLowerCase());
    const isInterview = ['interview', 'offered'].includes(status.toLowerCase());
    const isOffered = status.toLowerCase() === 'offered';
    const isRejected = status.toLowerCase() === 'rejected';

    const steps = [
      { label: 'Applied', completed: isApplied, current: status === 'Applied' },
      { label: 'Reviewed', completed: isReviewed, current: status === 'Reviewed' },
      { label: 'Shortlisted', completed: isShortlisted, current: status === 'Shortlisted' },
      { label: 'Interview', completed: isInterview, current: status === 'Interview' },
      { 
        label: isRejected ? 'Rejected' : 'Offered', 
        completed: isOffered || isRejected, 
        current: isOffered || isRejected,
        failed: isRejected 
      }
    ];

    return (
      <div className="flex flex-col gap-6">
        {/* Back and Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={() => setSelectedSubId(null)}
              className="text-xs font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              ← Back to Submissions List
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-2">Candidate Review Portal</h1>
            <p className="text-xs text-slate-400">Review solution quality, transition hiring phases, and log feedback notes.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Current Phase:</span>
            {getStatusBadge(status)}
          </div>
        </div>

        {/* Timeline Progress Banner */}
        <Card className="border border-slate-100 bg-slate-50/50">
          <CardBody className="p-5">
            <div className="relative flex items-center justify-between px-6">
              <div className="absolute left-10 right-10 top-[11px] h-0.5 bg-slate-200 -z-1" />
              <div 
                className="absolute left-10 top-[11px] h-0.5 bg-primary transition-all duration-500 -z-1"
                style={{ 
                  width: `${
                    isRejected ? 'calc(100% - 80px)' :
                    isOffered ? 'calc(100% - 80px)' :
                    isInterview ? 'calc(75% - 60px)' :
                    isShortlisted ? 'calc(50% - 40px)' :
                    isReviewed ? 'calc(25% - 20px)' : '0%'
                  }` 
                }}
              />
              {steps.map((step, idx) => {
                let dotClass = 'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300 ';
                let labelClass = 'text-[10px] font-semibold mt-1 transition-colors duration-300 ';

                if (step.failed) {
                  dotClass += 'border-red-500 text-red-500 bg-red-50';
                  labelClass += 'text-red-500 font-bold';
                } else if (step.completed) {
                  dotClass += 'border-primary bg-primary text-white';
                  labelClass += 'text-primary font-bold';
                } else if (step.current) {
                  dotClass += 'border-blue-500 text-blue-500 bg-blue-50 ring-4 ring-blue-50';
                  labelClass += 'text-blue-600 font-bold';
                } else {
                  dotClass += 'border-slate-200 text-slate-300 bg-white';
                  labelClass += 'text-slate-400';
                }

                return (
                  <div key={idx} className="flex flex-col items-center flex-1 relative">
                    <div className={dotClass}>
                      {step.failed ? '✗' : step.completed ? '✓' : '○'}
                    </div>
                    <span className={labelClass}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Evaluation Panels Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left panel: Candidate Details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="border border-slate-100 bg-white">
              <CardHeader className="py-4">
                <h3 className="font-extrabold text-slate-800 text-sm">Submission Deliverables</h3>
              </CardHeader>
              <CardBody className="flex flex-col gap-5">
                <div className="flex items-center gap-4 border-b border-slate-50 pb-4">
                  <img
                    src={sub.candidateAvatar}
                    alt={sub.candidateName}
                    className="w-12 h-12 rounded-full border border-slate-200 object-cover"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{sub.candidateName}</h3>
                    <p className="text-xs text-slate-500">Submitted for: <span className="font-semibold text-primary">{sub.taskTitle}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                    <IoLogoGithub size={16} className="text-slate-800" />
                    <span>GitHub Repository</span>
                    <IoOpenOutline size={12} className="text-slate-400" />
                  </a>
                  {sub.liveUrl && (
                    <a href={sub.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                      <IoOpenOutline size={16} className="text-primary" />
                      <span>Live Demonstration</span>
                      <IoOpenOutline size={12} className="text-slate-400" />
                    </a>
                  )}
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Candidate Notes</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{sub.notes}</p>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right panel: Evaluation Actions */}
          <aside className="flex flex-col gap-6">
            <Card className="border border-slate-100 bg-white">
              <CardHeader className="py-4">
                <h3 className="font-extrabold text-slate-800 text-sm">Evaluation Console</h3>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                {error && (
                  <div className="bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-lg border border-red-100 flex items-center gap-2">
                    <IoHourglassOutline size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <Input
                  label="Evaluation Score (0 - 100)"
                  type="number"
                  name="score"
                  value={reviewForm.score}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, score: e.target.value }))}
                  min="0"
                  max="100"
                  required
                />

                <Input
                  label="Evaluation / Interview Notes"
                  type="textarea"
                  name="feedback"
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Provide feedback on code quality. Outline next steps for scheduling interviews or making job offers..."
                  required
                  rows={4}
                />

                {/* Pipeline Buttons Group */}
                <div className="flex flex-col gap-2 pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">FUNNEL ACTIONS</span>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    {/* REVIEW BUTTON */}
                    <Button 
                      onClick={() => handleUpdateStatus('Reviewed')}
                      variant={status === 'Reviewed' ? 'primary' : 'outline'}
                      className="text-xs py-2 w-full font-bold flex items-center justify-center gap-1.5"
                    >
                      ✓ Review
                    </Button>
                    
                    {/* SHORTLIST BUTTON */}
                    <Button 
                      onClick={() => handleUpdateStatus('Shortlisted')}
                      variant={status === 'Shortlisted' ? 'primary' : 'outline'}
                      className="text-xs py-2 w-full font-bold flex items-center justify-center gap-1.5"
                    >
                      ★ Shortlist
                    </Button>
                    
                    {/* SCHEDULE INTERVIEW BUTTON */}
                    <Button 
                      onClick={() => handleUpdateStatus('Interview')}
                      variant={status === 'Interview' ? 'primary' : 'outline'}
                      className="text-xs py-2 w-full font-bold flex items-center justify-center gap-1.5"
                    >
                      📅 Schedule Interview
                    </Button>
                    
                    {/* OFFER BUTTON */}
                    <Button 
                      onClick={() => handleUpdateStatus('Offered')}
                      variant={status === 'Offered' ? 'primary' : 'outline'}
                      className="text-xs py-2 w-full font-bold flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                    >
                      🏆 Offer
                    </Button>
                    
                    {/* REJECT BUTTON */}
                    <Button 
                      onClick={() => handleUpdateStatus('Rejected')}
                      variant="danger"
                      className="text-xs py-2 w-full font-bold flex items-center justify-center gap-1.5"
                    >
                      ✗ Reject
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user.companyName} Console</h1>
          <p className="text-xs text-slate-400">Evaluate solutions, manage pipeline phases, and invite candidates for technical interviews.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-primary rounded-xl">
              <IoListOutline size={22} />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Active Challenges</span>
              <span className="text-lg font-black text-slate-800">{stats.challenges}</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <IoPeopleOutline size={22} />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Solutions Received</span>
              <span className="text-lg font-black text-slate-800">{stats.submissions}</span>
            </div>
          </CardBody>
        </Card>

        <Card className={stats.pending > 0 ? 'bg-amber-50/20 border-amber-100/50' : ''}>
          <CardBody className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl">
              <IoHourglassOutline size={22} />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Reviews Pending</span>
              <span className="text-lg font-black text-amber-700">{stats.pending}</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'submissions'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Submissions Received ({companySubmissions.length})
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'challenges'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          My Posted Challenges ({companyTasks.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'submissions' ? (
          <div className="flex flex-col gap-4">
            {companySubmissions.length > 0 ? (
              companySubmissions.map((sub) => (
                <Card key={sub.id} className="border border-slate-100">
                  <CardHeader className="flex flex-wrap justify-between items-center py-4 gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={sub.candidateAvatar}
                        alt={sub.candidateName}
                        className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 leading-tight">{sub.candidateName}</h4>
                        <p className="text-xs text-slate-400">
                          Submitted for: <span className="font-semibold text-slate-600">{sub.taskTitle}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3">
                        {sub.score !== null && sub.score !== undefined && (
                          <div className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100 flex items-center gap-1">
                            <IoRibbonOutline size={12} /> Score: {sub.score}
                          </div>
                        )}
                        {getStatusBadge(sub.status)}
                        <Button size="sm" onClick={() => handleOpenReviewPage(sub)}>
                          {sub.status === 'Applied' ? 'Review Solution' : 'View Pipeline'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardBody className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                      <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                        <IoLogoGithub size={14} className="text-slate-800" /> GitHub Repo <IoOpenOutline size={10} />
                      </a>
                      {sub.liveUrl && (
                        <a href={sub.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                          <IoOpenOutline size={14} className="text-primary" /> Live Demo <IoOpenOutline size={10} />
                        </a>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100/50">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Candidate Notes</h5>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{sub.notes}</p>
                    </div>

                    {sub.feedback && (
                      <div className="border-t border-slate-50 pt-3">
                        <h5 className="text-xs font-bold text-slate-800 mb-1">Feedback Logged:</h5>
                        <p className="text-xs text-slate-500 italic bg-primary/5 p-3 rounded-lg border border-primary/10">"{sub.feedback}"</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))
            ) : (
              <Card className="border border-slate-100 p-8 text-center bg-white rounded-xl">
                <CardBody className="flex flex-col items-center gap-3">
                  <div className="p-3.5 bg-slate-50 text-slate-400 rounded-full">
                    <IoPeopleOutline size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">No submissions yet</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Submissions will show up here as candidates complete your challenges.</p>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companyTasks.length > 0 ? (
              companyTasks.map((t) => (
                <Card key={t.id} className="border border-slate-100 flex flex-col justify-between">
                  <CardBody className="flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{t.title}</h4>
                      <Badge variant={t.difficulty === 'Easy' ? 'green' : t.difficulty === 'Intermediate' ? 'blue' : 'purple'} className="capitalize">
                        {t.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{t.description.replace(/[#*`]/g, '')}</p>
                    <div className="flex flex-wrap gap-1">
                      {t.tags.map((tag) => (
                        <Badge key={tag} variant="slate" className="text-[9px]">{tag}</Badge>
                      ))}
                    </div>
                  </CardBody>
                  <div className="flex justify-between items-center px-5 py-3 border-t border-slate-50 bg-slate-50/50 rounded-b-xl text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5"><IoTimeOutline size={14} /><span>{t.duration}</span></div>
                    <div className="flex items-center gap-1.5"><IoPeopleOutline size={14} /><span>{t.applicantsCount} submissions</span></div>
                    <div className="text-emerald-600 font-bold">${t.reward}</div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-2">
                <Card className="border border-slate-100 p-8 text-center bg-white rounded-xl">
                  <CardBody className="flex flex-col items-center gap-3">
                    <div className="p-3.5 bg-slate-50 text-slate-400 rounded-full">
                      <IoListOutline size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">No challenges posted</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Click the "Create New Challenge" link to publish your first challenge.</p>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCompany;
