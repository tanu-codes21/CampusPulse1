'use client';

import React from 'react';
import {
  LayoutDashboard,
  Megaphone,
  CalendarCheck,
  Sparkles,
  FolderLock,
  Users,
  Settings,
  X,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export type NavTab = 
  | 'dashboard'
  | 'notices'
  | 'planner'
  | 'ai'
  | 'vault'
  | 'community'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
}) => {
  const { t } = useLanguage();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; accent: string; accentColor: string }[] = [
    {
      id: 'dashboard',
      label: t('dashboard'),
      icon: <LayoutDashboard className="w-5 h-5" />,
      accent: 'border-l-4 border-neo-primary dark:border-white',
      accentColor: 'text-neo-primary dark:text-white',
    },
    {
      id: 'notices',
      label: t('smartNoticeCentre'),
      icon: <Megaphone className="w-5 h-5" />,
      accent: 'border-l-4 border-accent-cyan shadow-[inset_4px_0_0_#06B6D4]',
      accentColor: 'text-accent-cyan',
    },
    {
      id: 'planner',
      label: t('academicPlanner'),
      icon: <CalendarCheck className="w-5 h-5" />,
      accent: 'border-l-4 border-accent-blue shadow-[inset_4px_0_0_#3B82F6]',
      accentColor: 'text-accent-blue',
    },
    {
      id: 'ai',
      label: t('campusAiAssistant'),
      icon: <Sparkles className="w-5 h-5" />,
      accent: 'border-l-4 border-accent-magenta shadow-[inset_4px_0_0_#D946EF]',
      accentColor: 'text-accent-magenta',
    },
    {
      id: 'vault',
      label: t('documentVault'),
      icon: <FolderLock className="w-5 h-5" />,
      accent: 'border-l-4 border-accent-purple shadow-[inset_4px_0_0_#8B5CF6]',
      accentColor: 'text-accent-purple',
    },
    {
      id: 'community',
      label: t('campusCommunity'),
      icon: <Users className="w-5 h-5" />,
      accent: 'border-l-4 border-accent-orange shadow-[inset_4px_0_0_#F97316]',
      accentColor: 'text-accent-orange',
    },
    {
      id: 'settings',
      label: t('settings'),
      icon: <Settings className="w-5 h-5" />,
      accent: 'border-l-4 border-slate-500 shadow-[inset_4px_0_0_#64748B]',
      accentColor: 'text-slate-600 dark:text-slate-300',
    },
  ];

  const handleSelect = (id: NavTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-neo-bg dark:bg-neo-darkBg text-neo-primary dark:text-neo-darkPrimary select-none">
      {/* Brand & Logo Header */}
      <div className="p-6 pb-4 flex items-center justify-between border-b border-neo-border/60 dark:border-neo-darkBorder/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neo-card dark:bg-neo-darkCard flex items-center justify-center shadow-neo-raised-sm dark:shadow-neo-dark-raised-sm text-accent-cyan border border-neo-border dark:border-neo-darkBorder">
            <Zap className="w-5 h-5 fill-accent-cyan text-accent-cyan" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-neo-primary dark:text-white leading-tight">
              Campus<span className="text-accent-cyan">Pulse</span>
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-neo-secondary dark:text-neo-darkSecondary">
              Student Platform
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-neo-secondary hover:text-neo-primary hover:bg-black/5"
          aria-label="Close Navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Strict Left Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-neo-secondary/70 dark:text-neo-darkSecondary/70">
          Main Features
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150 text-left ${
                isActive
                  ? `bg-neo-card dark:bg-neo-darkCard shadow-neo-raised dark:shadow-neo-dark-raised ${item.accentColor} ${item.accent}`
                  : 'text-neo-primary/80 dark:text-neo-darkPrimary/80 hover:bg-neo-card/60 dark:hover:bg-neo-darkCard/50 hover:text-neo-primary'
              }`}
            >
              <span className={isActive ? item.accentColor : 'text-neo-secondary dark:text-neo-darkSecondary'}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tagline Footer in Sidebar */}
      <div className="p-4 m-3 rounded-2xl bg-neo-card/60 dark:bg-neo-darkCard/60 border border-neo-border/50 dark:border-neo-darkBorder/50 shadow-neo-raised-sm dark:shadow-neo-dark-raised-sm">
        <p className="text-xs font-bold text-neo-primary dark:text-neo-darkPrimary leading-snug">
          &ldquo;Paste the clutter. Master your day.&rdquo;
        </p>
        <p className="text-[10px] text-neo-secondary dark:text-neo-darkSecondary mt-1">
          Minimalist • Fast • Offline-Ready
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:block w-72 h-screen fixed left-0 top-0 border-r border-neo-border/80 dark:border-neo-darkBorder/80 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Collapsible Left Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-80 bg-neo-bg dark:bg-neo-darkBg z-50 transform transition-transform duration-300 ease-in-out lg:hidden border-r border-neo-border shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

