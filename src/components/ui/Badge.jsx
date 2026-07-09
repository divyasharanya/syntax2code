import React from 'react';

const Badge = ({
  children,
  variant = 'slate',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';
  
  const variants = {
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    purple: 'bg-purple-50 text-purple-700 border border-purple-100',
    yellow: 'bg-amber-50 text-amber-800 border border-amber-100',
    red: 'bg-rose-50 text-rose-700 border border-rose-100',
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
