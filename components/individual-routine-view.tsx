"use client";

import * as React from "react";
import {
  DayRoutine,
  PeriodTiming,
  DEFAULT_PERIOD_TIMINGS,
  getTodaysFullDate,
  TEACHER_DIRECTORY,
  TeacherInfo,
  RoutineCell,
  isNonTeachingSubject,
} from "../lib/routine-data";
import { Printer, User, GraduationCap, Award, X } from "lucide-react";

interface IndividualRoutineViewProps {
  routineData: DayRoutine[];
  timings?: PeriodTiming[];
  teachers?: Record<string, TeacherInfo>;
  onUpdateCell?: (
    day: string,
    sectionId: string,
    periodIndex: number,
    cell: RoutineCell | null,
  ) => void;
  onToggleSectionStatus?: (
    day: string,
    sectionId: string,
    isActive: boolean,
    reason?: string,
  ) => void;
}

type Mode = "teacher" | "section";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
] as const;

export function IndividualRoutineView({
  routineData,
  timings = DEFAULT_PERIOD_TIMINGS,
  teachers,
  onUpdateCell,
  onToggleSectionStatus,
}: IndividualRoutineViewProps) {
  const [mode, setMode] = React.useState<Mode>("teacher");
  const [editingCell, setEditingCell] = React.useState<{
    day: string;
    sectionId: string;
    periodIndex: number;
    cell: RoutineCell | null;
  } | null>(null);

  // Period timing lookup helper
  const getPeriodTime = (index: number, fallback: string) => {
    const found = timings.find((t) => t.index === index);
    return found ? found.time : fallback;
  };

  // ==========================================
  // 1. EXTRACT ALL TEACHERS & COMPUTE LOADS
  // ==========================================
  const allTeachers = React.useMemo(() => {
    const teacherMap: Record<string, TeacherInfo> = {
      ...(teachers || TEACHER_DIRECTORY),
    };

    routineData.forEach((day) => {
      day.sections.forEach((sec) => {
        sec.periods.forEach((p) => {
          if (!p) return;
          const codes = [p.teacherCode, p.substituteTeacherCode].filter(
            Boolean,
          ) as string[];
          codes.forEach((code) => {
            const parts = code
              .split(/[/,]/)
              .map((s) => s.trim())
              .filter(Boolean);
            parts.forEach((c) => {
              const isReal = !isNonTeachingSubject(p.subject, p.isExam);
              if (!teacherMap[c]) {
                teacherMap[c] = {
                  code: c,
                  dept: "General",
                  subject: isReal && p.subject ? p.subject : "Subject",
                };
              } else if (
                teacherMap[c].subject === "Subject" &&
                isReal &&
                p.subject
              ) {
                teacherMap[c].subject = p.subject;
              }
            });
          });
        });
      });
    });

    return teacherMap;
  }, [routineData, teachers]);

  const teacherSchedules = React.useMemo(() => {
    const schedules: Record<
      string,
      Record<
        string,
        Record<
          number,
          Array<{
            sectionId: string;
            subject: string;
            room?: string;
            isSub?: boolean;
            originalTeacherCode?: string;
          }>
        >
      >
    > = {};

    Object.keys(allTeachers).forEach((code) => {
      schedules[code] = {};
      DAYS_OF_WEEK.forEach((d) => {
        schedules[code][d] = {};
      });
    });

    routineData.forEach((dayRoutine) => {
      const day = dayRoutine.day;
      dayRoutine.sections.forEach((sec) => {
        if (!sec.isActive) return;
        sec.periods.forEach((p, periodIdx) => {
          if (!p) return;
          const activeCode = p.substituteTeacherCode || p.teacherCode;
          if (!activeCode) return;

          const parts = activeCode
            .split(/[/,]/)
            .map((s) => s.trim())
            .filter(Boolean);
          parts.forEach((tCode) => {
            if (!schedules[tCode]) {
              schedules[tCode] = {};
              DAYS_OF_WEEK.forEach((d) => {
                schedules[tCode][d] = {};
              });
            }
            if (!schedules[tCode][day]) {
              schedules[tCode][day] = {};
            }
            if (!schedules[tCode][day][periodIdx]) {
              schedules[tCode][day][periodIdx] = [];
            }
            schedules[tCode][day][periodIdx].push({
              sectionId: sec.sectionId,
              subject: p.subject,
              room: p.room,
              isSub: Boolean(
                p.substituteTeacherCode &&
                p.substituteTeacherCode.includes(tCode),
              ),
              originalTeacherCode: p.teacherCode,
            });
          });
        });
      });
    });

    return schedules;
  }, [allTeachers, routineData]);

  // Teacher load counts
  const teacherTotalLoads = React.useMemo(() => {
    const loads: Record<
      string,
      { total: number; byDay: Record<string, number> }
    > = {};
    Object.keys(allTeachers).forEach((code) => {
      loads[code] = {
        total: 0,
        byDay: { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0 },
      };
      const sched = teacherSchedules[code];
      if (sched) {
        DAYS_OF_WEEK.forEach((d) => {
          let count = 0;
          if (sched[d]) {
            Object.values(sched[d]).forEach((arr) => {
              if (arr.length > 0) count++;
            });
          }
          loads[code].byDay[d] = count;
          loads[code].total += count;
        });
      }
    });
    return loads;
  }, [allTeachers, teacherSchedules]);

  // Teacher selection state
  const sortedTeacherCodes = React.useMemo(() => {
    return Object.keys(allTeachers).sort((a, b) => {
      // Sort by active weekly load descending, then by code
      const loadA = teacherTotalLoads[a]?.total || 0;
      const loadB = teacherTotalLoads[b]?.total || 0;
      if (loadB !== loadA) return loadB - loadA;
      return a.localeCompare(b);
    });
  }, [allTeachers, teacherTotalLoads]);

  const [selectedTeacherCode, setSelectedTeacherCode] = React.useState<string>(
    sortedTeacherCodes[0] || "SM",
  );

  // ==========================================
  // 2. EXTRACT ALL SECTIONS
  // ==========================================
  const allSections = React.useMemo(() => {
    const firstDay = routineData[0];
    if (!firstDay) return [];
    return firstDay.sections.map((s) => ({
      sectionId: s.sectionId,
      className: s.className,
      sectionName: s.sectionName,
    }));
  }, [routineData]);

  const [selectedSectionId, setSelectedSectionId] = React.useState<string>(
    allSections[0]?.sectionId || "6A",
  );
  const [selectedClassFilter, setSelectedClassFilter] =
    React.useState<string>("all");

  const filteredSections = React.useMemo(() => {
    if (selectedClassFilter === "all") return allSections;
    return allSections.filter((s) => s.className === selectedClassFilter);
  }, [allSections, selectedClassFilter]);

  const uniqueClasses = React.useMemo(() => {
    return Array.from(new Set(allSections.map((s) => s.className)));
  }, [allSections]);

  // Handle Print Routine
  const handlePrint = () => {
    window.print();
  };

  const selectedTeacher = allTeachers[selectedTeacherCode] || {
    code: selectedTeacherCode,
    name: selectedTeacherCode,
    dept: "General",
    subject: "Subject",
  };

  const selectedTeacherLoad = teacherTotalLoads[selectedTeacherCode] || {
    total: 0,
    byDay: { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0 },
  };

  const selectedSectionInfo = allSections.find(
    (s) => s.sectionId === selectedSectionId,
  ) || {
    sectionId: selectedSectionId,
    className: "Class",
    sectionName: selectedSectionId,
  };

  return (
    <div className="space-y-6">
      <div className="no-print p-4 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span>Routine Generator</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-stretch sm:self-auto w-full sm:w-auto">
            <div className="flex items-center p-1 rounded-2xl bg-background-secondary border border-border">
              <button
                type="button"
                onClick={() => setMode("teacher")}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex-1 sm:flex-none ${
                  mode === "teacher"
                    ? "bg-card text-primary shadow-xs border border-border/80"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Teacher Routine</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("section")}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex-1 sm:flex-none ${
                  mode === "section"
                    ? "bg-card text-primary shadow-xs border border-border/80"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Class Routine</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs transition-colors cursor-pointer"
              title="Print official routine on A4 (Ctrl+P)"
            >
              <Printer className="w-4 h-4" />
              <span>Print Routine</span>
            </button>
          </div>
        </div>

        {/* Dynamic Selector based on selected mode */}
        {mode === "teacher" ? (
          <div className="pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Select Teacher ({sortedTeacherCodes.length} Faculty Members
                Available)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={selectedTeacherCode}
                    onChange={(e) => setSelectedTeacherCode(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-xs rounded-xl bg-background-secondary border border-border text-foreground font-semibold outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    {sortedTeacherCodes.map((code) => {
                      const t = allTeachers[code];
                      const load = teacherTotalLoads[code]?.total || 0;
                      return (
                        <option key={code} value={code}>
                          {code} ({t?.dept || "General"}) • {load} periods/week
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick stats badge */}
            <div className="p-2.5 rounded-xl bg-background-secondary border border-border flex items-center justify-between text-xs">
              <span className="text-foreground-muted">Weekly Load:</span>
              <span className="font-bold text-primary">
                {selectedTeacherLoad.total} periods across 5 days
              </span>
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-border space-y-3">
            {/* Class filter chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-foreground mr-1">
                Class Filter:
              </span>
              <button
                type="button"
                onClick={() => setSelectedClassFilter("all")}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedClassFilter === "all"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-background-secondary hover:bg-card border border-border text-foreground-muted hover:text-foreground"
                }`}
              >
                All Classes
              </button>
              {uniqueClasses.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClassFilter(cls)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedClassFilter === cls
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-background-secondary hover:bg-card border border-border text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>

            {/* Section pills */}
            <div className="flex flex-wrap gap-1.5">
              {filteredSections.map((sec) => (
                <button
                  key={sec.sectionId}
                  type="button"
                  onClick={() => setSelectedSectionId(sec.sectionId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedSectionId === sec.sectionId
                      ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/20 scale-105"
                      : "bg-background-secondary hover:bg-card border border-border text-foreground hover:text-primary"
                  }`}
                >
                  {sec.sectionId}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. AUTHENTIC OFFICIAL ROUTINE SHEET (Targeted by .routine-print-area) */}
      <div className="routine-print-area">
        {mode === "teacher" ? (
          /* =========================================================================
             OFFICIAL INDIVIDUAL TEACHER ROUTINE SHEET (EXACT RUMC STYLING & COLORS)
             ========================================================================= */
          <div
            className="routine-sheet min-h-[297mm] flex flex-col justify-between p-6 sm:p-8 bg-white border border-border shadow-xs text-black transition-colors"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              color: "#000000",
              backgroundColor: "#ffffff",
            }}
          >
            {/* Header: WEF Date in RED & Shift Name */}
            <div className="flex items-center justify-between text-[11px] font-bold tracking-wide pb-1 border-b border-zinc-200">
              <span style={{ color: "#FF0000" }}>
                WEF: {getTodaysFullDate()}
              </span>
              <span className="text-zinc-600 text-[10px] uppercase font-semibold">
                EMMS
              </span>
            </div>

            {/* College Name & Subtitle */}
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

            {/* Yellow Banner: Teacher's Individual Routine */}
            <div
              className="py-1 px-3 text-center font-bold text-[13px] tracking-wide my-2 uppercase"
              style={{
                backgroundColor: "#FFFF00",
                color: "#000000",
                border: "1px solid #000000",
                fontWeight: 700,
              }}
            >
              TEACHER&apos;S INDIVIDUAL CLASS ROUTINE — 2026
            </div>

            {/* Teacher Meta Info Box */}
            <div
              className="p-2.5 mb-3 flex flex-wrap items-center justify-between gap-2 text-[12px] border"
              style={{
                borderColor: "#000000",
                backgroundColor: "#F9FAFB",
              }}
            >
              <div>
                <span className="font-bold">Teacher Acronym: </span>
                <span className="font-bold text-black uppercase">
                  {selectedTeacher.code}
                </span>
              </div>
              <div>
                <span className="font-bold">Department: </span>
                <span className="font-semibold">{selectedTeacher.dept}</span>
              </div>
              <div>
                <span className="font-bold">Main Subject: </span>
                <span className="font-semibold">{selectedTeacher.subject}</span>
              </div>
              <div>
                <span className="font-bold">Total Load: </span>
                <span className="font-bold" style={{ color: "#00B050" }}>
                  {selectedTeacherLoad.total} Periods / Week
                </span>
              </div>
            </div>

            {/* 5-Day Weekly Routine Grid */}
            <div className="overflow-x-auto">
              <table
                className="w-full text-center border-collapse"
                style={{
                  border: "1px solid #000000",
                  fontFamily: "'Times New Roman', Times, serif",
                }}
              >
                <thead>
                  <tr>
                    <th
                      className="p-1.5 text-center w-24 font-bold"
                      style={{
                        border: "1px solid #000000",
                        backgroundColor: "#8DB3E2",
                        color: "#000000",
                      }}
                    >
                      <div className="text-[13px]">Day</div>
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
                    {/* Official Break Column */}
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
                        ({getPeriodTime(0, "9.55-10:25")})
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
                    <th
                      className="p-1.5 text-center w-14 font-bold"
                      style={{
                        border: "1px solid #000000",
                        backgroundColor: "#8DB3E2",
                        color: "#000000",
                      }}
                    >
                      <div className="text-[12px]">Load</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS_OF_WEEK.map((dayName, rowIdx) => {
                    const sched =
                      teacherSchedules[selectedTeacherCode]?.[dayName] || {};
                    const dayLoad = selectedTeacherLoad.byDay[dayName] || 0;

                    const renderCell = (periodIdx: number) => {
                      const classes = sched[periodIdx];
                      if (!classes || classes.length === 0) {
                        return (
                          <td
                            key={periodIdx}
                            className="p-2 text-center text-zinc-400 text-[11px]"
                            style={{
                              border: "1px solid #000000",
                              backgroundColor: "#FAFAFA",
                            }}
                          >
                            <span className="italic font-sans text-[10px] text-zinc-400">
                              Free
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={periodIdx}
                          onClick={() => {
                            if (!onUpdateCell || !classes[0]) return;
                            const dayRoutine = routineData.find(
                              (d) => d.day === dayName,
                            );
                            const sec = dayRoutine?.sections.find(
                              (s) => s.sectionId === classes[0].sectionId,
                            );
                            const targetCell = sec?.periods[periodIdx] || null;
                            setEditingCell({
                              day: dayName,
                              sectionId: classes[0].sectionId,
                              periodIndex: periodIdx,
                              cell: targetCell,
                            });
                          }}
                          className={`p-1.5 text-center ${onUpdateCell ? "cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-inset transition-shadow" : ""}`}
                          title={
                            onUpdateCell
                              ? "Click to edit period details"
                              : undefined
                          }
                          style={{
                            border: "1px solid #000000",
                            backgroundColor: classes.some((c) => c.isSub)
                              ? "#F3E8FF"
                              : "#FFFFFF",
                          }}
                        >
                          {classes.map((cls, cIdx) => (
                            <div key={cIdx} className="space-y-0.5">
                              <div className="font-bold text-[13px] text-black leading-tight">
                                {cls.sectionId}
                              </div>
                              <div className="text-[11px] font-semibold text-zinc-800 leading-tight">
                                {cls.subject}
                              </div>
                              {cls.isSub && (
                                <span className="inline-block px-1 text-[8px] bg-purple-700 text-white font-bold rounded">
                                  SUB
                                  {cls.originalTeacherCode
                                    ? ` (for ${cls.originalTeacherCode})`
                                    : ""}
                                </span>
                              )}
                            </div>
                          ))}
                        </td>
                      );
                    };

                    return (
                      <tr key={dayName} className="h-14">
                        {/* Day Name */}
                        <td
                          className="p-2 text-center font-bold text-[12px]"
                          style={{
                            border: "1px solid #000000",
                            backgroundColor: "#F3F4F6",
                          }}
                        >
                          {dayName}
                        </td>

                        {/* Periods 1 to 4 */}
                        {renderCell(0)}
                        {renderCell(1)}
                        {renderCell(2)}
                        {renderCell(3)}

                        {/* Break Column */}
                        {rowIdx === 0 && (
                          <td
                            rowSpan={DAYS_OF_WEEK.length}
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

                        {/* Periods 5 to 7 */}
                        {renderCell(4)}
                        {renderCell(5)}
                        {renderCell(6)}

                        {/* Daily Load */}
                        <td
                          className="p-2 text-center font-bold text-[12px]"
                          style={{
                            border: "1px solid #000000",
                            backgroundColor: "#F3F4F6",
                          }}
                        >
                          {dayLoad}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Official Signatures Block (Replica of RUMC PDF Format) */}
            <div className="mt-auto pt-8 grid grid-cols-4 gap-4 text-center text-[11px] font-bold text-black border-t border-zinc-300">
              <div className="space-y-1">
                <div className="w-32 mx-auto border-b border-black mb-1"></div>
                <div>Teacher&apos;s Signature</div>
              </div>
              <div className="space-y-1">
                <div className="w-32 mx-auto border-b border-black mb-1"></div>
                <div>Sign of OIC Routine Comm.</div>
              </div>
              <div className="space-y-1">
                <div className="w-32 mx-auto border-b border-black mb-1"></div>
                <div>Sign of Chairman Routine Comm.</div>
              </div>
              <div className="space-y-1">
                <div className="w-32 mx-auto border-b border-black mb-1"></div>
                <div>Sign of VP (EMMS)</div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             OFFICIAL CLASS & SECTION ROUTINE SHEET (EXACT RUMC STYLING & COLORS)
             ========================================================================= */
          <div
            className="routine-sheet min-h-[297mm] flex flex-col justify-between p-6 sm:p-8 bg-white border border-border shadow-xs text-black transition-colors"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              color: "#000000",
              backgroundColor: "#ffffff",
            }}
          >
            {/* Header: WEF Date in RED & Shift Name */}
            <div className="flex items-center justify-between text-[11px] font-bold tracking-wide pb-1 border-b border-zinc-200">
              <span style={{ color: "#FF0000" }}>
                WEF: {getTodaysFullDate()}
              </span>
              <span className="text-zinc-600 text-[10px] uppercase font-semibold">
                EMMS
              </span>
            </div>

            {/* College Name & Subtitle */}
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

            {/* Yellow Banner: Class Routine */}
            <div
              className="py-1 px-3 text-center font-bold text-[13px] tracking-wide my-2 uppercase"
              style={{
                backgroundColor: "#FFFF00",
                color: "#000000",
                border: "1px solid #000000",
                fontWeight: 700,
              }}
            >
              CLASS &amp; SECTION ROUTINE — 2026
            </div>

            {/* Class & Section Meta Info Box */}
            <div
              className="p-2.5 mb-3 flex flex-wrap items-center justify-between gap-2 text-[12px] border"
              style={{
                borderColor: "#000000",
                backgroundColor: "#F9FAFB",
              }}
            >
              <div>
                <span className="font-bold">Class: </span>
                <span className="font-semibold text-black uppercase">
                  {selectedSectionInfo.className}
                </span>
              </div>
              <div>
                <span className="font-bold">Section: </span>
                <span className="font-bold text-black uppercase">
                  {selectedSectionInfo.sectionId}
                </span>
              </div>
              <div>
                <span className="font-bold">Medium / Shift: </span>
                <span className="font-semibold">
                  English Medium • Morning Shift
                </span>
              </div>
              <div>
                <span className="font-bold">Academic Year: </span>
                <span className="font-semibold">2026</span>
              </div>
            </div>

            {/* 5-Day Weekly Routine Grid for this Section */}
            <div className="overflow-x-auto">
              <table
                className="w-full text-center border-collapse"
                style={{
                  border: "1px solid #000000",
                  fontFamily: "'Times New Roman', Times, serif",
                }}
              >
                <thead>
                  <tr>
                    <th
                      className="p-1.5 text-center w-24 font-bold"
                      style={{
                        border: "1px solid #000000",
                        backgroundColor: "#8DB3E2",
                        color: "#000000",
                      }}
                    >
                      <div className="text-[13px]">Day</div>
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
                    {/* Official Break Column */}
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
                        ({getPeriodTime(0, "9.55-10:25")})
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
                  {DAYS_OF_WEEK.map((dayName, rowIdx) => {
                    const dayRoutine = routineData.find(
                      (d) => d.day === dayName,
                    );
                    const secRoutine = dayRoutine?.sections.find(
                      (s) => s.sectionId === selectedSectionId,
                    );

                    const isClosed = secRoutine && !secRoutine.isActive;

                    const renderCell = (periodIdx: number) => {
                      if (isClosed) {
                        return (
                          <td
                            key={periodIdx}
                            onClick={() => {
                              if (onToggleSectionStatus) {
                                const newReason = prompt(
                                  `Edit close reason for ${secRoutine.sectionId} (${dayName}):`,
                                  secRoutine.statusReason || "Exam",
                                );
                                if (newReason !== null) {
                                  if (newReason.trim()) {
                                    onToggleSectionStatus(
                                      dayName,
                                      secRoutine.sectionId,
                                      false,
                                      newReason.trim(),
                                    );
                                  } else {
                                    onToggleSectionStatus(
                                      dayName,
                                      secRoutine.sectionId,
                                      true,
                                      "Normal",
                                    );
                                  }
                                }
                              }
                            }}
                            className={`p-1.5 text-center text-rose-700 bg-rose-50 ${onToggleSectionStatus ? "cursor-pointer hover:bg-rose-100 transition-colors" : ""}`}
                            title={
                              onToggleSectionStatus
                                ? "Click to edit close reason or reactivate"
                                : undefined
                            }
                            style={{ border: "1px solid #000000" }}
                          >
                            <div className="text-[10px] font-bold uppercase tracking-wide">
                              Closed
                            </div>
                            {secRoutine.statusReason && (
                              <div className="text-[9px] text-rose-600 font-medium truncate max-w-[85px] mx-auto">
                                {secRoutine.statusReason}
                              </div>
                            )}
                          </td>
                        );
                      }

                      const cell = secRoutine?.periods[periodIdx];
                      if (!cell) {
                        return (
                          <td
                            key={periodIdx}
                            onClick={() => {
                              if (onUpdateCell) {
                                setEditingCell({
                                  day: dayName,
                                  sectionId: selectedSectionId,
                                  periodIndex: periodIdx,
                                  cell: null,
                                });
                              }
                            }}
                            className={`p-2 text-center text-zinc-300 text-[11px] ${onUpdateCell ? "cursor-pointer hover:bg-blue-50/50 hover:ring-2 hover:ring-blue-400 hover:ring-inset transition-all" : ""}`}
                            title={
                              onUpdateCell
                                ? "Click to assign class to this period"
                                : undefined
                            }
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
                          key={periodIdx}
                          onClick={() => {
                            if (onUpdateCell) {
                              setEditingCell({
                                day: dayName,
                                sectionId: selectedSectionId,
                                periodIndex: periodIdx,
                                cell,
                              });
                            }
                          }}
                          className={`p-1.5 text-center ${onUpdateCell ? "cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-inset transition-all" : ""}`}
                          title={
                            onUpdateCell
                              ? "Click to edit period details"
                              : undefined
                          }
                          style={{
                            border: "1px solid #000000",
                            backgroundColor: cell.substituteTeacherCode
                              ? "#F3E8FF"
                              : "#FFFFFF",
                          }}
                        >
                          <div className="font-bold text-[14px] text-black leading-tight">
                            {cell.subject}
                          </div>
                          {cell.substituteTeacherCode ? (
                            <div className="mt-0.5">
                              <div className="text-[12px] font-bold text-purple-900 leading-tight">
                                {cell.substituteTeacherCode}
                              </div>
                              <div className="text-[10px] font-semibold text-purple-700 leading-none mt-0.5">
                                (for {cell.teacherCode})
                              </div>
                            </div>
                          ) : (
                            <div className="text-[12px] font-bold text-blue-900 mt-0.5 leading-tight">
                              {cell.teacherCode}
                            </div>
                          )}
                        </td>
                      );
                    };

                    return (
                      <tr key={dayName} className="h-14">
                        {/* Day Name */}
                        <td
                          className="p-2 text-center font-bold text-[12px]"
                          style={{
                            border: "1px solid #000000",
                            backgroundColor: "#F3F4F6",
                          }}
                        >
                          {dayName}
                        </td>

                        {/* Periods 1 to 4 */}
                        {renderCell(0)}
                        {renderCell(1)}
                        {renderCell(2)}
                        {renderCell(3)}

                        {/* Break Column */}
                        {rowIdx === 0 && (
                          <td
                            rowSpan={DAYS_OF_WEEK.length}
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

                        {/* Periods 5 to 7 */}
                        {renderCell(4)}
                        {renderCell(5)}
                        {renderCell(6)}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Signatures Block */}
            <div className="mt-auto pt-8 grid grid-cols-4 gap-4 text-center text-[11px] font-bold text-black border-t border-zinc-300">
              <div className="space-y-1">
                <div className="w-32 mx-auto border-b border-black mb-1"></div>
                <div>Class Teacher</div>
              </div>
              <div className="space-y-1">
                <div className="w-32 mx-auto border-b border-black mb-1"></div>
                <div>Convener, Routine</div>
              </div>
              <div className="space-y-1">
                <div className="w-32 mx-auto border-b border-black mb-1"></div>
                <div>In-Charge (EMMS)</div>
              </div>
              <div className="space-y-1">
                <div className="w-32 mx-auto border-b border-black mb-1"></div>
                <div>Principal, RUMC</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {editingCell && (
        <div className="no-print fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border p-4 sm:p-6 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-base text-foreground">
                  Edit Cell: {editingCell.sectionId} • Period{" "}
                  {editingCell.periodIndex + 1}
                </h3>
                <p className="text-xs text-foreground-muted">
                  Day: {editingCell.day}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCell(null)}
                className="p-1.5 rounded-lg hover:bg-secondary text-foreground-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!onUpdateCell) return;
                const form = e.currentTarget;
                const subject = (
                  form.elements.namedItem("subject") as HTMLInputElement
                ).value.trim();
                const teacherCode = (
                  form.elements.namedItem("teacherCode") as HTMLInputElement
                ).value.trim();
                const room = (
                  form.elements.namedItem("room") as HTMLInputElement
                ).value.trim();

                if (!subject || !teacherCode) {
                  onUpdateCell(
                    editingCell.day,
                    editingCell.sectionId,
                    editingCell.periodIndex,
                    null,
                  );
                } else {
                  onUpdateCell(
                    editingCell.day,
                    editingCell.sectionId,
                    editingCell.periodIndex,
                    {
                      subject,
                      teacherCode,
                      room: room || editingCell.cell?.room || undefined,
                      substituteTeacherCode:
                        editingCell.cell?.substituteTeacherCode,
                      substituteReason: editingCell.cell?.substituteReason,
                    },
                  );
                }
                setEditingCell(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-medium text-foreground block mb-1">
                  Subject Name
                </label>
                <input
                  name="subject"
                  defaultValue={editingCell.cell?.subject || ""}
                  placeholder="e.g. Physics, Higher Math, ICT"
                  className="w-full px-3 py-2 rounded-xl bg-background-secondary border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">
                  Teacher Acronym
                </label>
                <input
                  name="teacherCode"
                  defaultValue={editingCell.cell?.teacherCode || ""}
                  placeholder="e.g. NC"
                  className="w-full px-3 py-2 rounded-xl bg-background-secondary border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 uppercase font-mono"
                />
              </div>

              {editingCell.cell?.substituteTeacherCode && (
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-purple-700 dark:text-purple-300">
                      Sub: {editingCell.cell.substituteTeacherCode}
                    </span>
                    <span className="text-foreground-muted ml-1">
                      (for {editingCell.cell.teacherCode})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!onUpdateCell) return;
                      onUpdateCell(
                        editingCell.day,
                        editingCell.sectionId,
                        editingCell.periodIndex,
                        {
                          ...editingCell.cell!,
                          substituteTeacherCode: undefined,
                          substituteReason: undefined,
                          substituteSubject: undefined,
                          subject:
                            editingCell.cell!.originalSubject ||
                            editingCell.cell!.subject,
                          originalSubject: undefined,
                        },
                      );
                      setEditingCell(null);
                    }}
                    className="px-2 py-1 text-[11px] font-semibold text-danger hover:bg-danger-bg rounded-lg transition-colors cursor-pointer"
                  >
                    Remove Sub
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateCell) {
                      onUpdateCell(
                        editingCell.day,
                        editingCell.sectionId,
                        editingCell.periodIndex,
                        null,
                      );
                    }
                    setEditingCell(null);
                  }}
                  className="px-3 py-1.5 text-xs text-danger hover:bg-danger-bg rounded-xl transition-colors cursor-pointer"
                >
                  Clear Period (Free)
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCell(null)}
                    className="px-3 py-1.5 text-xs rounded-xl bg-secondary text-foreground hover:bg-muted cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
