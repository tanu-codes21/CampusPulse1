'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Notice,
  Task,
  Exam,
  Assignment,
  DocumentItem,
  Club,
  ExchangeListing,
  AppNotification,
  CustomReminder,
} from '@/types';
import {
  INITIAL_NOTICES,
  INITIAL_TASKS,
  INITIAL_EXAMS,
  INITIAL_ASSIGNMENTS,
  INITIAL_CLUBS,
  INITIAL_EXCHANGE,
  INITIAL_NOTIFICATIONS,
} from '@/lib/initialData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';
import { sendBrowserNotification } from '@/lib/notifications';

interface DataContextType {
  notices: Notice[];
  tasks: Task[];
  exams: Exam[];
  assignments: Assignment[];
  documents: DocumentItem[];
  clubs: Club[];
  exchangeListings: ExchangeListing[];
  notifications: AppNotification[];
  reminders: CustomReminder[];
  bookmarkedNoticeIds: string[];
  
  // Notices
  addNotice: (notice: Omit<Notice, 'id' | 'createdAt' | 'updatedAt' | 'versionHistory'>) => Promise<Notice>;
  updateNotice: (id: string, updates: Partial<Notice>, changesSummary?: string) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  toggleBookmark: (noticeId: string) => void;
  
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'userId'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  createTaskFromNotice: (notice: Notice) => Promise<Task>;

  // Exams & Assignments
  addExam: (exam: Omit<Exam, 'id'>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  addAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
  updateAssignmentStatus: (id: string, status: 'pending' | 'submitted' | 'late') => Promise<void>;

  // Documents
  addDocument: (doc: Omit<DocumentItem, 'id' | 'uploadedAt' | 'uploadedBy'>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;

  // Community
  addExchangeListing: (listing: Omit<ExchangeListing, 'id' | 'createdAt' | 'ownerId' | 'status'>) => Promise<void>;
  reportExchangeListing: (id: string, reason: string, details?: string) => Promise<void>;

  // Feedback
  submitFeedback: (type: 'feedback' | 'bug' | 'feature_request', subject: string, message: string) => Promise<{ success: boolean; id: string }>;

  // Reminders & Notifications
  addReminder: (reminder: Omit<CustomReminder, 'id'>) => void;
  snoozeReminder: (id: string, minutes: number) => void;
  dismissReminder: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [clubs, setClubs] = useState<Club[]>(INITIAL_CLUBS);
  const [exchangeListings, setExchangeListings] = useState<ExchangeListing[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [reminders, setReminders] = useState<CustomReminder[]>([]);
  const [bookmarkedNoticeIds, setBookmarkedNoticeIds] = useState<string[]>(['n-1']);

  // Initial load from Supabase or localStorage
  useEffect(() => {
    const loadData = async () => {
      // 1. Notices
      const localNotices = localStorage.getItem('campuspulse_notices');
      if (localNotices) {
        setNotices(JSON.parse(localNotices));
      } else {
        setNotices(INITIAL_NOTICES);
        localStorage.setItem('campuspulse_notices', JSON.stringify(INITIAL_NOTICES));
      }

      // 2. Tasks
      const localTasks = localStorage.getItem('campuspulse_tasks');
      if (localTasks) {
        setTasks(JSON.parse(localTasks));
      } else {
        setTasks(INITIAL_TASKS);
        localStorage.setItem('campuspulse_tasks', JSON.stringify(INITIAL_TASKS));
      }

      // 3. Exams
      const localExams = localStorage.getItem('campuspulse_exams');
      if (localExams) {
        setExams(JSON.parse(localExams));
      } else {
        setExams(INITIAL_EXAMS);
        localStorage.setItem('campuspulse_exams', JSON.stringify(INITIAL_EXAMS));
      }

      // 4. Assignments
      const localAssignments = localStorage.getItem('campuspulse_assignments');
      if (localAssignments) {
        setAssignments(JSON.parse(localAssignments));
      } else {
        setAssignments(INITIAL_ASSIGNMENTS);
        localStorage.setItem('campuspulse_assignments', JSON.stringify(INITIAL_ASSIGNMENTS));
      }

      // 5. Documents
      const localDocs = localStorage.getItem('campuspulse_documents');
      if (localDocs) {
        setDocuments(JSON.parse(localDocs));
      } else {
        const sampleDocs: DocumentItem[] = [
          {
            id: 'doc-1',
            title: 'B.Tech CSE 6th Semester Detailed Syllabus',
            category: 'Syllabus',
            fileUrl: 'https://example.com/syllabus.pdf',
            fileName: 'CSE_6th_Sem_Syllabus_2026.pdf',
            fileSize: 2450000,
            fileType: 'application/pdf',
            uploadedAt: '2026-10-15T09:00:00Z',
            uploadedBy: 'Academic Cell',
            tags: ['Syllabus', 'CSE', '6th Sem'],
          },
          {
            id: 'doc-2',
            title: 'End-Semester Official Exam Schedule Circular',
            category: 'Circular',
            fileUrl: 'https://example.com/exam-circular.pdf',
            fileName: 'Exam_Circular_Nov2026.pdf',
            fileSize: 1120000,
            fileType: 'application/pdf',
            uploadedAt: '2026-10-28T14:00:00Z',
            uploadedBy: 'Controller of Exams',
            tags: ['Exam', 'Schedule', 'Official'],
          },
          {
            id: 'doc-3',
            title: 'Distributed Systems Unit 1-4 Formula & Summary Sheet',
            category: 'Study Material',
            fileUrl: 'https://example.com/ds-cheat-sheet.pdf',
            fileName: 'Distributed_Systems_Summary.pdf',
            fileSize: 3100000,
            fileType: 'application/pdf',
            uploadedAt: '2026-10-30T16:00:00Z',
            uploadedBy: 'Self',
            tags: ['Distributed Systems', 'Notes'],
          },
        ];
        setDocuments(sampleDocs);
        localStorage.setItem('campuspulse_documents', JSON.stringify(sampleDocs));
      }

      // 6. Community Listings
      const localExchange = localStorage.getItem('campuspulse_exchange');
      if (localExchange) {
        setExchangeListings(JSON.parse(localExchange));
      } else {
        setExchangeListings(INITIAL_EXCHANGE);
        localStorage.setItem('campuspulse_exchange', JSON.stringify(INITIAL_EXCHANGE));
      }

      // 7. Notifications
      const localNotifs = localStorage.getItem('campuspulse_notifications');
      if (localNotifs) {
        setNotifications(JSON.parse(localNotifs));
      } else {
        setNotifications(INITIAL_NOTIFICATIONS);
        localStorage.setItem('campuspulse_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
      }

      // 8. Bookmarks
      const localBookmarks = localStorage.getItem('campuspulse_bookmarks');
      if (localBookmarks) {
        setBookmarkedNoticeIds(JSON.parse(localBookmarks));
      }

      // Remote Supabase fetch if live
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: remoteNotices } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
          if (remoteNotices && remoteNotices.length > 0) {
            setNotices(remoteNotices.map((n: any) => ({
              id: n.id,
              title: n.title,
              description: n.description,
              date: n.event_date,
              time: n.event_time,
              venue: n.venue,
              category: n.category,
              registrationDeadline: n.registration_deadline,
              importantInstructions: n.important_instructions || [],
              priority: n.priority,
              source: n.source,
              imageUrl: n.image_url,
              isOfficial: n.is_official,
              rawText: n.raw_text,
              uncertainFields: n.uncertain_fields,
              createdAt: n.created_at,
              updatedAt: n.updated_at,
              versionHistory: [],
              hindiTitle: n.hindi_title,
              hindiDescription: n.hindi_description,
              hindiInstructions: n.hindi_instructions,
            })));
          }

          if (user) {
            const { data: remoteTasks } = await supabase.from('tasks').select('*').eq('user_id', user.id);
            if (remoteTasks && remoteTasks.length > 0) {
              setTasks(remoteTasks.map((t: any) => ({
                id: t.id,
                userId: t.user_id,
                title: t.title,
                subject: t.subject,
                description: t.description,
                dueDate: t.due_date,
                dueTime: t.due_time,
                priority: t.priority,
                isCompleted: t.is_completed,
                category: t.category,
                sourceNoticeId: t.source_notice_id,
                createdAt: t.created_at,
                completedAt: t.completed_at,
              })));
            }
          }
        } catch (err) {
          console.warn('Supabase remote fetch warning:', err);
        }
      }
    };

    loadData();
  }, [user]);

  // Notice operations
  const addNotice = async (noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt' | 'versionHistory'>): Promise<Notice> => {
    const newNotice: Notice = {
      ...noticeData,
      id: `n-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versionHistory: [
        {
          version: 1,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.fullName || 'Campus Admin',
          changesSummary: 'Initial publication',
        },
      ],
    };

    const updated = [newNotice, ...notices];
    setNotices(updated);
    localStorage.setItem('campuspulse_notices', JSON.stringify(updated));

    // Send in-app notification & browser alert
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `New Notice: ${newNotice.title}`,
      message: `${newNotice.category} announcement posted`,
      type: 'notice',
      timestamp: 'Just now',
      isRead: false,
      link: 'notices',
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('campuspulse_notifications', JSON.stringify(updatedNotifs));

    sendBrowserNotification(`CampusPulse: ${newNotice.title}`, {
      body: newNotice.description.slice(0, 100),
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('notices').insert({
          id: newNotice.id,
          user_id: user?.id,
          title: newNotice.title,
          description: newNotice.description,
          event_date: newNotice.date,
          event_time: newNotice.time,
          venue: newNotice.venue,
          category: newNotice.category,
          registration_deadline: newNotice.registrationDeadline,
          important_instructions: newNotice.importantInstructions,
          priority: newNotice.priority,
          source: newNotice.source,
          image_url: newNotice.imageUrl,
          is_official: newNotice.isOfficial,
          raw_text: newNotice.rawText,
          hindi_title: newNotice.hindiTitle,
          hindi_description: newNotice.hindiDescription,
        });
      } catch (e) {
        console.warn('Notice remote save error:', e);
      }
    }

    return newNotice;
  };

  const updateNotice = async (id: string, updates: Partial<Notice>, changesSummary = 'Updated notice details') => {
    const updated = notices.map((n) => {
      if (n.id === id) {
        const newVersionNumber = (n.versionHistory?.length || 1) + 1;
        const newHistory = [
          ...(n.versionHistory || []),
          {
            version: newVersionNumber,
            updatedAt: new Date().toISOString(),
            updatedBy: user?.fullName || 'Editor',
            changesSummary,
          },
        ];
        return {
          ...n,
          ...updates,
          updatedAt: new Date().toISOString(),
          versionHistory: newHistory,
        };
      }
      return n;
    });

    setNotices(updated);
    localStorage.setItem('campuspulse_notices', JSON.stringify(updated));
  };

  const deleteNotice = async (id: string) => {
    const updated = notices.filter((n) => n.id !== id);
    setNotices(updated);
    localStorage.setItem('campuspulse_notices', JSON.stringify(updated));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('notices').delete().eq('id', id);
      } catch (e) {
        console.warn('Notice delete error:', e);
      }
    }
  };

  const toggleBookmark = (noticeId: string) => {
    let next: string[];
    if (bookmarkedNoticeIds.includes(noticeId)) {
      next = bookmarkedNoticeIds.filter((id) => id !== noticeId);
    } else {
      next = [...bookmarkedNoticeIds, noticeId];
    }
    setBookmarkedNoticeIds(next);
    localStorage.setItem('campuspulse_bookmarks', JSON.stringify(next));
  };

  // Task operations
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'userId'>): Promise<Task> => {
    const newTask: Task = {
      ...taskData,
      id: `t-${Date.now()}`,
      userId: user?.id || 'demo-user',
      createdAt: new Date().toISOString(),
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    localStorage.setItem('campuspulse_tasks', JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('tasks').insert({
          id: newTask.id,
          user_id: user?.id,
          title: newTask.title,
          subject: newTask.subject,
          description: newTask.description,
          due_date: newTask.dueDate,
          due_time: newTask.dueTime,
          priority: newTask.priority,
          is_completed: newTask.isCompleted,
          category: newTask.category,
          source_notice_id: newTask.sourceNoticeId,
        });
      } catch (e) {
        console.warn('Task remote save error:', e);
      }
    }

    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTasks(updated);
    localStorage.setItem('campuspulse_tasks', JSON.stringify(updated));
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    localStorage.setItem('campuspulse_tasks', JSON.stringify(updated));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('tasks').delete().eq('id', id);
      } catch (e) {
        console.warn('Task remote delete error:', e);
      }
    }
  };

  const toggleTaskComplete = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const isNowCompleted = !target.isCompleted;

    const updated = tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            isCompleted: isNowCompleted,
            completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          }
        : t
    );

    setTasks(updated);
    localStorage.setItem('campuspulse_tasks', JSON.stringify(updated));
  };

  const createTaskFromNotice = async (notice: Notice): Promise<Task> => {
    const newTask = await addTask({
      title: `Prepare for: ${notice.title}`,
      subject: notice.category,
      description: `Auto-generated from Notice [${notice.title}]: ${notice.description.slice(0, 140)}...`,
      dueDate: notice.date || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      dueTime: notice.time || '18:00',
      priority: notice.priority,
      isCompleted: false,
      sourceNoticeId: notice.id,
      category: 'admin',
    });

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Task Created from Notice',
      message: `"${notice.title}" has been added to your Academic Planner.`,
      type: 'task',
      timestamp: 'Just now',
      isRead: false,
      link: 'planner',
    };
    setNotifications((prev) => [notif, ...prev]);

    return newTask;
  };

  // Exams
  const addExam = async (examData: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      ...examData,
      id: `ex-${Date.now()}`,
    };
    const updated = [...exams, newExam];
    setExams(updated);
    localStorage.setItem('campuspulse_exams', JSON.stringify(updated));
  };

  const deleteExam = async (id: string) => {
    const updated = exams.filter((e) => e.id !== id);
    setExams(updated);
    localStorage.setItem('campuspulse_exams', JSON.stringify(updated));
  };

  // Assignments
  const addAssignment = async (data: Omit<Assignment, 'id'>) => {
    const newAssignment: Assignment = {
      ...data,
      id: `as-${Date.now()}`,
    };
    const updated = [newAssignment, ...assignments];
    setAssignments(updated);
    localStorage.setItem('campuspulse_assignments', JSON.stringify(updated));
  };

  const updateAssignmentStatus = async (id: string, status: 'pending' | 'submitted' | 'late') => {
    const updated = assignments.map((a) => (a.id === id ? { ...a, status } : a));
    setAssignments(updated);
    localStorage.setItem('campuspulse_assignments', JSON.stringify(updated));
  };

  // Documents
  const addDocument = async (docData: Omit<DocumentItem, 'id' | 'uploadedAt' | 'uploadedBy'>) => {
    const newDoc: DocumentItem = {
      ...docData,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user?.fullName || 'Student',
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    localStorage.setItem('campuspulse_documents', JSON.stringify(updated));
  };

  const deleteDocument = async (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    localStorage.setItem('campuspulse_documents', JSON.stringify(updated));
  };

  // Exchange Listings
  const addExchangeListing = async (listingData: Omit<ExchangeListing, 'id' | 'createdAt' | 'ownerId' | 'status'>) => {
    const newListing: ExchangeListing = {
      ...listingData,
      id: `exl-${Date.now()}`,
      ownerId: user?.id || 'demo-user',
      createdAt: new Date().toISOString(),
      status: 'available',
      reportCount: 0,
    };
    const updated = [newListing, ...exchangeListings];
    setExchangeListings(updated);
    localStorage.setItem('campuspulse_exchange', JSON.stringify(updated));
  };

  const reportExchangeListing = async (id: string, reason: string, details?: string) => {
    const updated = exchangeListings.map((l) => {
      if (l.id === id) {
        return {
          ...l,
          isReported: true,
          reportCount: (l.reportCount || 0) + 1,
        };
      }
      return l;
    });
    setExchangeListings(updated);
    localStorage.setItem('campuspulse_exchange', JSON.stringify(updated));
  };

  // Feedback
  const submitFeedback = async (
    type: 'feedback' | 'bug' | 'feature_request',
    subject: string,
    message: string
  ): Promise<{ success: boolean; id: string }> => {
    const feedbackId = `fb-${Date.now()}`;
    const submission = {
      id: feedbackId,
      userId: user?.id || 'guest',
      userEmail: user?.email || 'student@campuspulse.edu',
      userName: user?.fullName || 'Student',
      type,
      subject,
      message,
      status: 'pending' as const,
      submittedAt: new Date().toISOString(),
    };

    // Store in local feedback list
    const existing = JSON.parse(localStorage.getItem('campuspulse_feedbacks') || '[]');
    localStorage.setItem('campuspulse_feedbacks', JSON.stringify([submission, ...existing]));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('feedback_submissions').insert({
          id: submission.id,
          user_id: user?.id,
          user_email: submission.userEmail,
          user_name: submission.userName,
          feedback_type: submission.type,
          subject: submission.subject,
          message: submission.message,
          status: 'pending',
        });
      } catch (e) {
        console.warn('Feedback remote save:', e);
      }
    }

    return { success: true, id: feedbackId };
  };

  // Reminders
  const addReminder = (remData: Omit<CustomReminder, 'id'>) => {
    const newRem: CustomReminder = {
      ...remData,
      id: `rem-${Date.now()}`,
    };
    setReminders((prev) => [...prev, newRem]);
  };

  const snoozeReminder = (id: string, minutes: number) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              isSnoozed: true,
              snoozeUntil: new Date(Date.now() + minutes * 60000).toISOString(),
            }
          : r
      )
    );
  };

  const dismissReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setNotifications(updated);
    localStorage.setItem('campuspulse_notifications', JSON.stringify(updated));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('campuspulse_notifications');
  };

  return (
    <DataContext.Provider
      value={{
        notices,
        tasks,
        exams,
        assignments,
        documents,
        clubs,
        exchangeListings,
        notifications,
        reminders,
        bookmarkedNoticeIds,
        addNotice,
        updateNotice,
        deleteNotice,
        toggleBookmark,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        createTaskFromNotice,
        addExam,
        deleteExam,
        addAssignment,
        updateAssignmentStatus,
        addDocument,
        deleteDocument,
        addExchangeListing,
        reportExchangeListing,
        submitFeedback,
        addReminder,
        snoozeReminder,
        dismissReminder,
        markNotificationRead,
        clearNotifications,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

