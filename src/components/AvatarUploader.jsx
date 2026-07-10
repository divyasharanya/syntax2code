import React, { useState, useRef } from 'react';
import { IoCloudUploadOutline, IoLinkOutline, IoImagesOutline, IoClose } from 'react-icons/io5';

const CANDIDATE_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
];

const COMPANY_PRESETS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80', // stripe logo style
  'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=150&auto=format&fit=crop&q=80', // spotify logo style
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=150&auto=format&fit=crop&q=80', // airbnb logo style
  'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80', // default startup
];

const AvatarUploader = ({ value, onChange, type = 'candidate' }) => {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const presets = type === 'candidate' ? CANDIDATE_PRESETS : COMPANY_PRESETS;

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlValue.trim()) {
      onChange(urlValue.trim());
      setUrlValue('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Active Preview */}
        <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-md flex-shrink-0 bg-slate-50 dark:bg-slate-900">
          <img
            src={value || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt="Upload Preview"
            className="w-full h-full object-cover"
          />
          <div 
            onClick={triggerFileInput}
            className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-opacity duration-200 gap-1"
          >
            <IoCloudUploadOutline size={20} />
            <span>Upload New</span>
          </div>
        </div>

        {/* Upload Control Center */}
        <div className="flex-1 w-full flex flex-col gap-3">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {type === 'candidate' ? 'Profile Picture' : 'Company Logo'}
          </label>
          
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={triggerFileInput}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <IoCloudUploadOutline size={14} />
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <IoLinkOutline size={14} />
              Image URL
            </button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileInputChange}
            accept="image/*"
            className="hidden"
          />
          
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            PNG, JPG or SVG formats. Max size 2MB. Drag and drop works too.
          </p>
        </div>
      </div>

      {/* Drag & Drop Overlay Zone (Alternative visual feedback) */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
          dragActive
            ? 'border-primary bg-primary/5 dark:bg-primary/10'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900'
        }`}
        onClick={triggerFileInput}
      >
        <IoCloudUploadOutline className="text-slate-400 dark:text-slate-500" size={24} />
        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
          Drag & drop your file here, or <span className="text-primary font-bold">browse</span>
        </span>
      </div>

      {/* URL Input Form */}
      {showUrlInput && (
        <form onSubmit={handleUrlSubmit} className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <input
            type="url"
            placeholder="Paste image address (e.g. https://example.com/logo.png)"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            className="flex-1 text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
          <button
            type="submit"
            className="px-3 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="p-2 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <IoClose size={16} />
          </button>
        </form>
      )}

      {/* Presets List */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1">
          <IoImagesOutline size={12} />
          Or Choose A Curated Preset
        </span>
        <div className="flex items-center gap-3">
          {presets.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onChange(preset)}
              className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-100 dark:bg-slate-800 hover:scale-105 ${
                value === preset ? 'border-primary scale-105 shadow-sm' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <img src={preset} alt={`preset-${index}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarUploader;
