'use client';

import React, { useState } from 'react';
import { Sidebar, NavTab } from './Sidebar';
import { Header } from './Header';
import { DashboardView } from '../dashboard/DashboardView';
import { SmartNoticeCentre } from '../notices/SmartNoticeCentre';
import { AcademicPlanner } from '../planner/AcademicPlanner';
import { CampusAiAssistant } from '../ai/CampusAiAssistant';
import { DocumentVault } from '../documents/DocumentVault';
import { CampusCommunity } from '../community/CampusCommunity';
import { SettingsView } from '../settings/SettingsView';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { AuthModal } from '../auth/AuthModal';

export const AppLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neo-bg dark:bg-neo-darkBg text-neo-primary dark:text-neo-darkPrimary flex transition-colors duration-200">
      {/* 1. STRICT LEFT SIDEBAR (Desktop & Mobile Drawer) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Global Main Header */}
        <Header
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigateTab={(tab) => setCurrentTab(tab)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Dynamic Feature View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenQuickNotice={() => setCurrentTab('notices')}
              onOpenQuickTask={() => setCurrentTab('planner')}
            />
          )}

          {currentTab === 'notices' && <SmartNoticeCentre />}

          {currentTab === 'planner' && <AcademicPlanner />}

          {currentTab === 'ai' && <CampusAiAssistant />}

          {currentTab === 'vault' && <DocumentVault />}

          {currentTab === 'community' && <CampusCommunity />}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Universal Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />

      {/* User Authentication Modal (Gmail OTP Flow) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

