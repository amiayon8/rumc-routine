import {
  DayRoutine,
  TEACHER_DIRECTORY,
  TeacherInfo,
} from "./routine-data";

export interface SubstitutionCandidate {
  teacher: TeacherInfo;
  isSameSubject: boolean;
  isSameDept: boolean;
  takesThisClass: boolean; // Teaches this section or grade level
  takesThisSubject: boolean;
  currentDayLoad: number;
  projectedDayLoad?: number;
  freeInPeriod: boolean;
  isOverloaded: boolean;
  score: number;
  matchReasons: string[];
}

export interface SubstitutionRequirement {
  id: string; // unique identifier
  sectionId: string;
  className: string;
  sectionName: string;
  periodIndex: number;
  periodName: string;
  periodTime: string;
  subject: string;
  originalTeacher: TeacherInfo;
  candidates: SubstitutionCandidate[];
  recommendedCandidate: SubstitutionCandidate | null;
  assignedCandidate?: SubstitutionCandidate | null;
}

export interface TeacherLoadSummary {
  teacher: TeacherInfo;
  dailyLoads: Record<string, number>;
  totalWeekLoad: number;
  freeSlotsByDay: Record<string, number[]>; // period indices (0 to 6) where teacher is free
  status: "light" | "optimal" | "heavy" | "overloaded";
}

/**
 * Calculates detailed teaching loads for all teachers across the week
 */
export function calculateTeacherLoads(
  routineData: DayRoutine[]
): Record<string, TeacherLoadSummary> {
  const result: Record<string, TeacherLoadSummary> = {};

  // Initialize for all known teachers
  Object.values(TEACHER_DIRECTORY).forEach((t) => {
    result[t.code] = {
      teacher: t,
      dailyLoads: { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0 },
      totalWeekLoad: 0,
      freeSlotsByDay: {
        Sunday: [0, 1, 2, 3, 4, 5, 6],
        Monday: [0, 1, 2, 3, 4, 5, 6],
        Tuesday: [0, 1, 2, 3, 4, 5, 6],
        Wednesday: [0, 1, 2, 3, 4, 5, 6],
        Thursday: [0, 1, 2, 3, 4, 5, 6],
      },
      status: "light",
    };
  });

  routineData.forEach((day) => {
    const dayName = day.day;
    day.sections.forEach((sec) => {
      // If class is closed, don't count towards active teaching duty load
      if (!sec.isActive) return;

      sec.periods.forEach((cell, pIdx) => {
        if (!cell) return;

        // Count for active teacher (or substitute if assigned)
        const activeCode = cell.substituteTeacherCode || cell.teacherCode;

        // Handle composite codes e.g. "SJB,IJT" or "FAJ/YK/AAN"
        const codes = activeCode.split(/[/,]/).map((c) => c.trim()).filter(Boolean);

        codes.forEach((code) => {
          if (!result[code]) {
            result[code] = {
              teacher: TEACHER_DIRECTORY[code] || {
                code,
                name: `Teacher ${code}`,
                dept: "General",
                subject: cell.subject,
              },
              dailyLoads: { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0 },
              totalWeekLoad: 0,
              freeSlotsByDay: {
                Sunday: [0, 1, 2, 3, 4, 5, 6],
                Monday: [0, 1, 2, 3, 4, 5, 6],
                Tuesday: [0, 1, 2, 3, 4, 5, 6],
                Wednesday: [0, 1, 2, 3, 4, 5, 6],
                Thursday: [0, 1, 2, 3, 4, 5, 6],
              },
              status: "light",
            };
          }

          result[code].dailyLoads[dayName] = (result[code].dailyLoads[dayName] || 0) + 1;
          result[code].totalWeekLoad += 1;

          // Remove period from free slots
          result[code].freeSlotsByDay[dayName] = result[code].freeSlotsByDay[dayName].filter(
            (idx) => idx !== pIdx
          );
        });
      });
    });
  });

  // Assign load status
  Object.values(result).forEach((summary) => {
    const avg = summary.totalWeekLoad / 5;
    if (avg >= 5) summary.status = "overloaded";
    else if (avg >= 4) summary.status = "heavy";
    else if (avg >= 2.5) summary.status = "optimal";
    else summary.status = "light";
  });

  return result;
}

/**
 * Finds which teachers are occupied in a specific day and period
 */
export function getOccupiedTeachersInPeriod(
  dayRoutine: DayRoutine,
  periodIndex: number
): Set<string> {
  const occupied = new Set<string>();

  dayRoutine.sections.forEach((sec) => {
    // If the class is closed, the teachers of this class are NOT occupied!
    if (!sec.isActive) return;

    const cell = sec.periods[periodIndex];
    if (!cell) return;

    const activeCode = cell.substituteTeacherCode || cell.teacherCode;
    const codes = activeCode.split(/[/,]/).map((c) => c.trim()).filter(Boolean);
    codes.forEach((c) => occupied.add(c));
  });

  return occupied;
}

/**
 * Builds an index of which teachers take which sections, classes, and subjects
 */
export function buildTeacherExperienceIndex(routineData: DayRoutine[]) {
  // teacherCode -> Set of sectionIds (e.g. "9A", "10B")
  const teacherSections: Record<string, Set<string>> = {};
  // teacherCode -> Set of classNames (e.g. "Class 9", "Class 10")
  const teacherClasses: Record<string, Set<string>> = {};
  // teacherCode -> Set of normalized subjects
  const teacherSubjects: Record<string, Set<string>> = {};

  routineData.forEach((day) => {
    day.sections.forEach((sec) => {
      sec.periods.forEach((cell) => {
        if (!cell) return;
        const codes = cell.teacherCode.split(/[/,]/).map((c) => c.trim()).filter(Boolean);
        const subj = cell.subject.toLowerCase().trim();

        codes.forEach((code) => {
          if (!teacherSections[code]) teacherSections[code] = new Set();
          if (!teacherClasses[code]) teacherClasses[code] = new Set();
          if (!teacherSubjects[code]) teacherSubjects[code] = new Set();

          teacherSections[code].add(sec.sectionId);
          teacherClasses[code].add(sec.className);
          teacherSubjects[code].add(subj);
        });
      });
    });
  });

  return { teacherSections, teacherClasses, teacherSubjects };
}

/**
 * Intelligent Multi-Teacher Substitution Solver:
 * 1. Checks which teachers take the selected classes and subjects
 * 2. Checks current and projected daily workloads
 * 3. Solves globally across all periods without period collisions and without overloading teachers
 */
export function getMultiTeacherSubstitutionPlan({
  dayName,
  absentTeacherCodes,
  allowedReplacementCodes,
  routineData,
  maxDailyLoad = 5,
}: {
  dayName: string;
  absentTeacherCodes: string[];
  allowedReplacementCodes?: string[]; // If omitted or empty, all non-absent teachers are eligible
  routineData: DayRoutine[];
  maxDailyLoad?: number;
}): SubstitutionRequirement[] {
  const dayRoutine = routineData.find((d) => d.day === dayName);
  if (!dayRoutine || absentTeacherCodes.length === 0) return [];

  const teacherLoads = calculateTeacherLoads(routineData);
  const { teacherSections, teacherClasses, teacherSubjects } =
    buildTeacherExperienceIndex(routineData);

  const periodNames = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];
  const periodTimes = [
    "7.30-8.10",
    "8.10-8.45",
    "8.45-9.20",
    "9.20-9.55",
    "10.25-11.00",
    "11.00-11.35",
    "11.35-12.10",
  ];

  const absentSet = new Set(absentTeacherCodes);
  const allowedSet =
    allowedReplacementCodes && allowedReplacementCodes.length > 0
      ? new Set(allowedReplacementCodes)
      : null;

  // 1. Gather all affected periods across all absent teachers
  const rawRequirements: Array<{
    id: string;
    sectionId: string;
    className: string;
    sectionName: string;
    periodIndex: number;
    periodName: string;
    periodTime: string;
    subject: string;
    originalTeacher: TeacherInfo;
  }> = [];

  dayRoutine.sections.forEach((sec) => {
    // If class is suspended/closed, no substitution is needed
    if (!sec.isActive) return;

    sec.periods.forEach((cell, pIdx) => {
      if (!cell) return;

      const activeCode = cell.substituteTeacherCode || cell.teacherCode;
      const codes = activeCode.split(/[/,]/).map((c) => c.trim());

      // Check if any of the absent teachers are scheduled in this cell
      const matchedAbsent = codes.find((c) => absentSet.has(c));
      if (matchedAbsent) {
        const teacher = TEACHER_DIRECTORY[matchedAbsent] || {
          code: matchedAbsent,
          name: `Teacher ${matchedAbsent}`,
          dept: "General",
          subject: cell.subject,
        };

        rawRequirements.push({
          id: `${sec.sectionId}_p${pIdx}_${matchedAbsent}`,
          sectionId: sec.sectionId,
          className: sec.className,
          sectionName: sec.sectionName,
          periodIndex: pIdx,
          periodName: periodNames[pIdx] || `Period ${pIdx + 1}`,
          periodTime: periodTimes[pIdx] || "",
          subject: cell.subject,
          originalTeacher: teacher,
        });
      }
    });
  });

  // Track dynamic workloads and period bookings during assignment
  const simulatedLoads: Record<string, number> = {};
  Object.keys(teacherLoads).forEach((code) => {
    simulatedLoads[code] = teacherLoads[code]?.dailyLoads[dayName] || 0;
  });

  // periodIndex -> Set of teacher codes assigned as substitutes in that period
  const periodBookings: Record<number, Set<string>> = {
    0: new Set(),
    1: new Set(),
    2: new Set(),
    3: new Set(),
    4: new Set(),
    5: new Set(),
    6: new Set(),
  };

  // Helper to score a candidate for a specific requirement
  const evaluateCandidate = (
    cand: TeacherInfo,
    req: (typeof rawRequirements)[0]
  ): SubstitutionCandidate | null => {
    // Cannot assign if teacher is absent
    if (absentSet.has(cand.code)) return null;

    // Cannot assign if not in allowed pool
    if (allowedSet && !allowedSet.has(cand.code)) return null;

    // Check if occupied in this period in regular schedule
    const occupied = getOccupiedTeachersInPeriod(dayRoutine, req.periodIndex);
    if (occupied.has(cand.code)) return null;

    // Check if already booked as substitute in this same period
    if (periodBookings[req.periodIndex]?.has(cand.code)) return null;

    const candSubjects = teacherSubjects[cand.code] || new Set();
    const candClasses = teacherClasses[cand.code] || new Set();
    const candSections = teacherSections[cand.code] || new Set();

    const subjNorm = req.subject.toLowerCase().trim();
    const isSameDept =
      cand.dept.toLowerCase().trim() === req.originalTeacher.dept.toLowerCase().trim();
    const takesThisSubject =
      candSubjects.has(subjNorm) ||
      cand.subject.toLowerCase().includes(subjNorm) ||
      subjNorm.includes(cand.subject.toLowerCase());

    const takesExactSection = candSections.has(req.sectionId);
    const takesThisGradeLevel = candClasses.has(req.className);
    const takesThisClass = takesExactSection || takesThisGradeLevel;

    const currentLoad = simulatedLoads[cand.code] || 0;
    const isOverloaded = currentLoad >= maxDailyLoad;

    const matchReasons: string[] = [];
    let score = 0;

    // 1. Takes this exact class & subject
    if (takesExactSection && takesThisSubject) {
      score += 250;
      matchReasons.push(`Takes ${req.sectionId} ${req.subject}`);
    } else if (takesThisGradeLevel && takesThisSubject) {
      score += 190;
      matchReasons.push(`Takes ${req.className} ${req.subject}`);
    } else if (takesThisSubject) {
      score += 130;
      matchReasons.push(`Teaches ${req.subject}`);
    } else if (isSameDept) {
      score += 70;
      matchReasons.push(`Same Dept (${cand.dept})`);
    } else {
      score += 10;
      matchReasons.push("Available Faculty");
    }

    // 2. Workload & Overload Protection
    if (isOverloaded) {
      score -= 500; // Strong penalty to avoid overload
      matchReasons.push(`Overload Warning (${currentLoad} classes)`);
    } else {
      // Reward lower workload to balance teaching duties evenly
      score += Math.max(0, (maxDailyLoad - currentLoad) * 25);
      matchReasons.push(`Current load: ${currentLoad} classes`);
    }

    return {
      teacher: cand,
      isSameSubject: takesThisSubject,
      isSameDept,
      takesThisClass,
      takesThisSubject,
      currentDayLoad: teacherLoads[cand.code]?.dailyLoads[dayName] || 0,
      projectedDayLoad: currentLoad + 1,
      freeInPeriod: true,
      isOverloaded,
      score,
      matchReasons,
    };
  };

  // Build the complete requirements with ranked candidate lists and optimal assignments
  const finalRequirements: SubstitutionRequirement[] = [];

  // Sort raw requirements by period first for predictable chronological scheduling
  rawRequirements.sort((a, b) => a.periodIndex - b.periodIndex);

  rawRequirements.forEach((req) => {
    const candidateList: SubstitutionCandidate[] = [];

    Object.values(TEACHER_DIRECTORY).forEach((cand) => {
      const evaluation = evaluateCandidate(cand, req);
      if (evaluation) {
        candidateList.push(evaluation);
      }
    });

    // Sort candidate list by score descending (highest priority match & lowest load first)
    candidateList.sort((a, b) => b.score - a.score);

    // Pick recommended candidate (prefer non-overloaded first)
    const bestCandidate =
      candidateList.find((c) => !c.isOverloaded) || candidateList[0] || null;

    if (bestCandidate) {
      // Update dynamic workload tracking
      simulatedLoads[bestCandidate.teacher.code] =
        (simulatedLoads[bestCandidate.teacher.code] || 0) + 1;
      periodBookings[req.periodIndex]?.add(bestCandidate.teacher.code);
    }

    finalRequirements.push({
      id: req.id,
      sectionId: req.sectionId,
      className: req.className,
      sectionName: req.sectionName,
      periodIndex: req.periodIndex,
      periodName: req.periodName,
      periodTime: req.periodTime,
      subject: req.subject,
      originalTeacher: req.originalTeacher,
      candidates: candidateList,
      recommendedCandidate: bestCandidate,
      assignedCandidate: bestCandidate,
    });
  });

  return finalRequirements;
}

/**
 * Backward-compatible single-teacher helper
 */
export function getSubstitutionRequirements(
  dayName: string,
  absentTeacherCode: string,
  routineData: DayRoutine[]
): SubstitutionRequirement[] {
  return getMultiTeacherSubstitutionPlan({
    dayName,
    absentTeacherCodes: [absentTeacherCode],
    routineData,
  });
}
