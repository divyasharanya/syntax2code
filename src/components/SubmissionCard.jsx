import React from 'react';
import Card, { CardBody, CardHeader } from './ui/Card';
import Badge from './ui/Badge';
import { IoLogoGithub, IoOpenOutline, IoCheckmarkCircleOutline, IoHourglassOutline, IoCloseCircleOutline, IoTrophyOutline, IoPeopleOutline } from 'react-icons/io5';

const SubmissionCard = ({ submission, showCandidateInfo = false }) => {
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'offered':
        return (
          <Badge variant="green" className="flex items-center gap-1">
            <IoCheckmarkCircleOutline size={13} /> Offered
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="red" className="flex items-center gap-1">
            <IoCloseCircleOutline size={13} /> Rejected
          </Badge>
        );
      case 'applied':
        return (
          <Badge variant="blue" className="flex items-center gap-1 text-[10px]">
            <IoHourglassOutline size={13} /> Applied
          </Badge>
        );
      case 'reviewed':
        return (
          <Badge variant="blue" className="flex items-center gap-1 text-[10px]">
            <IoCheckmarkCircleOutline size={13} /> Reviewed
          </Badge>
        );
      case 'shortlisted':
        return (
          <Badge variant="purple" className="flex items-center gap-1 text-[10px]">
            <IoTrophyOutline size={13} /> Shortlisted
          </Badge>
        );
      case 'interview':
        return (
          <Badge variant="purple" className="flex items-center gap-1 text-[10px]">
            <IoPeopleOutline size={13} /> Interview
          </Badge>
        );
      default:
        return (
          <Badge variant="yellow" className="flex items-center gap-1 text-[10px]">
            <IoHourglassOutline size={13} /> {status}
          </Badge>
        );
    }
  };

  const renderTimeline = () => {
    const status = submission.status || 'Applied';
    
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
      <div className="mt-4 pt-4 border-t border-slate-100/60">
        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Application Timeline</h5>
        <div className="relative flex items-center justify-between px-2">
          {/* Background Line */}
          <div className="absolute left-6 right-6 top-[11px] h-0.5 bg-slate-100 -z-1" />
          
          {/* Progress Line */}
          <div 
            className="absolute left-6 top-[11px] h-0.5 bg-primary transition-all duration-500 -z-1"
            style={{ 
              width: `${
                isRejected ? 'calc(100% - 48px)' :
                isOffered ? 'calc(100% - 48px)' :
                isInterview ? 'calc(75% - 36px)' :
                isShortlisted ? 'calc(50% - 24px)' :
                isReviewed ? 'calc(25% - 12px)' : '0%'
              }` 
            }}
          />

          {steps.map((step, idx) => {
            let dotClass = 'w-[24px] h-[24px] rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300 ';
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
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          {showCandidateInfo ? (
            <>
              <img
                src={submission.candidateAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={submission.candidateName}
                className="w-9 h-9 rounded-full border border-slate-100 object-cover"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-800">{submission.candidateName}</h4>
                <p className="text-xs text-slate-400">Submitted for <span className="font-semibold text-slate-600">{submission.taskTitle}</span></p>
              </div>
            </>
          ) : (
            <div>
              <h4 className="text-sm font-bold text-slate-800">{submission.taskTitle}</h4>
              <p className="text-xs text-slate-400">By <span className="font-semibold text-slate-600">{submission.companyName}</span></p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {submission.score && (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
              <IoTrophyOutline size={13} />
              <span>Score: {submission.score}/100</span>
            </div>
          )}
          {getStatusBadge(submission.status)}
        </div>
      </CardHeader>

      <CardBody className="flex flex-col gap-4">
        {/* Deliverables Links */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <a
            href={submission.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
          >
            <IoLogoGithub size={16} className="text-slate-800" />
            <span>GitHub Repository</span>
            <IoOpenOutline size={12} className="text-slate-400" />
          </a>
          {submission.liveUrl && (
            <a
              href={submission.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
            >
              <IoOpenOutline size={16} className="text-primary" />
              <span>Live Demonstration</span>
              <IoOpenOutline size={12} className="text-slate-400" />
            </a>
          )}
        </div>

        {/* Candidate Submission Notes */}
        <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100/50">
          <h5 className="text-xs font-bold text-slate-500 mb-1">Submission Notes:</h5>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
            {submission.notes}
          </p>
        </div>

        {/* Company Feedback */}
        {submission.feedback && (
          <div className="border-t border-slate-100 pt-3 flex flex-col gap-1.5">
            <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1">
              💬 Company Evaluation & Feedback:
            </h5>
            <p className="text-xs text-slate-500 italic bg-primary/5 p-3 rounded-lg border border-primary/10 leading-relaxed">
              "{submission.feedback}"
            </p>
          </div>
        )}

        {/* Progress Timeline Stepper */}
        {renderTimeline()}
      </CardBody>
    </Card>
  );
};

export default SubmissionCard;
