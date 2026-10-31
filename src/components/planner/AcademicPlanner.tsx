'use client';

import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  BookOpen,
  FileDown,
  Plus,
  Trash2,
  Edit3,
  Bell,
  AlarmClock,
  AlertCircle,
  Filter,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Task, Exam, Assignment, PriorityLevel } from '@/types';
import { exportAcademicPlannerPDF } from '@/lib/pdf';
import { NeoCard } from '../common/NeoCard';
import { NeoButton } from '../common/NeoButton';
import { NeoInput, NeoTextArea } from '../common/NeoInput';
import { Badge, PriorityBadge } from '../common/Badge';

export const AcademicPlanner: React.FC = () => {
  const { user } = useAuth();
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    exams,
    addExam,
    deleteExam,
    assignments,
    addAssignment,
    updateAssignmentStatus,
    reminders,
    addReminder,
    snoozeReminder,
    dismissReminder,
  } = useData();

  // Active module view
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar' | 'exams' | 'assignments' | 'reminders'>('tasks');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'pending' | 'completed' | 'all'>('pending');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskDueTime, setNewTaskDueTime] = useState('18:00');
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityLevel>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<'assignment' | 'exam_prep' | 'project' | 'personal' | 'admin'>('assignment');

  // Exam form state
  const [newExamSubject, setNewExamSubject] = useState('');
  const [newExamCode, setNewExamCode] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamTime, setNewExamTime] = useState('09:30 AM');
  const [newExamVenue, setNewExamVenue] = useState('');
  const [newExamSyllabus, setNewExamSyllabus] = useState('');

  // Assignment form state
  const [newAsTitle, setNewAsTitle] = useState('');
  const [newAsSubject, setNewAsSubject] = useState('');
  const [newAsDueDate, setNewAsDueDate] = useState('');
  const [newAsLink, setNewAsLink] = useState('');
  const [newAsWeightage, setNewAsWeightage] = useState('');

  // Reminder form state
  const [newRemTitle, setNewRemTitle] = useState('');
  const [newRemDateTime, setNewRemDateTime] = useState('');

  // Calculate live deadline countdown string
  const getCountdownString = (dueDate: string, dueTime?: string) => {
    const target = new Date(`${dueDate}T${dueTime || '23:59:00'}`).getTime();
    const diff = target - Date.now();
    if (diff <= 0) return 'Overdue';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return `${days}d ${hours}h left`;
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m left`;
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDueDate) {
      alert('Please enter a task title and due date.');
      return;
    }
    await addTask({
      title: newTaskTitle,
      subject: newTaskSubject || undefined,
      description: newTaskDesc || undefined,
      dueDate: newTaskDueDate,
      dueTime: newTaskDueTime || undefined,
      priority: newTaskPriority,
      isCompleted: false,
      category: newTaskCategory,
    });
    setNewTaskTitle('');
    setNewTaskSubject('');
    setNewTaskDesc('');
    setNewTaskDueDate('');
    setIsTaskModalOpen(false);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamSubject.trim() || !newExamDate) {
      alert('Subject and Date are required.');
      return;
    }
    await addExam({
      subject: newExamSubject,
      courseCode: newExamCode || undefined,
      date: newExamDate,
      time: newExamTime,
      venue: newExamVenue || 'Main Examination Block',
      syllabusNotes: newExamSyllabus || undefined,
    });
    setNewExamSubject('');
    setNewExamCode('');
    setNewExamDate('');
    setNewExamVenue('');
    setNewExamSyllabus('');
    setIsExamModalOpen(false);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsTitle.trim() || !newAsSubject.trim() || !newAsDueDate) {
      alert('Title, Subject and Due Date are required.');
      return;
    }
    await addAssignment({
      title: newAsTitle,
      subject: newAsSubject,
      dueDate: newAsDueDate,
      submissionLink: newAsLink || undefined,
      status: 'pending',
      weightage: newAsWeightage || undefined,
    });
    setNewAsTitle('');
    setNewAsSubject('');
    setNewAsDueDate('');
    setNewAsLink('');
    setNewAsWeightage('');
    setIsAssignmentModalOpen(false);
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemTitle || !newRemDateTime) {
      alert('Reminder title and date/time are required.');
      return;
    }
    addReminder({
      title: newRemTitle,
      targetDateTime: newRemDateTime,
      isSnoozed: false,
      isDismissed: false,
    });
    setNewRemTitle('');
    setNewRemDateTime('');
    setIsReminderModalOpen(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskStatusFilter === 'pending') return !t.isCompleted;
    if (taskStatusFilter === 'completed') return t.isCompleted;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-accent-blue border border-blue-200/50">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-neo-primary dark:text-white">
              Academic Planner
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neo-secondary dark:text-neo-darkSecondary mt-1">
            Personal task manager, exam schedule, live deadline countdowns, and academic calendar in one unified dashboard.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* PDF Export Button */}
          <NeoButton
            variant="secondary"
            size="md"
            onClick={() => exportAcademicPlannerPDF(user?.fullName || 'Student', tasks, exams, assignments)}
            title="Download PDF Schedule"
          >
            <FileDown className="w-4 h-4 text-accent-blue" />
            Export Schedule (PDF)
          </NeoButton>

          <NeoButton
            variant="accent-blue"
            size="md"
            onClick={() => setIsTaskModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            New Task
          </NeoButton>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto p-1.5 rounded-2xl bg-neo-card dark:bg-neo-darkCard border border-neo-border dark:border-neo-darkBorder shadow-neo-raised-sm gap-1">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'tasks'
              ? 'bg-accent-blue text-white shadow-md'
              : 'text-neo-secondary hover:text-neo-primary'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Task Manager ({tasks.filter((t) => !t.isCompleted).length})
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'calendar'
              ? 'bg-accent-blue text-white shadow-md'
              : 'text-neo-secondary hover:text-neo-primary'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Academic Calendar
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'exams'
              ? 'bg-accent-blue text-white shadow-md'
              : 'text-neo-secondary hover:text-neo-primary'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Exam Schedule ({exams.length})
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'assignments'
              ? 'bg-accent-blue text-white shadow-md'
              : 'text-neo-secondary hover:text-neo-primary'
          }`}
        >
          <Clock className="w-4 h-4" />
          Assignment Tracker ({assignments.length})
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'reminders'
              ? 'bg-accent-blue text-white shadow-md'
              : 'text-neo-secondary hover:text-neo-primary'
          }`}
        >
          <Bell className="w-4 h-4" />
          Reminders ({reminders.length})
        </button>
      </div>

      {/* VIEW 1: TASK MANAGER */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            {/* Status toggle buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTaskStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  taskStatusFilter === 'pending'
                    ? 'bg-accent-blue text-white'
                    : 'bg-neo-card text-neo-secondary border border-neo-border'
                }`}
              >
                Pending ({tasks.filter((t) => !t.isCompleted).length})
              </button>
              <button
                onClick={() => setTaskStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  taskStatusFilter === 'completed'
                    ? 'bg-accent-blue text-white'
                    : 'bg-neo-card text-neo-secondary border border-neo-border'
                }`}
              >
                Completed ({tasks.filter((t) => t.isCompleted).length})
              </button>
              <button
                onClick={() => setTaskStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  taskStatusFilter === 'all'
                    ? 'bg-accent-blue text-white'
                    : 'bg-neo-card text-neo-secondary border border-neo-border'
                }`}
              >
                All Tasks
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <NeoCard variant="flat" className="text-center py-12">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-neo-primary dark:text-white">
                  No tasks in this category
                </p>
                <p className="text-xs text-neo-secondary mt-1">
                  Add a new task or import action items directly from the Smart Notice Centre.
                </p>
              </NeoCard>
            ) : (
              filteredTasks.map((task) => {
                const countdown = getCountdownString(task.dueDate, task.dueTime);
                const isOverdue = countdown === 'Overdue' && !task.isCompleted;

                return (
                  <NeoCard
                    key={task.id}
                    accent="blue"
                    variant="flat"
                    className="p-4 transition-all hover:shadow-neo-raised-sm"
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                          task.isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-neo-border bg-neo-bg hover:border-accent-blue'
                        }`}
                      >
                        {task.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p
                            className={`text-base font-extrabold text-neo-primary dark:text-white ${
                              task.isCompleted ? 'line-through opacity-60' : ''
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <PriorityBadge priority={task.priority} />
                            {/* Live Countdown Badge */}
                            {!task.isCompleted && (
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                  isOverdue
                                    ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                                    : 'bg-blue-50 text-accent-blue border-blue-200'
                                }`}
                              >
                                {countdown}
                              </span>
                            )}
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-xs text-neo-secondary dark:text-neo-darkSecondary mt-1 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neo-secondary">
                          <span className="flex items-center gap-1 font-medium">
                            <CalendarIcon className="w-3.5 h-3.5 text-accent-blue" />
                            Due: {task.dueDate} {task.dueTime}
                          </span>
                          {task.subject && (
                            <span className="px-2 py-0.5 rounded-lg bg-neo-bg dark:bg-neo-darkBg border border-neo-border font-semibold">
                              {task.subject}
                            </span>
                          )}
                          <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-neo-bg text-neo-secondary">
                            {task.category}
                          </span>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg text-neo-secondary hover:text-rose-500"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </NeoCard>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: ACADEMIC CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <NeoCard>
            <div className="flex items-center justify-between pb-4 border-b border-neo-border">
              <h2 className="text-base font-extrabold text-neo-primary dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-accent-blue" />
                Academic Schedule View (November 2026)
              </h2>
              <span className="text-xs font-semibold text-accent-blue bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-200">
                End-Semester Active
              </span>
            </div>

            {/* Calendar Events List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-4 rounded-2xl bg-neo-bg dark:bg-neo-darkBg border-l-4 border-accent-blue border-neo-border space-y-1.5 shadow-neo-raised-sm"
                >
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="blue">Examination</Badge>
                    <span className="font-bold text-accent-blue">{exam.date}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-neo-primary dark:text-white">
                    {exam.subject} ({exam.courseCode || 'Core'})
                  </h4>
                  <p className="text-xs text-neo-secondary">Time: {exam.time} • Venue: {exam.venue}</p>
                </div>
              ))}

              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-neo-bg dark:bg-neo-darkBg border-l-4 border-cyan-500 border-neo-border space-y-1.5 shadow-neo-raised-sm"
                >
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="cyan">Task Deadline</Badge>
                    <span className="font-bold text-accent-cyan">{task.dueDate}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-neo-primary dark:text-white">
                    {task.title}
                  </h4>
                  <p className="text-xs text-neo-secondary">Priority: {task.priority.toUpperCase()}</p>
                </div>
              ))}
            </div>
          </NeoCard>
        </div>
      )}

      {/* VIEW 3: EXAM SCHEDULE */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neo-secondary uppercase tracking-wider">
              Registered Examinations ({exams.length})
            </h3>
            <NeoButton variant="secondary" size="sm" onClick={() => setIsExamModalOpen(true)}>
              <Plus className="w-4 h-4 text-accent-blue" />
              Add Exam
            </NeoButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam) => (
              <NeoCard key={exam.id} accent="blue" className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-accent-blue uppercase tracking-wider">
                      {exam.courseCode || 'Course'}
                    </span>
                    <h3 className="text-base font-extrabold text-neo-primary dark:text-white">
                      {exam.subject}
                    </h3>
                  </div>
                  <button
                    onClick={() => deleteExam(exam.id)}
                    className="p-1 rounded text-neo-secondary hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-neo-secondary border-t border-neo-border/60 pt-2">
                  <p className="font-semibold text-neo-primary dark:text-white">
                    📅 Date & Time: {exam.date} • {exam.time}
                  </p>
                  <p>📍 Hall / Venue: <span className="font-bold text-neo-primary dark:text-white">{exam.venue}</span></p>
                  {exam.seatNumber && <p>🪑 Seat Allocation: <span className="font-mono text-accent-blue font-bold">{exam.seatNumber}</span></p>}
                  {exam.syllabusNotes && (
                    <div className="p-2.5 rounded-xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border text-[11px] mt-2">
                      <span className="font-bold text-neo-secondary block mb-0.5">Syllabus Scope:</span>
                      {exam.syllabusNotes}
                    </div>
                  )}
                </div>
              </NeoCard>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: ASSIGNMENT TRACKER */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neo-secondary uppercase tracking-wider">
              Coursework & Lab Assignments ({assignments.length})
            </h3>
            <NeoButton variant="secondary" size="sm" onClick={() => setIsAssignmentModalOpen(true)}>
              <Plus className="w-4 h-4 text-accent-blue" />
              Add Assignment
            </NeoButton>
          </div>

          <div className="space-y-3">
            {assignments.map((as) => (
              <NeoCard key={as.id} accent="blue" variant="flat" className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-accent-blue">{as.subject}</span>
                      <Badge variant={as.status === 'submitted' ? 'success' : 'orange'}>
                        {as.status.toUpperCase()}
                      </Badge>
                      {as.weightage && (
                        <span className="text-[11px] text-neo-secondary font-mono">({as.weightage})</span>
                      )}
                    </div>
                    <h4 className="text-base font-extrabold text-neo-primary dark:text-white mt-1">
                      {as.title}
                    </h4>
                    <p className="text-xs text-neo-secondary mt-1">
                      Due: {as.dueDate} {as.dueTime}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {as.submissionLink && (
                      <a
                        href={as.submissionLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-neo-card border border-neo-border text-accent-blue hover:underline"
                      >
                        Portal Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      onClick={() =>
                        updateAssignmentStatus(as.id, as.status === 'pending' ? 'submitted' : 'pending')
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        as.status === 'submitted'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-neo-bg border border-neo-border text-neo-secondary hover:text-emerald-500'
                      }`}
                    >
                      {as.status === 'submitted' ? 'Mark Pending' : 'Mark Submitted'}
                    </button>
                  </div>
                </div>
              </NeoCard>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: REMINDERS & SNOOZE */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neo-secondary uppercase tracking-wider">
              Custom Reminders
            </h3>
            <NeoButton variant="secondary" size="sm" onClick={() => setIsReminderModalOpen(true)}>
              <Plus className="w-4 h-4 text-accent-blue" />
              New Reminder
            </NeoButton>
          </div>

          <div className="space-y-3">
            {reminders.length === 0 ? (
              <NeoCard variant="flat" className="text-center py-10 text-xs text-neo-secondary">
                No custom reminders created yet. Add one to alert you before important submissions!
              </NeoCard>
            ) : (
              reminders.map((rem) => (
                <NeoCard key={rem.id} variant="flat" className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-accent-blue">
                      <AlarmClock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-neo-primary dark:text-white">
                        {rem.title}
                      </p>
                      <p className="text-xs text-neo-secondary">
                        Alert at: {new Date(rem.targetDateTime).toLocaleString()}
                        {rem.isSnoozed && ` (Snoozed until ${new Date(rem.snoozeUntil || '').toLocaleTimeString()})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => snoozeReminder(rem.id, 30)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neo-bg border border-neo-border text-neo-secondary hover:text-accent-blue"
                    >
                      Snooze 30m
                    </button>
                    <button
                      onClick={() => dismissReminder(rem.id)}
                      className="p-1.5 text-neo-secondary hover:text-rose-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </NeoCard>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD TASK */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTask}
            className="w-full max-w-lg bg-neo-card dark:bg-neo-darkCard rounded-3xl p-6 border border-neo-border shadow-neo-raised-lg space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neo-border">
              <h2 className="text-lg font-bold text-neo-primary dark:text-white">
                Add Academic Task
              </h2>
              <button onClick={() => setIsTaskModalOpen(false)} type="button">
                <X className="w-5 h-5 text-neo-secondary" />
              </button>
            </div>

            <NeoInput
              label="Task Title"
              placeholder="e.g. Complete Machine Learning Assignment 3"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              required
            />

            <NeoInput
              label="Subject / Course"
              placeholder="e.g. CS-602 Machine Learning"
              value={newTaskSubject}
              onChange={(e) => setNewTaskSubject(e.target.value)}
            />

            <NeoTextArea
              label="Description / Checklist Notes"
              placeholder="Add key requirements or checklist items..."
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              rows={3}
            />

            <div className="grid grid-cols-2 gap-3">
              <NeoInput
                type="date"
                label="Due Date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                required
              />
              <NeoInput
                type="time"
                label="Due Time"
                value={newTaskDueTime}
                onChange={(e) => setNewTaskDueTime(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neo-secondary mb-1.5">
                  Priority
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as PriorityLevel)}
                  className="w-full rounded-xl bg-neo-bg dark:bg-neo-darkBg text-neo-primary dark:text-neo-darkPrimary border border-neo-border px-3 py-2 text-xs font-semibold"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neo-secondary mb-1.5">
                  Category
                </label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as any)}
                  className="w-full rounded-xl bg-neo-bg dark:bg-neo-darkBg text-neo-primary dark:text-neo-darkPrimary border border-neo-border px-3 py-2 text-xs font-semibold"
                >
                  <option value="assignment">Assignment</option>
                  <option value="exam_prep">Exam Prep</option>
                  <option value="project">Project</option>
                  <option value="personal">Personal</option>
                  <option value="admin">Administrative</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-neo-border">
              <NeoButton variant="secondary" type="button" onClick={() => setIsTaskModalOpen(false)}>
                Cancel
              </NeoButton>
              <NeoButton variant="accent-blue" type="submit">
                Create Task
              </NeoButton>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD EXAM */}
      {isExamModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateExam}
            className="w-full max-w-lg bg-neo-card dark:bg-neo-darkCard rounded-3xl p-6 border border-neo-border shadow-neo-raised-lg space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neo-border">
              <h2 className="text-lg font-bold text-neo-primary dark:text-white">
                Add Exam Schedule Entry
              </h2>
              <button onClick={() => setIsExamModalOpen(false)} type="button">
                <X className="w-5 h-5 text-neo-secondary" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <NeoInput
                  label="Subject Name"
                  placeholder="e.g. Distributed Systems"
                  value={newExamSubject}
                  onChange={(e) => setNewExamSubject(e.target.value)}
                  required
                />
              </div>
              <div>
                <NeoInput
                  label="Course Code"
                  placeholder="CS-601"
                  value={newExamCode}
                  onChange={(e) => setNewExamCode(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NeoInput
                type="date"
                label="Date"
                value={newExamDate}
                onChange={(e) => setNewExamDate(e.target.value)}
                required
              />
              <NeoInput
                label="Timing"
                value={newExamTime}
                onChange={(e) => setNewExamTime(e.target.value)}
              />
            </div>

            <NeoInput
              label="Hall / Venue"
              placeholder="Block B Hall 204"
              value={newExamVenue}
              onChange={(e) => setNewExamVenue(e.target.value)}
            />

            <NeoTextArea
              label="Syllabus Topics / Notes"
              placeholder="e.g. Units 1 through 5, Formula sheets permitted"
              value={newExamSyllabus}
              onChange={(e) => setNewExamSyllabus(e.target.value)}
            />

            <div className="pt-4 flex justify-end gap-2 border-t border-neo-border">
              <NeoButton variant="secondary" type="button" onClick={() => setIsExamModalOpen(false)}>
                Cancel
              </NeoButton>
              <NeoButton variant="accent-blue" type="submit">
                Save Exam
              </NeoButton>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD ASSIGNMENT */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateAssignment}
            className="w-full max-w-lg bg-neo-card dark:bg-neo-darkCard rounded-3xl p-6 border border-neo-border shadow-neo-raised-lg space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neo-border">
              <h2 className="text-lg font-bold text-neo-primary dark:text-white">
                Add Coursework Assignment
              </h2>
              <button onClick={() => setIsAssignmentModalOpen(false)} type="button">
                <X className="w-5 h-5 text-neo-secondary" />
              </button>
            </div>

            <NeoInput
              label="Assignment Title"
              placeholder="e.g. Distributed Consensus Lab"
              value={newAsTitle}
              onChange={(e) => setNewAsTitle(e.target.value)}
              required
            />

            <NeoInput
              label="Subject / Professor"
              placeholder="e.g. CS-601 (Prof. Rao)"
              value={newAsSubject}
              onChange={(e) => setNewAsSubject(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <NeoInput
                type="date"
                label="Due Date"
                value={newAsDueDate}
                onChange={(e) => setNewAsDueDate(e.target.value)}
                required
              />
              <NeoInput
                label="Grade Weightage"
                placeholder="e.g. 15% Final Grade"
                value={newAsWeightage}
                onChange={(e) => setNewAsWeightage(e.target.value)}
              />
            </div>

            <NeoInput
              label="Submission Link / Classroom URL"
              placeholder="https://classroom.google.com/..."
              value={newAsLink}
              onChange={(e) => setNewAsLink(e.target.value)}
            />

            <div className="pt-4 flex justify-end gap-2 border-t border-neo-border">
              <NeoButton variant="secondary" type="button" onClick={() => setIsAssignmentModalOpen(false)}>
                Cancel
              </NeoButton>
              <NeoButton variant="accent-blue" type="submit">
                Save Assignment
              </NeoButton>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD REMINDER */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateReminder}
            className="w-full max-w-md bg-neo-card dark:bg-neo-darkCard rounded-3xl p-6 border border-neo-border shadow-neo-raised-lg space-y-4"
          >
            <h2 className="text-lg font-bold text-neo-primary dark:text-white pb-3 border-b border-neo-border">
              Set Custom Reminder
            </h2>
            <NeoInput
              label="Reminder Title"
              placeholder="e.g. Verify Hall Ticket Signature"
              value={newRemTitle}
              onChange={(e) => setNewRemTitle(e.target.value)}
              required
            />
            <NeoInput
              type="datetime-local"
              label="Date & Time"
              value={newRemDateTime}
              onChange={(e) => setNewRemDateTime(e.target.value)}
              required
            />
            <div className="pt-3 flex justify-end gap-2 border-t border-neo-border">
              <NeoButton variant="secondary" type="button" onClick={() => setIsReminderModalOpen(false)}>
                Cancel
              </NeoButton>
              <NeoButton variant="accent-blue" type="submit">
                Set Reminder
              </NeoButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

