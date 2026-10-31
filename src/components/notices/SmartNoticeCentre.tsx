'use client';

import React, { useState } from 'react';
import {
  Megaphone,
  Upload,
  Sparkles,
  Search,
  Filter,
  Bookmark,
  Share2,
  Trash2,
  Edit3,
  CalendarCheck,
  AlertCircle,
  FileText,
  Clock,
  MapPin,
  Calendar,
  Languages,
  CheckCircle,
  History,
  X,
  Plus,
  RefreshCw,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { Notice, PriorityLevel, NoticeCategory } from '@/types';
import {
  extractNoticeFromText,
  extractNoticeFromImage,
  translateNoticeContent,
  summarizeNotice,
  detectDuplicateNotice,
} from '@/lib/gemini';
import { NeoCard } from '../common/NeoCard';
import { NeoButton } from '../common/NeoButton';
import { NeoInput, NeoTextArea } from '../common/NeoInput';
import { Badge, PriorityBadge } from '../common/Badge';

export const SmartNoticeCentre: React.FC = () => {
  const {
    notices,
    addNotice,
    updateNotice,
    deleteNotice,
    toggleBookmark,
    bookmarkedNoticeIds,
    createTaskFromNotice,
  } = useData();
  const { language } = useLanguage();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Smart Input & AI Scanner states
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'image'>('text');
  const [rawText, setRawText] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Extracted confirmation form
  const [extractedData, setExtractedData] = useState<{
    title: string;
    description: string;
    date: string;
    time: string;
    venue: string;
    category: NoticeCategory;
    registrationDeadline: string;
    importantInstructions: string[];
    priority: PriorityLevel;
    uncertainFields: string[];
  } | null>(null);

  // Details & History Modal
  const [activeNoticeDetail, setActiveNoticeDetail] = useState<Notice | null>(null);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [editChangeSummary, setEditChangeSummary] = useState('');

  // AI Summarizer & Translation local states
  const [noticeSummaries, setNoticeSummaries] = useState<Record<string, string>>({});
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  const categories: NoticeCategory[] = [
    'Academic',
    'Examination',
    'Events & Workshops',
    'Placement & Internships',
    'Clubs & Cultural',
    'Administration & Fees',
    'Scholarships',
    'General',
  ];

  // Handle File Upload (Image / Poster)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run AI Extraction
  const handleRunAiExtraction = async () => {
    setIsExtracting(true);
    setDuplicateWarning(null);

    try {
      let result;
      if (inputMode === 'text') {
        if (!rawText.trim()) {
          alert('Please paste a WhatsApp announcement or notice text.');
          setIsExtracting(false);
          return;
        }
        result = await extractNoticeFromText(rawText);
      } else {
        if (!selectedImageBase64) {
          alert('Please select or upload a poster image first.');
          setIsExtracting(false);
          return;
        }
        result = await extractNoticeFromImage(selectedImageBase64, 'image/jpeg');
      }

      // Check duplicates
      const dupCheck = detectDuplicateNotice(result.title, result.venue || undefined, notices);
      if (dupCheck.isDuplicate && dupCheck.matchedNotice) {
        setDuplicateWarning(`Potential duplicate detected: "${dupCheck.matchedNotice.title}" is already recorded.`);
      }

      setExtractedData({
        title: result.title || '',
        description: result.description || '',
        date: result.date || '',
        time: result.time || '',
        venue: result.venue || '',
        category: (result.category as NoticeCategory) || 'General',
        registrationDeadline: result.registrationDeadline || '',
        importantInstructions: result.importantInstructions || [],
        priority: (result.priority as PriorityLevel) || 'medium',
        uncertainFields: result.uncertainFields || [],
      });
    } catch (err) {
      console.error('Extraction error:', err);
      alert('Could not complete extraction. Please check connection or verify fields manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Confirm and Save Extracted Notice
  const handleSaveConfirmedNotice = async () => {
    if (!extractedData || !extractedData.title.trim()) {
      alert('Notice Title is required.');
      return;
    }

    await addNotice({
      title: extractedData.title,
      description: extractedData.description,
      date: extractedData.date || undefined,
      time: extractedData.time || undefined,
      venue: extractedData.venue || undefined,
      category: extractedData.category,
      registrationDeadline: extractedData.registrationDeadline || undefined,
      importantInstructions: extractedData.importantInstructions,
      priority: extractedData.priority,
      source: inputMode === 'text' ? 'whatsapp' : 'poster',
      imageUrl: selectedImageBase64 || undefined,
      rawText: rawText || undefined,
      uncertainFields: extractedData.uncertainFields,
    });

    // Reset and close
    setExtractedData(null);
    setRawText('');
    setSelectedImageBase64(null);
    setDuplicateWarning(null);
    setIsInputModalOpen(false);
  };

  // Translation Toggle
  const handleTranslateNotice = async (notice: Notice) => {
    setTranslatingId(notice.id);
    const targetLang = language === 'hi' ? 'en' : 'hi';
    const translated = await translateNoticeContent(
      notice.title,
      notice.description,
      notice.importantInstructions || [],
      targetLang
    );

    if (targetLang === 'hi') {
      await updateNotice(notice.id, {
        hindiTitle: translated.title,
        hindiDescription: translated.description,
        hindiInstructions: translated.instructions,
      }, 'Added Hindi Translation');
    }
    setTranslatingId(null);
  };

  // AI Summarizer
  const handleSummarize = async (notice: Notice) => {
    setSummarizingId(notice.id);
    const summary = await summarizeNotice(notice.title, notice.description);
    setNoticeSummaries((prev) => ({ ...prev, [notice.id]: summary }));
    setSummarizingId(null);
  };

  // Sharing
  const handleShare = (notice: Notice) => {
    const text = `📢 *${notice.title}*\n\n${notice.description}\n\n📅 Date: ${notice.date || 'TBA'} | ⏰ Time: ${notice.time || 'TBA'}\n📍 Venue: ${notice.venue || 'TBA'}\n\nShared via CampusPulse`;
    if (navigator.share) {
      navigator.share({ title: notice.title, text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Notice copied to clipboard with WhatsApp format!');
    }
  };

  // Filtering
  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.venue && n.venue.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All' || n.priority === selectedPriority;
    const matchesBookmark = !showBookmarksOnly || bookmarkedNoticeIds.includes(n.id);

    return matchesSearch && matchesCategory && matchesPriority && matchesBookmark;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Main Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-accent-cyan border border-cyan-200/50">
              <Megaphone className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-neo-primary dark:text-white">
              Smart Notice Centre
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neo-secondary dark:text-neo-darkSecondary mt-1">
            Scan campus posters, paste cluttered WhatsApp circulars, and organize official announcements with AI extraction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NeoButton
            variant="accent-cyan"
            size="md"
            onClick={() => {
              setIsInputModalOpen(true);
              setExtractedData(null);
            }}
          >
            <Plus className="w-4 h-4" />
            Smart Notice Input
          </NeoButton>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <NeoCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2">
            <NeoInput
              placeholder="Search notices by title, keywords or venue..."
              icon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl bg-neo-bg dark:bg-neo-darkBg text-neo-primary dark:text-neo-darkPrimary border border-neo-border/80 dark:border-neo-darkBorder/80 shadow-neo-inset dark:shadow-neo-dark-inset px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent-cyan/60"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Priority & Bookmarks */}
          <div className="flex items-center gap-2">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="flex-1 rounded-xl bg-neo-bg dark:bg-neo-darkBg text-neo-primary dark:text-neo-darkPrimary border border-neo-border/80 dark:border-neo-darkBorder/80 shadow-neo-inset dark:shadow-neo-dark-inset px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent-cyan/60"
            >
              <option value="All">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`p-2.5 rounded-xl border transition-all ${
                showBookmarksOnly
                  ? 'bg-amber-500 border-amber-500 text-white shadow-md'
                  : 'bg-neo-card dark:bg-neo-darkCard border-neo-border text-neo-secondary hover:text-amber-500 shadow-neo-raised-sm'
              }`}
              title="Show Bookmarked Only"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </NeoCard>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotices.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <Megaphone className="w-12 h-12 text-neo-secondary/40 mx-auto mb-3" />
            <p className="text-base font-bold text-neo-primary dark:text-white">
              No notices match your filters
            </p>
            <p className="text-xs text-neo-secondary mt-1">
              Try adjusting your search terms or paste a new circular.
            </p>
          </div>
        ) : (
          filteredNotices.map((notice) => {
            const isBookmarked = bookmarkedNoticeIds.includes(notice.id);
            const isHindi = language === 'hi' && notice.hindiTitle;
            const displayTitle = isHindi ? notice.hindiTitle : notice.title;
            const displayDesc = isHindi ? notice.hindiDescription : notice.description;
            const summary = noticeSummaries[notice.id];

            return (
              <NeoCard
                key={notice.id}
                accent="cyan"
                hoverEffect
                className="flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Category & Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="cyan">{notice.category}</Badge>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={notice.priority} />
                      <button
                        onClick={() => toggleBookmark(notice.id)}
                        className="p-1 rounded-lg text-neo-secondary hover:text-amber-500"
                        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Notice'}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-extrabold text-base text-neo-primary dark:text-white leading-tight">
                      {displayTitle}
                    </h3>
                    <p className="text-xs text-neo-secondary dark:text-neo-darkSecondary mt-2 line-clamp-3 leading-relaxed">
                      {displayDesc}
                    </p>
                  </div>

                  {/* AI Summary Banner if generated */}
                  {summary && (
                    <div className="p-2.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-xs text-neo-primary dark:text-white">
                      <p className="font-bold text-[10px] uppercase text-accent-cyan flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Summary
                      </p>
                      <p className="mt-1 leading-snug">{summary}</p>
                    </div>
                  )}

                  {/* Metadata Chips: Date, Time, Venue */}
                  <div className="pt-2 border-t border-neo-border/50 dark:border-neo-darkBorder/50 space-y-1.5 text-xs text-neo-secondary">
                    {notice.date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
                        <span>Date: {notice.date} {notice.time ? `• ${notice.time}` : ''}</span>
                      </div>
                    )}
                    {notice.venue && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
                        <span className="truncate">Venue: {notice.venue}</span>
                      </div>
                    )}
                    {notice.registrationDeadline && (
                      <div className="flex items-center gap-1.5 text-rose-500 font-medium">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Deadline: {new Date(notice.registrationDeadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-4 mt-4 border-t border-neo-border/60 dark:border-neo-darkBorder/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* AI Summarize */}
                    <button
                      onClick={() => handleSummarize(notice)}
                      disabled={summarizingId === notice.id}
                      className="p-1.5 rounded-lg text-neo-secondary hover:text-accent-magenta hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30"
                      title="Generate AI Summary"
                    >
                      <Sparkles className={`w-4 h-4 ${summarizingId === notice.id ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Translate toggle */}
                    <button
                      onClick={() => handleTranslateNotice(notice)}
                      disabled={translatingId === notice.id}
                      className="p-1.5 rounded-lg text-neo-secondary hover:text-accent-cyan hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
                      title="Translate (English / Hindi)"
                    >
                      <Languages className={`w-4 h-4 ${translatingId === notice.id ? 'animate-spin' : ''}`} />
                    </button>

                    {/* 1-Click Add to Planner */}
                    <button
                      onClick={async () => {
                        await createTaskFromNotice(notice);
                        alert(`Task created in Academic Planner for: "${notice.title}"`);
                      }}
                      className="p-1.5 rounded-lg text-neo-secondary hover:text-accent-blue hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      title="Add to Academic Planner"
                    >
                      <CalendarCheck className="w-4 h-4" />
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => handleShare(notice)}
                      className="p-1.5 rounded-lg text-neo-secondary hover:text-accent-cyan"
                      title="Share Notice"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveNoticeDetail(notice)}
                      className="text-xs font-bold text-accent-cyan hover:underline"
                    >
                      Details & History
                    </button>
                    <button
                      onClick={() => setEditingNotice(notice)}
                      className="p-1.5 rounded-lg text-neo-secondary hover:text-neo-primary"
                      title="Edit Notice"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this notice?')) {
                          deleteNotice(notice.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-neo-secondary hover:text-rose-500"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </NeoCard>
            );
          })
        )}
      </div>

      {/* MODAL 1: SMART NOTICE INPUT & AI SCANNER */}
      {isInputModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-neo-card dark:bg-neo-darkCard rounded-3xl p-6 border border-neo-border dark:border-neo-darkBorder shadow-neo-raised-lg my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neo-border/60 dark:border-neo-darkBorder/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-cyan" />
                <h2 className="text-lg font-extrabold text-neo-primary dark:text-white">
                  Smart Notice Input & Poster Scanner
                </h2>
              </div>
              <button
                onClick={() => setIsInputModalOpen(false)}
                className="p-1.5 rounded-lg text-neo-secondary hover:text-neo-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!extractedData ? (
              <div className="space-y-4 pt-4">
                {/* Mode Selector Tabs */}
                <div className="flex p-1 rounded-xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border/80 shadow-neo-inset">
                  <button
                    onClick={() => setInputMode('text')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      inputMode === 'text'
                        ? 'bg-neo-card dark:bg-neo-darkCard text-accent-cyan shadow-neo-raised-sm'
                        : 'text-neo-secondary'
                    }`}
                  >
                    Paste WhatsApp / Text Circular
                  </button>
                  <button
                    onClick={() => setInputMode('image')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      inputMode === 'image'
                        ? 'bg-neo-card dark:bg-neo-darkCard text-accent-cyan shadow-neo-raised-sm'
                        : 'text-neo-secondary'
                    }`}
                  >
                    Upload Poster / Flyer Image
                  </button>
                </div>

                {inputMode === 'text' ? (
                  <div>
                    <NeoTextArea
                      label="Paste Forwarded WhatsApp Message or Email Announcement"
                      placeholder="Paste text like: 'Dear students, Midterm Exam will be held on 15th Nov in Hall B-101. Carry admit cards...'"
                      rows={7}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-neo-border dark:border-neo-darkBorder rounded-2xl p-6 text-center bg-neo-bg/50 dark:bg-neo-darkBg/50">
                    {selectedImageBase64 ? (
                      <div className="space-y-3">
                        <img
                          src={selectedImageBase64}
                          alt="Poster Preview"
                          className="max-h-60 mx-auto rounded-xl object-contain shadow-md"
                        />
                        <button
                          onClick={() => setSelectedImageBase64(null)}
                          className="text-xs text-rose-500 font-bold hover:underline"
                        >
                          Remove and select another
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="w-10 h-10 text-accent-cyan mx-auto mb-2" />
                        <p className="text-sm font-bold text-neo-primary dark:text-white">
                          Click to upload campus poster or drag & drop
                        </p>
                        <p className="text-xs text-neo-secondary mt-1">
                          PNG, JPG, WebP supported. AI will scan text, date, venue, instructions.
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <NeoButton variant="secondary" onClick={() => setIsInputModalOpen(false)}>
                    Cancel
                  </NeoButton>
                  <NeoButton
                    variant="accent-cyan"
                    disabled={isExtracting}
                    onClick={handleRunAiExtraction}
                  >
                    {isExtracting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing with Gemini AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Extract Structured Notice
                      </>
                    )}
                  </NeoButton>
                </div>
              </div>
            ) : (
              /* CONFIRMATION & UNCERTAINTY VERIFICATION STEP */
              <div className="space-y-4 pt-4">
                {duplicateWarning && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{duplicateWarning}</span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-xs text-accent-cyan">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Please verify the extracted fields below.
                  </p>
                  <p className="text-[11px] text-neo-secondary mt-0.5">
                    Missing or ambiguous details have been highlighted for your confirmation.
                  </p>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  <NeoInput
                    label="Notice Title"
                    value={extractedData.title}
                    onChange={(e) => setExtractedData({ ...extractedData, title: e.target.value })}
                  />

                  <NeoTextArea
                    label="Notice Description"
                    rows={3}
                    value={extractedData.description}
                    onChange={(e) => setExtractedData({ ...extractedData, description: e.target.value })}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <NeoInput
                        type="date"
                        label={`Event Date ${extractedData.uncertainFields.includes('date') ? '(Uncertain - Verify)' : ''}`}
                        value={extractedData.date}
                        onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
                        error={extractedData.uncertainFields.includes('date') ? 'Please confirm date' : undefined}
                      />
                    </div>
                    <div>
                      <NeoInput
                        label={`Time ${extractedData.uncertainFields.includes('time') ? '(Uncertain)' : ''}`}
                        placeholder="e.g. 10:00 AM"
                        value={extractedData.time}
                        onChange={(e) => setExtractedData({ ...extractedData, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <NeoInput
                        label={`Venue ${extractedData.uncertainFields.includes('venue') ? '(Uncertain - Verify)' : ''}`}
                        placeholder="Auditorium / Hall / Online"
                        value={extractedData.venue}
                        onChange={(e) => setExtractedData({ ...extractedData, venue: e.target.value })}
                        error={extractedData.uncertainFields.includes('venue') ? 'Please confirm venue' : undefined}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neo-secondary mb-1.5">
                        Category
                      </label>
                      <select
                        value={extractedData.category}
                        onChange={(e) =>
                          setExtractedData({ ...extractedData, category: e.target.value as NoticeCategory })
                        }
                        className="w-full rounded-xl bg-neo-bg dark:bg-neo-darkBg text-neo-primary dark:text-neo-darkPrimary border border-neo-border px-3 py-2 text-xs font-semibold"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <NeoInput
                        type="date"
                        label="Registration Deadline (if any)"
                        value={extractedData.registrationDeadline}
                        onChange={(e) =>
                          setExtractedData({ ...extractedData, registrationDeadline: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neo-secondary mb-1.5">
                        Priority Classification
                      </label>
                      <select
                        value={extractedData.priority}
                        onChange={(e) =>
                          setExtractedData({ ...extractedData, priority: e.target.value as PriorityLevel })
                        }
                        className="w-full rounded-xl bg-neo-bg dark:bg-neo-darkBg text-neo-primary dark:text-neo-darkPrimary border border-neo-border px-3 py-2 text-xs font-semibold"
                      >
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center border-t border-neo-border/60">
                  <button
                    onClick={() => setExtractedData(null)}
                    className="text-xs text-neo-secondary hover:text-neo-primary font-bold"
                  >
                    ← Back to input
                  </button>
                  <div className="flex gap-2">
                    <NeoButton variant="secondary" onClick={() => setIsInputModalOpen(false)}>
                      Discard
                    </NeoButton>
                    <NeoButton variant="accent-cyan" onClick={handleSaveConfirmedNotice}>
                      Save Verified Notice
                    </NeoButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: NOTICE DETAILS & VERSION UPDATE HISTORY */}
      {activeNoticeDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-neo-card dark:bg-neo-darkCard rounded-3xl p-6 border border-neo-border dark:border-neo-darkBorder shadow-neo-raised-lg my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neo-border/60 dark:border-neo-darkBorder/60">
              <div className="flex items-center gap-2">
                <Badge variant="cyan">{activeNoticeDetail.category}</Badge>
                <PriorityBadge priority={activeNoticeDetail.priority} />
              </div>
              <button
                onClick={() => setActiveNoticeDetail(null)}
                className="p-1.5 rounded-lg text-neo-secondary hover:text-neo-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto pr-1">
              <h2 className="text-xl font-extrabold text-neo-primary dark:text-white">
                {activeNoticeDetail.title}
              </h2>

              <p className="text-sm text-neo-primary dark:text-neo-darkPrimary leading-relaxed">
                {activeNoticeDetail.description}
              </p>

              {/* Hindi version if exists */}
              {activeNoticeDetail.hindiTitle && (
                <div className="p-3 rounded-xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border text-xs space-y-1">
                  <p className="font-bold text-accent-cyan">[हिंदी संस्करण]</p>
                  <p className="font-semibold text-neo-primary dark:text-white">{activeNoticeDetail.hindiTitle}</p>
                  <p className="text-neo-secondary">{activeNoticeDetail.hindiDescription}</p>
                </div>
              )}

              {/* Important Instructions */}
              {activeNoticeDetail.importantInstructions && activeNoticeDetail.importantInstructions.length > 0 && (
                <div className="p-4 rounded-2xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent-cyan flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Important Instructions
                  </h4>
                  <ul className="space-y-1 text-xs text-neo-primary dark:text-neo-darkPrimary list-disc pl-4">
                    {activeNoticeDetail.importantInstructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Version History Log */}
              <div className="pt-4 border-t border-neo-border/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neo-secondary flex items-center gap-1.5 mb-3">
                  <History className="w-4 h-4" /> Notice Update History
                </h4>
                {(!activeNoticeDetail.versionHistory || activeNoticeDetail.versionHistory.length === 0) ? (
                  <p className="text-xs text-neo-secondary">Original version (no edits logged yet).</p>
                ) : (
                  <div className="space-y-2">
                    {activeNoticeDetail.versionHistory.map((v, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border/60 text-xs"
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-accent-cyan">Version {v.version}</span>
                          <span className="text-neo-secondary">{new Date(v.updatedAt).toLocaleString()}</span>
                        </div>
                        <p className="text-neo-primary dark:text-white mt-1">{v.changesSummary}</p>
                        <p className="text-[10px] text-neo-secondary mt-0.5">Updated by: {v.updatedBy}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-neo-border/60 flex justify-end">
              <NeoButton variant="secondary" onClick={() => setActiveNoticeDetail(null)}>
                Close
              </NeoButton>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT NOTICE */}
      {editingNotice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-neo-card dark:bg-neo-darkCard rounded-3xl p-6 border border-neo-border shadow-neo-raised-lg">
            <h2 className="text-lg font-bold text-neo-primary dark:text-white pb-3 border-b border-neo-border">
              Edit Notice & Log Version
            </h2>
            <div className="space-y-3 pt-3">
              <NeoInput
                label="Title"
                value={editingNotice.title}
                onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })}
              />
              <NeoTextArea
                label="Description"
                rows={4}
                value={editingNotice.description}
                onChange={(e) => setEditingNotice({ ...editingNotice, description: e.target.value })}
              />
              <NeoInput
                label="Summary of changes (for version history)"
                placeholder="e.g. Updated exam hall number or postponed date"
                value={editChangeSummary}
                onChange={(e) => setEditChangeSummary(e.target.value)}
              />
            </div>
            <div className="pt-4 flex justify-end gap-2 border-t border-neo-border mt-4">
              <NeoButton variant="secondary" onClick={() => setEditingNotice(null)}>
                Cancel
              </NeoButton>
              <NeoButton
                variant="accent-cyan"
                onClick={async () => {
                  await updateNotice(
                    editingNotice.id,
                    { title: editingNotice.title, description: editingNotice.description },
                    editChangeSummary || 'Modified notice details'
                  );
                  setEditingNotice(null);
                  setEditChangeSummary('');
                }}
              >
                Save Changes
              </NeoButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

