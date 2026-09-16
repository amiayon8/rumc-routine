// RUMC English Medium Morning Shift (EMMS) 2026 Official Routine Dataset
// Parsed directly from "13 Sep_Routine EMMS 2026.pdf"

export interface RoutineCell {
  subject: string;
  teacherCode: string;
  room?: string;
  isPractical?: boolean;
  substituteTeacherCode?: string;
  substituteReason?: string;
  originalSubject?: string;
  substituteSubject?: string;
  isExam?: boolean;
}

export interface SectionRoutine {
  sectionId: string;
  className: string;
  sectionName: string;
  isActive: boolean;
  statusReason?: string;
  periods: (RoutineCell | null)[]; // 7 periods (indices 0 to 6)
}

export interface DayRoutine {
  day: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday";
  dateFormatted: string;
  sections: SectionRoutine[];
}

export interface TeacherInfo {
  code: string;
  dept: string;
  subject: string;
  phone?: string;
  email?: string;
}

export function getTodaysFormattedDate(): string {
  const now = new Date();
  return now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getTodaysFullDate(): string {
  const now = new Date();
  return now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const CANONICAL_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
] as const;

export type CanonicalDay = (typeof CANONICAL_DAYS)[number];

export function getTodaysWeekday(): CanonicalDay {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ] as const;
  const dayName = days[new Date().getDay()];
  if (dayName === "Friday" || dayName === "Saturday") {
    return "Sunday";
  }
  return dayName;
}

export const DAY_ORDER_MAP: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
};

export function sortDaysCanonical<T extends { day: string }>(days: T[]): T[] {
  return [...days].sort((a, b) => {
    const orderA = DAY_ORDER_MAP[a.day] ?? 99;
    const orderB = DAY_ORDER_MAP[b.day] ?? 99;
    return orderA - orderB;
  });
}

export interface PeriodTiming {
  index: number;
  name?: string;
  time: string;
  startTime?: string;
  endTime?: string;
  isBreak?: boolean;
}

export const DEFAULT_PERIOD_TIMINGS: PeriodTiming[] = [
  { index: 1, name: "1st Period", time: "7.30-8.10", startTime: "07:30", endTime: "08:10" },
  { index: 2, name: "2nd Period", time: "8.10-8.45", startTime: "08:10", endTime: "08:45" },
  { index: 3, name: "3rd Period", time: "8.45-9.20", startTime: "08:45", endTime: "09:20" },
  { index: 4, name: "4th Period", time: "9.20-9.55", startTime: "09:20", endTime: "09:55" },
  {
    index: 0,
    name: "Tiffin / Break",
    time: "9.55-10:25",
    isBreak: true,
    startTime: "09:55",
    endTime: "10:25",
  },
  { index: 5, name: "5th Period", time: "10.25-11.00", startTime: "10:25", endTime: "11:00" },
  { index: 6, name: "6th Period", time: "11.00-11.35", startTime: "11:00", endTime: "11:35" },
  { index: 7, name: "7th Period", time: "11.35-12.10", startTime: "11:35", endTime: "12:10" },
];

export const PERIOD_TIMINGS = DEFAULT_PERIOD_TIMINGS;

export const SECTIONS_META = [
  { id: "6A", className: "Class 6", sectionName: "A" },
  { id: "6B", className: "Class 6", sectionName: "B" },
  { id: "6C", className: "Class 6", sectionName: "C" },
  { id: "7A", className: "Class 7", sectionName: "A" },
  { id: "7B", className: "Class 7", sectionName: "B" },
  { id: "7C", className: "Class 7", sectionName: "C" },
  { id: "8A", className: "Class 8", sectionName: "A" },
  { id: "8B", className: "Class 8", sectionName: "B" },
  { id: "8C", className: "Class 8", sectionName: "C" },
  { id: "9A", className: "Class 9", sectionName: "A" },
  { id: "9B", className: "Class 9", sectionName: "B" },
  { id: "9C", className: "Class 9", sectionName: "C" },
  { id: "9Bstd", className: "Class 9", sectionName: "Bstd" },
  { id: "10A", className: "Class 10", sectionName: "A" },
  { id: "10B", className: "Class 10", sectionName: "B" },
  { id: "10C", className: "Class 10", sectionName: "C" },
  { id: "10BST", className: "Class 10", sectionName: "BST" },
  { id: "11A", className: "Class 11", sectionName: "A" },
  { id: "11B", className: "Class 11", sectionName: "B" },
  { id: "11C", className: "Class 11", sectionName: "C" },
  { id: "11BST", className: "Class 11", sectionName: "BST" },
  { id: "12A", className: "Class 12", sectionName: "A" },
  { id: "12B", className: "Class 12", sectionName: "B" },
  { id: "12C", className: "Class 12", sectionName: "C" },
  { id: "12BST", className: "Class 12", sectionName: "BST" },
];

export const TEACHER_DIRECTORY: Record<string, TeacherInfo> = {
  AA: { code: "AA", dept: "Mathematics", subject: "Math" },
  MR: { code: "MR", dept: "Physics", subject: "Physics" },
  TA: { code: "TA", dept: "Mathematics", subject: "Math" },
  NS: { code: "NS", dept: "Chemistry", subject: "Chemistry" },
  ZI: { code: "ZI", dept: "Physics", subject: "Physics" },
  GCS: { code: "GCS", dept: "Chemistry", subject: "Chemistry" },
  SM: { code: "SM", dept: "English", subject: "English" },
  IHT: { code: "IHT", dept: "English", subject: "English" },
  FF: { code: "FF", dept: "ICT", subject: "ICT" },
  LB: { code: "LB", dept: "BGS", subject: "BGS" },
  TIM: { code: "TIM", dept: "Mathematics", subject: "Math" },
  UFC: { code: "UFC", dept: "Science", subject: "Science / Home Sci" },
  MSF: { code: "MSF", dept: "Biology", subject: "Biology" },
  FAJ: { code: "FAJ", dept: "Biology", subject: "Biology / Science" },
  MAM: { code: "MAM", dept: "English", subject: "English" },
  NR: { code: "NR", dept: "Mathematics", subject: "Math" },
  DR: { code: "DR", dept: "Bangla", subject: "Bangla" },
  DRD: { code: "DRD", dept: "Religion", subject: "Religion (Hindu)" },
  AB: { code: "AB", dept: "Religion", subject: "Religion (Islam)" },
  MU: { code: "MU", dept: "BGS", subject: "BGS" },
  RMMH: { code: "RMMH", dept: "Religion", subject: "Religion (Islam)" },
  AAB: { code: "AAB", dept: "English", subject: "English / Religion" },
  SZK: { code: "SZK", dept: "Mathematics", subject: "Math" },
  MN: { code: "MN", dept: "Bangla", subject: "Bangla" },
  MRC: { code: "MRC", dept: "ICT", subject: "ICT" },
  MHM: { code: "MHM", dept: "Bangla", subject: "Bangla" },
  SJB: { code: "SJB", dept: "Physical Education", subject: "P.Ed" },
  IJT: { code: "IJT", dept: "Arts & Crafts", subject: "Arts / P.Ed" },
  TAM: { code: "TAM", dept: "BGS", subject: "BGS" },
  TU: { code: "TU", dept: "Physics", subject: "Physics" },
  LYM: { code: "LYM", dept: "Mathematics", subject: "Math" },
  MS: { code: "MS", dept: "Bangla", subject: "Bangla" },
  NC: { code: "NC", dept: "Physics", subject: "Physics" },
  MNI: { code: "MNI", dept: "Mathematics", subject: "Math" },
  MHN: { code: "MHN", dept: "Commerce", subject: "Accounting" },
  TAH: { code: "TAH", dept: "Commerce", subject: "Finance & Banking" },
  MHK: { code: "MHK", dept: "Commerce", subject: "Business Org" },
  MSA: { code: "MSA", dept: "Bangla", subject: "Bangla" },
  MZI: { code: "MZI", dept: "Chemistry", subject: "Chemistry" },
  MHA: { code: "MHA", dept: "Bangla", subject: "Bangla" },
  RAI: { code: "RAI", dept: "ICT", subject: "ICT" },
  SJ: { code: "SJ", dept: "Biology", subject: "Biology" },
  MRN: { code: "MRN", dept: "Chemistry", subject: "Chemistry" },
  YK: { code: "YK", dept: "Statistics", subject: "Statistics / Math" },
  AAN: { code: "AAN", dept: "Technical", subject: "Engineering Drw / Math" },
  SRY: { code: "SRY", dept: "Science", subject: "Science / Agriculture" },
  SA: { code: "SA", dept: "BGS", subject: "BGS / Agriculture" },
  ARH: { code: "ARH", dept: "Languages", subject: "Language Lab" },
  AAM: { code: "AAM", dept: "Library", subject: "Library" },
  RHR: { code: "RHR", dept: "English", subject: "English" },
  RTM: { code: "RTM", dept: "English", subject: "English" },
  ASM: { code: "ASM", dept: "English", subject: "English" },
  KI: { code: "KI", dept: "English", subject: "English" },
  CM: { code: "CM", dept: "Bangla", subject: "Bangla" },
  ZC: { code: "ZC", dept: "Chemistry", subject: "Chemistry / Science" },
  ZUR: { code: "ZUR", dept: "Mathematics", subject: "Math" },
};

/**
 * Checks if a subject string or cell represents an exam, revision session,
 * or non-teaching period that should NOT be counted as an official teaching subject
 * for a teacher from the routine grid.
 */
export function isNonTeachingSubject(
  subject?: string | null,
  isExam?: boolean
): boolean {
  if (isExam) return true;
  if (!subject) return true;

  const normalized = subject.trim().toLowerCase();
  if (!normalized) return true;

  // Catch ALL exams and tests across all subjects (e.g., "Math Exam", "Eng 1 Exam", "Sci Exam", "Ban Exam", "Class Test", etc.)
  if (
    normalized.includes("exam") ||
    normalized.includes("examination") ||
    /\b(test|quiz|assessment|eval|evaluation|midterm|final|ct)\b/i.test(
      normalized
    )
  ) {
    return true;
  }

  // Revision / review class matches (e.g., "Rev class", "Rev.", "Revision", "Review")
  if (
    /\b(rev|rev\.|revision|review)\b/i.test(
      normalized
    )
  ) {
    return true;
  }

  // Non-academic duties or routine placeholders
  if (
    /^(assembly|break|tiffin|recess|free|off|meeting|event|sports(\s*day)?|study|zero\s*period)$/i.test(
      normalized
    )
  ) {
    return true;
  }

  return false;
}
