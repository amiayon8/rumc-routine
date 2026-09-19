import {
  DayRoutine,
  TEACHER_DIRECTORY,
  TeacherInfo,
  isNonTeachingSubject,
  is11Or12BstdClass,
  isPhysicsChemistryMathBiologyTeacher,
} from "./routine-data";

export interface SubstitutionCandidate {
  teacher: TeacherInfo;
  isSameSubject: boolean;
  isSameDept: boolean;
  takesThisClass: boolean;
  takesThisSubject: boolean;
  currentDayLoad: number;
  projectedDayLoad?: number;
  freeInPeriod: boolean;
  isOverloaded: boolean;
  score: number;
  matchReasons: string[];
  suggestedSubject: string;
}

export interface SubstitutionRequirement {
  id: string;
  sectionId: string;
  className: string;
  sectionName: string;
  periodIndex: number;
  periodName: string;
  periodTime: string;
  subject: string;
  originalSubject?: string;
  originalTeacher: TeacherInfo;
  activeSubstituteTeacher?: TeacherInfo | null;
  isAlreadySubstituted?: boolean;
  candidates: SubstitutionCandidate[];
  recommendedCandidate: SubstitutionCandidate | null;
  assignedCandidate?: SubstitutionCandidate | null;
  isMultiTeacher?: boolean;
  isAllAbsent?: boolean;
  coTeachersPresent?: string[];
  allOriginalTeacherCodes?: string[];
  multiTeacherSlotIndex?: number;
}

export interface TeacherLoadSummary {
  teacher: TeacherInfo;
  dailyLoads: Record<string, number>;
  totalWeekLoad: number;
  freeSlotsByDay: Record<string, number[]>; // period indices (0 to 6) where teacher is free
  status: "light" | "optimal" | "heavy" | "overloaded";
}

export function calculateTeacherLoads(
  routineData: DayRoutine[],
  customTeachers?: Record<string, TeacherInfo>,
): Record<string, TeacherLoadSummary> {
  const directory = customTeachers || TEACHER_DIRECTORY;
  const result: Record<string, TeacherLoadSummary> = {};

  Object.values(directory).forEach((t) => {
    result[t.code] = {
      teacher: t,
      dailyLoads: {
        Sunday: 0,
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
      },
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
    const busyPeriodsByTeacher: Record<string, Set<number>> = {};
    const teacherSubjects: Record<string, string> = {};

    day.sections.forEach((sec) => {
      if (!sec.isActive) return;

      sec.periods.forEach((cell, pIdx) => {
        if (!cell) return;

        const activeCode = cell.substituteTeacherCode || cell.teacherCode;
        const codes = activeCode
          .split(/[/,]/)
          .map((c) => c.trim())
          .filter(Boolean);

        codes.forEach((code) => {
          if (!busyPeriodsByTeacher[code]) {
            busyPeriodsByTeacher[code] = new Set<number>();
          }
          busyPeriodsByTeacher[code].add(pIdx);
          if (
            !teacherSubjects[code] &&
            cell.subject &&
            !isNonTeachingSubject(cell.subject, cell.isExam)
          ) {
            teacherSubjects[code] = cell.subject;
          }
        });
      });
    });

    Object.entries(busyPeriodsByTeacher).forEach(([code, periodSet]) => {
      if (!result[code]) {
        result[code] = {
          teacher: directory[code] || {
            code,
            dept: "General",
            subject: teacherSubjects[code] || "Subject",
          },
          dailyLoads: {
            Sunday: 0,
            Monday: 0,
            Tuesday: 0,
            Wednesday: 0,
            Thursday: 0,
          },
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

      const periodsCount = periodSet.size;
      result[code].dailyLoads[dayName] = periodsCount;
      result[code].totalWeekLoad += periodsCount;

      result[code].freeSlotsByDay[dayName] = result[code].freeSlotsByDay[
        dayName
      ].filter((idx) => !periodSet.has(idx));
    });
  });

  Object.values(result).forEach((summary) => {
    const avg = summary.totalWeekLoad / 5;
    if (avg >= 5) summary.status = "overloaded";
    else if (avg >= 4) summary.status = "heavy";
    else if (avg >= 2.5) summary.status = "optimal";
    else summary.status = "light";
  });

  return result;
}

export function getOccupiedTeachersInPeriod(
  dayRoutine: DayRoutine,
  periodIndex: number,
): Set<string> {
  const occupied = new Set<string>();

  dayRoutine.sections.forEach((sec) => {
    if (!sec.isActive) return;

    const cell = sec.periods[periodIndex];
    if (!cell) return;

    const activeCode = cell.substituteTeacherCode || cell.teacherCode;
    const codes = activeCode
      .split(/[/,]/)
      .map((c) => c.trim())
      .filter(Boolean);
    codes.forEach((c) => occupied.add(c));
  });

  return occupied;
}

export function buildTeacherExperienceIndex(routineData: DayRoutine[]) {
  const teacherSections: Record<string, Set<string>> = {};
  const teacherClasses: Record<string, Set<string>> = {};
  const teacherSubjects: Record<string, Set<string>> = {};

  routineData.forEach((day) => {
    day.sections.forEach((sec) => {
      sec.periods.forEach((cell) => {
        if (!cell) return;
        if (isNonTeachingSubject(cell.subject, cell.isExam)) return;

        const codes = cell.teacherCode
          .split(/[/,]/)
          .map((c) => c.trim())
          .filter(Boolean);
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

export function getTeacherSubjectForSection(
  routineData: DayRoutine[],
  teacherCode: string,
  sectionId: string,
  className?: string,
  fallbackSubject?: string,
): string {
  for (const day of routineData) {
    for (const sec of day.sections) {
      if (sec.sectionId === sectionId) {
        for (const cell of sec.periods) {
          if (
            cell &&
            !cell.substituteTeacherCode &&
            !isNonTeachingSubject(
              cell.originalSubject || cell.subject,
              cell.isExam,
            ) &&
            (cell.teacherCode === teacherCode ||
              cell.teacherCode
                .split(/[/,]/)
                .map((c) => c.trim())
                .includes(teacherCode))
          ) {
            return cell.originalSubject || cell.subject;
          }
        }
      }
    }
  }

  if (className) {
    for (const day of routineData) {
      for (const sec of day.sections) {
        if (sec.className === className) {
          for (const cell of sec.periods) {
            if (
              cell &&
              !cell.substituteTeacherCode &&
              !isNonTeachingSubject(
                cell.originalSubject || cell.subject,
                cell.isExam,
              ) &&
              (cell.teacherCode === teacherCode ||
                cell.teacherCode
                  .split(/[/,]/)
                  .map((c) => c.trim())
                  .includes(teacherCode))
            ) {
              return cell.originalSubject || cell.subject;
            }
          }
        }
      }
    }
  }

  for (const day of routineData) {
    for (const sec of day.sections) {
      for (const cell of sec.periods) {
        if (
          cell &&
          !cell.substituteTeacherCode &&
          !isNonTeachingSubject(
            cell.originalSubject || cell.subject,
            cell.isExam,
          ) &&
          (cell.teacherCode === teacherCode ||
            cell.teacherCode
              .split(/[/,]/)
              .map((c) => c.trim())
              .includes(teacherCode))
        ) {
          return cell.originalSubject || cell.subject;
        }
      }
    }
  }

  if (fallbackSubject) {
    const tokens = fallbackSubject
      .split(/[/,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const validToken = tokens.find((t) => !isNonTeachingSubject(t));
    if (validToken) return validToken;
    if (!isNonTeachingSubject(fallbackSubject)) return fallbackSubject;
  }

  return "Subject";
}

export function getMultiTeacherSubstitutionPlan({
  dayName,
  absentTeacherCodes,
  teacherAbsencePeriods,
  allowedReplacementCodes,
  routineData,
  maxDailyLoad = 5,
  teachersDirectory = TEACHER_DIRECTORY,
}: {
  dayName: string;
  absentTeacherCodes: string[];
  teacherAbsencePeriods?: Record<string, number[]>; // teacherCode -> period indices (0 to 6)
  allowedReplacementCodes?: string[]; // If omitted or empty, all non-absent teachers are eligible
  routineData: DayRoutine[];
  maxDailyLoad?: number;
  teachersDirectory?: Record<string, TeacherInfo>;
}): SubstitutionRequirement[] {
  const dayRoutine = routineData.find((d) => d.day === dayName);
  if (!dayRoutine || absentTeacherCodes.length === 0) return [];

  const teacherLoads = calculateTeacherLoads(routineData, teachersDirectory);
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
  const isTeacherAbsentInPeriod = (code: string, pIdx: number): boolean => {
    if (!absentSet.has(code)) return false;
    const specificPeriods = teacherAbsencePeriods?.[code];
    if (!specificPeriods || specificPeriods.length === 0) return true;
    return specificPeriods.includes(pIdx);
  };

  const allowedSet =
    allowedReplacementCodes && allowedReplacementCodes.length > 0
      ? new Set(allowedReplacementCodes)
      : null;

  const rawRequirements: Array<{
    id: string;
    sectionId: string;
    className: string;
    sectionName: string;
    periodIndex: number;
    periodName: string;
    periodTime: string;
    subject: string;
    originalSubject?: string;
    originalTeacher: TeacherInfo;
    activeSubstituteTeacher?: TeacherInfo | null;
    isAlreadySubstituted: boolean;
    isMultiTeacher: boolean;
    isAllAbsent: boolean;
    coTeachersPresent: string[];
    allOriginalTeacherCodes: string[];
    multiTeacherSlotIndex?: number;
  }> = [];

  dayRoutine.sections.forEach((sec) => {
    if (!sec.isActive) return;

    sec.periods.forEach((cell, pIdx) => {
      if (!cell) return;

      const rawTeacherCode = (cell.teacherCode || "").trim();
      const origCodes = rawTeacherCode
        .split(/[/,]/)
        .map((c) => c.trim())
        .filter(Boolean);
      const isMultiTeacher = origCodes.length > 1;

      if (!isMultiTeacher) {
        const singleCode = origCodes[0] || rawTeacherCode;
        const subCode = cell.substituteTeacherCode?.trim();
        const isOrigAbsent = isTeacherAbsentInPeriod(singleCode, pIdx);
        const isSubAbsent = subCode
          ? isTeacherAbsentInPeriod(subCode, pIdx)
          : false;

        if (isOrigAbsent || isSubAbsent) {
          const origTeacher = teachersDirectory[singleCode] || {
            code: singleCode,
            dept: "General",
            subject: !isNonTeachingSubject(cell.subject, cell.isExam)
              ? cell.subject
              : "Subject",
          };
          const activeSubTeacher = subCode
            ? teachersDirectory[subCode] || {
                code: subCode,
                dept: "General",
                subject: !isNonTeachingSubject(cell.subject, cell.isExam)
                  ? cell.subject
                  : "Subject",
              }
            : null;
          const originalSubject = cell.originalSubject || cell.subject;

          rawRequirements.push({
            id: `${sec.sectionId}_p${pIdx}_${singleCode}`,
            sectionId: sec.sectionId,
            className: sec.className,
            sectionName: sec.sectionName,
            periodIndex: pIdx,
            periodName: periodNames[pIdx] || `Period ${pIdx + 1}`,
            periodTime: periodTimes[pIdx] || "",
            subject: originalSubject,
            originalSubject,
            originalTeacher: origTeacher,
            activeSubstituteTeacher: activeSubTeacher,
            isAlreadySubstituted: !!cell.substituteTeacherCode,
            isMultiTeacher: false,
            isAllAbsent: false,
            coTeachersPresent: [],
            allOriginalTeacherCodes: [singleCode],
          });
        }
        return;
      }
      let currentCodes: string[] = [];
      if (cell.substituteTeacherCode) {
        if (cell.substituteTeacherCode.includes("/")) {
          currentCodes = cell.substituteTeacherCode
            .split("/")
            .map((c) => c.trim())
            .filter(Boolean);
        } else {
          currentCodes = [cell.substituteTeacherCode.trim()];
        }
      } else {
        currentCodes = [...origCodes];
      }

      const absentSlotIndices: number[] = [];
      const presentSlotIndices: number[] = [];

      if (
        currentCodes.length === 1 &&
        currentCodes[0] !== rawTeacherCode &&
        !origCodes.includes(currentCodes[0])
      ) {
        if (isTeacherAbsentInPeriod(currentCodes[0], pIdx)) {
          absentSlotIndices.push(0);
        }
      } else {
        origCodes.forEach((origCode, idx) => {
          const currCode = currentCodes[idx] || origCode;
          if (
            isTeacherAbsentInPeriod(currCode, pIdx) ||
            isTeacherAbsentInPeriod(origCode, pIdx)
          ) {
            absentSlotIndices.push(idx);
          } else {
            presentSlotIndices.push(idx);
          }
        });
      }

      if (absentSlotIndices.length === 0) return;

      const originalSubject = cell.originalSubject || cell.subject;
      const isAllAbsent =
        absentSlotIndices.length === origCodes.length ||
        (currentCodes.length === 1 && absentSlotIndices.length === 1);

      if (isAllAbsent) {
        const origTeacher: TeacherInfo = {
          code: rawTeacherCode,
          dept: "Multiple",
          subject: originalSubject,
        };
        const activeSubTeacher =
          cell.substituteTeacherCode &&
          !cell.substituteTeacherCode.includes("/")
            ? teachersDirectory[cell.substituteTeacherCode] || {
                code: cell.substituteTeacherCode,
                dept: "General",
                subject: cell.subject,
              }
            : null;

        rawRequirements.push({
          id: `${sec.sectionId}_p${pIdx}_all_${rawTeacherCode}`,
          sectionId: sec.sectionId,
          className: sec.className,
          sectionName: sec.sectionName,
          periodIndex: pIdx,
          periodName: periodNames[pIdx] || `Period ${pIdx + 1}`,
          periodTime: periodTimes[pIdx] || "",
          subject: originalSubject,
          originalSubject,
          originalTeacher: origTeacher,
          activeSubstituteTeacher: activeSubTeacher,
          isAlreadySubstituted:
            !!cell.substituteTeacherCode &&
            !cell.substituteTeacherCode.includes("/"),
          isMultiTeacher: true,
          isAllAbsent: true,
          coTeachersPresent: [],
          allOriginalTeacherCodes: origCodes,
        });
      } else {
        const coTeachersPresent = presentSlotIndices.map(
          (i) => currentCodes[i] || origCodes[i],
        );

        absentSlotIndices.forEach((slotIdx) => {
          const absentCode = origCodes[slotIdx];
          const currSlotCode = currentCodes[slotIdx] || absentCode;
          const origTeacher = teachersDirectory[absentCode] || {
            code: absentCode,
            dept: "General",
            subject: originalSubject,
          };
          const activeSubTeacher =
            currSlotCode !== absentCode
              ? teachersDirectory[currSlotCode] || {
                  code: currSlotCode,
                  dept: "General",
                  subject: originalSubject,
                }
              : null;

          rawRequirements.push({
            id: `${sec.sectionId}_p${pIdx}_slot${slotIdx}_${absentCode}`,
            sectionId: sec.sectionId,
            className: sec.className,
            sectionName: sec.sectionName,
            periodIndex: pIdx,
            periodName: periodNames[pIdx] || `Period ${pIdx + 1}`,
            periodTime: periodTimes[pIdx] || "",
            subject: originalSubject,
            originalSubject,
            originalTeacher: origTeacher,
            activeSubstituteTeacher: activeSubTeacher,
            isAlreadySubstituted: currSlotCode !== absentCode,
            isMultiTeacher: true,
            isAllAbsent: false,
            coTeachersPresent,
            allOriginalTeacherCodes: origCodes,
            multiTeacherSlotIndex: slotIdx,
          });
        });
      }
    });
  });
  const simulatedLoads: Record<string, number> = {};
  Object.keys(teacherLoads).forEach((code) => {
    simulatedLoads[code] = teacherLoads[code]?.dailyLoads[dayName] || 0;
  });
  const periodBookings: Record<number, Set<string>> = {
    0: new Set(),
    1: new Set(),
    2: new Set(),
    3: new Set(),
    4: new Set(),
    5: new Set(),
    6: new Set(),
  };
  const evaluateCandidate = (
    cand: TeacherInfo,
    req: (typeof rawRequirements)[0],
  ): SubstitutionCandidate | null => {
    if (isTeacherAbsentInPeriod(cand.code, req.periodIndex)) return null;
    if (cand.code === req.originalTeacher.code) return null;
    if (req.isAllAbsent && req.allOriginalTeacherCodes?.includes(cand.code))
      return null;
    if (req.coTeachersPresent?.includes(cand.code)) return null;
    if (
      is11Or12BstdClass(req.sectionId, req.className, req.sectionName) &&
      isPhysicsChemistryMathBiologyTeacher(cand)
    ) {
      return null;
    }

    if (allowedSet && !allowedSet.has(cand.code)) return null;
    const isCurrentSub = req.activeSubstituteTeacher?.code === cand.code;
    const occupied = getOccupiedTeachersInPeriod(dayRoutine, req.periodIndex);
    if (occupied.has(cand.code) && !isCurrentSub) return null;
    if (periodBookings[req.periodIndex]?.has(cand.code) && !isCurrentSub)
      return null;

    const candSubjects = teacherSubjects[cand.code] || new Set();
    const candClasses = teacherClasses[cand.code] || new Set();
    const candSections = teacherSections[cand.code] || new Set();

    const subjNorm = req.subject.toLowerCase().trim();
    const isSameDept =
      cand.dept.toLowerCase().trim() ===
      req.originalTeacher.dept.toLowerCase().trim();
    const candSubjectTokens = (cand.subject || "")
      .toLowerCase()
      .split(/[,/|;]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const takesThisSubject =
      candSubjects.has(subjNorm) ||
      candSubjectTokens.some(
        (token) =>
          token === subjNorm ||
          subjNorm.includes(token) ||
          token.includes(subjNorm),
      ) ||
      Array.from(candSubjects).some(
        (expSubj) =>
          expSubj === subjNorm ||
          subjNorm.includes(expSubj) ||
          expSubj.includes(subjNorm),
      );

    const takesExactSection = candSections.has(req.sectionId);
    const takesThisGradeLevel = candClasses.has(req.className);
    const takesThisClass = takesExactSection || takesThisGradeLevel;

    const currentLoad = simulatedLoads[cand.code] || 0;
    const isOverloaded = currentLoad >= maxDailyLoad;

    const matchReasons: string[] = [];
    let score = 0;
    if (isCurrentSub) {
      score += 300;
      matchReasons.push("Currently Active Substitute");
    }
    let suggestedSubject: string;

    if (req.isMultiTeacher && !req.isAllAbsent) {
      suggestedSubject = req.originalSubject || req.subject;

      score += 150;
      matchReasons.push(`Co-Teaching Support (${req.subject} maintained)`);

      if (
        cand.dept.toLowerCase().trim() ===
        req.originalTeacher.dept.toLowerCase().trim()
      ) {
        score += 40;
        matchReasons.push(`Same Department (${cand.dept})`);
      }
      if (takesThisClass) {
        score += 30;
        matchReasons.push(`Familiar with ${req.className}`);
      }
    } else if (req.isMultiTeacher && req.isAllAbsent) {
      suggestedSubject = getTeacherSubjectForSection(
        routineData,
        cand.code,
        req.sectionId,
        req.className,
        cand.subject || cand.dept || req.subject,
      );

      score += 130;
      matchReasons.push(`Full Class Cover (Subject: ${suggestedSubject})`);

      if (takesThisClass) {
        score += 40;
        matchReasons.push(`Familiar with ${req.className}`);
      }
      if (isSameDept) {
        score += 30;
        matchReasons.push(`Same Department (${cand.dept})`);
      }
    } else {
      suggestedSubject = getTeacherSubjectForSection(
        routineData,
        cand.code,
        req.sectionId,
        req.className,
        cand.subject || cand.dept || req.subject,
      );

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
        matchReasons.push(`Same Department (${cand.dept})`);
      } else {
        score += 20;
        matchReasons.push("General Substitution");
      }

      if (
        takesExactSection &&
        !matchReasons.some((r) => r.includes("Takes " + req.sectionId))
      ) {
        score += 60;
        matchReasons.push(`Takes other subjects in ${req.sectionId}`);
      } else if (
        takesThisGradeLevel &&
        !matchReasons.some((r) => r.includes(req.className))
      ) {
        score += 30;
        matchReasons.push(`Familiar with ${req.className}`);
      }
    }

    if (isOverloaded) {
      score -= 500;
      matchReasons.push(`Overload Warning (${currentLoad} classes)`);
    } else {
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
      projectedDayLoad: currentLoad + (isCurrentSub ? 0 : 1),
      freeInPeriod: true,
      isOverloaded,
      score,
      matchReasons,
      suggestedSubject,
    };
  };

  const finalRequirements: SubstitutionRequirement[] = [];

  rawRequirements.sort((a, b) => a.periodIndex - b.periodIndex);

  rawRequirements.forEach((req) => {
    const candidateList: SubstitutionCandidate[] = [];

    Object.values(teachersDirectory).forEach((cand) => {
      const evaluation = evaluateCandidate(cand, req);
      if (evaluation) {
        candidateList.push(evaluation);
      }
    });

    candidateList.sort((a, b) => b.score - a.score);

    const bestCandidate =
      candidateList.find((c) => !c.isOverloaded) || candidateList[0] || null;

    if (bestCandidate) {
      if (
        !req.isAlreadySubstituted ||
        req.activeSubstituteTeacher?.code !== bestCandidate.teacher.code
      ) {
        simulatedLoads[bestCandidate.teacher.code] =
          (simulatedLoads[bestCandidate.teacher.code] || 0) + 1;
      }
      periodBookings[req.periodIndex]?.add(bestCandidate.teacher.code);
    }

    const currentSubCandidate = req.activeSubstituteTeacher
      ? candidateList.find(
          (c) => c.teacher.code === req.activeSubstituteTeacher?.code,
        )
      : null;

    const assignedCandidate = currentSubCandidate || bestCandidate;

    finalRequirements.push({
      id: req.id,
      sectionId: req.sectionId,
      className: req.className,
      sectionName: req.sectionName,
      periodIndex: req.periodIndex,
      periodName: req.periodName,
      periodTime: req.periodTime,
      subject: req.subject,
      originalSubject: req.originalSubject,
      originalTeacher: req.originalTeacher,
      activeSubstituteTeacher: req.activeSubstituteTeacher,
      isAlreadySubstituted: req.isAlreadySubstituted,
      isMultiTeacher: req.isMultiTeacher,
      isAllAbsent: req.isAllAbsent,
      coTeachersPresent: req.coTeachersPresent,
      allOriginalTeacherCodes: req.allOriginalTeacherCodes,
      multiTeacherSlotIndex: req.multiTeacherSlotIndex,
      candidates: candidateList,
      recommendedCandidate: bestCandidate,
      assignedCandidate,
    });
  });

  return finalRequirements;
}

export function getSubstitutionRequirements(
  dayName: string,
  absentTeacherCode: string,
  routineData: DayRoutine[],
): SubstitutionRequirement[] {
  return getMultiTeacherSubstitutionPlan({
    dayName,
    absentTeacherCodes: [absentTeacherCode],
    routineData,
  });
}
