'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Languages,
  Trash2,
  ShieldCheck,
  Bot,
  User as UserIcon,
  HelpCircle,
  Clock,
  BookOpen,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { queryCampusAi } from '@/lib/gemini';
import { NeoCard } from '../common/NeoCard';
import { NeoButton } from '../common/NeoButton';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const CampusAiAssistant: React.FC = () => {
  const { notices, tasks, exams, assignments, clubs } = useData();
  const { language, setLanguage } = useLanguage();

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: language === 'hi'
        ? 'नमस्ते! मैं आपका कैंपस पल्स एआई सहायक हूँ। मैं आपकी आधिकारिक सूचनाओं, परीक्षा कार्यक्रम और लंबित कार्यों के सत्यापित डेटा से उत्तर देता हूँ। आप मुझसे अपनी आगामी समय-सीमाओं, परीक्षाओं या क्लब आयोजनों के बारे में पूछ सकते हैं।'
        : 'Hello! I am your verified CampusPulse AI Assistant. I provide answers grounded strictly in your saved college notices, exam schedules, and pending assignments. How can I help you organize your academic day?',
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    {
      en: 'What deadlines do I have this week?',
      hi: 'इस सप्ताह मेरी क्या समय-सीमाएं (डेडलाइन्स) हैं?',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    {
      en: 'When is my next exam?',
      hi: 'मेरी अगली परीक्षा कब और कहाँ है?',
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
    {
      en: 'What events are happening tomorrow?',
      hi: 'कल कैंपस में कौन से कार्यक्रम हो रहे हैं?',
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    {
      en: 'Summarise my important notices.',
      hi: 'मेरी महत्वपूर्ण सूचनाओं का सारांश दें।',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      en: 'What tasks are still pending?',
      hi: 'मेरे कौन-कौन से कार्य अभी भी लंबित हैं?',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
  ];

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const allEvents = clubs.flatMap((c) => c.events);
      const answer = await queryCampusAi(
        text,
        { notices, tasks, exams, assignments, events: allEvents },
        language
      );

      const assistantMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error('Campus AI query error:', e);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: language === 'hi'
          ? 'क्षमा करें, प्रतिक्रिया उत्पन्न करने में समस्या आई। कृपया पुनः प्रयास करें।'
          : 'Sorry, I encountered an issue querying the campus database. Please try again.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'msg-reset',
        sender: 'assistant',
        text: language === 'hi'
          ? 'वार्तालाप साफ़ कर दिया गया है। आप मुझसे कोई भी नया प्रश्न पूछ सकते हैं।'
          : 'Conversation cleared. What would you like to check next in your academic schedule?',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/40 text-accent-magenta border border-fuchsia-200/50">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-neo-primary dark:text-white">
              Campus AI Assistant
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neo-secondary dark:text-neo-darkSecondary mt-1">
            Grounded strictly in your college notices, exams, and tasks. Ask questions in English or Hindi.
          </p>
        </div>

        {/* Language Selector (English / Hindi ONLY) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="p-1 rounded-xl bg-neo-card dark:bg-neo-darkCard border border-neo-border flex items-center shadow-neo-raised-sm">
            <Languages className="w-4 h-4 text-accent-magenta ml-2 mr-1" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-accent-magenta text-white shadow-sm'
                  : 'text-neo-secondary hover:text-neo-primary'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                language === 'hi'
                  ? 'bg-accent-magenta text-white shadow-sm'
                  : 'text-neo-secondary hover:text-neo-primary'
              }`}
            >
              हिंदी
            </button>
          </div>

          <button
            onClick={handleClear}
            className="p-2 rounded-xl bg-neo-card border border-neo-border text-neo-secondary hover:text-rose-500 shadow-neo-raised-sm"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chat Box */}
      <NeoCard accent="magenta" className="flex flex-col h-[600px] p-0 overflow-hidden">
        {/* Anti-Hallucination & Grounding Banner */}
        <div className="px-5 py-3 bg-neo-bg dark:bg-neo-darkBg border-b border-neo-border/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Strict Verification Mode Active</span>
          </div>
          <span className="text-[11px] text-neo-secondary hidden sm:inline">
            Knowledge source: {notices.length} Notices • {exams.length} Exams • {tasks.length} Tasks
          </span>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/50 text-accent-magenta border border-fuchsia-200/60 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-neo-primary text-white shadow-md'
                    : 'bg-neo-card dark:bg-neo-darkCard text-neo-primary dark:text-neo-darkPrimary border border-neo-border/80 shadow-neo-raised-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <span
                  className={`text-[10px] mt-1.5 block text-right ${
                    m.sender === 'user' ? 'text-slate-300' : 'text-neo-secondary'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-neo-card dark:bg-neo-darkCard text-neo-primary border border-neo-border flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-fuchsia-50 text-accent-magenta border border-fuchsia-200 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-neo-card border border-neo-border text-xs text-neo-secondary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-magenta animate-pulse" />
                <span>Scanning verified notices and deadlines...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-5 py-2.5 bg-neo-bg/60 dark:bg-neo-darkBg/60 border-t border-neo-border/60 overflow-x-auto flex items-center gap-2">
          <span className="text-[11px] font-bold text-neo-secondary uppercase tracking-wider shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-accent-magenta" />
            Quick Ask:
          </span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(language === 'hi' ? qp.hi : qp.en)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neo-card dark:bg-neo-darkCard text-neo-primary dark:text-white border border-neo-border shadow-neo-raised-sm hover:border-accent-magenta transition-all shrink-0"
            >
              {qp.icon}
              <span>{language === 'hi' ? qp.hi : qp.en}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-neo-card dark:bg-neo-darkCard border-t border-neo-border/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              placeholder={
                language === 'hi'
                  ? 'अपनी परीक्षाओं, समय-सीमाओं या नोटिस के बारे में यहाँ पूछें...'
                  : 'Ask about exams, deadlines, venue instructions, or notice summaries...'
              }
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 rounded-xl bg-neo-bg dark:bg-neo-darkBg text-neo-primary dark:text-neo-darkPrimary border border-neo-border/80 shadow-neo-inset px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-magenta/60"
            />
            <NeoButton variant="accent-magenta" type="submit" disabled={!inputQuery.trim() || isLoading}>
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </NeoButton>
          </form>
        </div>
      </NeoCard>
    </div>
  );
};

