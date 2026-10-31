'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Megaphone,
  CheckCircle2,
  Calendar,
  BookOpen,
  FolderLock,
  Users,
  ShoppingBag,
  Clock,
  History,
  ArrowRight,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { NavTab } from '../layout/Sidebar';
import { Badge } from '../common/Badge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { notices, tasks, exams, documents, clubs, exchangeListings } = useData();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('campuspulse_recent_searches') || '[]');
    setRecentSearches(saved);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle search
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const saveRecentSearch = (text: string) => {
    if (!text.trim()) return;
    const clean = text.trim();
    const updated = [clean, ...recentSearches.filter((s) => s !== clean)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem('campuspulse_recent_searches', JSON.stringify(updated));
  };

  const handleSelectResult = (tab: NavTab) => {
    saveRecentSearch(query);
    onNavigateTab(tab);
    onClose();
  };

  // Perform search across all entities
  const q = query.toLowerCase().trim();

  const matchedNotices = notices.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q) ||
      (n.venue && n.venue.toLowerCase().includes(q))
  );

  const matchedTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      (t.subject && t.subject.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      t.dueDate.includes(q)
  );

  const matchedExams = exams.filter(
    (e) =>
      e.subject.toLowerCase().includes(q) ||
      (e.courseCode && e.courseCode.toLowerCase().includes(q)) ||
      e.venue.toLowerCase().includes(q) ||
      e.date.includes(q)
  );

  const matchedDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(q) ||
      d.fileName.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.tags?.some((t) => t.toLowerCase().includes(q))
  );

  const matchedClubs = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.events.some((ev) => ev.title.toLowerCase().includes(q))
  );

  const matchedExchange = exchangeListings.filter(
    (ex) =>
      ex.title.toLowerCase().includes(q) ||
      ex.description.toLowerCase().includes(q) ||
      ex.category.toLowerCase().includes(q)
  );

  const totalResults =
    matchedNotices.length +
    matchedTasks.length +
    matchedExams.length +
    matchedDocs.length +
    matchedClubs.length +
    matchedExchange.length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 pb-8 overflow-y-auto">
      <div className="w-full max-w-3xl bg-neo-card dark:bg-neo-darkCard rounded-3xl border border-neo-border dark:border-neo-darkBorder shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-neo-border/80 flex items-center gap-3 bg-neo-bg/50 dark:bg-neo-darkBg/50">
          <Search className="w-5 h-5 text-accent-cyan shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search across all notices, dates, exams, tasks, clubs, documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-neo-primary dark:text-white placeholder:text-neo-secondary text-sm sm:text-base outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-neo-secondary hover:text-neo-primary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-neo-secondary border border-neo-border"
          >
            Esc
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-5 py-2.5 bg-neo-card border-b border-neo-border/60 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-accent-cyan text-white shadow-sm'
                : 'text-neo-secondary hover:text-neo-primary'
            }`}
          >
            All Results ({query ? totalResults : 0})
          </button>
          <button
            onClick={() => setSelectedCategory('notices')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === 'notices'
                ? 'bg-accent-cyan text-white shadow-sm'
                : 'text-neo-secondary hover:text-neo-primary'
            }`}
          >
            Notices ({matchedNotices.length})
          </button>
          <button
            onClick={() => setSelectedCategory('tasks')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === 'tasks'
                ? 'bg-accent-blue text-white shadow-sm'
                : 'text-neo-secondary hover:text-neo-primary'
            }`}
          >
            Tasks ({matchedTasks.length})
          </button>
          <button
            onClick={() => setSelectedCategory('exams')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === 'exams'
                ? 'bg-accent-blue text-white shadow-sm'
                : 'text-neo-secondary hover:text-neo-primary'
            }`}
          >
            Exams ({matchedExams.length})
          </button>
          <button
            onClick={() => setSelectedCategory('documents')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === 'documents'
                ? 'bg-accent-purple text-white shadow-sm'
                : 'text-neo-secondary hover:text-neo-primary'
            }`}
          >
            Documents ({matchedDocs.length})
          </button>
          <button
            onClick={() => setSelectedCategory('community')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === 'community'
                ? 'bg-accent-orange text-white shadow-sm'
                : 'text-neo-secondary hover:text-neo-primary'
            }`}
          >
            Clubs & Exchange ({matchedClubs.length + matchedExchange.length})
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {!query.trim() ? (
            /* Recent Searches */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neo-secondary flex items-center gap-1.5">
                  <History className="w-4 h-4 text-accent-cyan" />
                  Recent Searches
                </span>
                {recentSearches.length > 0 && (
                  <button
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem('campuspulse_recent_searches');
                    }}
                    className="text-[11px] text-neo-secondary hover:underline"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {recentSearches.length === 0 ? (
                <p className="text-xs text-neo-secondary">
                  No recent searches. Try searching for &ldquo;End-Sem&rdquo;, &ldquo;Hackathon&rdquo;, or &ldquo;Syllabus&rdquo;.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(s)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neo-bg dark:bg-neo-darkBg text-xs font-semibold border border-neo-border text-neo-primary dark:text-white hover:border-accent-cyan"
                    >
                      <Clock className="w-3 h-3 text-neo-secondary" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-neo-secondary space-y-1">
              <Search className="w-8 h-8 mx-auto text-neo-secondary/40 mb-2" />
              <p className="text-sm font-bold text-neo-primary dark:text-white">
                No matching results found
              </p>
              <p className="text-xs">Try searching with broader terms or keywords.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Category: Notices */}
              {(selectedCategory === 'all' || selectedCategory === 'notices') && matchedNotices.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-accent-cyan">
                    <span className="flex items-center gap-1.5">
                      <Megaphone className="w-3.5 h-3.5" /> Campus Notices ({matchedNotices.length})
                    </span>
                    <button onClick={() => handleSelectResult('notices')} className="hover:underline">
                      View all in Notice Centre →
                    </button>
                  </div>
                  {matchedNotices.slice(0, 3).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleSelectResult('notices')}
                      className="p-3.5 rounded-2xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border hover:border-accent-cyan/60 cursor-pointer transition-all shadow-neo-raised-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-neo-primary dark:text-white truncate">
                          {n.title}
                        </h4>
                        <Badge variant="cyan">{n.category}</Badge>
                      </div>
                      <p className="text-xs text-neo-secondary line-clamp-1 mt-1">{n.description}</p>
                      <div className="mt-2 text-[11px] text-neo-secondary flex items-center gap-3">
                        {n.date && <span>📅 Date: {n.date}</span>}
                        {n.venue && <span>📍 {n.venue}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Category: Tasks */}
              {(selectedCategory === 'all' || selectedCategory === 'tasks') && matchedTasks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-accent-blue">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Academic Tasks ({matchedTasks.length})
                    </span>
                    <button onClick={() => handleSelectResult('planner')} className="hover:underline">
                      View in Planner →
                    </button>
                  </div>
                  {matchedTasks.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleSelectResult('planner')}
                      className="p-3.5 rounded-2xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border hover:border-accent-blue/60 cursor-pointer transition-all shadow-neo-raised-sm flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-neo-primary dark:text-white">{t.title}</h4>
                        <p className="text-xs text-neo-secondary mt-0.5">Due: {t.dueDate} {t.dueTime}</p>
                      </div>
                      <Badge variant="blue">{t.priority.toUpperCase()}</Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Category: Exams */}
              {(selectedCategory === 'all' || selectedCategory === 'exams') && matchedExams.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-accent-blue">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Exam Schedule ({matchedExams.length})
                    </span>
                    <button onClick={() => handleSelectResult('planner')} className="hover:underline">
                      View in Planner →
                    </button>
                  </div>
                  {matchedExams.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      onClick={() => handleSelectResult('planner')}
                      className="p-3.5 rounded-2xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border hover:border-accent-blue/60 cursor-pointer transition-all shadow-neo-raised-sm"
                    >
                      <h4 className="font-bold text-sm text-neo-primary dark:text-white">
                        {e.subject} ({e.courseCode || 'Exam'})
                      </h4>
                      <p className="text-xs text-neo-secondary mt-0.5">
                        {e.date} • {e.time} • {e.venue}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Category: Documents */}
              {(selectedCategory === 'all' || selectedCategory === 'documents') && matchedDocs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-accent-purple">
                    <span className="flex items-center gap-1.5">
                      <FolderLock className="w-3.5 h-3.5" /> Document Vault ({matchedDocs.length})
                    </span>
                    <button onClick={() => handleSelectResult('vault')} className="hover:underline">
                      Open Vault →
                    </button>
                  </div>
                  {matchedDocs.slice(0, 3).map((d) => (
                    <div
                      key={d.id}
                      onClick={() => handleSelectResult('vault')}
                      className="p-3.5 rounded-2xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border hover:border-accent-purple/60 cursor-pointer transition-all shadow-neo-raised-sm flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-neo-primary dark:text-white">{d.title}</h4>
                        <p className="text-[11px] text-neo-secondary font-mono">{d.fileName}</p>
                      </div>
                      <Badge variant="purple">{d.category}</Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Category: Community */}
              {(selectedCategory === 'all' || selectedCategory === 'community') && (matchedClubs.length > 0 || matchedExchange.length > 0) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-accent-orange">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Campus Community ({matchedClubs.length + matchedExchange.length})
                    </span>
                    <button onClick={() => handleSelectResult('community')} className="hover:underline">
                      Go to Community →
                    </button>
                  </div>
                  {matchedClubs.slice(0, 2).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectResult('community')}
                      className="p-3.5 rounded-2xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border hover:border-accent-orange/60 cursor-pointer transition-all shadow-neo-raised-sm"
                    >
                      <h4 className="font-bold text-sm text-neo-primary dark:text-white">{c.name}</h4>
                      <p className="text-xs text-neo-secondary line-clamp-1 mt-0.5">{c.description}</p>
                    </div>
                  ))}
                  {matchedExchange.slice(0, 2).map((ex) => (
                    <div
                      key={ex.id}
                      onClick={() => handleSelectResult('community')}
                      className="p-3.5 rounded-2xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border hover:border-accent-orange/60 cursor-pointer transition-all shadow-neo-raised-sm flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-neo-primary dark:text-white">{ex.title}</h4>
                        <p className="text-xs text-accent-orange font-bold">
                          {ex.isFree ? 'FREE' : `₹${ex.price}`}
                        </p>
                      </div>
                      <Badge variant="orange">{ex.category}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

