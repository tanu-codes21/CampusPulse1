export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';

export type NoticeCategory = 
  | 'Academic'
  | 'Examination'
  | 'Events & Workshops'
  | 'Placement & Internships'
  | 'Clubs & Cultural'
  | 'Administration & Fees'
  | 'Scholarships'
  | 'General';

export interface NoticeVersion {
  version: number;
  updatedAt: string;
  updatedBy: string;
  changesSummary: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  date?: string;
  time?: string;
  venue?: string;
  category: NoticeCategory;
  registrationDeadline?: string;
  importantInstructions?: string[];
  priority: PriorityLevel;
  source: 'whatsapp' | 'poster' | 'manual' | 'circular';
  imageUrl?: string;
  isBookmarked?: boolean;
  isOfficial?: boolean;
  rawText?: string;
  uncertainFields?: string[];
  createdAt: string;
  updatedAt: string;
  versionHistory: NoticeVersion[];
  hindiTitle?: string;
  hindiDescription?: string;
  hindiInstructions?: string[];
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  subject?: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  priority: PriorityLevel;
  isCompleted: boolean;
  sourceNoticeId?: string;
  createdAt: string;
  completedAt?: string;
  category: 'assignment' | 'exam_prep' | 'project' | 'personal' | 'admin';
}

export interface Exam {
  id: string;
  subject: string;
  courseCode?: string;
  date: string;
  time: string;
  durationMinutes?: number;
  venue: string;
  syllabusNotes?: string;
  seatNumber?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  dueTime?: string;
  submissionLink?: string;
  instructions?: string;
  status: 'pending' | 'submitted' | 'late';
  weightage?: string;
}

export interface CustomReminder {
  id: string;
  title: string;
  targetDateTime: string;
  relatedType?: 'notice' | 'task' | 'exam' | 'assignment';
  relatedId?: string;
  isSnoozed?: boolean;
  snoozeUntil?: string;
  isDismissed?: boolean;
}

export type DocumentCategory = 
  | 'Timetable'
  | 'Syllabus'
  | 'Study Material'
  | 'Circular'
  | 'Important Document';

export interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
  tags?: string[];
}

export interface ClubEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  registrationUrl?: string;
  isRegistrationOpen: boolean;
}

export interface Club {
  id: string;
  name: string;
  category: 'Technical' | 'Cultural' | 'Sports' | 'Social' | 'Academic';
  description: string;
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  logoUrl?: string;
  memberCount: number;
  events: ClubEvent[];
  registrationUrl?: string;
}

export type ExchangeCategory = 
  | 'Books'
  | 'Study Materials'
  | 'Lab Equipment'
  | 'Electronics'
  | 'Other';

export interface ExchangeListing {
  id: string;
  title: string;
  description: string;
  price: number;
  isFree?: boolean;
  category: ExchangeCategory;
  condition: 'Brand New' | 'Like New' | 'Good' | 'Fair';
  imageUrl?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  ownerId: string;
  createdAt: string;
  status: 'available' | 'reserved' | 'sold';
  isReported?: boolean;
  reportCount?: number;
}

export interface FeedbackSubmission {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'feedback' | 'bug' | 'feature_request';
  subject: string;
  message: string;
  status: 'pending' | 'under_review' | 'resolved';
  submittedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  college?: string;
  branch?: string;
  semester?: string;
  year?: string;
  rollNumber?: string;
  themePreference: 'light' | 'dark';
  languagePreference: 'en' | 'hi';
  notificationsEnabled: boolean;
  deadlineAlerts: boolean;
  eventReminders: boolean;
  examReminders: boolean;
  emailNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'event' | 'exam' | 'task' | 'notice' | 'announcement';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

