import React, { useState } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import AvatarUploader from './AvatarUploader';
import { IoSaveOutline, IoCloseCircleOutline } from 'react-icons/io5';

const ProfileForm = ({ user, onSave, onCancel }) => {
  const isCandidate = user.role === 'candidate';

  // Common and role-specific states
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || user.companyLogo || '');
  
  // Candidate states
  const [title, setTitle] = useState(user.title || '');
  const [skills, setSkills] = useState(
    user.skills ? user.skills.join(', ') : ''
  );
  const [portfolioUrl, setPortfolioUrl] = useState(user.portfolioUrl || '');

  // Company states
  const [companyName, setCompanyName] = useState(user.companyName || '');
  const [companyUrl, setCompanyUrl] = useState(user.companyUrl || '');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isCandidate) {
      if (!name.trim()) {
        setError('Name is required.');
        return;
      }
      
      setLoading(true);
      // Process skills into array
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const updatedFields = {
        name: name.trim(),
        title: title.trim(),
        bio: bio.trim(),
        skills: skillsArray,
        portfolioUrl: portfolioUrl.trim(),
        avatar: avatar,
      };

      setTimeout(() => {
        onSave(updatedFields);
        setLoading(false);
      }, 300);
    } else {
      if (!companyName.trim()) {
        setError('Company Name is required.');
        return;
      }

      setLoading(true);
      const updatedFields = {
        name: name.trim(), // keep main user name too
        companyName: companyName.trim(),
        companyUrl: companyUrl.trim(),
        bio: bio.trim(),
        companyLogo: avatar,
      };

      setTimeout(() => {
        onSave(updatedFields);
        setLoading(false);
      }, 300);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="p-3 text-xs font-semibold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50">
          {error}
        </div>
      )}

      {/* Avatar/Logo Uploader Section */}
      <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
        <AvatarUploader
          value={avatar}
          onChange={setAvatar}
          type={isCandidate ? 'candidate' : 'company'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isCandidate ? (
          <>
            {/* Candidate Edit Fields */}
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              required
            />
            <Input
              label="Professional Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frontend Engineer"
            />
            <div className="md:col-span-2">
              <Input
                label="Portfolio Website URL"
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="e.g. https://github.com/alexrivera"
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Skills (comma separated)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, JavaScript, Tailwind CSS, Node.js"
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                Separated by commas. These will render as badges on your profile.
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Company Edit Fields */}
            <Input
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Stripe"
              required
            />
            <Input
              label="Company Website URL"
              type="url"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              placeholder="e.g. https://stripe.com"
            />
            <div className="md:col-span-2">
              <Input
                label="Primary Contact Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Chen"
                required
              />
            </div>
          </>
        )}

        {/* Bio / Description Field */}
        <div className="md:col-span-2">
          <Input
            type="textarea"
            label={isCandidate ? 'About / Bio' : 'Company Description'}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={
              isCandidate
                ? 'Describe your professional journey, technical expertise, and what drives you...'
                : 'Describe what your company does, its core products, and the values you look for in candidates...'
            }
            rows={5}
          />
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
          className="flex items-center gap-1.5 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
        >
          <IoCloseCircleOutline size={16} />
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={loading} className="flex items-center gap-1.5">
          <IoSaveOutline size={16} />
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
