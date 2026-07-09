import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { IoCreateOutline, IoAlertCircleOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';

const CreateTask = () => {
  const { user } = useAuth();
  const { addTask } = useTasks();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'company') {
      navigate('/');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Intermediate',
    duration: '',
    reward: '',
    tags: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (Number(formData.reward) <= 0) {
      setError('Reward stipend must be a positive number.');
      return;
    }
    const durationNum = parseInt(formData.duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      setError('Duration must be a positive number of hours.');
      return;
    }

    const processedTags = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const fullDescription = `### Objective
${formData.description}

### Requirements
- Build the task with responsiveness and fluid animations in mind.
- Complete the code structure with clean and highly readable style patterns.
- Deploy the result using standard services (Vercel, Netlify, Github Pages, etc.).

### Deliverables
- A GitHub repository containing the complete, working React frontend project.
- A live deployment URL matching the guidelines.`;

    const res = addTask({
      title: formData.title,
      difficulty: formData.difficulty,
      duration: `${durationNum}h`,
      reward: Number(formData.reward),
      tags: processedTags,
      description: fullDescription,
    });

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/company');
      }, 1500);
    } else {
      setError(res.error || 'Failed to post task');
    }
  };

  return (
    <div className="flex-grow max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <IoCreateOutline size={26} className="text-primary" /> Create Internship Challenge
        </h1>
        <p className="text-xs text-slate-400">Post a real-world coding exercise for candidates. Top applicants will earn technical interviews.</p>
      </div>

      <Card className="border border-slate-100 shadow-sm bg-white">
        <CardBody className="p-6 md:p-8">
          {success ? (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                <IoShieldCheckmarkOutline size={26} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Challenge Published!</h3>
              <p className="text-xs text-slate-400">Redirecting to your company console...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-lg border border-red-100 flex items-center gap-2">
                  <IoAlertCircleOutline size={16} />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Challenge Title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. stripe custom payments checkout widget"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Difficulty Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Difficulty Rating</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg shadow-xs bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <Input
                  label="Estimated Time (Hours)"
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 4"
                  required
                />

                <Input
                  label="Completion Reward ($)"
                  type="number"
                  name="reward"
                  value={formData.reward}
                  onChange={handleChange}
                  placeholder="e.g. 150"
                  required
                />
              </div>

              <Input
                label="Required Skills (Comma separated)"
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. React, Tailwind CSS, API Integration"
                required
              />

              <Input
                label="Task Objective & Problem Details"
                type="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Explain the project objectives, code boundaries, specific edge cases that need styling, and general functional scope..."
                required
                rows={6}
              />

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 mt-2">
                <Link to="/dashboard/company">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit">
                  Publish Challenge
                </Button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default CreateTask;
