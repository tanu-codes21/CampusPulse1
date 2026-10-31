import { GoogleGenerativeAI } from '@google/generative-ai';
import { Notice, Task, Exam, Assignment, ClubEvent } from '@/types';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;
if (apiKey && apiKey !== 'your-gemini-api-key-here') {
  genAI = new GoogleGenerativeAI(apiKey);
}

export interface ExtractedNoticeData {
  title: string;
  description: string;
  date?: string;
  time?: string;
  venue?: string;
  category: string;
  registrationDeadline?: string;
  importantInstructions: string[];
  priority: 'urgent' | 'high' | 'medium' | 'low';
  uncertainFields: string[];
}

export async function extractNoticeFromText(rawText: string): Promise<ExtractedNoticeData> {
  if (!genAI) {
    // Intelligent heuristic local parser fallback if no Gemini API key is configured yet
    return localHeuristicParse(rawText);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
You are a precise Campus Notice parser.
Analyze this raw campus message/announcement. Extract structured information.
CRITICAL RULE: NEVER invent or assume missing information. If a field is not explicitly present, return null or empty string for it, and include that field name in the "uncertainFields" list.

Analyze this text:
"""
${rawText}
"""

Return ONLY a valid JSON object with this exact shape:
{
  "title": string (concise, clear title),
  "description": string (complete description of what the notice is about),
  "date": string or null (YYYY-MM-DD format if event date exists, else null),
  "time": string or null (e.g. "10:00 AM" or "14:30"),
  "venue": string or null (hall, room, lab, or auditorium, else null),
  "category": string (One of: "Academic", "Examination", "Events & Workshops", "Placement & Internships", "Clubs & Cultural", "Administration & Fees", "Scholarships", "General"),
  "registrationDeadline": string or null (YYYY-MM-DD or date/time if specified, else null),
  "importantInstructions": string[] (array of key instructions, rules, or requirements),
  "priority": string ("urgent" | "high" | "medium" | "low"),
  "uncertainFields": string[] (list of field names where information was ambiguous or missing e.g. ["venue", "registrationDeadline"])
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return parsed;
  } catch (error) {
    console.warn('Gemini extraction failed, falling back to heuristic parser:', error);
    return localHeuristicParse(rawText);
  }
}

export async function extractNoticeFromImage(base64Data: string, mimeType: string): Promise<ExtractedNoticeData> {
  if (!genAI) {
    return {
      title: 'Poster Uploaded (Notice)',
      description: 'Extracted from visual poster. Please verify the event details below.',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      venue: 'Main Auditorium',
      category: 'Events & Workshops',
      registrationDeadline: '',
      importantInstructions: ['Carry Student ID card', 'Be seated 15 minutes prior to start time'],
      priority: 'high',
      uncertainFields: ['registrationDeadline', 'venue'],
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
Extract all structured campus event/notice information from this poster image.
CRITICAL: NEVER hallucinate missing information.
Return ONLY valid JSON matching:
{
  "title": string,
  "description": string,
  "date": string or null (YYYY-MM-DD if found),
  "time": string or null,
  "venue": string or null,
  "category": string ("Academic" | "Examination" | "Events & Workshops" | "Placement & Internships" | "Clubs & Cultural" | "Administration & Fees" | "Scholarships" | "General"),
  "registrationDeadline": string or null,
  "importantInstructions": string[],
  "priority": "urgent" | "high" | "medium" | "low",
  "uncertainFields": string[]
}
`;

    const imagePart = {
      inlineData: {
        data: base64Data.split(',')[1] || base64Data,
        mimeType: mimeType || 'image/jpeg',
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.warn('Poster vision extraction failed:', error);
    return localHeuristicParse('Campus Poster Notice');
  }
}

export async function translateNoticeContent(
  title: string,
  description: string,
  instructions: string[],
  targetLang: 'en' | 'hi'
): Promise<{ title: string; description: string; instructions: string[] }> {
  if (!genAI) {
    if (targetLang === 'hi') {
      return {
        title: `[हिंदी] ${title}`,
        description: `[हिंदी अनुवाद]: ${description}`,
        instructions: instructions.map((i) => `[हिंदी]: ${i}`),
      };
    }
    return { title, description, instructions };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
Translate the following campus notice content accurately into ${targetLang === 'hi' ? 'Hindi (Devanagari script)' : 'English'}.
Maintain academic tone and keep names, dates, venues, links, and acronyms intact.

Title: ${title}
Description: ${description}
Instructions: ${JSON.stringify(instructions)}

Return ONLY valid JSON:
{
  "title": string,
  "description": string,
  "instructions": string[]
}
`;
    const res = await model.generateContent(prompt);
    const text = res.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (e) {
    console.warn('Translation failed:', e);
    return { title, description, instructions };
  }
}

export async function summarizeNotice(title: string, description: string): Promise<string> {
  if (!genAI) {
    return `${title}: ${description.slice(0, 140)}...`;
  }
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Provide a crisp, 2-sentence student-friendly bullet summary of this campus notice:\nTitle: ${title}\nDescription: ${description}`;
    const res = await model.generateContent(prompt);
    return res.response.text().trim();
  } catch {
    return `${title}: ${description.slice(0, 140)}...`;
  }
}

export function detectDuplicateNotice(
  newTitle: string,
  newVenue: string | undefined,
  existingNotices: Notice[]
): { isDuplicate: boolean; matchedNotice?: Notice } {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const target = normalize(newTitle);

  for (const n of existingNotices) {
    const current = normalize(n.title);
    if (target === current || (target.length > 8 && current.includes(target)) || (current.length > 8 && target.includes(current))) {
      return { isDuplicate: true, matchedNotice: n };
    }
    // Check title + venue similarity
    if (newVenue && n.venue && normalize(newVenue) === normalize(n.venue) && target.slice(0, 12) === current.slice(0, 12)) {
      return { isDuplicate: true, matchedNotice: n };
    }
  }
  return { isDuplicate: false };
}

export async function queryCampusAi(
  userQuery: string,
  context: {
    notices: Notice[];
    tasks: Task[];
    exams: Exam[];
    assignments: Assignment[];
    events: ClubEvent[];
  },
  language: 'en' | 'hi' = 'en'
): Promise<string> {
  const contextSummary = `
SAVED CAMPUS NOTICES:
${context.notices.map((n) => `- [${n.category}] ${n.title} (Date: ${n.date || 'TBD'}, Venue: ${n.venue || 'TBD'}, Priority: ${n.priority}): ${n.description}`).join('\n')}

STUDENT PENDING TASKS & DEADLINES:
${context.tasks.map((t) => `- [Task: ${t.category}] ${t.title} (Due: ${t.dueDate} ${t.dueTime || ''}, Completed: ${t.isCompleted})`).join('\n')}

EXAM SCHEDULE:
${context.exams.map((e) => `- Exam: ${e.subject} (${e.courseCode || ''}) on ${e.date} at ${e.time}, Venue: ${e.venue}`).join('\n')}

ASSIGNMENT TRACKER:
${context.assignments.map((a) => `- Assignment: ${a.title} for ${a.subject} (Due: ${a.dueDate}, Status: ${a.status})`).join('\n')}

UPCOMING CLUB EVENTS:
${context.events.map((ev) => `- Event: ${ev.title} on ${ev.date} at ${ev.time}, Venue: ${ev.venue}`).join('\n')}
`;

  if (!genAI) {
    // High-quality local knowledge-base responder if API key is not configured
    return answerQueryLocally(userQuery, context, language);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
You are the CampusPulse AI Assistant for university students.
Language mode: Respond STRICTLY in ${language === 'hi' ? 'Hindi (Devanagari)' : 'English'}.

STRICT ACCURACY RULES:
1. Ground your answer ONLY in the verified data provided below.
2. DO NOT invent dates, exam rooms, deadlines, or college rules.
3. If an answer cannot be determined from the provided notices, schedules, or tasks, explicitly state that no verified record exists in CampusPulse.
4. If a notice is unverified or marked draft, make that clear.
5. Format your response cleanly with bullet points, bold key dates, and actionable advice.

VERIFIED CAMPUS KNOWLEDGE BASE:
${contextSummary}

STUDENT'S QUESTION:
"${userQuery}"
`;

    const res = await model.generateContent(prompt);
    return res.response.text();
  } catch (error) {
    console.warn('Campus AI API call failed, using local context answer:', error);
    return answerQueryLocally(userQuery, context, language);
  }
}

// Local smart answer generation fallback
function answerQueryLocally(
  q: string,
  ctx: { notices: Notice[]; tasks: Task[]; exams: Exam[]; assignments: Assignment[]; events: ClubEvent[] },
  lang: 'en' | 'hi'
): string {
  const query = q.toLowerCase();

  if (query.includes('deadline') || query.includes('due') || query.includes('pending task')) {
    const pendingTasks = ctx.tasks.filter((t) => !t.isCompleted);
    const pendingAssignments = ctx.assignments.filter((a) => a.status === 'pending');
    if (lang === 'hi') {
      return `### आपके आगामी कार्य और समय-सीमाएं:\n\n${pendingTasks.length > 0 ? pendingTasks.map((t) => `* **${t.title}** - अंतिम तिथि: ${t.dueDate} (${t.priority} प्राथमिकता)`).join('\n') : 'कोई लंबित कार्य नहीं मिला।'}\n\n**लंबित असाइनमेंट:**\n${pendingAssignments.length > 0 ? pendingAssignments.map((a) => `* **${a.title}** (${a.subject}) - अंतिम तिथि: ${a.dueDate}`).join('\n') : 'सभी असाइनमेंट पूर्ण हैं।'}`;
    }
    return `### Your Upcoming Tasks & Deadlines:\n\n${pendingTasks.length > 0 ? pendingTasks.map((t) => `* **${t.title}** — Due: ${t.dueDate} (${t.priority.toUpperCase()} priority)`).join('\n') : 'No pending tasks scheduled!'}\n\n**Assignments:**\n${pendingAssignments.length > 0 ? pendingAssignments.map((a) => `* **${a.title}** (${a.subject}) — Due: ${a.dueDate}`).join('\n') : 'All assignments are submitted or none found.'}`;
  }

  if (query.includes('exam')) {
    if (lang === 'hi') {
      return `### परीक्षा अनुसूची (Exam Schedule):\n\n${ctx.exams.length > 0 ? ctx.exams.map((e) => `* **${e.subject}**: दिनांक ${e.date} को ${e.time} बजे, स्थान: ${e.venue}`).join('\n') : 'वर्तमान में कोई परीक्षा निर्धारित नहीं है।'}`;
    }
    return `### Exam Schedule:\n\n${ctx.exams.length > 0 ? ctx.exams.map((e) => `* **${e.subject}** (${e.courseCode || 'Core'}): ${e.date} at ${e.time}, Venue: **${e.venue}**\n  *Notes: ${e.syllabusNotes || 'Standard syllabus'}*`).join('\n') : 'No exams currently scheduled in your planner.'}`;
  }

  if (query.includes('event') || query.includes('tomorrow') || query.includes('happening')) {
    if (lang === 'hi') {
      return `### आगामी कैंपस कार्यक्रम (Campus Events):\n\n${ctx.events.length > 0 ? ctx.events.map((ev) => `* **${ev.title}**: दिनांक ${ev.date} को ${ev.time} बजे, स्थान: ${ev.venue}`).join('\n') : 'कोई आगामी कार्यक्रम नहीं मिला।'}`;
    }
    return `### Upcoming Campus Events:\n\n${ctx.events.length > 0 ? ctx.events.map((ev) => `* **${ev.title}** — Date: ${ev.date} at ${ev.time}, Venue: ${ev.venue}\n  ${ev.description}`).join('\n') : 'No upcoming events recorded for the next few days.'}`;
  }

  if (query.includes('notice') || query.includes('summar')) {
    const importantNotices = ctx.notices.slice(0, 3);
    if (lang === 'hi') {
      return `### महत्वपूर्ण सूचनाओं का सारांश:\n\n${importantNotices.map((n) => `* **${n.hindiTitle || n.title}** [${n.category}]: ${n.hindiDescription || n.description.slice(0, 100)}...`).join('\n')}`;
    }
    return `### Important Notices Summary:\n\n${importantNotices.map((n) => `* **${n.title}** [${n.category}] — *${n.date || 'Active'}*:\n  ${n.description.slice(0, 120)}...`).join('\n')}`;
  }

  if (lang === 'hi') {
    return `नमस्ते! मैं आपका कैंपस पल्स सहायक हूँ। आप मुझसे अपनी परीक्षाओं, आगामी असाइनमेंट, समय-सीमाओं या नोटिस के बारे में पूछ सकते हैं।`;
  }
  return `Hello! I am your verified CampusPulse assistant. You can ask me about your exams, upcoming assignment deadlines, today's priorities, or summaries of latest official notices.`;
}

// Local heuristic rule-based extractor
function localHeuristicParse(raw: string): ExtractedNoticeData {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const title = lines[0] ? lines[0].replace(/[*_#]/g, '').slice(0, 90) : 'Campus Announcement';
  
  // Date heuristic
  const dateMatch = raw.match(/\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{4}-\d{2}-\d{2})\b/) ||
                    raw.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}(st|nd|rd|th)?,? \d{4}\b/i);
  
  // Time heuristic
  const timeMatch = raw.match(/\b\d{1,2}(:\d{2})?\s*(AM|PM|am|pm)\b/);

  // Venue heuristic
  const venueMatch = raw.match(/(?:venue|location|room|hall|auditorium|at)[:\s]+([^\n.,;]+)/i);

  // Category classification
  let category = 'General';
  const lower = raw.toLowerCase();
  if (lower.includes('exam') || lower.includes('midterm') || lower.includes('hall ticket')) category = 'Examination';
  else if (lower.includes('hackathon') || lower.includes('workshop') || lower.includes('webinar') || lower.includes('fest')) category = 'Events & Workshops';
  else if (lower.includes('placement') || lower.includes('internship') || lower.includes('ctc') || lower.includes('resume')) category = 'Placement & Internships';
  else if (lower.includes('club') || lower.includes('audition') || lower.includes('cultural')) category = 'Clubs & Cultural';
  else if (lower.includes('fee') || lower.includes('admin') || lower.includes('registrar')) category = 'Administration & Fees';
  else if (lower.includes('scholarship')) category = 'Scholarships';
  else if (lower.includes('lecture') || lower.includes('class') || lower.includes('syllabus') || lower.includes('assignment')) category = 'Academic';

  // Priority
  let priority: 'urgent' | 'high' | 'medium' | 'low' = 'medium';
  if (lower.includes('urgent') || lower.includes('mandatory') || lower.includes('immediate') || lower.includes('last date today')) priority = 'urgent';
  else if (lower.includes('important') || lower.includes('deadline') || category === 'Examination') priority = 'high';

  // Instructions
  const instructions: string[] = [];
  lines.forEach((l) => {
    if (l.match(/^[-*•\d.]/) || l.toLowerCase().includes('carry') || l.toLowerCase().includes('register') || l.toLowerCase().includes('note:')) {
      instructions.push(l.replace(/^[-*•\d.]\s*/, ''));
    }
  });

  const uncertain: string[] = [];
  if (!venueMatch) uncertain.push('venue');
  if (!dateMatch) uncertain.push('date');
  if (!timeMatch) uncertain.push('time');
  if (!lower.includes('deadline') && !lower.includes('last date')) uncertain.push('registrationDeadline');

  return {
    title,
    description: lines.slice(1).join(' ') || title,
    date: dateMatch ? dateMatch[0] : undefined,
    time: timeMatch ? timeMatch[0] : undefined,
    venue: venueMatch ? venueMatch[1].trim() : undefined,
    category,
    registrationDeadline: undefined,
    importantInstructions: instructions.length > 0 ? instructions.slice(0, 4) : ['Review notice details and verify deadlines with your department.'],
    priority,
    uncertainFields: uncertain,
  };
}

