'use client';

import React from 'react';

interface NeoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const NeoInput: React.FC<NeoInputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-neo-secondary dark:text-neo-darkSecondary"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-neo-secondary dark:text-neo-darkSecondary pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl bg-neo-bg dark:bg-neo-darkBg text-neo-primary dark:text-neo-darkPrimary placeholder:text-neo-secondary/50 dark:placeholder:text-neo-darkSecondary/50 border border-neo-border/80 dark:border-neo-darkBorder/80 shadow-neo-inset dark:shadow-neo-dark-inset px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent-cyan/60 ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-rose-400 focus:ring-rose-400' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-500 font-medium pl-1">{error}</p>}
    </div>
  );
};

interface NeoTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const NeoTextArea: React.FC<NeoTextAreaProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={areaId}
          className="block text-xs font-semibold uppercase tracking-wider text-neo-secondary dark:text-neo-darkSecondary"
        >
          {label}
        </label>
      )}
      <textarea
        id={areaId}
        className={`w-full rounded-xl bg-neo-bg dark:bg-neo-darkBg text-neo-primary dark:text-neo-darkPrimary placeholder:text-neo-secondary/50 dark:placeholder:text-neo-darkSecondary/50 border border-neo-border/80 dark:border-neo-darkBorder/80 shadow-neo-inset dark:shadow-neo-dark-inset px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent-cyan/60 resize-y min-h-[90px] ${
          error ? 'border-rose-400 focus:ring-rose-400' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 font-medium pl-1">{error}</p>}
    </div>
  );
};

