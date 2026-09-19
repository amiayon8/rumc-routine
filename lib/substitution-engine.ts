import {
  DayRoutine,
  TEACHER_DIRECTORY,
  TeacherInfo,
  isNonTeachingSubject,
  is11Or12BstdClass,
  isPhysicsChemistryMathBiologyTeacher,
  isPracticalSubject,
  cleanPracticalSubject,
  is9Or10BstdClass,
  is11Or12Class,
  formatSubjectForSection,
  isExcludedSubstituteTeacher,
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
  consecutiveClassesCount: number;
  consecutiveNoBreakCount: number;
  consecutiveWarning?: string;
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
            const candidateSubject = cleanPracticalSubject(
              cell.originalSubject || cell.subject,
            );
            if (candidateSubject && !isNonTeachingSubject(candidateSubject)) {
              return formatSubjectForSection(
                candidateSubject,
                sectionId,
                className,
              );
            }
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
              const candidateSubject = cleanPracticalSubject(
                cell.originalSubject || cell.subject,
              );
              if (candidateSubject && !isNonTeachingSubject(candidateSubject)) {
                return formatSubjectForSection(
                  candidateSubject,
                  sectionId,
                  className,
                );
              }
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
          const candidateSubject = cleanPracticalSubject(
            cell.originalSubject || cell.subject,
          );
          if (candidateSubject && !isNonTeachingSubject(candidateSubject)) {
            return formatSubjectForSection(
              candidateSubject,
              sectionId,
              className,
            );
          }
        }
      }
    }
  }

  if (fallbackSubject) {
    const tokens = fallbackSubject
      .split(/[/,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const validToken = tokens.find((t) => {
      const cleaned = cleanPracticalSubject(t);
      return cleaned && !isNonTeachingSubject(cleaned);
    });
    if (validToken) {
      const cleaned = cleanPracticalSubject(validToken);
      if (cleaned && !isNonTeachingSubject(cleaned)) {
        return formatSubjectForSection(cleaned, sectionId, className);
      }
      return formatSubjectForSection(validToken, sectionId, className);
    }
    const cleanedFallback = cleanPracticalSubject(fallbackSubject);
    if (cleanedFallback && !isNonTeachingSubject(cleanedFallback)) {
      return formatSubjectForSection(cleanedFallback, sectionId, className);
    }
  }

  return formatSubjectForSection("Subject", sectionId, className);
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
          const formattedOriginalSubject = formatSubjectForSection(
            originalSubject,
            sec.sectionId,
            sec.className,
            sec.sectionName,
          );
          const cleanedSubject = formatSubjectForSection(
            cleanPracticalSubject(formattedOriginalSubject) ||
              formattedOriginalSubject,
            sec.sectionId,
            sec.className,
            sec.sectionName,
          );

          rawRequirements.push({
            id: `${sec.sectionId}_p${pIdx}_${singleCode}`,
            sectionId: sec.sectionId,
            className: sec.className,
            sectionName: sec.sectionName,
            periodIndex: pIdx,
            periodName: periodNames[pIdx] || `Period ${pIdx + 1}`,
            periodTime: periodTimes[pIdx] || "",
            subject: cleanedSubject,
            originalSubject: formattedOriginalSubject,
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
      const formattedOriginalSubject = formatSubjectForSection(
        originalSubject,
        sec.sectionId,
        sec.className,
        sec.sectionName,
      );
      const cleanedSubject = formatSubjectForSection(
        cleanPracticalSubject(formattedOriginalSubject) ||
          formattedOriginalSubject,
        sec.sectionId,
        sec.className,
        sec.sectionName,
      );
      const isAllAbsent =
        absentSlotIndices.length === origCodes.length ||
        (currentCodes.length === 1 && absentSlotIndices.length === 1);

      if (isAllAbsent) {
        const origTeacher: TeacherInfo = {
          code: rawTeacherCode,
          dept: "Multiple",
          subject: cleanedSubject,
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
          subject: cleanedSubject,
          originalSubject: formattedOriginalSubject,
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
            subject: formattedOriginalSubject,
          };
          const activeSubTeacher =
            currSlotCode !== absentCode
              ? teachersDirectory[currSlotCode] || {
                  code: currSlotCode,
                  dept: "General",
                  subject: formattedOriginalSubject,
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
            subject: cleanedSubject,
            originalSubject: formattedOriginalSubject,
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

  const teacherScheduledPeriods: Record<string, Set<number>> = {};
  Object.keys(teachersDirectory).forEach((code) => {
    teacherScheduledPeriods[code] = new Set<number>();
  });

  dayRoutine.sections.forEach((sec) => {
    if (!sec.isActive) return;

    sec.periods.forEach((cell, pIdx) => {
      if (!cell) return;

      const activeCode = cell.substituteTeacherCode || cell.teacherCode;
      const codes = activeCode
        .split(/[/,]/)
        .map((c) => c.trim())
        .filter(Boolean);

      codes.forEach((code) => {
        if (!isTeacherAbsentInPeriod(code, pIdx)) {
          if (!teacherScheduledPeriods[code]) {
            teacherScheduledPeriods[code] = new Set<number>();
          }
          teacherScheduledPeriods[code].add(pIdx);
        }
      });
    });
  });

  const calculateConsecutiveStatus = (
    teacherCode: string,
    targetPeriod: number,
  ) => {
    const prospectivePeriods = new Set(
      teacherScheduledPeriods[teacherCode] || [],
    );
    prospectivePeriods.add(targetPeriod);

    let leftIndex = targetPeriod;
    while (leftIndex > 0 && prospectivePeriods.has(leftIndex - 1)) {
      leftIndex--;
    }

    let rightIndex = targetPeriod;
    while (rightIndex < 6 && prospectivePeriods.has(rightIndex + 1)) {
      rightIndex++;
    }

    const consecutiveClassesCount = rightIndex - leftIndex + 1;

    let leftNoBreak = targetPeriod;
    const blockStart = targetPeriod <= 3 ? 0 : 4;
    while (leftNoBreak > blockStart && prospectivePeriods.has(leftNoBreak - 1)) {
      leftNoBreak--;
    }

    let rightNoBreak = targetPeriod;
    const blockEnd = targetPeriod <= 3 ? 3 : 6;
    while (rightNoBreak < blockEnd && prospectivePeriods.has(rightNoBreak + 1)) {
      rightNoBreak++;
    }

    const consecutiveNoBreakCount = rightNoBreak - leftNoBreak + 1;

    return {
      consecutiveClassesCount,
      consecutiveNoBreakCount,
    };
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
    if (isExcludedSubstituteTeacher(cand.code)) return null;
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
    let isSameDept =
      cand.dept.toLowerCase().trim() ===
      req.originalTeacher.dept.toLowerCase().trim();
    const candSubjectTokens = (cand.subject || "")
      .toLowerCase()
      .split(/[,/|;]/)
      .map((s) => s.trim())
      .filter(Boolean);

    let takesThisSubject =
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

    const is9Or10Bstd = is9Or10BstdClass(
      req.sectionId,
      req.className,
      req.sectionName,
    );
    const isScienceTarget =
      subjNorm === "science" ||
      subjNorm === "sci" ||
      subjNorm === "g sci" ||
      subjNorm === "general science";

    if (is9Or10Bstd && isScienceTarget) {
      const candDeptNorm = cand.dept.toLowerCase().trim();
      const candIsScienceField =
        candDeptNorm === "science" ||
        candDeptNorm === "physics" ||
        candDeptNorm === "chemistry" ||
        candDeptNorm === "biology" ||
        candSubjectTokens.some((t) =>
          [
            "science",
            "physics",
            "chemistry",
            "biology",
            "sci",
            "phy",
            "chem",
            "bio",
          ].includes(t),
        );
      if (candIsScienceField) {
        takesThisSubject = true;
        isSameDept = true;
      }
    }

    const isMathTarget =
      subjNorm === "math" ||
      subjNorm === "mathematics" ||
      subjNorm === "h.math" ||
      subjNorm === "higher math";

    if (
      (is9Or10Bstd || is11Or12Class(req.sectionId, req.className)) &&
      isMathTarget
    ) {
      const candDeptNorm = cand.dept.toLowerCase().trim();
      const candIsMathField =
        candDeptNorm === "mathematics" ||
        candDeptNorm === "technical" ||
        candSubjectTokens.some((t) =>
          [
            "math",
            "mathematics",
            "h.math",
            "higher math",
            "engineering drw",
            "engr drw",
            "drw",
          ].includes(t),
        );
      if (candIsMathField) {
        takesThisSubject = true;
        isSameDept = true;
      }
    }

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

    const { consecutiveClassesCount, consecutiveNoBreakCount } =
      calculateConsecutiveStatus(cand.code, req.periodIndex);

    let consecutiveWarning: string | undefined;
    if (consecutiveClassesCount === 1) {
      score += 40;
      matchReasons.push("No consecutive classes");
    } else if (consecutiveClassesCount === 2) {
      if (consecutiveNoBreakCount === 1) {
        score -= 25;
        consecutiveWarning = "2 periods (with Tiffin break)";
        matchReasons.push("2 consecutive periods (with Tiffin break)");
      } else {
        score -= 80;
        consecutiveWarning = "2 consecutive classes";
        matchReasons.push("2 consecutive classes (back-to-back)");
      }
    } else if (consecutiveClassesCount === 3) {
      if (consecutiveNoBreakCount <= 2) {
        score -= 140;
        consecutiveWarning = "3 periods (spans Tiffin break)";
        matchReasons.push("3 consecutive periods (spans Tiffin break)");
      } else {
        score -= 220;
        consecutiveWarning = "3 consecutive classes";
        matchReasons.push("3 consecutive classes (no break)");
      }
    } else if (consecutiveClassesCount === 4) {
      if (consecutiveNoBreakCount <= 2) {
        score -= 280;
        consecutiveWarning = "4 consecutive periods";
        matchReasons.push("4 consecutive periods warning");
      } else {
        score -= 360;
        consecutiveWarning = "4 consecutive classes";
        matchReasons.push("4 back-to-back classes warning");
      }
    } else {
      score -= 500;
      consecutiveWarning = `${consecutiveClassesCount} consecutive classes`;
      matchReasons.push(`${consecutiveClassesCount} consecutive classes warning`);
    }

    const cleanedSuggestedSubject =
      cleanPracticalSubject(suggestedSubject);
    const baseFinalSubject =
      cleanedSuggestedSubject && !isNonTeachingSubject(cleanedSuggestedSubject)
        ? cleanedSuggestedSubject
        : cleanPracticalSubject(cand.subject) ||
          cleanPracticalSubject(cand.dept) ||
          cleanPracticalSubject(req.subject) ||
          "Subject";

    const finalSuggestedSubject = formatSubjectForSection(
      baseFinalSubject,
      req.sectionId,
      req.className,
      req.sectionName,
    );

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
      consecutiveClassesCount,
      consecutiveNoBreakCount,
      consecutiveWarning,
      score,
      matchReasons,
      suggestedSubject: finalSuggestedSubject,
    };
  };

  const assignmentsMap = new Map<
    string,
    {
      bestCandidate: SubstitutionCandidate | null;
      candidateList: SubstitutionCandidate[];
    }
  >();

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
      if (!teacherScheduledPeriods[bestCandidate.teacher.code]) {
        teacherScheduledPeriods[bestCandidate.teacher.code] = new Set<number>();
      }
      teacherScheduledPeriods[bestCandidate.teacher.code].add(req.periodIndex);
    }

    assignmentsMap.set(req.id, { bestCandidate, candidateList });
  });

  if (rawRequirements.length > 1) {
    rawRequirements.forEach((req) => {
      const currentAssignment = assignmentsMap.get(req.id)?.bestCandidate;
      if (currentAssignment) {
        teacherScheduledPeriods[currentAssignment.teacher.code]?.delete(
          req.periodIndex,
        );
        periodBookings[req.periodIndex]?.delete(
          currentAssignment.teacher.code,
        );
        if (
          !req.isAlreadySubstituted ||
          req.activeSubstituteTeacher?.code !== currentAssignment.teacher.code
        ) {
          simulatedLoads[currentAssignment.teacher.code] = Math.max(
            0,
            (simulatedLoads[currentAssignment.teacher.code] || 1) - 1,
          );
        }
      }

      const refreshedCandidates: SubstitutionCandidate[] = [];
      Object.values(teachersDirectory).forEach((cand) => {
        const evaluation = evaluateCandidate(cand, req);
        if (evaluation) {
          refreshedCandidates.push(evaluation);
        }
      });

      refreshedCandidates.sort((a, b) => b.score - a.score);
      const refinedBest =
        refreshedCandidates.find((c) => !c.isOverloaded) ||
        refreshedCandidates[0] ||
        null;

      if (refinedBest) {
        if (
          !req.isAlreadySubstituted ||
          req.activeSubstituteTeacher?.code !== refinedBest.teacher.code
        ) {
          simulatedLoads[refinedBest.teacher.code] =
            (simulatedLoads[refinedBest.teacher.code] || 0) + 1;
        }
        periodBookings[req.periodIndex]?.add(refinedBest.teacher.code);
        if (!teacherScheduledPeriods[refinedBest.teacher.code]) {
          teacherScheduledPeriods[refinedBest.teacher.code] = new Set<number>();
        }
        teacherScheduledPeriods[refinedBest.teacher.code].add(req.periodIndex);
      }

      assignmentsMap.set(req.id, {
        bestCandidate: refinedBest,
        candidateList: refreshedCandidates,
      });
    });
  }

  const finalRequirements: SubstitutionRequirement[] = [];

  rawRequirements.forEach((req) => {
    const assignment = assignmentsMap.get(req.id);
    const candidateList = assignment?.candidateList || [];
    const bestCandidate = assignment?.bestCandidate || null;

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
