import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = '',
  rows = 4,
  ...props
}) => {
  const isTextArea = type === 'textarea';
  const baseInputStyles = 'w-full px-4 py-2 border rounded-lg shadow-xs transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm disabled:bg-slate-50 disabled:text-slate-400';
  const borderStyles = error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 hover:border-slate-300 focus:border-primary';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {isTextArea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={`${baseInputStyles} ${borderStyles} resize-none`}
          {...props}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`${baseInputStyles} ${borderStyles}`}
          {...props}
        />
      )}
      
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};

export default Input;
