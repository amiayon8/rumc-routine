// RUMC English Medium Morning Shift (EMMS) 2026 Official Routine Dataset
// Parsed directly from "13 Sep_Routine EMMS 2026.pdf"

export interface RoutineCell {
  subject: string;
  teacherCode: string;
  room?: string;
  isPractical?: boolean;
  substituteTeacherCode?: string;
  substituteReason?: string;
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
  name: string;
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
  sunday: 0,
  Monday: 1,
  monday: 1,
  Tuesday: 2,
  tuesday: 2,
  Wednesday: 3,
  wednesday: 3,
  Thursday: 4,
  thursday: 4,
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
  name: string;
  time: string;
  startTime?: string;
  endTime?: string;
  isBreak?: boolean;
}

export const DEFAULT_PERIOD_TIMINGS: PeriodTiming[] = [
  { index: 1, name: "1st", time: "7.30-8.10", startTime: "07:30", endTime: "08:10" },
  { index: 2, name: "2nd", time: "8.10-8.45", startTime: "08:10", endTime: "08:45" },
  { index: 3, name: "3rd", time: "8.45-9.20", startTime: "08:45", endTime: "09:20" },
  { index: 4, name: "4th", time: "9.20-9.55", startTime: "09:20", endTime: "09:55" },
  { index: 0, name: "Break", time: "9.55-10:25", isBreak: true, startTime: "09:55", endTime: "10:25" },
  { index: 5, name: "5th", time: "10.25-11.00", startTime: "10:25", endTime: "11:00" },
  { index: 6, name: "6th", time: "11.00-11.35", startTime: "11:00", endTime: "11:35" },
  { index: 7, name: "7th", time: "11.35-12.10", startTime: "11:35", endTime: "12:10" },
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
  AA: { code: "AA", name: "Md. Abdullah Al-Amin", dept: "Mathematics", subject: "Math" },
  MR: { code: "MR", name: "Prof. Mahmudur Rahman", dept: "Physics", subject: "Physics" },
  TA: { code: "TA", name: "Tanvir Ahmed", dept: "Mathematics", subject: "Math" },
  NS: { code: "NS", name: "Dr. Nasreen Sultana", dept: "Chemistry", subject: "Chemistry" },
  ZI: { code: "ZI", name: "Md. Ziaul Islam", dept: "Physics", subject: "Physics" },
  GCS: { code: "GCS", name: "Gobinda Chandra Saha", dept: "Chemistry", subject: "Chemistry" },
  SM: { code: "SM", name: "Sayeed Mahmud", dept: "English", subject: "English" },
  IHT: { code: "IHT", name: "Imtiaz Hassan Talukder", dept: "English", subject: "English" },
  FF: { code: "FF", name: "Fariha Ferdous", dept: "ICT", subject: "ICT" },
  LB: { code: "LB", name: "Laila Bilkis", dept: "BGS", subject: "BGS" },
  TIM: { code: "TIM", name: "Tariqul Islam Mondol", dept: "Mathematics", subject: "Math" },
  UFC: { code: "UFC", name: "Umme Fatema Chowdhury", dept: "Science", subject: "Science / Home Sci" },
  MSF: { code: "MSF", name: "Md. Sajjad Farooqi", dept: "Biology", subject: "Biology" },
  FAJ: { code: "FAJ", name: "Farzana Akter Jahan", dept: "Biology", subject: "Biology / Science" },
  MAM: { code: "MAM", name: "Md. Abdul Mannan", dept: "English", subject: "English" },
  NR: { code: "NR", name: "Nurul Rashid", dept: "Mathematics", subject: "Math" },
  DR: { code: "DR", name: "Dilruba Rahman", dept: "Bangla", subject: "Bangla" },
  DRD: { code: "DRD", name: "Dipti Rani Das", dept: "Religion", subject: "Religion (Hindu)" },
  AB: { code: "AB", name: "Abdul Basit", dept: "Religion", subject: "Religion (Islam)" },
  MU: { code: "MU", name: "Mokhlesur Rahman", dept: "BGS", subject: "BGS" },
  RMMH: { code: "RMMH", name: "Rashed Mahmud Mohsin", dept: "Religion", subject: "Religion (Islam)" },
  AAB: { code: "AAB", name: "Ali Ahmed Bhuiyan", dept: "English", subject: "English / Religion" },
  SZK: { code: "SZK", name: "Shahidul Zaman Khan", dept: "Mathematics", subject: "Math" },
  MN: { code: "MN", name: "Mahbubur Nur", dept: "Bangla", subject: "Bangla" },
  MRC: { code: "MRC", name: "M. R. Chowdhury", dept: "ICT", subject: "ICT" },
  MHM: { code: "MHM", name: "Mirza Hasibul Morshed", dept: "Bangla", subject: "Bangla" },
  SJB: { code: "SJB", name: "Sujit Barua", dept: "Physical Education", subject: "P.Ed" },
  IJT: { code: "IJT", name: "Israt Jahan Tithi", dept: "Arts & Crafts", subject: "Arts / P.Ed" },
  TAM: { code: "TAM", name: "Tahsina Akter Mitu", dept: "BGS", subject: "BGS" },
  TU: { code: "TU", name: "Taufiq Umar", dept: "Physics", subject: "Physics" },
  LYM: { code: "LYM", name: "Lutfunnessa Yasmin", dept: "Mathematics", subject: "Math" },
  MS: { code: "MS", name: "Mahmudul Shakil", dept: "Bangla", subject: "Bangla" },
  NC: { code: "NC", name: "Nazrul Chowdhury", dept: "Physics", subject: "Physics" },
  MNI: { code: "MNI", name: "Md. Nazrul Islam", dept: "Mathematics", subject: "Math" },
  MHN: { code: "MHN", name: "Mahmuda Hasan", dept: "Commerce", subject: "Accounting" },
  TAH: { code: "TAH", name: "Tarek Ahmed", dept: "Commerce", subject: "Finance & Banking" },
  MHK: { code: "MHK", name: "Md. Hasibur Khan", dept: "Commerce", subject: "Business Org" },
  MSA: { code: "MSA", name: "Md. Shahinur Alam", dept: "Bangla", subject: "Bangla" },
  MZI: { code: "MZI", name: "Md. Zillur Islam", dept: "Chemistry", subject: "Chemistry" },
  MHA: { code: "MHA", name: "Mahfuzur Haque", dept: "Bangla", subject: "Bangla" },
  RAI: { code: "RAI", name: "Rabiul Alam", dept: "ICT", subject: "ICT" },
  SJ: { code: "SJ", name: "Suraiya Jahan", dept: "Biology", subject: "Biology" },
  MRN: { code: "MRN", name: "Mizanur Rahman", dept: "Chemistry", subject: "Chemistry" },
  YK: { code: "YK", name: "Yousuf Khan", dept: "Statistics", subject: "Statistics / Math" },
  AAN: { code: "AAN", name: "Ashraful Anam", dept: "Technical", subject: "Engineering Drw / Math" },
  SRY: { code: "SRY", name: "Shamima R. Yasmin", dept: "Science", subject: "Science / Agriculture" },
  SA: { code: "SA", name: "Shahidul Alam", dept: "BGS", subject: "BGS / Agriculture" },
  ARH: { code: "ARH", name: "Abdur Rashid", dept: "Languages", subject: "Language Lab" },
  AAM: { code: "AAM", name: "Abdullah Al Masud", dept: "Library", subject: "Library" },
  RHR: { code: "RHR", name: "Rashedul Haque", dept: "English", subject: "English" },
  RTM: { code: "RTM", name: "Rifat Tasnim", dept: "English", subject: "English" },
  ASM: { code: "ASM", name: "Abu Sayeed", dept: "English", subject: "English" },
  KI: { code: "KI", name: "Kamrul Islam", dept: "English", subject: "English" },
  CM: { code: "CM", name: "Chitta Majumder", dept: "Bangla", subject: "Bangla" },
  ZC: { code: "ZC", name: "Ziaur Chowdhury", dept: "Chemistry", subject: "Chemistry / Science" },
  ZUR: { code: "ZUR", name: "Ziaur Rahman", dept: "Mathematics", subject: "Math" },
};
