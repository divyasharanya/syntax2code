import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { IoTimeOutline, IoWalletOutline, IoPeopleOutline, IoArrowBackOutline, IoChevronForwardOutline, IoShieldCheckmarkOutline, IoAlertCircleOutline, IoLogoGithub, IoOpenOutline, IoCloudUploadOutline, IoDocumentOutline, IoCloseCircleOutline } from 'react-icons/io5';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, submissions, submitTask } = useTasks();
  const { user } = useAuth();

  const task = tasks.find((t) => t.id === id);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [formData, setFormData] = useState({ githubUrl: '', liveUrl: '', notes: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!task) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-xl font-bold text-slate-800">Challenge not found</h2>
        <Link to="/tasks">
          <Button variant="outline">Back to Challenges</Button>
        </Link>
      </div>
    );
  }

  // Find candidate's submission for this task (if logged in)
  const candidateSubmission = user && user.role === 'candidate'
    ? submissions.find((sub) => sub.taskId === task.id && sub.candidateId === user.id)
    : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const ACCEPTED_TYPES = ['.pdf', '.doc', '.docx', '.zip', '.png', '.jpg', '.jpeg'];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 10 MB.`);
      setSelectedFile(null);
      e.target.value = '';
      return;
    }
    setFileError('');
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError('');
    // Reset the hidden file input so the same file can be re-selected
    const input = document.getElementById('submission-file-input');
    if (input) input.value = '';
  };

  const handleOpenModal = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsSubmitModalOpen(true);
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    setError('');

    // Require at least one of: a valid GitHub URL or a file
    const hasGithub = formData.githubUrl.toLowerCase().includes('github.com/');
    const hasFile = Boolean(selectedFile);

    if (!hasGithub && !hasFile) {
      setError('Please provide a GitHub link or upload a file (or both).');
      return;
    }

    if (formData.githubUrl && !hasGithub) {
      setError('Please provide a valid GitHub repository URL (must include github.com/).');
      return;
    }

    setIsUploading(true);
    try {
      // submitTask in TaskContext is the single source of truth for the network request.
      // It handles both the multipart (file) and JSON (no file) paths, including auth headers.
      const result = await submitTask(task.id, {
        githubUrl: formData.githubUrl,
        liveUrl: formData.liveUrl,
        notes: formData.notes,
        file: selectedFile,
      });

      if (!result.success) {
        setError(result.error || 'Failed to submit solution.');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setSuccess(false);
        setFormData({ githubUrl: '', liveUrl: '', notes: '' });
        setSelectedFile(null);
      }, 1500);
    } catch (err) {
      setError('Network error — please check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Convert markdown-like descriptions into clean paragraphs
  const renderDescription = (desc) => {
    return desc.split('\n\n').map((block, idx) => {
      if (block.startsWith('### Objective') || block.startsWith('### Requirements') || block.startsWith('### Deliverables')) {
        return (
          <h3 key={idx} className="text-lg font-black text-slate-800 mt-6 mb-3 border-b border-slate-100 pb-1">
            {block.replace('### ', '')}
          </h3>
        );
      }
      if (block.startsWith('1.') || block.startsWith('-')) {
        const items = block.split('\n');
        return (
          <ul key={idx} className="list-disc pl-5 space-y-2 text-sm text-slate-600 leading-relaxed my-3">
            {items.map((item, subIdx) => {
              const cleanedItem = item.replace(/^\d+\.\s+\*\*(.*?)\*\*:\s*/, '<strong>$1</strong>: ').replace(/^-\s*/, '').replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs text-rose-600">$1</code>');
              return <li key={subIdx} dangerouslySetInnerHTML={{ __html: cleanedItem }} />;
            })}
          </ul>
        );
      }
      return (
        <p key={idx} className="text-sm text-slate-600 leading-relaxed my-3" dangerouslySetInnerHTML={{ __html: block.replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs text-rose-600">$1</code>') }} />
      );
    });
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      {/* Back navigation */}
      <div>
        <Link to="/tasks" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-primary transition-colors">
          <IoArrowBackOutline size={14} /> Back to Challenges
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Task Description details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="border border-slate-100">
            <CardBody className="p-6 md:p-8 flex flex-col gap-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <img
                    src={task.companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80'}
                    alt={task.companyName}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-100"
                  />
                  <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">{task.title}</h1>
                    <p className="text-sm font-semibold text-slate-500">Posted by {task.companyName}</p>
                  </div>
                </div>
                <Badge variant={task.difficulty === 'Easy' ? 'green' : task.difficulty === 'Intermediate' ? 'blue' : 'purple'} className="capitalize text-sm py-1 px-3">
                  {task.difficulty}
                </Badge>
              </div>

              {/* Task Details Content */}
              <div className="prose prose-slate max-w-none">
                {renderDescription(task.description)}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right 1 Column: Sticky Info Box */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-20">
          <Card className="border border-slate-100 shadow-xs">
            <CardHeader className="py-4">
              <h3 className="font-extrabold text-slate-800 text-sm">Challenge Summary</h3>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <div className="flex flex-col gap-3.5">
                {/* Reward Metric */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <IoWalletOutline size={20} />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Completion Reward</span>
                    <span className="text-base font-black text-emerald-600">${task.reward} stipend</span>
                  </div>
                </div>

                {/* Duration Metric */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-primary rounded-lg">
                    <IoTimeOutline size={20} />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Estimated Effort</span>
                    <span className="text-sm font-bold text-slate-800">{task.duration} hours</span>
                  </div>
                </div>

                {/* Applicants Metric */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">
                    <IoPeopleOutline size={20} />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Total Submissions</span>
                    <span className="text-sm font-bold text-slate-800">{task.applicantsCount || 0} applicants</span>
                  </div>
                </div>
              </div>

              {/* Tag Badges */}
              <div className="border-t border-slate-50 pt-4 flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Required Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="slate" className="text-[10px] py-1 px-2.5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Button depending on session & submission */}
              <div className="border-t border-slate-50 pt-4 mt-2">
                {!user ? (
                  <Link to="/login" className="w-full block">
                    <Button className="w-full">Sign In to Apply</Button>
                  </Link>
                ) : user.role === 'candidate' ? (
                  candidateSubmission ? (
                    <div className="flex flex-col gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <IoShieldCheckmarkOutline className="text-emerald-500" size={18} />
                        <span className="text-xs font-extrabold text-slate-700">Project Submitted</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        You have already submitted a solution for this challenge. Keep track of reviews inside your candidate dashboard.
                      </p>
                      <Link to="/dashboard/candidate" className="w-full">
                        <Button variant="outline" size="sm" className="w-full">
                          Go to Dashboard
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Button onClick={handleOpenModal} className="w-full">
                      Submit Solution
                    </Button>
                  )
                ) : user.id === task.companyId ? (
                  <Link to="/dashboard/company" className="w-full block">
                    <Button className="w-full">Manage Submissions</Button>
                  </Link>
                ) : (
                  <div className="bg-slate-50 text-slate-500 text-xs font-semibold p-3 rounded-lg border border-slate-100 text-center leading-tight">
                    Log in as a Candidate to submit solutions.
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </aside>
      </div>

      {/* SUBMISSION MODAL */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Challenge Solution"
      >
        {success ? (
          <div className="flex flex-col items-center justify-center p-6 text-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <IoShieldCheckmarkOutline size={26} />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">Solution Submitted!</h4>
            <p className="text-xs text-slate-400">Your files were cataloged. Redirecting to stats...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitSolution} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-lg border border-red-100 flex items-center gap-2">
                <IoAlertCircleOutline size={16} />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="GitHub Repository URL (optional if uploading a file)"
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/yourusername/project-repo"
            />

            {/* File Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">
                Upload Submission File
                <span className="font-normal text-slate-400 ml-1">(optional — PDF, DOC, DOCX, ZIP, PNG, JPG · max 10 MB)</span>
              </label>

              {selectedFile ? (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
                  <IoDocumentOutline size={18} className="text-blue-500 shrink-0" />
                  <span className="text-xs font-semibold text-blue-800 truncate flex-1">{selectedFile.name}</span>
                  <span className="text-[10px] text-blue-500 shrink-0">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="ml-1 text-blue-400 hover:text-red-500 transition-colors shrink-0"
                    aria-label="Remove file"
                  >
                    <IoCloseCircleOutline size={18} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="submission-file-input"
                  className="flex items-center gap-2 border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-colors rounded-lg px-3 py-3 cursor-pointer"
                >
                  <IoCloudUploadOutline size={18} className="text-slate-400" />
                  <span className="text-xs text-slate-500">Click to choose a file</span>
                </label>
              )}

              <input
                id="submission-file-input"
                type="file"
                accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />

              {fileError && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                  <IoAlertCircleOutline size={14} />
                  {fileError}
                </p>
              )}
            </div>

            <Input
              label="Live Deployment Link (Optional)"
              type="url"
              name="liveUrl"
              value={formData.liveUrl}
              onChange={handleChange}
              placeholder="https://project-demo.vercel.app"
            />

            <Input
              label="Implementation & Design Notes"
              type="textarea"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Explain how you built the project, what design structures you implemented, and how we can test the functionalities..."
            />

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
              <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading} className="relative min-w-[120px]">
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Uploading…
                  </span>
                ) : (
                  'Submit Files'
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default TaskDetails;
