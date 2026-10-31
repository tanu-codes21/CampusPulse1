import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';

export const metadata: Metadata = {
  title: 'CampusPulse – Student Productivity and Campus Management Platform',
  description: 'Paste the clutter. Master your day. Complete student productivity and verified campus circular platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-neo-bg text-neo-primary selection:bg-accent-cyan/20 selection:text-accent-cyan">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <DataProvider>
                {children}
              </DataProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

