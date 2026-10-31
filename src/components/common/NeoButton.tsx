'use client';

import React from 'react';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent-cyan' | 'accent-blue' | 'accent-magenta' | 'accent-purple' | 'accent-orange' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isPressed?: boolean;
}

export const NeoButton: React.FC<NeoButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isPressed = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg',
    md: 'px-4 py-2 text-sm font-semibold rounded-xl',
    lg: 'px-6 py-3 text-base font-semibold rounded-2xl',
  };

  const variantStyles = {
    secondary: `
      bg-neo-card dark:bg-neo-darkCard text-neo-primary dark:text-neo-darkPrimary
      border border-neo-border dark:border-neo-darkBorder
      shadow-neo-raised-sm dark:shadow-neo-dark-raised-sm
      hover:shadow-neo-raised dark:hover:shadow-neo-dark-raised
      active:shadow-neo-inset dark:active:shadow-neo-dark-inset
    `,
    primary: `
      bg-neo-primary dark:bg-accent-cyan text-white dark:text-neo-primary
      border border-neo-primary/20
      shadow-md hover:opacity-95 active:scale-[0.98]
    `,
    'accent-cyan': `
      bg-accent-cyan text-white
      border border-cyan-400/30
      shadow-[0_4px_12px_rgba(6,182,212,0.3)] hover:brightness-105 active:scale-[0.98]
    `,
    'accent-blue': `
      bg-accent-blue text-white
      border border-blue-400/30
      shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:brightness-105 active:scale-[0.98]
    `,
    'accent-magenta': `
      bg-accent-magenta text-white
      border border-pink-400/30
      shadow-[0_4px_12px_rgba(217,70,239,0.3)] hover:brightness-105 active:scale-[0.98]
    `,
    'accent-purple': `
      bg-accent-purple text-white
      border border-purple-400/30
      shadow-[0_4px_12px_rgba(139,92,246,0.3)] hover:brightness-105 active:scale-[0.98]
    `,
    'accent-orange': `
      bg-accent-orange text-white
      border border-orange-400/30
      shadow-[0_4px_12px_rgba(249,115,22,0.3)] hover:brightness-105 active:scale-[0.98]
    `,
    danger: `
      bg-rose-500 text-white
      border border-rose-600/30
      shadow-[0_4px_12px_rgba(244,63,94,0.3)] hover:brightness-105 active:scale-[0.98]
    `,
  };

  const pressedClass = isPressed
    ? 'shadow-neo-inset dark:shadow-neo-dark-inset translate-y-0.5'
    : '';

  const disabledClass = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer transition-all duration-150';

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 select-none font-medium ${sizeClasses[size]} ${variantStyles[variant]} ${pressedClass} ${disabledClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

