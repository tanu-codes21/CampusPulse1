'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  LogOut,
  User,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { NavTab } from './Sidebar';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenSearch,
  onNavigateTab,
  onOpenAuth,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, markNotificationRead, clearNotifications } = useData();
  const { t } = useLanguage();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="h-20 bg-neo-bg/90 dark:bg-neo-darkBg/90 backdrop-blur-md border-b border-neo-border/80 dark:border-neo-darkBorder/80 sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Mobile Drawer Trigger */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2.5 rounded-xl bg-neo-card dark:bg-neo-darkCard border border-neo-border dark:border-neo-darkBorder shadow-neo-raised-sm dark:shadow-neo-dark-raised-sm text-neo-primary dark:text-neo-darkPrimary"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-extrabold text-base tracking-tight text-neo-primary dark:text-white">
          Campus<span className="text-accent-cyan">Pulse</span>
        </span>
      </div>

      {/* Global Search Bar in Header */}
      <div className="flex-1 max-w-xl mx-auto hidden sm:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border/80 dark:border-neo-darkBorder/80 shadow-neo-inset dark:shadow-neo-dark-inset text-neo-secondary dark:text-neo-darkSecondary text-sm hover:border-accent-cyan/50 transition-all text-left group"
        >
          <Search className="w-4 h-4 text-neo-secondary group-hover:text-accent-cyan transition-colors" />
          <span className="truncate flex-1">{t('searchPlaceholder')}</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono bg-neo-card dark:bg-neo-darkCard rounded border border-neo-border dark:border-neo-darkBorder text-neo-secondary">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Mobile Search Icon */}
      <div className="sm:hidden">
        <button
          onClick={onOpenSearch}
          className="p-2.5 rounded-xl bg-neo-card dark:bg-neo-darkCard border border-neo-border shadow-neo-raised-sm text-neo-primary"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Top Right: Notifications & Profile Picture Account Menu */}
      <div className="flex items-center gap-3">
        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2.5 rounded-xl bg-neo-card dark:bg-neo-darkCard border border-neo-border dark:border-neo-darkBorder shadow-neo-raised-sm dark:shadow-neo-dark-raised-sm text-neo-primary dark:text-neo-darkPrimary relative hover:shadow-neo-raised transition-all"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-neo-card dark:bg-neo-darkCard border border-neo-border dark:border-neo-darkBorder shadow-neo-raised-lg dark:shadow-neo-dark-raised p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-neo-border/60 dark:border-neo-darkBorder/60">
                <h3 className="font-bold text-sm text-neo-primary dark:text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-accent-cyan" />
                  Notifications
                </h3>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-neo-secondary hover:text-neo-primary font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto py-2 space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-neo-secondary">
                    No new alerts or reminders right now.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.link === 'notices') onNavigateTab('notices');
                        else if (n.link === 'planner') onNavigateTab('planner');
                        setShowNotifMenu(false);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        n.isRead
                          ? 'bg-neo-bg/40 dark:bg-neo-darkBg/40 border-transparent opacity-75'
                          : 'bg-neo-bg dark:bg-neo-darkBg border-accent-cyan/30 shadow-neo-raised-sm'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.type === 'exam' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                        {n.type === 'deadline' && <Calendar className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                        {n.type === 'task' && <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                        {n.type === 'notice' && <Sparkles className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-neo-primary dark:text-white truncate">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-neo-secondary dark:text-neo-darkSecondary mt-0.5 leading-snug line-clamp-2">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-neo-secondary/60 mt-1 block">
                            {n.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Picture and Account Menu at Top Right */}
        <div className="relative" ref={profileRef}>
          {isAuthenticated && user ? (
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-neo-card dark:bg-neo-darkCard border border-neo-border dark:border-neo-darkBorder shadow-neo-raised-sm dark:shadow-neo-dark-raised-sm hover:shadow-neo-raised transition-all"
              aria-label="Account Menu"
            >
              {/* Profile Avatar */}
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover border border-neo-border"
              />
              <span className="hidden md:inline-block text-xs font-bold text-neo-primary dark:text-white max-w-[120px] truncate">
                {user.fullName}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-neo-primary text-white text-xs font-bold shadow-md hover:opacity-90"
            >
              Sign In with OTP
            </button>
          )}

          {/* Account Dropdown Menu */}
          {showProfileMenu && user && (
            <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-neo-card dark:bg-neo-darkCard border border-neo-border dark:border-neo-darkBorder shadow-neo-raised-lg dark:shadow-neo-dark-raised p-4 z-50">
              <div className="pb-3 border-b border-neo-border/60 dark:border-neo-darkBorder/60">
                <p className="font-extrabold text-sm text-neo-primary dark:text-white truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-accent-cyan font-semibold">@{user.username}</p>
                <p className="text-[11px] text-neo-secondary truncate mt-0.5">{user.email}</p>
                <div className="mt-2 text-[10px] bg-neo-bg dark:bg-neo-darkBg p-1.5 rounded-lg border border-neo-border/60 text-neo-secondary">
                  {user.branch} • {user.semester}
                </div>
              </div>

              <div className="pt-2 space-y-1">
                <button
                  onClick={() => {
                    onNavigateTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neo-primary dark:text-white hover:bg-neo-bg dark:hover:bg-neo-darkBg transition-all text-left"
                >
                  <User className="w-4 h-4 text-accent-cyan" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    onNavigateTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neo-primary dark:text-white hover:bg-neo-bg dark:hover:bg-neo-darkBg transition-all text-left"
                >
                  <SettingsIcon className="w-4 h-4 text-neo-secondary" />
                  Settings & Preferences
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

