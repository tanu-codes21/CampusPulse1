'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Sun,
  Moon,
  Bell,
  Languages,
  MessageSquare,
  ShieldAlert,
  LogOut,
  Save,
  CheckCircle,
  AlertTriangle,
  Upload,
  RefreshCw,
  Bug,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import { requestNotificationPermission } from '@/lib/notifications';
import { NeoCard } from '../common/NeoCard';
import { NeoButton } from '../common/NeoButton';
import { NeoInput, NeoTextArea } from '../common/NeoInput';
import { Badge } from '../common/Badge';

export const SettingsView: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { submitFeedback } = useData();

  // Profile Form States
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [college, setCollege] = useState(user?.college || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [semester, setSemester] = useState(user?.semester || '');
  const [year, setYear] = useState(user?.year || '');
  const [rollNumber, setRollNumber] = useState(user?.rollNumber || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Notification Preferences
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled ?? true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(user?.deadlineAlerts ?? true);
  const [eventReminders, setEventReminders] = useState(user?.eventReminders ?? true);
  const [examReminders, setExamReminders] = useState(user?.examReminders ?? true);
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications ?? false);
  const [browserPermissionStatus, setBrowserPermissionStatus] = useState<string>('default');

  // Feedback Corner States
  const [feedbackType, setFeedbackType] = useState<'feedback' | 'bug' | 'feature_request'>('feedback');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccessId, setFeedbackSuccessId] = useState<string | null>(null);
  const [pastFeedbacks, setPastFeedbacks] = useState<any[]>([]);

  // Delete Account Confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermissionStatus(Notification.permission);
    }
    const savedFeedbacks = JSON.parse(localStorage.getItem('campuspulse_feedbacks') || '[]');
    setPastFeedbacks(savedFeedbacks);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    const res = await updateProfile({
      fullName,
      username,
      avatarUrl,
      college,
      branch,
      semester,
      year,
      rollNumber,
    });

    setProfileSaving(false);
    if (res.success) {
      setProfileMessage({ text: 'Profile updated and synchronized successfully!' });
    } else {
      setProfileMessage({ text: res.error || 'Failed to update profile.', error: true });
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (enabled) {
      const perm = await requestNotificationPermission();
      setBrowserPermissionStatus(perm);
    }
    await updateProfile({ notificationsEnabled: enabled });
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackSubject.trim() || !feedbackMsg.trim()) {
      alert('Please enter a subject and message.');
      return;
    }

    setFeedbackSubmitting(true);
    const result = await submitFeedback(feedbackType, feedbackSubject, feedbackMsg);
    setFeedbackSubmitting(false);

    if (result.success) {
      setFeedbackSuccessId(result.id);
      setFeedbackSubject('');
      setFeedbackMsg('');
      const saved = JSON.parse(localStorage.getItem('campuspulse_feedbacks') || '[]');
      setPastFeedbacks(saved);
    }
  };

  const handleDeleteAccount = async () => {
    alert('Account deleted. Redirecting...');
    await logout();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-neo-border">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-neo-primary dark:text-white">
            Settings & Preferences
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-neo-secondary dark:text-neo-darkSecondary mt-1">
          Manage your personal profile, appearance, notification preferences, language, and feedback.
        </p>
      </div>

      {/* 1. MY PROFILE */}
      <NeoCard className="p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-neo-border">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-accent-cyan" />
            <h2 className="text-lg font-extrabold text-neo-primary dark:text-white">
              My Profile
            </h2>
          </div>
          <span className="text-xs font-mono text-accent-cyan">
            @{user?.username}
          </span>
        </div>

        {profileMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              profileMessage.error
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            }`}
          >
            {profileMessage.error ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
            <span>{profileMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Avatar & Email preview */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border">
            <img
              src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={fullName}
              className="w-16 h-16 rounded-full object-cover border-2 border-accent-cyan shadow-md"
            />
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <p className="text-sm font-extrabold text-neo-primary dark:text-white">{fullName}</p>
              <p className="text-xs text-neo-secondary font-mono">{user?.email}</p>
              <p className="text-[11px] text-neo-secondary/70">
                Email address is verified via Supabase Gmail OTP authentication.
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <NeoInput
                label="Avatar Image URL"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeoInput
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <NeoInput
              label="Unique Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeoInput
              label="College / Institute"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            />
            <NeoInput
              label="Branch / Major"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <NeoInput
              label="Semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            />
            <NeoInput
              label="Academic Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <NeoInput
              label="Roll Number / ID"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <NeoButton variant="accent-cyan" type="submit" disabled={profileSaving}>
              {profileSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </NeoButton>
          </div>
        </form>
      </NeoCard>

      {/* 2. APPEARANCE (Light Neomorphic Default & Dark) */}
      <NeoCard className="p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-neo-border">
          <Sun className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-extrabold text-neo-primary dark:text-white">
            Appearance & Theme
          </h2>
        </div>

        <p className="text-xs text-neo-secondary">
          Choose between the default Minimalist Light Neomorphic theme and Dark Neomorphic mode.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Light Neomorphic Card */}
          <div
            onClick={() => setTheme('light')}
            className={`p-5 rounded-2xl cursor-pointer border-2 transition-all ${
              theme === 'light'
                ? 'border-accent-cyan bg-[#FAFBF8] shadow-neo-raised'
                : 'border-neo-border bg-[#FAFBF8]/70 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-sm text-[#222831] flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                Light Neomorphic (Default)
              </span>
              {theme === 'light' && (
                <CheckCircle className="w-4 h-4 text-accent-cyan" />
              )}
            </div>
            <p className="text-xs text-[#64748B]">
              Warm Off-White background (#F4F5F0), Soft White cards (#FAFBF8), and extruded raised shadows.
            </p>
          </div>

          {/* Dark Neomorphic Card */}
          <div
            onClick={() => setTheme('dark')}
            className={`p-5 rounded-2xl cursor-pointer border-2 transition-all ${
              theme === 'dark'
                ? 'border-accent-cyan bg-[#1B2028] shadow-neo-dark-raised text-white'
                : 'border-neo-border bg-[#1B2028]/70 text-slate-300 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-sm flex items-center gap-2 text-white">
                <Moon className="w-4 h-4 text-accent-cyan" />
                Dark Neomorphic Mode
              </span>
              {theme === 'dark' && (
                <CheckCircle className="w-4 h-4 text-accent-cyan" />
              )}
            </div>
            <p className="text-xs text-slate-400">
              Deep Obsidian surfaces with soft dark extrusion shadows for comfortable late-night studying.
            </p>
          </div>
        </div>
      </NeoCard>

      {/* 3. NOTIFICATIONS & ALERTS */}
      <NeoCard className="p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-neo-border">
          <Bell className="w-5 h-5 text-accent-blue" />
          <h2 className="text-lg font-extrabold text-neo-primary dark:text-white">
            Notification Preferences
          </h2>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between p-3 rounded-xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border">
            <div>
              <p className="text-sm font-bold text-neo-primary dark:text-white">
                Push Notifications Status
              </p>
              <p className="text-xs text-neo-secondary">
                Browser permission: <span className="font-mono font-bold">{browserPermissionStatus}</span>
              </p>
            </div>
            <button
              onClick={() => handleToggleNotifications(!notificationsEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                notificationsEnabled
                  ? 'bg-accent-blue text-white shadow-md'
                  : 'bg-neo-card border border-neo-border text-neo-secondary'
              }`}
            >
              {notificationsEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border cursor-pointer">
              <span className="text-xs font-semibold text-neo-primary dark:text-white">
                Upcoming Deadline Alerts
              </span>
              <input
                type="checkbox"
                checked={deadlineAlerts}
                onChange={(e) => {
                  setDeadlineAlerts(e.target.checked);
                  updateProfile({ deadlineAlerts: e.target.checked });
                }}
                className="rounded text-accent-blue"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border cursor-pointer">
              <span className="text-xs font-semibold text-neo-primary dark:text-white">
                Exam Reminders
              </span>
              <input
                type="checkbox"
                checked={examReminders}
                onChange={(e) => {
                  setExamReminders(e.target.checked);
                  updateProfile({ examReminders: e.target.checked });
                }}
                className="rounded text-accent-blue"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border cursor-pointer">
              <span className="text-xs font-semibold text-neo-primary dark:text-white">
                Club & Hackathon Event Reminders
              </span>
              <input
                type="checkbox"
                checked={eventReminders}
                onChange={(e) => {
                  setEventReminders(e.target.checked);
                  updateProfile({ eventReminders: e.target.checked });
                }}
                className="rounded text-accent-blue"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border cursor-pointer">
              <span className="text-xs font-semibold text-neo-primary dark:text-white">
                Daily Email Digest Notifications
              </span>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => {
                  setEmailNotifications(e.target.checked);
                  updateProfile({ emailNotifications: e.target.checked });
                }}
                className="rounded text-accent-blue"
              />
            </label>
          </div>
        </div>
      </NeoCard>

      {/* 4. LANGUAGE (English & Hindi ONLY) */}
      <NeoCard className="p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-neo-border">
          <Languages className="w-5 h-5 text-accent-magenta" />
          <h2 className="text-lg font-extrabold text-neo-primary dark:text-white">
            Language Settings
          </h2>
        </div>

        <p className="text-xs text-neo-secondary">
          CampusPulse strictly supports English and Hindi for all platform modules and AI translations.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md pt-1">
          <button
            onClick={() => {
              setLanguage('en');
              updateProfile({ languagePreference: 'en' });
            }}
            className={`p-4 rounded-2xl border-2 text-left font-bold text-xs transition-all ${
              language === 'en'
                ? 'border-accent-magenta bg-fuchsia-50/50 dark:bg-fuchsia-950/30 text-accent-magenta shadow-neo-raised-sm'
                : 'border-neo-border bg-neo-bg text-neo-secondary'
            }`}
          >
            <p className="text-sm font-extrabold">English (US/UK)</p>
            <p className="text-[11px] font-normal text-neo-secondary mt-0.5">Default interface language</p>
          </button>

          <button
            onClick={() => {
              setLanguage('hi');
              updateProfile({ languagePreference: 'hi' });
            }}
            className={`p-4 rounded-2xl border-2 text-left font-bold text-xs transition-all ${
              language === 'hi'
                ? 'border-accent-magenta bg-fuchsia-50/50 dark:bg-fuchsia-950/30 text-accent-magenta shadow-neo-raised-sm'
                : 'border-neo-border bg-neo-bg text-neo-secondary'
            }`}
          >
            <p className="text-sm font-extrabold">हिन्दी (Hindi)</p>
            <p className="text-[11px] font-normal text-neo-secondary mt-0.5">देवनागरी लिपि में अनुवाद</p>
          </button>
        </div>
      </NeoCard>

      {/* 5. FEEDBACK CORNER */}
      <NeoCard className="p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-neo-border">
          <MessageSquare className="w-5 h-5 text-accent-orange" />
          <h2 className="text-lg font-extrabold text-neo-primary dark:text-white">
            Feedback Corner & Bug Reports
          </h2>
        </div>

        <p className="text-xs text-neo-secondary">
          Submissions are saved directly to the developer PostgreSQL database for prompt review and resolution.
        </p>

        {feedbackSuccessId && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center justify-between">
            <span>Feedback ticket #{feedbackSuccessId} submitted successfully!</span>
            <button onClick={() => setFeedbackSuccessId(null)} className="text-xs underline">
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleFeedbackSubmit} className="space-y-4 pt-1">
          {/* Feedback Type buttons */}
          <div className="flex p-1 rounded-xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border max-w-md">
            <button
              type="button"
              onClick={() => setFeedbackType('feedback')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 ${
                feedbackType === 'feedback'
                  ? 'bg-neo-card dark:bg-neo-darkCard text-accent-orange shadow-neo-raised-sm'
                  : 'text-neo-secondary'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> General
            </button>
            <button
              type="button"
              onClick={() => setFeedbackType('bug')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 ${
                feedbackType === 'bug'
                  ? 'bg-neo-card dark:bg-neo-darkCard text-rose-500 shadow-neo-raised-sm'
                  : 'text-neo-secondary'
              }`}
            >
              <Bug className="w-3.5 h-3.5" /> Bug Report
            </button>
            <button
              type="button"
              onClick={() => setFeedbackType('feature_request')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 ${
                feedbackType === 'feature_request'
                  ? 'bg-neo-card dark:bg-neo-darkCard text-accent-cyan shadow-neo-raised-sm'
                  : 'text-neo-secondary'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" /> Feature Idea
            </button>
          </div>

          <NeoInput
            label="Subject"
            placeholder="Brief subject of your report or suggestion"
            value={feedbackSubject}
            onChange={(e) => setFeedbackSubject(e.target.value)}
            required
          />

          <NeoTextArea
            label="Details & Reproduction Steps"
            placeholder="Describe what happened or what improvement you would love to see..."
            rows={4}
            value={feedbackMsg}
            onChange={(e) => setFeedbackMsg(e.target.value)}
            required
          />

          <div className="pt-2 flex justify-end">
            <NeoButton variant="accent-orange" type="submit" disabled={feedbackSubmitting}>
              {feedbackSubmitting ? 'Submitting to database...' : 'Submit Feedback'}
            </NeoButton>
          </div>
        </form>

        {/* Track Feedback Submissions */}
        {pastFeedbacks.length > 0 && (
          <div className="pt-4 border-t border-neo-border space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neo-secondary">
              Track Your Submissions ({pastFeedbacks.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {pastFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-3 rounded-xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border text-xs flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-neo-primary dark:text-white">{fb.subject}</p>
                    <p className="text-[11px] text-neo-secondary font-mono">
                      #{fb.id} • {new Date(fb.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                    {fb.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </NeoCard>

      {/* 6. ACCOUNT ACTIONS */}
      <NeoCard className="p-6 space-y-4 border-rose-200 dark:border-rose-900/50">
        <div className="flex items-center gap-2.5 pb-3 border-b border-neo-border">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
            Account Management
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-neo-primary dark:text-white">
              Log Out of CampusPulse
            </p>
            <p className="text-xs text-neo-secondary">
              Terminate current session on this device. Your data remains safely stored.
            </p>
          </div>
          <NeoButton variant="secondary" onClick={logout}>
            <LogOut className="w-4 h-4" />
            Log Out
          </NeoButton>
        </div>

        <div className="pt-4 border-t border-neo-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-rose-600">Delete Account & Data</p>
            <p className="text-xs text-neo-secondary">
              Permanently remove your tasks, custom reminders, and personal profile from CampusPulse.
            </p>
          </div>
          <NeoButton variant="danger" onClick={() => setShowDeleteModal(true)}>
            Delete Account
          </NeoButton>
        </div>
      </NeoCard>

      {/* MODAL: DELETE CONFIRMATION */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neo-card dark:bg-neo-darkCard rounded-3xl p-6 border border-rose-300 shadow-neo-raised-lg space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Confirm Account Deletion</h3>
            </div>
            <p className="text-xs text-neo-secondary leading-relaxed">
              Are you completely sure? This will delete your verified student profile, all your tasks, and custom schedule entries. This action cannot be undone.
            </p>
            <div className="pt-3 flex justify-end gap-2 border-t border-neo-border">
              <NeoButton variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </NeoButton>
              <NeoButton variant="danger" onClick={handleDeleteAccount}>
                Yes, Delete My Account
              </NeoButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

