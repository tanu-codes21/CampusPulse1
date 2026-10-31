'use client';

import React from 'react';
import { PriorityLevel } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'blue' | 'magenta' | 'purple' | 'orange' | 'neutral' | 'success' | 'danger';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
}) => {
  const variantStyles = {
    cyan: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    magenta: 'bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800',
    purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    danger: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeStyles[size]} ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  switch (priority) {
    case 'urgent':
      return <Badge variant="danger">Urgent</Badge>;
    case 'high':
      return <Badge variant="orange">High Priority</Badge>;
    case 'medium':
      return <Badge variant="cyan">Medium</Badge>;
    case 'low':
      return <Badge variant="neutral">Low</Badge>;
    default:
      return <Badge variant="neutral">{priority}</Badge>;
  }
};

