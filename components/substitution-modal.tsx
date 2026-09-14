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
  const [printViewMode, setPrintViewMode] = React.useState<"table" | "grid">(
    "table",
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
  const [selectedDeptFilter, setSelectedDeptFilter] =
    React.useState<string>("All");

  const [manualAssignments, setManualAssignments] = React.useState<
    Record<string, string>
  >({});
  const [manualSubjects, setManualSubjects] = React.useState<
    Record<string, string>
  >({});

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

  const handleToggleReplacementPool = (code: string) => {
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

  const handleAutoAssignAll = () => {
    requirements.forEach((req) => {
      const assignedCode =
        manualAssignments[req.id] || req.recommendedCandidate?.teacher.code;

      if (assignedCode) {
        const candidate = req.candidates.find(
          (c) => c.teacher.code === assignedCode,
        );
        const resolvedSubject =
          manualSubjects[req.id] ||
          candidate?.suggestedSubject ||
          candidate?.teacher.subject ||
          candidate?.teacher.dept ||
          req.originalSubject ||
          req.subject;

        onApplySubstitution(
          selectedDay,
          req.periodIndex,
          req.sectionId,
          req.originalTeacher.code,
          assignedCode,
          undefined,
          resolvedSubject,
        );
      }
    });
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
      if (!map.has(key)) {
        const assignedCode =
          manualAssignments[req.id] || req.recommendedCandidate?.teacher.code;
        if (assignedCode) {
          const sec = dayRoutine.sections.find(
            (s) => s.sectionId === req.sectionId,
          );
          const cell = sec?.periods[req.periodIndex];
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
            originalTeacherCode: req.originalTeacher.code,
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

  const filteredAbsentTeachers = allTeachersList.filter((t) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      selectedDeptFilter === "All" || t.dept === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <div className="p-4 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-danger-bg text-danger">
                  <UserX className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-lg text-foreground tracking-tight">
                  Multi-Teacher Auto-Replacement
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center p-1 rounded-2xl bg-background-secondary border border-border">
                <button
                  type="button"
                  onClick={() => setPrintViewMode("table")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    printViewMode === "table"
                      ? "bg-card text-primary shadow-xs border border-border/80"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Duty Roster</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintViewMode("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    printViewMode === "grid"
                      ? "bg-card text-primary shadow-xs border border-border/80"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Routine Grid</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs transition-colors cursor-pointer"
                title="Print official replacement routine on A4 (Ctrl+P)"
              >
                <Printer className="w-4 h-4" />
                <span>Print Replacements</span>
              </button>

              {requirements.length > 0 && (
                <button
                  type="button"
                  onClick={handleAutoAssignAll}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-card hover:bg-secondary border border-border text-foreground transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Auto-Assign All {requirements.length} Classes</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-semibold text-foreground block mb-1.5">
                Day of Routine
              </label>
              <select
                value={selectedDay}
                onChange={(e) => {
                  setSelectedDay(e.target.value);
                  setManualAssignments({});
                  setManualSubjects({});
                }}
                className="w-full px-3 py-2 rounded-xl bg-background-secondary border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer font-medium"
              >
                {sortDaysCanonical(routineData).map((d) => (
                  <option key={d.day} value={d.day}>
                    {d.day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1.5 flex items-center justify-between">
                <span>Max Daily Workload</span>
              </label>
              <select
                value={maxDailyLoad}
                onChange={(e) => setMaxDailyLoad(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-background-secondary border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer font-medium"
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
              <label className="font-semibold text-foreground block mb-1.5 flex items-center justify-between">
                <span>Replacement Faculty Pool</span>
              </label>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setUseCustomPool(false)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                    !useCustomPool
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-background-secondary text-foreground-muted hover:text-foreground"
                  }`}
                >
                  All Available Faculty
                </button>
                <button
                  type="button"
                  onClick={() => setUseCustomPool(true)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                    useCustomPool
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-background-secondary text-foreground-muted hover:text-foreground"
                  }`}
                >
                  Custom Pool ({allowedReplacementCodes.length})
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-background-secondary/60 border border-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <UserX className="w-4 h-4 text-red-500" />
                <span>
                  Select Absent Teachers ({absentTeacherCodes.length} selected):
                </span>
              </span>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-subtle" />
                  <input
                    type="text"
                    placeholder="Filter teachers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-2.5 py-1 text-xs rounded-xl bg-card border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 w-36 sm:w-44"
                  />
                </div>

                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-xl bg-card border border-border text-foreground outline-hidden cursor-pointer"
                >
                  {departmentsList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                {absentTeacherCodes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setAbsentTeacherCodes([]);
                      setTeacherAbsencePeriods({});
                    }}
                    className="px-2 py-1 text-[11px] text-danger hover:bg-danger-bg rounded-lg transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {absentTeacherCodes.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {absentTeacherCodes.map((code) => {
                    const t = teacherDir[code] || TEACHER_DIRECTORY[code];
                    const isFull = isTeacherFullDay(code);
                    const absentPeriods = teacherAbsencePeriods[code] ?? [
                      0, 1, 2, 3, 4, 5, 6,
                    ];

                    return (
                      <div
                        key={code}
                        className="p-3 rounded-2xl bg-card border border-red-500/30 text-xs flex flex-col gap-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-red-600 dark:text-red-400 text-sm">
                              {code}
                            </span>
                            {(t?.subject || t?.dept) && (
                              <span className="px-2 py-0.5 rounded-lg bg-background-secondary text-[11px] text-foreground-muted font-medium">
                                {t.subject || t.dept}
                              </span>
                            )}
                            <span className="text-[11px] font-semibold text-foreground-muted">
                              {isFull ? (
                                <span className="text-red-500 font-bold">
                                  Full Day Absent
                                </span>
                              ) : absentPeriods.length === 0 ? (
                                <span className="text-emerald-500 font-medium">
                                  Present All Periods
                                </span>
                              ) : (
                                <span>
                                  Absent in {absentPeriods.length} period
                                  {absentPeriods.length > 1 ? "s" : ""}
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
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
                              className={`px-2 py-0.5 text-[10px] rounded-lg font-bold border transition-colors cursor-pointer ${
                                isFull
                                  ? "bg-red-500 text-white border-red-600"
                                  : "bg-background-secondary text-foreground-muted border-border hover:text-foreground"
                              }`}
                            >
                              {isFull ? "Full Day" : "Specific Periods"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleAbsent(code)}
                              className="p-1 rounded-lg hover:bg-red-500/20 text-red-600 cursor-pointer"
                              title={`Remove ${code}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5 border-t border-border/50">
                          <span className="text-[10px] font-semibold text-foreground-subtle mr-0.5">
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
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                                  isPeriodAbsent
                                    ? "bg-red-500 text-white shadow-2xs font-bold"
                                    : "bg-background-secondary text-foreground-muted hover:bg-secondary hover:text-foreground border border-border"
                                }`}
                                title={`Period ${pIdx + 1}: ${
                                  isPeriodAbsent
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
              <p className="text-xs text-foreground-muted italic">
                No absent teachers selected. Click any teacher below to mark
                absent (full day or specific periods).
              </p>
            )}

            <div className="max-h-36 overflow-y-auto pt-1 flex flex-wrap gap-1.5">
              {filteredAbsentTeachers.map((t) => {
                const isAbsent = absentTeacherCodes.includes(t.code);
                return (
                  <button
                    key={t.code}
                    type="button"
                    onClick={() => handleToggleAbsent(t.code)}
                    className={`px-2.5 py-1 text-xs rounded-xl border transition-all cursor-pointer flex items-center gap-1 font-medium ${
                      isAbsent
                        ? "bg-red-500 text-white border-red-600 font-bold shadow-xs"
                        : "bg-card text-foreground hover:bg-secondary border-border"
                    }`}
                    title={`${t.code} • ${t.subject || t.dept}`}
                  >
                    <span className="font-mono font-bold">{t.code}</span>
                    <span className="text-[10px] opacity-75">
                      ({t.subject || t.dept})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {useCustomPool && (
            <div className="p-4 rounded-2xl bg-primary-subtle/30 border border-primary/20 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
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
                    className="px-2 py-0.5 rounded bg-card border border-border text-foreground hover:bg-secondary cursor-pointer"
                  >
                    Select All Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllowedReplacementCodes([])}
                    className="px-2 py-0.5 rounded text-danger hover:bg-danger-bg cursor-pointer"
                  >
                    Clear Pool
                  </button>
                </div>
              </div>

              <div className="max-h-28 overflow-y-auto flex flex-wrap gap-1.5 pt-1">
                {allTeachersList
                  .filter((t) => !absentTeacherCodes.includes(t.code))
                  .map((t) => {
                    const isInPool = allowedReplacementCodes.includes(t.code);
                    return (
                      <button
                        key={t.code}
                        type="button"
                        onClick={() => handleToggleReplacementPool(t.code)}
                        className={`px-2 py-0.5 text-[11px] rounded-lg border transition-all cursor-pointer font-medium ${
                          isInPool
                            ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                            : "bg-card text-foreground-muted hover:text-foreground border-border"
                        }`}
                        title={`${t.code} • ${t.subject || t.dept}`}
                      >
                        {t.code} ({t.subject || t.dept})
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <span>
                  Calculated Assignment Plan ({requirements.length} periods need
                  substitution)
                </span>
              </h3>
              <p className="text-xs text-foreground-muted">
                Ranked by class experience, subject/dept match, and
                non-overloaded daily workloads.
              </p>
            </div>

            {requirements.length > 0 && (
              <button
                type="button"
                onClick={handleAutoAssignAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply All Assignments</span>
              </button>
            )}
          </div>

          {requirements.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-card border border-border space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-sm text-foreground">
                No Substitutions Needed
              </h4>
              <p className="text-xs text-foreground-muted max-w-md mx-auto">
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
                const suggestedSubSubject =
                  selectedCandidate?.suggestedSubject ||
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
                    className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-border/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1 sm:max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-bold text-xs">
                          {req.sectionId}
                        </span>
                        <span className="font-bold text-foreground">
                          {req.periodName} ({req.periodTime})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-foreground-muted flex-wrap">
                        <span className="font-semibold text-foreground">
                          {req.originalSubject || req.subject}
                        </span>
                        <span>•</span>
                        <span>
                          Absent:{" "}
                          <span className="font-bold text-danger font-mono">
                            {req.originalTeacher.code}
                          </span>
                        </span>
                      </div>

                      {req.isAlreadySubstituted &&
                        req.activeSubstituteTeacher && (
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/30 text-[10px]">
                              Currently Substituted by:{" "}
                              {req.activeSubstituteTeacher.code}
                            </span>
                          </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-1.5 md:px-4 border-y md:border-y-0 md:border-x border-border/60 py-2 md:py-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-foreground-muted text-[11px]">
                          Assigned:
                        </span>
                        {selectedCandidate ? (
                          <>
                            <span className="font-bold text-foreground font-mono">
                              {selectedCandidate.teacher.code}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                selectedCandidate.takesThisClass
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                  : selectedCandidate.isSameDept
                                    ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30"
                                    : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                              }`}
                            >
                              {selectedCandidate.matchReasons[0] || "Available"}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                selectedCandidate.isOverloaded
                                  ? "bg-red-500/10 text-red-600"
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
                          <span className="text-danger font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>
                              No free teacher available in this period
                            </span>
                          </span>
                        )}
                      </div>

                      {selectedCandidate && (
                        <div className="flex items-center gap-2 flex-wrap text-[11px]">
                          <span className="text-foreground-muted font-medium">
                            Subject:
                          </span>
                          <span className="text-foreground-muted line-through font-medium">
                            {req.originalSubject || req.subject}
                          </span>
                          <span className="text-foreground-muted font-bold">
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
                            className="px-2 py-0.5 text-xs rounded-lg bg-background-secondary border border-border text-foreground font-semibold focus:ring-1 focus:ring-primary/40 outline-hidden w-28 sm:w-32"
                            placeholder="New Subject"
                            title="Subject taught by replacement teacher"
                          />
                        </div>
                      )}

                      {selectedCandidate &&
                        selectedCandidate.matchReasons.length > 1 && (
                          <p className="text-[11px] text-foreground-muted">
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
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-colors cursor-pointer whitespace-nowrap"
                          title={`Revert back to original teacher ${req.originalTeacher.code}`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Revert ({req.originalTeacher.code})</span>
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
                          className="pl-2.5 pr-8 py-1.5 text-xs rounded-xl bg-background-secondary border border-border text-foreground font-medium outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
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
                        <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-subtle pointer-events-none" />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (currentAssignedCode) {
                            onApplySubstitution(
                              selectedDay,
                              req.periodIndex,
                              req.sectionId,
                              req.originalTeacher.code,
                              currentAssignedCode,
                              undefined,
                              effectiveSubject,
                            );
                          }
                        }}
                        disabled={!currentAssignedCode}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {req.isAlreadySubstituted ? "Update Sub" : "Assign"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {activeSubstitutions.length > 0 && (
          <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                <h3 className="font-bold text-sm text-foreground">
                  Active Applied Substitutions on {selectedDay} (
                  {activeSubstitutions.length})
                </h3>
              </div>

              <button
                type="button"
                onClick={handleRevertAllToday}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs text-danger hover:bg-danger-bg rounded-xl transition-colors cursor-pointer font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert All on {selectedDay}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeSubstitutions.map((sub) => (
                <div
                  key={`${sub.sectionId}_${sub.periodIndex}`}
                  className="p-3 rounded-2xl bg-background-secondary border border-border flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[11px]">
                        {sub.sectionId}
                      </span>
                      <span>Period {sub.periodIndex + 1}</span>
                      <span className="text-purple-600 dark:text-purple-400 font-semibold">
                        • {sub.subject}
                      </span>
                      {sub.originalSubject &&
                        sub.originalSubject !== sub.subject && (
                          <span className="text-foreground-muted text-[10px] line-through">
                            ({sub.originalSubject})
                          </span>
                        )}
                    </div>
                    <div className="text-[11px] text-foreground-muted mt-0.5">
                      Original:{" "}
                      <span className="line-through">
                        {sub.originalTeacherCode}
                      </span>{" "}
                      → Sub:{" "}
                      <span className="font-bold text-purple-600 dark:text-purple-400">
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
                    className="p-1 rounded-lg text-foreground-muted hover:text-danger hover:bg-danger-bg transition-colors cursor-pointer"
                    title="Revert this substitution"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="routine-print-area font-serif mt-8 space-y-6">
        <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-3xl bg-card border border-border shadow-xs">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Printer className="w-4 h-4 text-primary" />
              <span>Official Replacement Document Preview</span>
            </h3>
            <p className="text-xs text-foreground-muted">
              Standard RUMC official portrait format ready for high-resolution
              printing or PDF export.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Replacements</span>
            </button>
          </div>
        </div>

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
              {printViewMode === "table"
                ? "DAILY TEACHER REPLACEMENT & SUBSTITUTION SCHEDULE — 2026"
                : "DAILY ROUTINE WITH TEACHER REPLACEMENTS — 2026"}
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

            {printViewMode === "table" ? (
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
            ) : (
              <div className="overflow-x-auto">
                <table
                  className="w-full text-center border-collapse"
                  style={{
                    border: "1.5px solid #000000",
                    fontFamily: "'Times New Roman', Times, serif",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        className="p-1.5 text-center w-24 font-bold"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#FFFF00",
                          color: "#000000",
                        }}
                      >
                        <div className="text-[13px]">Class &amp; Sec</div>
                      </th>
                      <th
                        className="p-1 text-center font-bold"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#8DB3E2",
                          color: "#000000",
                        }}
                      >
                        <div className="text-[13px]">1st</div>
                        <div className="text-[10px] font-normal leading-none mt-0.5">
                          {getPeriodTime(1, "7.30-8.10")}
                        </div>
                      </th>
                      <th
                        className="p-1 text-center font-bold"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#8DB3E2",
                          color: "#000000",
                        }}
                      >
                        <div className="text-[13px]">2nd</div>
                        <div className="text-[10px] font-normal leading-none mt-0.5">
                          {getPeriodTime(2, "8.10-8.45")}
                        </div>
                      </th>
                      <th
                        className="p-1 text-center font-bold"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#8DB3E2",
                          color: "#000000",
                        }}
                      >
                        <div className="text-[13px]">3rd</div>
                        <div className="text-[10px] font-normal leading-none mt-0.5">
                          {getPeriodTime(3, "8.45-9.20")}
                        </div>
                      </th>
                      <th
                        className="p-1 text-center font-bold"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#8DB3E2",
                          color: "#000000",
                        }}
                      >
                        <div className="text-[13px]">4th</div>
                        <div className="text-[10px] font-normal leading-none mt-0.5">
                          {getPeriodTime(4, "9.20-9.55")}
                        </div>
                      </th>
                      <th
                        className="p-1 text-center w-16 text-[12px] font-bold"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#8DB3E2",
                          color: "#000000",
                        }}
                      >
                        <div>Break</div>
                        <div className="text-[10px] font-normal leading-none mt-0.5">
                          ({getPeriodTime(0, "9.55-10.25")})
                        </div>
                      </th>
                      <th
                        className="p-1 text-center font-bold"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#8DB3E2",
                          color: "#000000",
                        }}
                      >
                        <div className="text-[13px]">5th</div>
                        <div className="text-[10px] font-normal leading-none mt-0.5">
                          {getPeriodTime(5, "10.25-11.00")}
                        </div>
                      </th>
                      <th
                        className="p-1 text-center font-bold"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#8DB3E2",
                          color: "#000000",
                        }}
                      >
                        <div className="text-[13px]">6th</div>
                        <div className="text-[10px] font-normal leading-none mt-0.5">
                          {getPeriodTime(6, "11.00-11.35")}
                        </div>
                      </th>
                      <th
                        className="p-1 text-center font-bold"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#8DB3E2",
                          color: "#000000",
                        }}
                      >
                        <div className="text-[13px]">7th</div>
                        <div className="text-[10px] font-normal leading-none mt-0.5">
                          {getPeriodTime(7, "11.35-12.10")}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDayRoutine.sections.map((sec, rowIdx) => {
                      const isClosed = !sec.isActive;

                      const renderGridCell = (pIdx: number) => {
                        if (isClosed) {
                          return (
                            <td
                              key={pIdx}
                              className="p-1.5 text-center text-rose-700 bg-rose-50"
                              style={{ border: "1px solid #000000" }}
                            >
                              <div className="text-[10px] font-bold uppercase tracking-wide">
                                Closed
                              </div>
                              {sec.statusReason && (
                                <div className="text-[9px] text-rose-600 font-medium truncate max-w-[85px] mx-auto">
                                  {sec.statusReason}
                                </div>
                              )}
                            </td>
                          );
                        }

                        const subData = substitutedMap.get(
                          `${sec.sectionId}_${pIdx}`,
                        );
                        if (subData) {
                          return (
                            <td
                              key={pIdx}
                              className="p-1 text-center"
                              style={{
                                border: "1px solid #000000",
                                backgroundColor: "#F3E8FF",
                              }}
                            >
                              <div className="space-y-0.5">
                                <div className="font-bold text-[12px] text-black leading-tight">
                                  {subData.subject}
                                </div>
                                {subData.originalSubject &&
                                  subData.originalSubject !==
                                    subData.subject && (
                                    <div className="text-[8px] text-zinc-500 line-through">
                                      was {subData.originalSubject}
                                    </div>
                                  )}
                                <div className="flex items-center justify-center gap-1">
                                  <span className="font-mono font-bold text-purple-700 text-[13px]">
                                    {subData.substituteTeacherCode}
                                  </span>
                                  <span className="text-[9px] text-zinc-600">
                                    (for {subData.originalTeacherCode})
                                  </span>
                                </div>
                                <span className="inline-block px-1 text-[8px] bg-purple-700 text-white font-bold rounded">
                                  SUB
                                </span>
                              </div>
                            </td>
                          );
                        }

                        const cell = sec.periods[pIdx];
                        if (!cell) {
                          return (
                            <td
                              key={pIdx}
                              className="p-1.5 text-center text-zinc-300 text-[11px]"
                              style={{
                                border: "1px solid #000000",
                                backgroundColor: "#FAFAFA",
                              }}
                            >
                              -
                            </td>
                          );
                        }

                        return (
                          <td
                            key={pIdx}
                            className="p-1 text-center"
                            style={{
                              border: "1px solid #000000",
                              backgroundColor: "#FFFFFF",
                            }}
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold text-[12px] text-black leading-tight">
                                {cell.subject}
                              </div>
                              <div className="font-mono font-bold text-[13px] text-zinc-800">
                                {cell.teacherCode}
                              </div>
                            </div>
                          </td>
                        );
                      };

                      return (
                        <tr key={sec.sectionId} className="h-11">
                          <td
                            className="p-1 text-center font-bold text-[12px]"
                            style={{
                              border: "1px solid #000000",
                              backgroundColor: "#FFFF00",
                            }}
                          >
                            {sec.sectionId}
                          </td>
                          {renderGridCell(0)}
                          {renderGridCell(1)}
                          {renderGridCell(2)}
                          {renderGridCell(3)}

                          {rowIdx === 0 && (
                            <td
                              rowSpan={currentDayRoutine.sections.length}
                              className="text-center font-bold text-[12px] tracking-wider align-middle"
                              style={{
                                border: "1px solid #000000",
                                backgroundColor: "#FFFFCC",
                                writingMode: "vertical-rl",
                                transform: "rotate(180deg)",
                              }}
                            >
                              BREAK / TIFFIN
                            </td>
                          )}

                          {renderGridCell(4)}
                          {renderGridCell(5)}
                          {renderGridCell(6)}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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

          <div className="text-center text-[10px] text-zinc-500 pt-2 border-t border-zinc-200 mt-2">
            RAJUK UTTARA MODEL COLLEGE • ROUTINE AUTOMATION SYSTEM
          </div>
        </div>
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
