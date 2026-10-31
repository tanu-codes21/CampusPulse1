import { jsPDF } from 'jspdf';
import { Task, Exam, Assignment } from '@/types';

export function exportAcademicPlannerPDF(
  studentName: string,
  tasks: Task[],
  exams: Exam[],
  assignments: Assignment[]
) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(34, 40, 49); // Deep Charcoal
  doc.text('CampusPulse', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Muted Slate
  doc.text('Paste the clutter. Master your day. | Academic Schedule & Planner', 14, 27);
  doc.text(`Student: ${studentName || 'Student'} | Generated: ${new Date().toLocaleDateString()}`, 14, 33);

  doc.setDrawColor(229, 231, 235);
  doc.line(14, 37, 196, 37);

  let y = 46;

  // 1. Upcoming Exams
  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246); // Blue
  doc.text('1. Upcoming Examinations', 14, y);
  y += 7;

  if (exams.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('No exams currently scheduled.', 18, y);
    y += 10;
  } else {
    exams.forEach((exam) => {
      doc.setFontSize(11);
      doc.setTextColor(34, 40, 49);
      doc.text(`* ${exam.subject} (${exam.courseCode || 'Core'})`, 18, y);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`  Date: ${exam.date} | Time: ${exam.time} | Venue: ${exam.venue}`, 18, y + 5);
      if (exam.syllabusNotes) {
        doc.text(`  Syllabus / Notes: ${exam.syllabusNotes}`, 18, y + 10);
        y += 16;
      } else {
        y += 12;
      }
    });
  }

  y += 6;

  // 2. Pending Tasks & Priorities
  doc.setFontSize(14);
  doc.setTextColor(6, 182, 212); // Cyan
  doc.text('2. Pending Tasks & Priorities', 14, y);
  y += 7;

  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  if (pendingTasks.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('All tasks completed! Great work.', 18, y);
    y += 10;
  } else {
    pendingTasks.forEach((task) => {
      doc.setFontSize(10);
      doc.setTextColor(34, 40, 49);
      doc.text(`[ ] ${task.title} - Due: ${task.dueDate} ${task.dueTime || ''} (${task.priority.toUpperCase()})`, 18, y);
      y += 6;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
  }

  y += 8;

  // 3. Assignments Tracker
  doc.setFontSize(14);
  doc.setTextColor(217, 70, 239); // Magenta
  doc.text('3. Assignment Tracker', 14, y);
  y += 7;

  if (assignments.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('No active assignments found.', 18, y);
  } else {
    assignments.forEach((assignment) => {
      doc.setFontSize(10);
      doc.setTextColor(34, 40, 49);
      doc.text(`* ${assignment.title} - ${assignment.subject} | Due: ${assignment.dueDate} | Status: ${assignment.status}`, 18, y);
      y += 6;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(160, 174, 192);
  doc.text('Generated with CampusPulse - Smart Student Productivity Platform', 14, 285);

  doc.save(`CampusPulse-Academic-Schedule-${new Date().toISOString().split('T')[0]}.pdf`);
}

