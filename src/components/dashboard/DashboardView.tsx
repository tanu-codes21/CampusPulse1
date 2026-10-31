'use client';

import React from 'react';
import {
  Megaphone,
  CheckCircle2,
  Calendar,
  Sparkles,
  Clock,
  ArrowRight,
  Plus,
  Bookmark,
  Share2,
  Languages,
  BookOpen,
  MapPin,
  Flame,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { NeoCard } from '../common/NeoCard';
import { NeoButton } from '../common/NeoButton';
import { PriorityBadge, Badge } from '../common/Badge';
import { NavTab } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenQuickNotice: () => void;
  onOpenQuickTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenQuickNotice,
  onOpenQuickTask,
}) => {
  const { user } = useAuth();
  const { notices, tasks, exams, clubs, toggleBookmark, bookmarkedNoticeIds, toggleTaskComplete } = useData();
  const { t, language } = useLanguage();

  // Metrics
  const totalNoticesCount = notices.length;
  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const pendingTasksCount = pendingTasks.length;
  const upcomingDeadlinesCount = pendingTasks.filter((t) => {
    const diff = new Date(t.dueDate).getTime() - Date.now();
    return diff > 0 && diff < 7 * 86400000;
  }).length;
  const upcomingEventsCount = clubs.reduce((acc, c) => acc + c.events.length, 0);

  // Today's / Urgent Priorities
  const todayPriorities = pendingTasks.filter(
    (t) => t.priority === 'urgent' || t.priority === 'high'
  ).slice(0, 4);

  // Recent Notices
  const recentNotices = notices.slice(0, 3);

  // Upcoming Schedule (Exams & Events combined)
  const upcomingItems = [
    ...exams.map((e) => ({
      id: e.id,
      title: `${e.subject} (${e.courseCode || 'Exam'})`,
      type: 'Exam',
      date: e.date,
      time: e.time,
      venue: e.venue,
      color: 'blue' as const,
    })),
    ...clubs.flatMap((c) =>
      c.events.map((ev) => ({
        id: ev.id,
        title: `${ev.title} - ${c.name}`,
        type: 'Club Event',
        date: ev.date,
        time: ev.time,
        venue: ev.venue,
        color: 'orange' as const,
      }))
    ),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 4);

  const handleShare = (title: string, desc: string) => {
    if (navigator.share) {
      navigator.share({ title, text: desc, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${title}\n${desc}`);
      alert('Notice details copied to clipboard!');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. BRANDING & PROMINENT TAGLINE BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neo-card via-neo-card to-cyan-50/40 dark:from-neo-darkCard dark:via-neo-darkCard dark:to-cyan-950/20 p-6 sm:p-8 border border-neo-border dark:border-neo-darkBorder shadow-neo-raised dark:shadow-neo-dark-raised">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              CampusPulse Platform
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neo-primary dark:text-white">
              Welcome back, {user?.fullName.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-base sm:text-lg font-bold text-accent-cyan tracking-tight">
              &ldquo;Paste the clutter. Master your day.&rdquo;
            </p>
            <p className="text-xs sm:text-sm text-neo-secondary dark:text-neo-darkSecondary max-w-2xl">
              Turn forwarded WhatsApp notices, class announcements, and chaotic campus messages into structured tasks, calendar alerts, and actionable study schedules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <NeoButton
              variant="accent-cyan"
              size="md"
              onClick={onOpenQuickNotice}
              className="shadow-lg"
            >
              <Megaphone className="w-4 h-4" />
              {t('pasteNotice')}
            </NeoButton>
            <NeoButton
              variant="secondary"
              size="md"
              onClick={() => onNavigateTab('ai')}
            >
              <Sparkles className="w-4 h-4 text-accent-magenta" />
              {t('askAi')}
            </NeoButton>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-accent-cyan/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-accent-magenta/10 blur-3xl pointer-events-none" />
      </div>

      {/* 2. STATS & METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Total Notices */}
        <NeoCard accent="cyan" hoverEffect className="cursor-pointer" onClick={() => onNavigateTab('notices')}>
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-accent-cyan border border-cyan-200/50">
              <Megaphone className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black text-neo-primary dark:text-white">
              {totalNoticesCount}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-neo-secondary dark:text-neo-darkSecondary uppercase tracking-wider">
              {t('totalNotices')}
            </p>
            <p className="text-[11px] text-accent-cyan mt-0.5 font-medium flex items-center gap-1">
              Active circulars & updates
              <ArrowRight className="w-3 h-3" />
            </p>
          </div>
        </NeoCard>

        {/* Metric 2: Pending Tasks */}
        <NeoCard accent="blue" hoverEffect className="cursor-pointer" onClick={() => onNavigateTab('planner')}>
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-accent-blue border border-blue-200/50">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black text-neo-primary dark:text-white">
              {pendingTasksCount}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-neo-secondary dark:text-neo-darkSecondary uppercase tracking-wider">
              {t('pendingTasks')}
            </p>
            <p className="text-[11px] text-accent-blue mt-0.5 font-medium flex items-center gap-1">
              In your academic planner
              <ArrowRight className="w-3 h-3" />
            </p>
          </div>
        </NeoCard>

        {/* Metric 3: Upcoming Deadlines */}
        <NeoCard accent="magenta" hoverEffect className="cursor-pointer" onClick={() => onNavigateTab('planner')}>
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-950/40 text-accent-magenta border border-fuchsia-200/50">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black text-neo-primary dark:text-white">
              {upcomingDeadlinesCount}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-neo-secondary dark:text-neo-darkSecondary uppercase tracking-wider">
              {t('upcomingDeadlines')}
            </p>
            <p className="text-[11px] text-accent-magenta mt-0.5 font-medium flex items-center gap-1">
              Due within 7 days
              <ArrowRight className="w-3 h-3" />
            </p>
          </div>
        </NeoCard>

        {/* Metric 4: Upcoming Events */}
        <NeoCard accent="orange" hoverEffect className="cursor-pointer" onClick={() => onNavigateTab('community')}>
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-accent-orange border border-orange-200/50">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black text-neo-primary dark:text-white">
              {upcomingEventsCount}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-neo-secondary dark:text-neo-darkSecondary uppercase tracking-wider">
              {t('upcomingEvents')}
            </p>
            <p className="text-[11px] text-accent-orange mt-0.5 font-medium flex items-center gap-1">
              Clubs & hackathons
              <ArrowRight className="w-3 h-3" />
            </p>
          </div>
        </NeoCard>
      </div>

      {/* 3. QUICK ACTIONS ROW */}
      <NeoCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neo-border/60 dark:border-neo-darkBorder/60">
          <div>
            <h2 className="text-base font-extrabold text-neo-primary dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-accent-cyan" />
              {t('quickActions')}
            </h2>
            <p className="text-xs text-neo-secondary dark:text-neo-darkSecondary">
              One-click actions to keep your academic workflow streamlined
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          <NeoButton
            variant="secondary"
            size="md"
            onClick={onOpenQuickNotice}
            className="w-full justify-start py-3"
          >
            <Megaphone className="w-4 h-4 text-accent-cyan" />
            <span>{t('pasteNotice')}</span>
          </NeoButton>

          <NeoButton
            variant="secondary"
            size="md"
            onClick={onOpenQuickTask}
            className="w-full justify-start py-3"
          >
            <Plus className="w-4 h-4 text-accent-blue" />
            <span>{t('addTask')}</span>
          </NeoButton>

          <NeoButton
            variant="secondary"
            size="md"
            onClick={() => onNavigateTab('ai')}
            className="w-full justify-start py-3"
          >
            <Sparkles className="w-4 h-4 text-accent-magenta" />
            <span>{t('askAi')}</span>
          </NeoButton>

          <NeoButton
            variant="secondary"
            size="md"
            onClick={() => onNavigateTab('vault')}
            className="w-full justify-start py-3"
          >
            <BookOpen className="w-4 h-4 text-accent-purple" />
            <span>{t('uploadDoc')}</span>
          </NeoButton>
        </div>
      </NeoCard>

      {/* 4. SPLIT SECTION: TODAY'S PRIORITIES & UPCOMING SCHEDULE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Priorities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neo-primary dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent-blue" />
              {t('todayPriorities')}
            </h2>
            <button
              onClick={() => onNavigateTab('planner')}
              className="text-xs font-bold text-accent-blue hover:underline flex items-center gap-1"
            >
              View Planner <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todayPriorities.length === 0 ? (
              <NeoCard variant="flat" className="text-center py-8">
                <p className="text-sm text-neo-secondary dark:text-neo-darkSecondary">
                  No urgent tasks pending for today! Enjoy your free time.
                </p>
              </NeoCard>
            ) : (
              todayPriorities.map((task) => (
                <NeoCard
                  key={task.id}
                  variant="flat"
                  className="p-4 transition-all hover:shadow-neo-raised-sm"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        task.isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-neo-border bg-neo-bg hover:border-accent-blue'
                      }`}
                    >
                      {task.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-bold text-neo-primary dark:text-white ${task.isCompleted ? 'line-through opacity-60' : ''}`}>
                          {task.title}
                        </p>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <p className="text-xs text-neo-secondary dark:text-neo-darkSecondary mt-1 line-clamp-1">
                        {task.description}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-neo-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-accent-blue" />
                          Due: {task.dueDate} {task.dueTime}
                        </span>
                        {task.subject && (
                          <span className="px-2 py-0.5 rounded bg-neo-bg dark:bg-neo-darkBg text-neo-secondary border border-neo-border">
                            {task.subject}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </NeoCard>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Schedule (Exams, Events) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neo-primary dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent-orange" />
              {t('upcomingSchedule')}
            </h2>
            <button
              onClick={() => onNavigateTab('planner')}
              className="text-xs font-bold text-accent-orange hover:underline flex items-center gap-1"
            >
              Full Calendar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingItems.length === 0 ? (
              <NeoCard variant="flat" className="text-center py-8">
                <p className="text-sm text-neo-secondary">No upcoming exams or events recorded.</p>
              </NeoCard>
            ) : (
              upcomingItems.map((item) => (
                <NeoCard
                  key={item.id}
                  variant="flat"
                  className="p-4 transition-all hover:shadow-neo-raised-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={item.color === 'blue' ? 'blue' : 'orange'}>
                          {item.type}
                        </Badge>
                        <span className="text-xs text-neo-secondary font-medium">
                          {item.date} • {item.time}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-neo-primary dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-xs text-neo-secondary flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-accent-cyan" />
                        {item.venue}
                      </p>
                    </div>
                  </div>
                </NeoCard>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. RECENTLY ADDED NOTICES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neo-primary dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-accent-cyan" />
              {t('recentlyAddedNotices')}
            </h2>
            <p className="text-xs text-neo-secondary">
              Latest structured announcements extracted and verified
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('notices')}
            className="text-xs font-bold text-accent-cyan hover:underline flex items-center gap-1"
          >
            All Notices ({notices.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentNotices.map((notice) => {
            const isBookmarked = bookmarkedNoticeIds.includes(notice.id);
            const displayTitle = language === 'hi' && notice.hindiTitle ? notice.hindiTitle : notice.title;
            const displayDesc = language === 'hi' && notice.hindiDescription ? notice.hindiDescription : notice.description;

            return (
              <NeoCard key={notice.id} accent="cyan" hoverEffect className="flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="cyan">{notice.category}</Badge>
                    <div className="flex items-center gap-1">
                      <PriorityBadge priority={notice.priority} />
                      <button
                        onClick={() => toggleBookmark(notice.id)}
                        className="p-1.5 rounded-lg text-neo-secondary hover:text-amber-500 transition-colors"
                        title="Bookmark Notice"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-neo-primary dark:text-white line-clamp-2 leading-snug">
                      {displayTitle}
                    </h3>
                    <p className="text-xs text-neo-secondary dark:text-neo-darkSecondary mt-1.5 line-clamp-3">
                      {displayDesc}
                    </p>
                  </div>

                  {notice.venue && (
                    <div className="text-[11px] text-neo-secondary flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-accent-cyan shrink-0" />
                      <span className="truncate">{notice.venue}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-neo-border/60 dark:border-neo-darkBorder/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-neo-secondary font-medium">
                    {notice.date || 'Notice'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShare(displayTitle, displayDesc)}
                      className="p-1.5 rounded-lg text-neo-secondary hover:text-accent-cyan"
                      title="Share"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onNavigateTab('notices')}
                      className="text-xs font-bold text-accent-cyan hover:underline flex items-center gap-0.5"
                    >
                      Details <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </NeoCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};

