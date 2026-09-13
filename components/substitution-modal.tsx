"use client";

import * as React from "react";
import {
  DayRoutine,
  TEACHER_DIRECTORY,
  TeacherInfo,
} from "../lib/routine-data";
import {
  getMultiTeacherSubstitutionPlan,
  SubstitutionRequirement,
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
} from "lucide-react";

interface SubstitutionManagerProps {
  routineData: DayRoutine[];
  currentDay: string;
  onApplySubstitution: (
    dayName: string,
    periodIndex: number,
    sectionId: string,
    originalTeacherCode: string,
    substituteTeacherCode: string,
    reason?: string
  ) => void;
  onRevertSubstitution: (dayName: string, periodIndex: number, sectionId: string) => void;
}

export function SubstitutionManager({
  routineData,
  currentDay,
  onApplySubstitution,
  onRevertSubstitution,
}: SubstitutionManagerProps) {
  const [selectedDay, setSelectedDay] = React.useState<string>(currentDay);
  const [absentTeacherCodes, setAbsentTeacherCodes] = React.useState<string[]>(["AA"]);
  const [allowedReplacementCodes, setAllowedReplacementCodes] = React.useState<string[]>([]);
  const [useCustomPool, setUseCustomPool] = React.useState<boolean>(false);
  const [maxDailyLoad, setMaxDailyLoad] = React.useState<number>(5);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedDeptFilter, setSelectedDeptFilter] = React.useState<string>("All");

  // Local manual overrides for any requirement: requirementId -> selected candidate code
  const [manualAssignments, setManualAssignments] = React.useState<Record<string, string>>({});

  const allTeachersList: TeacherInfo[] = React.useMemo(() => {
    return Object.values(TEACHER_DIRECTORY).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const departmentsList = React.useMemo(() => {
    const depts = new Set<string>();
    allTeachersList.forEach((t) => depts.add(t.dept));
    return ["All", ...Array.from(depts).sort()];
  }, [allTeachersList]);

  // Toggle absent teacher
  const handleToggleAbsent = (code: string) => {
    setAbsentTeacherCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Toggle replacement candidate in custom pool
  const handleToggleReplacementPool = (code: string) => {
    setAllowedReplacementCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Compute multi-teacher substitution requirements with dynamic workload & class experience checks
  const requirements: SubstitutionRequirement[] = React.useMemo(() => {
    if (absentTeacherCodes.length === 0) return [];
    return getMultiTeacherSubstitutionPlan({
      dayName: selectedDay,
      absentTeacherCodes,
      allowedReplacementCodes: useCustomPool ? allowedReplacementCodes : undefined,
      routineData,
      maxDailyLoad,
    });
  }, [
    selectedDay,
    absentTeacherCodes,
    allowedReplacementCodes,
    useCustomPool,
    routineData,
    maxDailyLoad,
  ]);

  // Current active substitutions for the selected day across all sections
  const activeSubstitutions = React.useMemo(() => {
    const dayRoutine = routineData.find((d) => d.day === selectedDay);
    if (!dayRoutine) return [];

    const list: Array<{
      sectionId: string;
      periodIndex: number;
      subject: string;
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
        onApplySubstitution(
          selectedDay,
          req.periodIndex,
          req.sectionId,
          req.originalTeacher.code,
          assignedCode,
          "Absence Replacement"
        );
      }
    });
  };

  const handleRevertAllToday = () => {
    activeSubstitutions.forEach((sub) => {
      onRevertSubstitution(selectedDay, sub.periodIndex, sub.sectionId);
    });
  };

  // Filter teachers for absent selection
  const filteredAbsentTeachers = allTeachersList.filter((t) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.dept.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDeptFilter === "All" || t.dept === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* 1. Multi-Absent & Target Pool Control Center */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-danger-bg text-danger">
                <UserX className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-lg text-foreground tracking-tight">
                Multi-Teacher Auto-Replacement Engine
              </h2>
            </div>
            <p className="text-xs text-foreground-muted mt-1">
              Select multiple absent teachers and replacement candidates. The system checks which teachers
              take the selected classes, evaluates current and projected daily workloads, and assigns replacements
              without overloading any faculty member.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {requirements.length > 0 && (
              <button
                type="button"
                onClick={handleAutoAssignAll}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Auto-Assign All {requirements.length} Classes (Balanced)</span>
              </button>
            )}
          </div>
        </div>

        {/* Day, Max Workload, and Pool Mode Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="font-semibold text-foreground block mb-1.5">Day of Routine</label>
            <select
              value={selectedDay}
              onChange={(e) => {
                setSelectedDay(e.target.value);
                setManualAssignments({});
              }}
              className="w-full px-3 py-2 rounded-xl bg-background-secondary border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer font-medium"
            >
              {routineData.map((d) => (
                <option key={d.day} value={d.day}>
                  {d.day}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1.5 flex items-center justify-between">
              <span>Max Daily Workload</span>
              <span className="text-foreground-muted text-[11px]">Guard against overload</span>
            </label>
            <select
              value={maxDailyLoad}
              onChange={(e) => setMaxDailyLoad(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-background-secondary border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer font-medium"
            >
              <option value={4}>Max 4 periods/day (Strict light load)</option>
              <option value={5}>Max 5 periods/day (Standard recommended)</option>
              <option value={6}>Max 6 periods/day (Heavy load permitted)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1.5 flex items-center justify-between">
              <span>Replacement Faculty Pool</span>
              <span className="text-foreground-muted text-[11px]">Eligible substitutes</span>
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

        {/* 2. Select Multiple Absent Teachers */}
        <div className="p-4 rounded-2xl bg-background-secondary/60 border border-border space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <UserX className="w-4 h-4 text-red-500" />
              <span>Select Absent Teachers ({absentTeacherCodes.length} selected):</span>
            </span>

            {/* Quick search & department filter */}
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
                  onClick={() => setAbsentTeacherCodes([])}
                  className="px-2 py-1 text-[11px] text-danger hover:bg-danger-bg rounded-lg transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Selected Absent Badges */}
          {absentTeacherCodes.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {absentTeacherCodes.map((code) => {
                const t = TEACHER_DIRECTORY[code];
                return (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-bold"
                  >
                    <span>{code}</span>
                    <span className="text-[11px] font-normal text-foreground-muted">
                      ({t?.name || "Teacher"})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleAbsent(code)}
                      className="p-0.5 rounded-full hover:bg-red-500/20 text-red-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-foreground-muted italic">
              No absent teachers selected. Click any teacher below to mark absent.
            </p>
          )}

          {/* All Teachers Pill Selector */}
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
                  title={`${t.name} • ${t.dept} • ${t.subject}`}
                >
                  <span className="font-mono font-bold">{t.code}</span>
                  <span className="text-[11px] opacity-80 truncate max-w-[120px]">
                    {t.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Custom Replacement Pool Selector (If enabled) */}
        {useCustomPool && (
          <div className="p-4 rounded-2xl bg-primary-subtle/30 border border-primary/20 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                <span>Selected Replacement Pool ({allowedReplacementCodes.length} faculty):</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setAllowedReplacementCodes(
                      allTeachersList
                        .filter((t) => !absentTeacherCodes.includes(t.code))
                        .map((t) => t.code)
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
                    >
                      {t.code} ({t.dept})
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Requirements & Optimal Assignment Plan */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <span>
                Calculated Assignment Plan ({requirements.length} periods need substitution)
              </span>
            </h3>
            <p className="text-xs text-foreground-muted">
              Ranked by class experience, subject/dept match, and non-overloaded daily workloads.
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
            <h4 className="font-bold text-sm text-foreground">No Substitutions Needed</h4>
            <p className="text-xs text-foreground-muted max-w-md mx-auto">
              {absentTeacherCodes.length === 0
                ? "Select one or more absent teachers above to compute required substitutions."
                : `The selected teacher(s) have no active scheduled classes on ${selectedDay}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requirements.map((req) => {
              const currentAssignedCode =
                manualAssignments[req.id] || req.recommendedCandidate?.teacher.code;
              const selectedCandidate = req.candidates.find(
                (c) => c.teacher.code === currentAssignedCode
              );

              return (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-border/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  {/* Left: Class, Period, Subject & Absent Teacher info */}
                  <div className="space-y-1 sm:max-w-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-bold text-xs">
                        {req.sectionId}
                      </span>
                      <span className="font-bold text-foreground">
                        {req.periodName} ({req.periodTime})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-foreground-muted">
                      <span className="font-semibold text-foreground">{req.subject}</span>
                      <span>•</span>
                      <span>
                        Absent:{" "}
                        <span className="font-bold text-danger">
                          {req.originalTeacher.code}
                        </span>{" "}
                        ({req.originalTeacher.name})
                      </span>
                    </div>
                  </div>

                  {/* Center: Match Details & Workload Protection Status */}
                  <div className="flex-1 space-y-1 md:px-4 border-y md:border-y-0 md:border-x border-border/60 py-2 md:py-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-foreground-muted text-[11px]">Assigned:</span>
                      {selectedCandidate ? (
                        <>
                          <span className="font-bold text-foreground font-mono">
                            {selectedCandidate.teacher.code}
                          </span>
                          <span className="text-foreground-muted">
                            ({selectedCandidate.teacher.name})
                          </span>

                          {/* Experience & Workload badge */}
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

                          {/* Workload Status */}
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
                          <span>No free teacher available in this period</span>
                        </span>
                      )}
                    </div>

                    {selectedCandidate && selectedCandidate.matchReasons.length > 1 && (
                      <p className="text-[11px] text-foreground-muted">
                        Rationale: {selectedCandidate.matchReasons.slice(1).join(" • ")}
                      </p>
                    )}
                  </div>

                  {/* Right: Override Dropdown & Quick Assign Button */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {/* Manual override selector */}
                    <div className="relative">
                      <select
                        value={currentAssignedCode || ""}
                        onChange={(e) =>
                          setManualAssignments((prev) => ({
                            ...prev,
                            [req.id]: e.target.value,
                          }))
                        }
                        className="pl-2.5 pr-8 py-1.5 text-xs rounded-xl bg-background-secondary border border-border text-foreground font-medium outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
                      >
                        {req.candidates.map((cand) => (
                          <option key={cand.teacher.code} value={cand.teacher.code}>
                            {cand.teacher.code} - {cand.teacher.name} (Load:{" "}
                            {cand.currentDayLoad})
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
                            "Manual/Balanced Replacement"
                          );
                        }
                      }}
                      disabled={!currentAssignedCode}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Assign</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Active Substitutions Log for Current Day */}
      {activeSubstitutions.length > 0 && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
              <h3 className="font-bold text-sm text-foreground">
                Active Applied Substitutions on {selectedDay} ({activeSubstitutions.length})
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
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[11px]">
                      {sub.sectionId}
                    </span>
                    <span>Period {sub.periodIndex + 1}</span>
                    <span className="text-foreground-muted">• {sub.subject}</span>
                  </div>
                  <div className="text-[11px] text-foreground-muted mt-0.5">
                    Original: <span className="line-through">{sub.originalTeacherCode}</span> →{" "}
                    Sub:{" "}
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {sub.substituteTeacherCode}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onRevertSubstitution(selectedDay, sub.periodIndex, sub.sectionId)
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
  );
}
