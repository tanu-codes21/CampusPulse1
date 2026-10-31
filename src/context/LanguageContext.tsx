'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type SupportedLanguage = 'en' | 'hi';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    tagline: 'Paste the clutter. Master your day.',
    dashboard: 'Dashboard',
    smartNoticeCentre: 'Smart Notice Centre',
    academicPlanner: 'Academic Planner',
    campusAiAssistant: 'Campus AI Assistant',
    documentVault: 'Document Vault',
    campusCommunity: 'Campus Community',
    settings: 'Settings',
    searchPlaceholder: 'Search notices, deadlines, exams, clubs, exchange...',
    totalNotices: 'Total Notices',
    pendingTasks: 'Pending Tasks',
    upcomingDeadlines: 'Upcoming Deadlines',
    upcomingEvents: 'Upcoming Events',
    todayPriorities: "Today's Priorities",
    recentlyAddedNotices: 'Recently Added Notices',
    upcomingSchedule: 'Upcoming Schedule',
    quickActions: 'Quick Actions',
    pasteNotice: 'Paste Notice',
    addTask: 'Add Task',
    askAi: 'Ask Campus AI',
    uploadDoc: 'Upload Document',
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  },
  hi: {
    tagline: 'अव्यवस्थित संदेश छोड़ें। अपने दिन पर विजय पाएं।',
    dashboard: 'डैशबोर्ड',
    smartNoticeCentre: 'स्मार्ट नोटिस केंद्र',
    academicPlanner: 'अकादमिक योजनाकार',
    campusAiAssistant: 'कैंपस एआई सहायक',
    documentVault: 'दस्तावेज़ वॉल्ट',
    campusCommunity: 'कैंपस समुदाय',
    settings: 'सेटिंग्स',
    searchPlaceholder: 'नोटिस, समय-सीमाएं, परीक्षाएं, क्लब, एक्सचेंज खोजें...',
    totalNotices: 'कुल नोटिस',
    pendingTasks: 'लंबित कार्य',
    upcomingDeadlines: 'आगामी समय-सीमाएं',
    upcomingEvents: 'आगामी कार्यक्रम',
    todayPriorities: 'आज की प्राथमिकताएं',
    recentlyAddedNotices: 'हाल ही में जोड़े गए नोटिस',
    upcomingSchedule: 'आगामी समय सारिणी',
    quickActions: 'त्वरित कार्रवाई',
    pasteNotice: 'नोटिस पेस्ट करें',
    addTask: 'कार्य जोड़ें',
    askAi: 'कैंपस एआई से पूछें',
    uploadDoc: 'दस्तावेज़ अपलोड करें',
    urgent: 'अति आवश्यक',
    high: 'उच्च',
    medium: 'मध्यम',
    low: 'निम्न',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    const saved = localStorage.getItem('campuspulse_lang') as SupportedLanguage;
    if (saved === 'en' || saved === 'hi') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('campuspulse_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

