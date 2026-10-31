'use client';

import React from 'react';

interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  accent?: 'cyan' | 'blue' | 'magenta' | 'purple' | 'orange' | 'none';
  variant?: 'raised' | 'flat' | 'inset';
  hoverEffect?: boolean;
}

export const NeoCard: React.FC<NeoCardProps> = ({
  children,
  accent = 'none',
  variant = 'raised',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const accentBorders = {
    none: 'border border-neo-border dark:border-neo-darkBorder',
    cyan: 'border border-accent-cyan/30 shadow-[0_0_15px_rgba(6,182,212,0.12)]',
    blue: 'border border-accent-blue/30 shadow-[0_0_15px_rgba(59,130,246,0.12)]',
    magenta: 'border border-accent-magenta/30 shadow-[0_0_15px_rgba(217,70,239,0.12)]',
    purple: 'border border-accent-purple/30 shadow-[0_0_15px_rgba(139,92,246,0.12)]',
    orange: 'border border-accent-orange/30 shadow-[0_0_15px_rgba(249,115,22,0.12)]',
  };

  const shadowVariants = {
    raised: 'shadow-neo-raised dark:shadow-neo-dark-raised',
    flat: 'shadow-neo-flat dark:shadow-neo-dark-flat',
    inset: 'shadow-neo-inset dark:shadow-neo-dark-inset',
  };

  const hoverClass = hoverEffect
    ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-neo-raised-lg dark:hover:shadow-neo-dark-raised'
    : '';

  return (
    <div
      className={`bg-neo-card dark:bg-neo-darkCard rounded-2xl p-5 text-neo-primary dark:text-neo-darkPrimary ${shadowVariants[variant]} ${accentBorders[accent]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

