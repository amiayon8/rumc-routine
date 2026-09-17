"use client";

import * as React from "react";
import {
  DayRoutine,
  TEACHER_DIRECTORY,
  TeacherInfo,
  sortDaysCanonical,
  getTodaysWeekday,
  getTodaysFullDate,
  DEFAULT_PERIOD_TIMINGS,
  PeriodTiming,
} from "../lib/routine-data";
import {
  getMultiTeacherSubstitutionPlan,
  SubstitutionRequirement,
  calculateTeacherLoads,
} from "../lib/substitution-engine";
import {
  UserX,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Users,
  Search,
  Check,
  X,
  ChevronDown,
  Briefcase,
  Printer,
  Table,
  FileSpreadsheet,
  ShieldCheck,
  ClipboardCheck,
} from "lucide-react";

interface SubstitutionManagerProps {
  routineData: DayRoutine[];
  currentDay: string;
  teachers?: Record<string, TeacherInfo>;
  timings?: PeriodTiming[];
  onApplySubstitution: (
    dayName: string,
    periodIndex: number,
    sectionId: string,
    originalTeacherCode: string,
    substituteTeacherCode: string,
    reason?: string,
    newSubject?: string,
  ) => void;
  onRevertSubstitution: (
    dayName: string,
    periodIndex: number,
    sectionId: string,
  ) => void;
}

export function SubstitutionManager({
  routineData,
  currentDay,
  teachers,
  timings = DEFAULT_PERIOD_TIMINGS,
  onApplySubstitution,
  onRevertSubstitution,
}: SubstitutionManagerProps) {
  const [prevCurrentDay, setPrevCurrentDay] =
    React.useState<string>(currentDay);
  const [selectedDay, setSelectedDay] = React.useState<string>(
    currentDay || getTodaysWeekday(),
  );

  if (currentDay && currentDay !== prevCurrentDay) {
    setPrevCurrentDay(currentDay);
    setSelectedDay(currentDay);
  }
  const [absentTeacherCodes, setAbsentTeacherCodes] = React.useState<string[]>(
    [],
  );
  const [teacherAbsencePeriods, setTeacherAbsencePeriods] = React.useState<
    Record<string, number[]>
  >({});
  const [allowedReplacementCodes, setAllowedReplacementCodes] = React.useState<
    string[]
  >([]);
  const [useCustomPool, setUseCustomPool] = React.useState<boolean>(false);
  const [maxDailyLoad, setMaxDailyLoad] = React.useState<number>(5);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [poolSearchQuery, setPoolSearchQuery] = React.useState<string>("");
  const [activeAutoAbsentCodes, setActiveAutoAbsentCodes] = React.useState<
    string[]
  >([]);
  const [activeAutoPoolCodes, setActiveAutoPoolCodes] = React.useState<
    string[]
  >([]);
  const [selectedDeptFilter, setSelectedDeptFilter] =
    React.useState<string>("All");

  const autoAbsentRef = React.useRef<string[]>([]);
  const absentTokenMatchesRef = React.useRef<Record<number, string>>({});

  const autoPoolRef = React.useRef<string[]>([]);
  const poolTokenMatchesRef = React.useRef<Record<number, string>>({});

  const [manualAssignments, setManualAssignments] = React.useState<
    Record<string, string>
  >({});
  const [manualSubjects, setManualSubjects] = React.useState<
    Record<string, string>
  >({});
  const [isConfirmRosterOpen, setIsConfirmRosterOpen] =
    React.useState<boolean>(false);
  const [successNotice, setSuccessNotice] = React.useState<string | null>(null);

  const teacherDir = teachers || TEACHER_DIRECTORY;

  const teacherLoads = React.useMemo(() => {
    return calculateTeacherLoads(routineData, teacherDir);
  }, [routineData, teacherDir]);

  const allTeachersList: TeacherInfo[] = React.useMemo(() => {
    return Object.values(teacherLoads)
      .map((summary) => summary.teacher)
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [teacherLoads]);

  const departmentsList = React.useMemo(() => {
    const depts = new Set<string>();
    allTeachersList.forEach((t) => {
      if (t.dept) depts.add(t.dept);
    });
    return ["All", ...Array.from(depts).sort()];
  }, [allTeachersList]);

  const isTeacherFullDay = (code: string) => {
    const periods = teacherAbsencePeriods[code];
    return !periods || periods.length === 7;
  };

  const setTeacherFullDayAbsent = (code: string) => {
    setTeacherAbsencePeriods((prev) => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
  };

  const toggleTeacherPeriodAbsence = (code: string, pIdx: number) => {
    setTeacherAbsencePeriods((prev) => {
      const current = prev[code] ?? [0, 1, 2, 3, 4, 5, 6];
      const exists = current.includes(pIdx);
      let updated: number[];
      if (exists) {
        updated = current.filter((p) => p !== pIdx);
      } else {
        updated = [...current, pIdx].sort((a, b) => a - b);
      }
      if (updated.length === 7) {
        const next = { ...prev };
        delete next[code];
        return next;
      }
      return { ...prev, [code]: updated };
    });
  };

  const handleToggleAbsent = (code: string) => {
    for (const [key, val] of Object.entries(absentTokenMatchesRef.current)) {
      if (val === code) {
        delete absentTokenMatchesRef.current[Number(key)];
      }
    }
    setActiveAutoAbsentCodes((prev) => prev.filter((c) => c !== code));
    setAbsentTeacherCodes((prev) => {
      const exists = prev.includes(code);
      if (exists) {
        setTeacherAbsencePeriods((pMap) => {
          const next = { ...pMap };
          delete next[code];
          return next;
        });
        return prev.filter((c) => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const parseTeacherCodesFromInput = (raw: string): string[] => {
    return raw
      .split(/[,;\n]+/)
      .map((tok) => tok.trim())
      .filter(Boolean);
  };

  const handleAbsentSearchChange = (val: string) => {
    setSearchQuery(val);

    if (!val.trim()) {
      const prevAuto = Object.values(absentTokenMatchesRef.current);
      if (prevAuto.length > 0) {
        setAbsentTeacherCodes((prev) =>
          prev.filter((c) => !prevAuto.includes(c)),
        );
      }
      absentTokenMatchesRef.current = {};
      setActiveAutoAbsentCodes([]);
      return;
    }

    const tokens = parseTeacherCodesFromInput(val);
    const oldMatches = absentTokenMatchesRef.current;
    const nextMatches: Record<number, string> = {};

    tokens.forEach((tok, idx) => {
      const found = allTeachersList.find(
        (t) => t.code.toUpperCase() === tok.toUpperCase(),
      );
      if (found) {
        nextMatches[idx] = found.code;
      }
    });

    // Identify codes from tokens that evolved (e.g. MS -> MSF: remove MS)
    const codesToRemove: string[] = [];
    Object.keys(oldMatches).forEach((keyStr) => {
      const idx = Number(keyStr);
      const oldCode = oldMatches[idx];
      const newCode = nextMatches[idx];
      if (oldCode && oldCode !== newCode) {
        if (!Object.values(nextMatches).includes(oldCode)) {
          codesToRemove.push(oldCode);
        }
      }
    });

    const codesToAdd = Object.values(nextMatches);

    setAbsentTeacherCodes((prev) => {
      const filtered = prev.filter((c) => !codesToRemove.includes(c));
      return Array.from(new Set([...filtered, ...codesToAdd]));
    });

    absentTokenMatchesRef.current = nextMatches;
    setActiveAutoAbsentCodes(codesToAdd);
  };

  const handleAbsentSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tokens = parseTeacherCodesFromInput(searchQuery);
      const allMatches = tokens
        .map(
          (tok) =>
            allTeachersList.find(
              (t) => t.code.toUpperCase() === tok.toUpperCase(),
            )?.code,
        )
        .filter((c): c is string => Boolean(c));

      if (allMatches.length > 0) {
        setAbsentTeacherCodes((prev) =>
          Array.from(new Set([...prev, ...allMatches])),
        );
      } else if (tokens.length === 1 && filteredAbsentTeachers.length === 1) {
        const code = filteredAbsentTeachers[0].code;
        setAbsentTeacherCodes((prev) =>
          prev.includes(code) ? prev : [...prev, code],
        );
      }
      absentTokenMatchesRef.current = {};
      setActiveAutoAbsentCodes([]);
      setSearchQuery("");
    }
  };

  const handleClearAbsentSearch = () => {
    absentTokenMatchesRef.current = {};
    setActiveAutoAbsentCodes([]);
    setSearchQuery("");
  };

  const handlePoolSearchChange = (val: string) => {
    setPoolSearchQuery(val);

    if (!val.trim()) {
      const prevAuto = Object.values(poolTokenMatchesRef.current);
      if (prevAuto.length > 0) {
        setAllowedReplacementCodes((prev) =>
          prev.filter((c) => !prevAuto.includes(c)),
        );
      }
      poolTokenMatchesRef.current = {};
      setActiveAutoPoolCodes([]);
      return;
    }

    const tokens = parseTeacherCodesFromInput(val);
    const oldMatches = poolTokenMatchesRef.current;
    const nextMatches: Record<number, string> = {};

    tokens.forEach((tok, idx) => {
      const found = allTeachersList.find(
        (t) => t.code.toUpperCase() === tok.toUpperCase(),
      );
      if (found) {
        nextMatches[idx] = found.code;
      }
    });

    const codesToRemove: string[] = [];
    Object.keys(oldMatches).forEach((keyStr) => {
      const idx = Number(keyStr);
      const oldCode = oldMatches[idx];
      const newCode = nextMatches[idx];
      if (oldCode && oldCode !== newCode) {
        if (!Object.values(nextMatches).includes(oldCode)) {
          codesToRemove.push(oldCode);
        }
      }
    });

    const codesToAdd = Object.values(nextMatches);

    setAllowedReplacementCodes((prev) => {
      const filtered = prev.filter((c) => !codesToRemove.includes(c));
      return Array.from(new Set([...filtered, ...codesToAdd]));
    });

    poolTokenMatchesRef.current = nextMatches;
    setActiveAutoPoolCodes(codesToAdd);
  };

  const handlePoolSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tokens = parseTeacherCodesFromInput(poolSearchQuery);
      const allMatches = tokens
        .map(
          (tok) =>
            allTeachersList.find(
              (t) => t.code.toUpperCase() === tok.toUpperCase(),
            )?.code,
        )
        .filter((c): c is string => Boolean(c));

      if (allMatches.length > 0) {
        setAllowedReplacementCodes((prev) =>
          Array.from(new Set([...prev, ...allMatches])),
        );
      } else if (tokens.length === 1 && filteredPoolTeachers.length === 1) {
        const code = filteredPoolTeachers[0].code;
        setAllowedReplacementCodes((prev) =>
          prev.includes(code) ? prev : [...prev, code],
        );
      }
      poolTokenMatchesRef.current = {};
      setActiveAutoPoolCodes([]);
      setPoolSearchQuery("");
    }
  };

  const handleClearPoolSearch = () => {
    poolTokenMatchesRef.current = {};
    setActiveAutoPoolCodes([]);
    setPoolSearchQuery("");
  };

  const handleToggleReplacementPool = (code: string) => {
    for (const [key, val] of Object.entries(poolTokenMatchesRef.current)) {
      if (val === code) {
        delete poolTokenMatchesRef.current[Number(key)];
      }
    }
    setActiveAutoPoolCodes((prev) => prev.filter((c) => c !== code));
    setAllowedReplacementCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const requirements: SubstitutionRequirement[] = React.useMemo(() => {
    if (absentTeacherCodes.length === 0) return [];
    return getMultiTeacherSubstitutionPlan({
      dayName: selectedDay,
      absentTeacherCodes,
      teacherAbsencePeriods,
      allowedReplacementCodes: useCustomPool
        ? allowedReplacementCodes
        : undefined,
      routineData,
      maxDailyLoad,
      teachersDirectory: teacherDir,
    });
  }, [
    selectedDay,
    absentTeacherCodes,
    teacherAbsencePeriods,
    allowedReplacementCodes,
    useCustomPool,
    routineData,
    maxDailyLoad,
    teacherDir,
  ]);

  const activeSubstitutions = React.useMemo(() => {
    const dayRoutine = routineData.find((d) => d.day === selectedDay);
    if (!dayRoutine) return [];

    const list: Array<{
      sectionId: string;
      periodIndex: number;
      subject: string;
      originalSubject?: string;
      originalTeacherCode: string;
      substituteTeacherCode: string;
      reason?: string;
    }> = [];

    dayRoutine.sections.forEach((sec) => {
      sec.periods.forEach((cell, pIdx) => {
        if (cell && cell.substituteTeacherCode) {
          list.push({
            sectionId: sec.sectionId,
            periodIndex: pIdx,
            subject: cell.subject,
            originalSubject: cell.originalSubject,
            originalTeacherCode: cell.teacherCode,
            substituteTeacherCode: cell.substituteTeacherCode,
            reason: cell.substituteReason,
          });
        }
      });
    });

    return list;
  }, [routineData, selectedDay]);

  const plannedRoster = React.useMemo(() => {
    return requirements.map((req, idx) => {
      const currentAssignedCode =
        manualAssignments[req.id] || req.recommendedCandidate?.teacher.code;
      const selectedCandidate = req.candidates.find(
        (c) => c.teacher.code === currentAssignedCode,
      );
      const isCoTeachingPartial = req.isMultiTeacher && !req.isAllAbsent;
      const suggestedSubSubject = isCoTeachingPartial
        ? req.originalSubject || req.subject
        : selectedCandidate?.suggestedSubject ||
          selectedCandidate?.teacher.subject ||
          selectedCandidate?.teacher.dept ||
          req.originalSubject ||
          req.subject;
      const effectiveSubject =
        manualSubjects[req.id] !== undefined
          ? manualSubjects[req.id]
          : suggestedSubSubject;

      return {
        sl: idx + 1,
        req,
        assignedTeacherCode: currentAssignedCode,
        candidate: selectedCandidate,
        effectiveSubject,
        isOverloaded: selectedCandidate?.isOverloaded,
        matchReason:
          selectedCandidate?.matchReasons[0] ||
          (currentAssignedCode ? "Assigned" : "No teacher available"),
        currentDayLoad: selectedCandidate?.currentDayLoad ?? 0,
        projectedDayLoad:
          selectedCandidate?.projectedDayLoad ||
          (selectedCandidate ? selectedCandidate.currentDayLoad + 1 : 0),
      };
    });
  }, [requirements, manualAssignments, manualSubjects]);

  const handleAutoAssignAll = () => {
    if (requirements.length === 0) return;
    setIsConfirmRosterOpen(true);
  };

  const handleConfirmAndApplyRoster = () => {
    let appliedCount = 0;
    plannedRoster.forEach((item) => {
      if (item.assignedTeacherCode) {
        onApplySubstitution(
          selectedDay,
          item.req.periodIndex,
          item.req.sectionId,
          item.req.originalTeacher.code,
          item.assignedTeacherCode,
          undefined,
          item.effectiveSubject,
        );
        appliedCount++;
      }
    });
    setIsConfirmRosterOpen(false);
    setSuccessNotice(
      `Duty Roster successfully applied! ${appliedCount} teacher replacement${appliedCount === 1 ? "" : "s"} updated for ${selectedDay}.`,
    );
  };

  const handleSingleAssign = (
    req: SubstitutionRequirement,
    assignedCode: string,
    effectiveSubject: string,
  ) => {
    onApplySubstitution(
      selectedDay,
      req.periodIndex,
      req.sectionId,
      req.originalTeacher.code,
      assignedCode,
      undefined,
      effectiveSubject,
    );
    setSuccessNotice(
      `Assigned substitute ${assignedCode} (${effectiveSubject}) for ${req.sectionId} Period ${req.periodIndex + 1} on ${selectedDay}.`,
    );
  };

  const handleRevertAllToday = () => {
    activeSubstitutions.forEach((sub) => {
      onRevertSubstitution(selectedDay, sub.periodIndex, sub.sectionId);
    });
  };

  const getPeriodTime = (periodNumber: number, fallbackTime: string) => {
    const periodTiming = timings.find((p) => p.index === periodNumber);
    return periodTiming ? periodTiming.time : fallbackTime;
  };

  const handlePrint = () => {
    window.print();
  };

  const printableReplacements = React.useMemo(() => {
    const dayRoutine = routineData.find((d) => d.day === selectedDay);
    if (!dayRoutine) return [];

    const map = new Map<
      string,
      {
        sectionId: string;
        className: string;
        periodIndex: number;
        subject: string;
        originalSubject?: string;
        originalTeacherCode: string;
        substituteTeacherCode: string;
        room?: string;
        reason?: string;
        isPending?: boolean;
      }
    >();

    dayRoutine.sections.forEach((sec) => {
      sec.periods.forEach((cell, pIdx) => {
        if (cell && cell.substituteTeacherCode) {
          const key = `${sec.sectionId}_${pIdx}`;
          map.set(key, {
            sectionId: sec.sectionId,
            className: sec.className,
            periodIndex: pIdx,
            subject: cell.subject,
            originalSubject: cell.originalSubject,
            originalTeacherCode: cell.teacherCode,
            substituteTeacherCode: cell.substituteTeacherCode,
            room: cell.room,
            reason: cell.substituteReason || "Assigned",
            isPending: false,
          });
        }
      });
    });

    requirements.forEach((req) => {
      const key = `${req.sectionId}_${req.periodIndex}`;
      const assignedCode =
        manualAssignments[req.id] || req.recommendedCandidate?.teacher.code;
      if (!assignedCode) return;

      const sec = dayRoutine.sections.find(
        (s) => s.sectionId === req.sectionId,
      );
      const cell = sec?.periods[req.periodIndex];
      const rawTeacherCode = cell?.teacherCode || req.originalTeacher.code;

      if (req.isMultiTeacher && !req.isAllAbsent) {
        if (map.has(key)) {
          const existing = map.get(key)!;
          const tokens = existing.substituteTeacherCode.split("/").map((c) => c.trim());
          const matchIdx = tokens.indexOf(req.originalTeacher.code);
          if (matchIdx !== -1) {
            tokens[matchIdx] = assignedCode;
          } else {
            const origCodes = rawTeacherCode.split(/[/,]/).map((c) => c.trim());
            const origIdx = origCodes.indexOf(req.originalTeacher.code);
            if (origIdx !== -1 && origIdx < tokens.length) {
              tokens[origIdx] = assignedCode;
            } else {
              tokens.push(assignedCode);
            }
          }
          existing.substituteTeacherCode = tokens.join("/");
        } else {
          const origCodes = rawTeacherCode.split(/[/,]/).map((c) => c.trim());
          const tokens = [...origCodes];
          const matchIdx = tokens.indexOf(req.originalTeacher.code);
          if (matchIdx !== -1) {
            tokens[matchIdx] = assignedCode;
          }
          map.set(key, {
            sectionId: req.sectionId,
            className: sec?.className || "",
            periodIndex: req.periodIndex,
            subject: req.originalSubject || req.subject,
            originalSubject: req.originalSubject || req.subject,
            originalTeacherCode: rawTeacherCode,
            substituteTeacherCode: tokens.join("/"),
            room: cell?.room,
            reason: "Auto-Assigned Plan (Co-Teaching)",
            isPending: true,
          });
        }
      } else {
        if (!map.has(key)) {
          const cand = req.candidates.find(
            (c) => c.teacher.code === assignedCode,
          );
          const resolvedSubject =
            manualSubjects[req.id] ||
            cand?.suggestedSubject ||
            cand?.teacher.subject ||
            cand?.teacher.dept ||
            req.originalSubject ||
            req.subject;

          map.set(key, {
            sectionId: req.sectionId,
            className: sec?.className || "",
            periodIndex: req.periodIndex,
            subject: resolvedSubject,
            originalSubject: req.originalSubject || req.subject,
            originalTeacherCode: rawTeacherCode,
            substituteTeacherCode: assignedCode,
            room: cell?.room,
            reason: "Auto-Assigned Plan",
            isPending: true,
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.periodIndex !== b.periodIndex) return a.periodIndex - b.periodIndex;
      return a.sectionId.localeCompare(b.sectionId);
    });
  }, [
    routineData,
    selectedDay,
    requirements,
    manualAssignments,
    manualSubjects,
  ]);

  const currentDayRoutine = React.useMemo(() => {
    return routineData.find((d) => d.day === selectedDay) || routineData[0];
  }, [routineData, selectedDay]);

  const substitutedMap = React.useMemo(() => {
    const map = new Map<
      string,
      {
        originalTeacherCode: string;
        substituteTeacherCode: string;
        subject: string;
        originalSubject?: string;
        room?: string;
        reason?: string;
        isPending?: boolean;
      }
    >();
    printableReplacements.forEach((rep) => {
      map.set(`${rep.sectionId}_${rep.periodIndex}`, {
        originalTeacherCode: rep.originalTeacherCode,
        substituteTeacherCode: rep.substituteTeacherCode,
        subject: rep.subject,
        originalSubject: rep.originalSubject,
        room: rep.room,
        reason: rep.reason,
        isPending: rep.isPending,
      });
    });
    return map;
  }, [printableReplacements]);



  const filteredAbsentTeachers = React.useMemo(() => {
    const tokens = parseTeacherCodesFromInput(searchQuery).map((t) =>
      t.toLowerCase(),
    );
    return allTeachersList.filter((t) => {
      const matchesSearch =
        tokens.length === 0 ||
        tokens.some(
          (tok) =>
            t.code.toLowerCase().includes(tok) ||
            t.dept.toLowerCase().includes(tok) ||
            t.subject.toLowerCase().includes(tok),
        );

      const matchesDept =
        selectedDeptFilter === "All" || t.dept === selectedDeptFilter;
      return matchesSearch && matchesDept;
    });
  }, [allTeachersList, searchQuery, selectedDeptFilter]);

  const filteredPoolTeachers = React.useMemo(() => {
    const activeFaculty = allTeachersList.filter(
      (t) => !absentTeacherCodes.includes(t.code),
    );
    const tokens = parseTeacherCodesFromInput(poolSearchQuery).map((t) =>
      t.toLowerCase(),
    );
    if (tokens.length === 0) return activeFaculty;
    return activeFaculty.filter((t) =>
      tokens.some(
        (tok) =>
          t.code.toLowerCase().includes(tok) ||
          t.dept.toLowerCase().includes(tok) ||
          t.subject.toLowerCase().includes(tok),
      ),
    );
  }, [allTeachersList, absentTeacherCodes, poolSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3 text-sm sm:text-base font-bold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="no-print space-y-6">
        <div className="p-5 sm:p-7 rounded-3xl bg-card border-2 border-border shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-danger-bg text-danger">
                  <UserX className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-black text-xl sm:text-2xl text-foreground tracking-tight">
                    Multi-Teacher Auto-Replacement
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">

              {requirements.length > 0 && (
                <button
                  type="button"
                  onClick={handleAutoAssignAll}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-black rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Review & Apply Roster ({requirements.length})</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-semibold">
            <div>
              <label className="font-bold text-foreground block mb-2 text-sm sm:text-base">
                Day of Routine
              </label>
              <select
                value={selectedDay}
                onChange={(e) => {
                  setSelectedDay(e.target.value);
                  setManualAssignments({});
                  setManualSubjects({});
                }}
                className="w-full h-11 sm:h-12 px-3.5 text-sm sm:text-base rounded-2xl bg-background-secondary border-2 border-border text-foreground outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer font-bold"
              >
                {sortDaysCanonical(routineData).map((d) => (
                  <option key={d.day} value={d.day}>
                    {d.day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-2 text-sm sm:text-base flex items-center justify-between">
                <span>Max Daily Workload</span>
              </label>
              <select
                value={maxDailyLoad}
                onChange={(e) => setMaxDailyLoad(Number(e.target.value))}
                className="w-full h-11 sm:h-12 px-3.5 text-sm sm:text-base rounded-2xl bg-background-secondary border-2 border-border text-foreground outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer font-bold"
              >
                <option value={4}>Max 4 periods/day (Strict light load)</option>
                <option value={5}>
                  Max 5 periods/day (Standard recommended)
                </option>
                <option value={6}>
                  Max 6 periods/day (Heavy load permitted)
                </option>
              </select>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-2 text-sm sm:text-base flex items-center justify-between">
                <span>Replacement Faculty Pool</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseCustomPool(false)}
                  className={`h-11 sm:h-12 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex-1 ${!useCustomPool
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-background-secondary text-foreground-muted hover:text-foreground border border-border"
                    }`}
                >
                  All Faculty
                </button>
                <button
                  type="button"
                  onClick={() => setUseCustomPool(true)}
                  className={`h-11 sm:h-12 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex-1 ${useCustomPool
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-background-secondary text-foreground-muted hover:text-foreground border border-border"
                    }`}
                >
                  Custom ({allowedReplacementCodes.length})
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-background-secondary/70 border-2 border-border space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <span className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                <UserX className="w-5 h-5 text-red-500" />
                <span>
                  Select Absent Teachers ({absentTeacherCodes.length} selected):
                </span>
              </span>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative flex-1 sm:w-72 md:w-80">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-subtle" />
                  <input
                    type="text"
                    placeholder="Search or enter codes (e.g. NC or NC, AA, MS)..."
                    value={searchQuery}
                    onChange={(e) => handleAbsentSearchChange(e.target.value)}
                    onKeyDown={handleAbsentSearchKeyDown}
                    className="w-full pl-11 pr-10 py-2.5 text-sm sm:text-base font-bold rounded-2xl bg-card border-2 border-border text-foreground outline-hidden focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all placeholder:font-medium placeholder:text-foreground-subtle shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearAbsentSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-foreground-subtle hover:text-foreground hover:bg-secondary cursor-pointer"
                      title="Clear search query"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {activeAutoAbsentCodes.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-2 border-emerald-500/30 px-3.5 py-2 rounded-2xl shadow-xs animate-in fade-in">
                    <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>Auto-selected: {activeAutoAbsentCodes.join(", ")}</span>
                  </div>
                )}

                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="h-11 sm:h-12 px-4 text-sm sm:text-base font-bold rounded-2xl bg-card border-2 border-border text-foreground outline-hidden focus:border-primary focus:ring-3 focus:ring-primary/20 cursor-pointer shadow-xs"
                >
                  {departmentsList.map((d) => (
                    <option key={d} value={d}>
                      {d === "All" ? "All Departments" : d}
                    </option>
                  ))}
                </select>

                <div className="text-xs sm:text-sm font-bold text-foreground-muted px-3 py-2 rounded-xl bg-card border border-border shadow-xs">
                  {filteredAbsentTeachers.length} of {allTeachersList.length} faculty
                </div>

                {absentTeacherCodes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setAbsentTeacherCodes([]);
                      setTeacherAbsencePeriods({});
                    }}
                    className="h-11 sm:h-12 px-3.5 py-1 text-xs sm:text-sm font-bold text-danger hover:bg-danger-bg rounded-2xl border border-danger/30 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {absentTeacherCodes.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {absentTeacherCodes.map((code) => {
                    const t = teacherDir[code] || TEACHER_DIRECTORY[code];
                    const isFull = isTeacherFullDay(code);
                    const absentPeriods = teacherAbsencePeriods[code] ?? [
                      0, 1, 2, 3, 4, 5, 6,
                    ];

                    return (
                      <div
                        key={code}
                        className="p-4 rounded-2xl bg-card border-2 border-red-500/40 text-xs sm:text-sm flex flex-col gap-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono font-black text-red-600 dark:text-red-400 text-base sm:text-lg">
                              {code}
                            </span>
                            {(t?.subject || t?.dept) && (
                              <span className="px-2.5 py-1 rounded-xl bg-background-secondary text-xs sm:text-sm text-foreground font-bold border border-border">
                                {t.subject || t.dept}
                              </span>
                            )}
                            <span className="text-xs sm:text-sm font-bold text-foreground-muted">
                              {isFull ? (
                                <span className="text-red-500 font-black">
                                  Full Day Absent
                                </span>
                              ) : absentPeriods.length === 0 ? (
                                <span className="text-emerald-500 font-bold">
                                  Present All Periods
                                </span>
                              ) : (
                                <span>
                                  Absent in {absentPeriods.length} period{absentPeriods.length > 1 ? "s" : ""}
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (isFull) {
                                  setTeacherAbsencePeriods((prev) => ({
                                    ...prev,
                                    [code]: [0],
                                  }));
                                } else {
                                  setTeacherFullDayAbsent(code);
                                }
                              }}
                              className={`px-3 py-1.5 text-xs sm:text-sm rounded-xl font-bold border-2 transition-colors cursor-pointer ${isFull
                                ? "bg-red-600 text-white border-red-700 shadow-xs"
                                : "bg-background-secondary text-foreground-muted border-border hover:text-foreground"
                                }`}
                            >
                              {isFull ? "Full Day" : "Specific Periods"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleAbsent(code)}
                              className="p-1.5 rounded-xl hover:bg-red-500/20 text-red-600 cursor-pointer"
                              title={`Remove ${code}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-border/60">
                          <span className="text-xs font-bold text-foreground-subtle mr-1">
                            {isFull
                              ? "All Periods Absent:"
                              : "Select Absent Periods:"}
                          </span>
                          {[0, 1, 2, 3, 4, 5, 6].map((pIdx) => {
                            const isPeriodAbsent = absentPeriods.includes(pIdx);
                            return (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() =>
                                  toggleTeacherPeriodAbsence(code, pIdx)
                                }
                                className={`min-w-[42px] h-9 px-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${isPeriodAbsent
                                  ? "bg-red-600 text-white shadow-xs font-black ring-2 ring-red-400"
                                  : "bg-background-secondary text-foreground-muted hover:bg-secondary hover:text-foreground border-2 border-border"
                                  }`}
                                title={`Period ${pIdx + 1}: ${isPeriodAbsent
                                  ? "Absent (needs sub)"
                                  : "Present (available)"
                                  }`}
                              >
                                P{pIdx + 1}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm sm:text-base text-foreground-muted font-medium italic">
                No absent teachers selected. Click any faculty member below to mark them absent.
              </p>
            )}

            <div className="max-h-64 sm:max-h-80 overflow-y-auto p-3 rounded-2xl bg-card border-2 border-border flex flex-wrap gap-2">
              {filteredAbsentTeachers.map((t) => {
                const isAbsent = absentTeacherCodes.includes(t.code);
                return (
                  <button
                    key={t.code}
                    type="button"
                    onClick={() => handleToggleAbsent(t.code)}
                    className={`px-3.5 py-2 text-sm sm:text-base rounded-xl border-2 transition-all cursor-pointer flex items-center gap-2 font-medium ${isAbsent
                      ? "bg-red-600 text-white border-red-700 font-black shadow-md scale-[1.02]"
                      : "bg-background-secondary text-foreground hover:bg-secondary border-border hover:border-border-strong"
                      }`}
                    title={`${t.code} • ${t.subject || t.dept}`}
                  >
                    <span className="font-mono font-black text-sm sm:text-base">{t.code}</span>
                    <span className="text-xs opacity-80 font-bold">
                      ({t.subject || t.dept})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {useCustomPool && (
            <div className="p-5 rounded-3xl bg-primary-subtle/30 border-2 border-primary/20 space-y-4 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>
                    Selected Replacement Pool ({allowedReplacementCodes.length}{" "}
                    faculty):
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAllowedReplacementCodes(
                        allTeachersList
                          .filter((t) => !absentTeacherCodes.includes(t.code))
                          .map((t) => t.code),
                      )
                    }
                    className="px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl bg-card border border-border text-foreground hover:bg-secondary cursor-pointer shadow-xs"
                  >
                    Select All Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllowedReplacementCodes([])}
                    className="px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl text-danger hover:bg-danger-bg border border-danger/20 cursor-pointer"
                  >
                    Clear Pool
                  </button>
                </div>
              </div>

              {/* Pool Search & Auto-Select Bar */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative flex-1 sm:w-72 md:w-80">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-subtle" />
                  <input
                    type="text"
                    placeholder="Search or enter pool codes (e.g. NC or NC, AA, MS)..."
                    value={poolSearchQuery}
                    onChange={(e) => handlePoolSearchChange(e.target.value)}
                    onKeyDown={handlePoolSearchKeyDown}
                    className="w-full pl-11 pr-10 py-2.5 text-sm sm:text-base font-bold rounded-2xl bg-card border-2 border-border text-foreground outline-hidden focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all placeholder:font-medium placeholder:text-foreground-subtle shadow-xs"
                  />
                  {poolSearchQuery && (
                    <button
                      type="button"
                      onClick={handleClearPoolSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-foreground-subtle hover:text-foreground hover:bg-secondary cursor-pointer"
                      title="Clear pool search query"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {activeAutoPoolCodes.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-2 border-emerald-500/30 px-3.5 py-2 rounded-2xl shadow-xs animate-in fade-in">
                    <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>Auto-selected for pool: {activeAutoPoolCodes.join(", ")}</span>
                  </div>
                )}

                <div className="text-xs sm:text-sm font-bold text-foreground-muted px-3.5 py-2 rounded-xl bg-card border border-border shadow-xs whitespace-nowrap">
                  {filteredPoolTeachers.length} faculty matched
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto p-3 rounded-2xl bg-card border-2 border-border flex flex-wrap gap-2 pt-1">
                {filteredPoolTeachers.map((t) => {
                  const isInPool = allowedReplacementCodes.includes(t.code);
                  return (
                    <button
                      key={t.code}
                      type="button"
                      onClick={() => handleToggleReplacementPool(t.code)}
                      className={`px-3.5 py-2 text-xs sm:text-sm rounded-xl border-2 transition-all cursor-pointer font-bold ${isInPool
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-background-secondary text-foreground-muted hover:text-foreground border-border"
                        }`}
                      title={`${t.code} • ${t.subject || t.dept}`}
                    >
                      <span className="font-mono font-black">{t.code}</span>
                      <span className="opacity-80 font-medium ml-1">
                        ({t.subject || t.dept})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="routine-print-area font-serif mt-8 space-y-6">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Replacements</span>
          </button>

          <div
            className="routine-sheet min-h-[297mm] flex flex-col justify-between p-6 sm:p-8 bg-white border border-border shadow-xs text-black transition-colors"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              color: "#000000",
              backgroundColor: "#ffffff",
            }}
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold tracking-wide pb-1 border-b border-zinc-200">
                <span style={{ color: "#FF0000" }}>
                  WEF: {getTodaysFullDate()}
                </span>
                <span className="text-zinc-600 text-[10px] uppercase font-semibold">
                  EMMS
                </span>
              </div>

              <div className="text-center py-2 space-y-0.5">
                <h1
                  className="text-xl sm:text-2xl font-bold tracking-wide uppercase text-black"
                  style={{
                    fontFamily: "'Times New Roman', Times, serif",
                    fontWeight: 700,
                  }}
                >
                  RAJUK UTTARA MODEL COLLEGE
                </h1>
                <div className="text-[12px] font-semibold tracking-wider text-black">
                  SECTOR-06, UTTARA MODEL TOWN, DHAKA-1230
                </div>
              </div>

              <div
                className="py-1 px-3 text-center font-bold text-[13px] tracking-wide my-2 uppercase"
                style={{
                  backgroundColor: "#FFFF00",
                  color: "#000000",
                  border: "1px solid #000000",
                  fontWeight: 700,
                }}
              >
                DAILY TEACHER REPLACEMENT & SUBSTITUTION SCHEDULE — 2026
              </div>

              <div
                className="p-2.5 mb-3 flex flex-wrap items-center justify-between gap-2 text-[12px] border"
                style={{
                  borderColor: "#000000",
                  backgroundColor: "#F9FAFB",
                }}
              >
                <div>
                  <span className="font-bold">Day: </span>
                  <span className="font-semibold">{selectedDay}</span>
                </div>
                <div>
                  <span className="font-bold">Date: </span>
                  <span className="font-semibold">{getTodaysFullDate()}</span>
                </div>
                <div>
                  <span className="font-bold">Shift: </span>
                  <span className="font-semibold">Morning Shift (EMMS)</span>
                </div>
                <div>
                  <span className="font-bold">Absent Faculty: </span>
                  <span className="font-semibold text-red-600">
                    {absentTeacherCodes.length > 0
                      ? absentTeacherCodes.join(", ")
                      : "None Recorded"}
                  </span>
                </div>
                <div>
                  <span className="font-bold">Total Replacements: </span>
                  <span className="font-bold" style={{ color: "#00B050" }}>
                    {printableReplacements.length} Classes
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table
                  className="w-full text-center border-collapse"
                  style={{
                    border: "1.5px solid #000000",
                    fontFamily: "'Times New Roman', Times, serif",
                  }}
                >
                  <thead>
                    <tr
                      style={{ backgroundColor: "#8DB3E2", color: "#000000" }}
                    >
                      <th
                        className="p-1.5 text-center text-[12px] font-bold w-10"
                        style={{ border: "1px solid #000000" }}
                      >
                        SL
                      </th>
                      <th
                        className="p-1.5 text-center text-[12px] font-bold w-24"
                        style={{ border: "1px solid #000000" }}
                      >
                        Period &amp; Time
                      </th>
                      <th
                        className="p-1.5 text-center text-[12px] font-bold w-24"
                        style={{ border: "1px solid #000000" }}
                      >
                        Class &amp; Sec
                      </th>
                      <th
                        className="p-1.5 text-center text-[12px] font-bold w-28"
                        style={{ border: "1px solid #000000" }}
                      >
                        Subject
                      </th>
                      <th
                        className="p-1.5 text-center text-[12px] font-bold"
                        style={{ border: "1px solid #000000" }}
                      >
                        Absent Teacher
                      </th>
                      <th
                        className="p-1.5 text-center text-[12px] font-bold"
                        style={{ border: "1px solid #000000" }}
                      >
                        Substitute Teacher
                      </th>
                      <th
                        className="p-1.5 text-center text-[12px] font-bold w-32"
                        style={{ border: "1px solid #000000" }}
                      >
                        Teacher Signature
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {printableReplacements.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="p-6 text-center text-[13px] text-zinc-500 italic"
                          style={{ border: "1px solid #000000" }}
                        >
                          No substitutions scheduled for {selectedDay}.
                        </td>
                      </tr>
                    ) : (
                      printableReplacements.map((sub, idx) => {
                        const origTeacher = teacherDir[sub.originalTeacherCode];
                        const subTeacher =
                          teacherDir[sub.substituteTeacherCode];
                        const periodNumber = sub.periodIndex + 1;
                        const periodLabel =
                          periodNumber === 1
                            ? "1st"
                            : periodNumber === 2
                              ? "2nd"
                              : periodNumber === 3
                                ? "3rd"
                                : `${periodNumber}th`;
                        const periodTime = getPeriodTime(periodNumber, "");

                        return (
                          <tr
                            key={`${sub.sectionId}_${sub.periodIndex}`}
                            className="h-10"
                            style={{
                              backgroundColor:
                                idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB",
                            }}
                          >
                            <td
                              className="p-1.5 text-center text-[12px] font-bold"
                              style={{ border: "1px solid #000000" }}
                            >
                              {idx + 1}
                            </td>
                            <td
                              className="p-1.5 text-center"
                              style={{ border: "1px solid #000000" }}
                            >
                              <div className="font-bold text-[12px]">
                                {periodLabel}
                              </div>
                              <div className="text-[10px] text-zinc-600 leading-none mt-0.5">
                                {periodTime}
                              </div>
                            </td>
                            <td
                              className="p-1.5 text-center"
                              style={{ border: "1px solid #000000" }}
                            >
                              <div className="font-bold text-[13px] text-black">
                                {sub.sectionId}
                              </div>
                              {sub.className && (
                                <div className="text-[10px] text-zinc-600">
                                  {sub.className}
                                </div>
                              )}
                            </td>
                            <td
                              className="p-1.5 text-center font-semibold text-[12px]"
                              style={{ border: "1px solid #000000" }}
                            >
                              <div className="font-bold text-[12px] text-black">
                                {sub.subject}
                              </div>
                              {sub.originalSubject &&
                                sub.originalSubject !== sub.subject && (
                                  <div className="text-[9px] text-zinc-500 line-through">
                                    was {sub.originalSubject}
                                  </div>
                                )}
                            </td>
                            <td
                              className="p-1.5 text-center"
                              style={{ border: "1px solid #000000" }}
                            >
                              <span className="font-mono font-bold text-red-600 text-[13px]">
                                {sub.originalTeacherCode}
                              </span>
                              {origTeacher && (
                                <div className="text-[10px] text-zinc-600">
                                  {origTeacher.subject || origTeacher.dept}
                                </div>
                              )}
                            </td>
                            <td
                              className="p-1.5 text-center"
                              style={{
                                border: "1px solid #000000",
                                backgroundColor: "#F3E8FF",
                              }}
                            >
                              <span className="font-mono font-bold text-purple-700 text-[13px]">
                                {sub.substituteTeacherCode}
                              </span>
                              {subTeacher && (
                                <div className="text-[10px] text-purple-900 font-medium">
                                  {subTeacher.subject || subTeacher.dept}
                                </div>
                              )}
                            </td>
                            <td
                              className="p-1.5 text-center"
                              style={{ border: "1px solid #000000" }}
                            >
                              <div className="w-24 h-5 border-b border-dotted border-zinc-400 mx-auto" />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="routine-signature-footer mt-auto pt-8 pb-2 print:pt-4 print:pb-1 flex items-center justify-between text-[11px] font-bold text-black px-4">
              <div className="text-center">
                <div className="w-36 border-b border-black mb-1 mx-auto" />
                <div>Sign of OIC Routine Comm.</div>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-black mb-1 mx-auto" />
                <div>Sign of Chairman Routine Comm.</div>
              </div>
              <div className="text-center">
                <div className="w-36 border-b border-black mb-1 mx-auto" />
                <div>Sign of VP (EMMS)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-card border-2 border-border shadow-xs">
            <div>
              <h3 className="font-black text-lg sm:text-xl text-foreground flex items-center gap-2.5">
                <Briefcase className="w-5 h-5 text-primary" />
                <span>
                  Calculated Assignment Plan ({requirements.length} periods need substitution)
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-foreground-muted mt-0.5 font-medium">
                Ranked by class experience, subject/dept match, and non-overloaded daily workloads.
              </p>
            </div>

            {requirements.length > 0 && (
              <button
                type="button"
                onClick={handleAutoAssignAll}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-black rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                <Table className="w-4 h-4" />
                <span>Review & Apply Duty Roster ({requirements.length})</span>
              </button>
            )}
          </div>

          {requirements.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-card border-2 border-border space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-black text-base sm:text-lg text-foreground">
                No Substitutions Needed
              </h4>
              <p className="text-xs sm:text-sm text-foreground-muted max-w-md mx-auto font-medium">
                {absentTeacherCodes.length === 0
                  ? "Select one or more absent teachers above to compute required substitutions."
                  : `The selected teacher(s) (${absentTeacherCodes.join(
                    ", ",
                  )}) have no classes requiring substitution on ${selectedDay}.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requirements.map((req) => {
                const currentAssignedCode =
                  manualAssignments[req.id] ||
                  req.recommendedCandidate?.teacher.code;
                const selectedCandidate = req.candidates.find(
                  (c) => c.teacher.code === currentAssignedCode,
                );
                const isCoTeachingPartial = req.isMultiTeacher && !req.isAllAbsent;
                const suggestedSubSubject = isCoTeachingPartial
                  ? req.originalSubject || req.subject
                  : selectedCandidate?.suggestedSubject ||
                    selectedCandidate?.teacher.subject ||
                    selectedCandidate?.teacher.dept ||
                    req.originalSubject ||
                    req.subject;
                const effectiveSubject =
                  manualSubjects[req.id] !== undefined
                    ? manualSubjects[req.id]
                    : suggestedSubSubject;

                return (
                  <div
                    key={req.id}
                    className="p-4 sm:p-5 rounded-2xl bg-card border-2 border-border shadow-xs hover:border-border-strong transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs sm:text-sm"
                  >
                    <div className="space-y-1.5 sm:max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary font-black text-xs sm:text-sm font-mono border border-primary/20">
                          {req.sectionId}
                        </span>
                        <span className="font-black text-foreground text-sm sm:text-base">
                          {req.periodName} ({req.periodTime})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-foreground-muted flex-wrap font-medium">
                        <span className="font-bold text-foreground">
                          {req.originalSubject || req.subject}
                        </span>
                        <span>•</span>
                        <span>
                          Absent:{" "}
                          <span className="font-black text-danger font-mono text-sm sm:text-base">
                            {req.originalTeacher.code}
                          </span>
                        </span>
                      </div>

                      {req.isMultiTeacher && !req.isAllAbsent && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/30 text-xs">
                            Co-teaching ({req.allOriginalTeacherCodes?.join("/")}) • In class: {req.coTeachersPresent?.join(", ")}
                          </span>
                        </div>
                      )}

                      {req.isMultiTeacher && req.isAllAbsent && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30 text-xs">
                            All Co-Teachers Absent ({req.allOriginalTeacherCodes?.join("/")})
                          </span>
                        </div>
                      )}

                      {req.isAlreadySubstituted &&
                        req.activeSubstituteTeacher && (
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/30 text-xs">
                              Currently Substituted by:{" "}
                              {req.activeSubstituteTeacher.code}
                            </span>
                          </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-2 md:px-4 border-y md:border-y-0 md:border-x border-border/70 py-3 md:py-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-foreground-muted text-xs sm:text-sm font-bold">
                          Assigned:
                        </span>
                        {selectedCandidate ? (
                          <>
                            <span className="font-black text-foreground font-mono text-base sm:text-lg">
                              {selectedCandidate.teacher.code}
                            </span>

                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${selectedCandidate.takesThisClass
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                                : selectedCandidate.isSameDept
                                  ? "bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30"
                                  : "bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30"
                                }`}
                            >
                              {selectedCandidate.matchReasons[0] || "Available"}
                            </span>

                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${selectedCandidate.isOverloaded
                                ? "bg-red-500/15 text-red-600"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                }`}
                            >
                              Daily Load: {selectedCandidate.currentDayLoad} →{" "}
                              {selectedCandidate.projectedDayLoad ||
                                selectedCandidate.currentDayLoad + 1}{" "}
                              classes
                            </span>
                          </>
                        ) : (
                          <span className="text-danger font-bold flex items-center gap-1 text-xs sm:text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            <span>
                              No free teacher available in this period
                            </span>
                          </span>
                        )}
                      </div>

                      {selectedCandidate && (
                        isCoTeachingPartial ? (
                          <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
                            <span className="text-foreground-muted font-bold">
                              Subject:
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-black border border-emerald-500/30">
                              {req.originalSubject || req.subject}
                            </span>
                            <span className="text-xs font-semibold text-foreground-muted">
                              (Unchanged — co-teachers present in class)
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
                            <span className="text-foreground-muted font-bold">
                              Subject:
                            </span>
                            <span className="text-foreground-muted line-through font-semibold">
                              {req.originalSubject || req.subject}
                            </span>
                            <span className="text-foreground-muted font-black">
                              →
                            </span>
                            <input
                              type="text"
                              value={effectiveSubject}
                              onChange={(e) =>
                                setManualSubjects((prev) => ({
                                  ...prev,
                                  [req.id]: e.target.value,
                                }))
                              }
                              className="h-9 sm:h-10 px-3 text-xs sm:text-sm rounded-xl bg-background-secondary border border-border text-foreground font-bold focus:ring-2 focus:ring-primary/40 outline-hidden w-32 sm:w-40"
                              placeholder="New Subject"
                              title="Subject taught by replacement teacher"
                            />
                          </div>
                        )
                      )}

                      {selectedCandidate &&
                        selectedCandidate.matchReasons.length > 1 && (
                          <p className="text-xs text-foreground-muted font-medium">
                            Rationale:{" "}
                            {selectedCandidate.matchReasons
                              .slice(1)
                              .join(" • ")}
                          </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center flex-wrap sm:flex-nowrap">
                      {req.isAlreadySubstituted && (
                        <button
                          type="button"
                          onClick={() =>
                            onRevertSubstitution(
                              selectedDay,
                              req.periodIndex,
                              req.sectionId,
                            )
                          }
                          className="inline-flex items-center gap-1.5 h-10 sm:h-11 px-3 text-xs sm:text-sm font-bold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-colors cursor-pointer whitespace-nowrap"
                          title={`Revert back to original teacher ${req.originalTeacher.code}`}
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Revert</span>
                        </button>
                      )}

                      <div className="relative">
                        <select
                          value={currentAssignedCode || ""}
                          onChange={(e) => {
                            const newCode = e.target.value;
                            setManualAssignments((prev) => ({
                              ...prev,
                              [req.id]: newCode,
                            }));
                            const newCand = req.candidates.find(
                              (c) => c.teacher.code === newCode,
                            );
                            if (newCand) {
                              setManualSubjects((prev) => ({
                                ...prev,
                                [req.id]:
                                  newCand.suggestedSubject ||
                                  newCand.teacher.subject ||
                                  newCand.teacher.dept ||
                                  req.originalSubject ||
                                  req.subject,
                              }));
                            }
                          }}
                          className="h-10 sm:h-11 pl-3 pr-8 text-xs sm:text-sm rounded-xl bg-background-secondary border border-border text-foreground font-bold outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
                        >
                          {req.candidates.map((cand) => (
                            <option
                              key={cand.teacher.code}
                              value={cand.teacher.code}
                            >
                              {cand.teacher.code} ({cand.teacher.subject || cand.teacher.dept}) • Load:{" "}
                              {cand.currentDayLoad}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-subtle pointer-events-none" />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (currentAssignedCode) {
                            handleSingleAssign(
                              req,
                              currentAssignedCode,
                              effectiveSubject,
                            );
                          }
                        }}
                        disabled={!currentAssignedCode}
                        className="inline-flex items-center gap-1.5 h-10 sm:h-11 px-4 text-xs sm:text-sm font-black rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>
                          {req.isAlreadySubstituted ? "Update" : "Assign"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleAutoAssignAll}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-black rounded-2xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg hover:shadow-xl transition-all cursor-pointer whitespace-nowrap active:scale-98"
                >
                  <Table className="w-5 h-5" />
                  <span>Review & Apply Duty Roster ({requirements.length} Classes)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Duty Roster Confirmation Modal */}
        {isConfirmRosterOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          >
            <div className="bg-card border-2 border-border shadow-2xl rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b-2 border-border flex items-start justify-between gap-4 bg-background-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary-subtle text-primary">
                    <ClipboardCheck className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                      Confirm Duty Roster Application
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground-muted font-medium mt-0.5">
                      Day: <strong>{selectedDay}</strong> • Review all teacher replacements before committing changes to the schedule.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsConfirmRosterOpen(false)}
                  className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-background-secondary border border-border text-center">
                    <div className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                      Total Classes
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
                      {plannedRoster.length}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Assigned
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {plannedRoster.filter((r) => r.assignedTeacherCode).length}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
                    <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                      Absent Faculty
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 mt-0.5">
                      {absentTeacherCodes.length}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center">
                    <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                      Shift
                    </div>
                    <div className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 mt-1">
                      Morning (EMMS)
                    </div>
                  </div>
                </div>

                {/* Warning if unassigned */}
                {plannedRoster.some((r) => !r.assignedTeacherCode) && (
                  <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-800 dark:text-amber-300 text-sm font-bold flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                    <span>
                      Notice: Some periods have no free teacher available and will not be substituted.
                    </span>
                  </div>
                )}

                {/* Roster Table */}
                <div className="rounded-2xl border-2 border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead className="bg-background-secondary border-b-2 border-border font-black text-foreground">
                        <tr>
                          <th className="p-3 text-center w-10">#</th>
                          <th className="p-3 w-28">Class & Sec</th>
                          <th className="p-3 w-36">Period & Time</th>
                          <th className="p-3">Absent Teacher</th>
                          <th className="p-3">Assigned Substitute</th>
                          <th className="p-3">Match / Load</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border font-medium">
                        {plannedRoster.map((item) => (
                          <tr
                            key={item.req.id}
                            className="hover:bg-secondary/30 transition-colors"
                          >
                            <td className="p-3 text-center font-bold text-foreground-muted">
                              {item.sl}
                            </td>
                            <td className="p-3">
                              <span className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary font-mono text-sm font-black border border-primary/20">
                                {item.req.sectionId}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="font-black text-foreground">
                                {item.req.periodName}
                              </div>
                              <div className="text-xs text-foreground-muted font-bold">
                                {item.req.periodTime}
                              </div>
                            </td>
                            <td className="p-3">
                              {item.req.isMultiTeacher && !item.req.isAllAbsent ? (
                                <div>
                                  <div className="font-mono font-black text-red-600 dark:text-red-400 text-sm sm:text-base flex items-center gap-1.5 flex-wrap">
                                    <span>{item.req.originalTeacher.code}</span>
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                                      Co-teaching
                                    </span>
                                  </div>
                                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    {item.req.originalSubject || item.req.subject} (Unchanged)
                                  </div>
                                  {item.req.coTeachersPresent && item.req.coTeachersPresent.length > 0 && (
                                    <div className="text-[11px] text-foreground-muted font-semibold">
                                      In class: {item.req.coTeachersPresent.join(", ")}
                                    </div>
                                  )}
                                </div>
                              ) : item.req.isMultiTeacher && item.req.isAllAbsent ? (
                                <div>
                                  <div className="font-mono font-black text-red-600 dark:text-red-400 text-sm sm:text-base flex items-center gap-1.5 flex-wrap">
                                    <span>{item.req.originalTeacher.code}</span>
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                      All Absent
                                    </span>
                                  </div>
                                  <div className="text-xs text-foreground-muted font-semibold line-through">
                                    {item.req.originalSubject || item.req.subject}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="font-mono font-black text-red-600 dark:text-red-400 text-sm sm:text-base">
                                    {item.req.originalTeacher.code}
                                  </div>
                                  <div className="text-xs text-foreground-muted font-semibold line-through">
                                    {item.req.originalSubject || item.req.subject}
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              {item.assignedTeacherCode ? (
                                <div>
                                  <div className="font-mono font-black text-purple-600 dark:text-purple-400 text-sm sm:text-base flex items-center gap-1.5 flex-wrap">
                                    <span>{item.assignedTeacherCode}</span>
                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                                      {item.effectiveSubject}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-danger font-bold text-xs sm:text-sm flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Unassigned
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-xs sm:text-sm">
                              {item.candidate ? (
                                <div className="space-y-0.5">
                                  <div className="font-bold text-foreground">
                                    {item.matchReason}
                                  </div>
                                  <div className="text-xs text-foreground-muted font-semibold">
                                    Load: {item.currentDayLoad} → {item.projectedDayLoad} classes
                                  </div>
                                </div>
                              ) : (
                                <span className="text-danger font-semibold">No faculty available</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-5 sm:p-6 border-t-2 border-border bg-background-secondary/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-foreground-muted font-medium">
                  Changes will be saved and reflected across all routine schedules and print exports.
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsConfirmRosterOpen(false)}
                    className="px-5 py-3 rounded-2xl border-2 border-border hover:bg-secondary text-foreground font-bold text-sm sm:text-base transition-colors cursor-pointer w-full sm:w-auto"
                  >
                    Cancel / Keep Editing
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAndApplyRoster}
                    disabled={plannedRoster.filter((r) => r.assignedTeacherCode).length === 0}
                    className="px-7 py-3 rounded-2xl bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50 font-black text-sm sm:text-base shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Check className="w-5 h-5" />
                    <span>Confirm & Apply Duty Roster</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubstitutions.length > 0 && (
          <div className="p-6 rounded-3xl bg-card border-2 border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                <h3 className="font-black text-base sm:text-lg text-foreground">
                  Active Applied Substitutions on {selectedDay} (
                  {activeSubstitutions.length})
                </h3>
              </div>

              <button
                type="button"
                onClick={handleRevertAllToday}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm text-danger hover:bg-danger-bg rounded-xl border border-danger/30 transition-colors cursor-pointer font-bold"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Revert All on {selectedDay}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {activeSubstitutions.map((sub) => (
                <div
                  key={`${sub.sectionId}_${sub.periodIndex}`}
                  className="p-4 rounded-2xl bg-background-secondary border-2 border-border flex items-center justify-between gap-3 text-xs sm:text-sm"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-foreground flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-mono font-bold text-xs">
                        {sub.sectionId}
                      </span>
                      <span className="font-bold">Period {sub.periodIndex + 1}</span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">
                        • {sub.subject}
                      </span>
                      {sub.originalSubject &&
                        sub.originalSubject !== sub.subject && (
                          <span className="text-foreground-muted text-xs line-through">
                            ({sub.originalSubject})
                          </span>
                        )}
                    </div>
                    <div className="text-xs sm:text-sm text-foreground-muted">
                      Original:{" "}
                      <span className="line-through font-mono font-bold">
                        {sub.originalTeacherCode}
                      </span>{" "}
                      → Sub:{" "}
                      <span className="font-black font-mono text-purple-600 dark:text-purple-400 text-sm">
                        {sub.substituteTeacherCode}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onRevertSubstitution(
                        selectedDay,
                        sub.periodIndex,
                        sub.sectionId,
                      )
                    }
                    className="p-1.5 rounded-xl text-foreground-muted hover:text-danger hover:bg-danger-bg transition-colors cursor-pointer"
                    title="Revert this substitution"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>



      <style jsx global>{`
        @media print {
          @page {
            size: portrait;
            margin: 4mm 4mm 4mm 4mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            width: 100% !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          .routine-print-area,
          .routine-print-area * {
            visibility: visible !important;
          }

          .routine-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .no-print {
            display: none !important;
          }

          .routine-sheet {
            width: 100% !important;
            max-width: 100% !important;
            min-height: 285mm !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
          }

          .routine-print-area table {
            border-collapse: collapse !important;
            border-spacing: 0 !important;
            border: 1.5px solid #000000 !important;
            width: 100% !important;
          }

          .routine-print-area th,
          .routine-print-area td {
            border: 1px solid #000000 !important;
            border-color: #000000 !important;
            background-clip: padding-box !important;
            box-shadow: inset 0 0 0 0.5px #000000 !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
