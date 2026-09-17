"use client";

import * as React from "react";
import {
  DayRoutine,
  RoutineCell,
  PeriodTiming,
  DEFAULT_PERIOD_TIMINGS,
  getTodaysFullDate,
  sortDaysCanonical,
  TeacherInfo,
  TEACHER_DIRECTORY,
} from "../lib/routine-data";
import { getTeacherSubjectForSection } from "../lib/substitution-engine";
import { TimingEditorModal } from "./timing-editor-modal";
import { ClassManagerModal } from "./class-manager-modal";
import { TeacherManagerModal } from "./teacher-manager-modal";
import {
  Printer,
  Download,
  RotateCcw,
  FileSpreadsheet,
  Upload,
  Search,
  Users,
  X,
  Power,
  Clock,
  GraduationCap,
  SlidersHorizontal,
  ChevronDown,
  Plus,
} from "lucide-react";

interface PdfRoutineViewProps {
  routineData: DayRoutine[];
  currentDay: string;
  timings?: PeriodTiming[];
  onSelectDay: (day: string) => void;
  onUpdateCell: (
    day: string,
    sectionId: string,
    periodIndex: number,
    cell: RoutineCell | null,
  ) => void;
  onUpdateTimings?: (newTimings: PeriodTiming[]) => void;
  onResetTimings?: () => void;
  onToggleSectionStatus?: (
    dayName: string,
    sectionId: string,
    isActive: boolean,
    reason?: string,
  ) => void;
  onResetAll: () => void;
  onExportJSON: () => void;
  onImportJSON: (jsonStr: string) => boolean;
  onOpenSubstitution?: (day: string) => void;
  onOpenClassStatus?: () => void;
  onAddSection?: (section: {
    sectionId: string;
    className: string;
    sectionName?: string;
  }) => boolean;
  onRemoveSection?: (sectionId: string) => void;
  onEditSection?: (
    oldSectionId: string,
    updated: { sectionId: string; className: string; sectionName?: string },
  ) => boolean;
  onReorderSections?: (orderedSectionIds: string[]) => void;
  teachers?: Record<string, TeacherInfo>;
  onAddTeacher?: (teacher: {
    code: string;
    dept: string;
    subject: string;
  }) => boolean;
  onRemoveTeacher?: (code: string) => void;
  onEditTeacher?: (
    oldCode: string,
    updated: { code: string; dept: string; subject: string },
  ) => boolean;
  onResetTeachers?: () => void;
  onAddClass?: (className: string, initialSectionName?: string) => boolean;
  onRenameClass?: (oldClassName: string, newClassName: string) => boolean;
  onDeleteClass?: (className: string) => void;
  onApplySubstitution?: (
    dayName: string,
    periodIndex: number,
    sectionId: string,
    originalTeacherCode: string,
    substituteTeacherCode: string,
    reason?: string,
    newSubject?: string,
  ) => void;
  onRevertSubstitution?: (
    dayName: string,
    periodIndex: number,
    sectionId: string,
  ) => void;
}

export function PdfRoutineView({
  routineData,
  currentDay,
  timings = DEFAULT_PERIOD_TIMINGS,
  onSelectDay,
  onUpdateCell,
  onUpdateTimings,
  onResetTimings,
  onToggleSectionStatus,
  onResetAll,
  onExportJSON,
  onImportJSON,
  onAddSection,
  onRemoveSection,
  onEditSection,
  onReorderSections,
  onAddClass,
  onRenameClass,
  onDeleteClass,
  teachers,
  onAddTeacher,
  onRemoveTeacher,
  onEditTeacher,
  onResetTeachers,
  onApplySubstitution,
  onRevertSubstitution,
}: PdfRoutineViewProps) {
  const [printAllDays, setPrintAllDays] = React.useState<boolean>(false);
  const [searchFilter, setSearchFilter] = React.useState<string>("");
  const [isTimingModalOpen, setIsTimingModalOpen] =
    React.useState<boolean>(false);
  const [isClassModalOpen, setIsClassModalOpen] =
    React.useState<boolean>(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] =
    React.useState<boolean>(false);
  const [editingCell, setEditingCell] = React.useState<{
    day: string;
    sectionId: string;
    periodIndex: number;
    cell: RoutineCell | null;
  } | null>(null);
  const [isAssigningSub, setIsAssigningSub] = React.useState<boolean>(false);

  const [isToolsOpen, setIsToolsOpen] = React.useState<boolean>(false);
  const toolsRef = React.useRef<HTMLDivElement | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolsRef.current &&
        !toolsRef.current.contains(event.target as Node)
      ) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const sortedRoutines = React.useMemo(
    () => sortDaysCanonical(routineData),
    [routineData],
  );
  const activeDayRoutine =
    sortedRoutines.find((d) => d.day === currentDay) || sortedRoutines[0];
  const daysList = sortedRoutines.map((d) => d.day);

  const handlePrint = (allDays: boolean) => {
    setPrintAllDays(allDays);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) {
        const success = onImportJSON(text);
        if (success) {
          alert("Routine data imported successfully!");
        } else {
          alert("Invalid routine JSON file.");
        }
      }
    };
    reader.readAsText(file);
  };

  const displayedDays = printAllDays ? sortedRoutines : [activeDayRoutine];

  const getPeriodTime = (idx: number, fallback: string) => {
    const item = timings.find((t) => t.index === idx);
    return item ? item.time : fallback;
  };

  const renderRoutineCell = (
    cell: RoutineCell | null,
    periodIndex: number,
    sectionId: string,
    day: string,
    className?: string,
  ) => {
    const isHighlighted =
      searchFilter.trim() !== "" &&
      cell &&
      (cell.subject.toLowerCase().includes(searchFilter.toLowerCase()) ||
        cell.teacherCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (cell.substituteTeacherCode &&
          cell.substituteTeacherCode
            .toLowerCase()
            .includes(searchFilter.toLowerCase())));

    return (
      <td
        key={periodIndex}
        onClick={() => {
          setEditingCell({
            day,
            sectionId,
            periodIndex,
            cell,
          });
          setIsAssigningSub(Boolean(cell?.substituteTeacherCode));
        }}
        className={`routine-cell py-0.5 px-0.5 text-center align-middle cursor-pointer transition-colors ${
          isHighlighted ? "bg-amber-200 text-black font-bold" : ""
        }`}
        style={{
          border: "1px solid #000000",
          backgroundColor: isHighlighted
            ? "#FDE68A"
            : cell?.substituteTeacherCode
              ? "#F3E8FF"
              : undefined,
          color: "#000000",
        }}
      >
        {cell ? (
          <div className="cell-content leading-tight text-[13.5px]">
            {cell.substituteTeacherCode ? (
              <>
                <div className="leading-tight">
                  <span className="font-semibold text-black">
                    {cell.substituteSubject ||
                      (cell.subject && cell.subject !== cell.originalSubject
                        ? cell.subject
                        : getTeacherSubjectForSection(
                            routineData,
                            cell.substituteTeacherCode,
                            sectionId,
                            className || "",
                            (teachers || TEACHER_DIRECTORY)[
                              cell.substituteTeacherCode
                            ]?.subject ||
                              (teachers || TEACHER_DIRECTORY)[
                                cell.substituteTeacherCode
                              ]?.dept ||
                              cell.subject,
                          ))}
                  </span>
                  <span className="text-black font-medium"> - </span>
                  <span className="font-bold text-purple-900">
                    {cell.substituteTeacherCode}
                  </span>
                </div>
                <div className="sub-indicator text-[11px] font-semibold text-purple-700 leading-none mt-0.5">
                  (for {cell.teacherCode})
                </div>
              </>
            ) : (
              <div className="leading-tight">
                <span className="font-semibold text-black">{cell.subject}</span>
                <span className="text-black font-medium">
                  {" "}
                  - {cell.teacherCode}
                </span>
              </div>
            )}
          </div>
        ) : (
          <span className="text-zinc-400 font-bold">-</span>
        )}
      </td>
    );
  };

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-3xl bg-card border-2 border-border shadow-xs">
        <div className="flex items-center gap-2 flex-wrap no-scrollbar pb-1 lg:pb-0 -mx-1 px-1">
          {daysList.map((day) => {
            const isSelected = day === currentDay;
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  setPrintAllDays(false);
                  onSelectDay(day);
                }}
                className={`px-4 py-2 text-sm sm:text-base font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${isSelected
                  ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                  : "bg-background-secondary text-foreground-muted hover:text-foreground hover:bg-secondary border border-border"
                  }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-subtle" />
            <input
              type="text"
              placeholder="Search teacher or subject..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full h-11 sm:h-12 pl-11 pr-10 text-sm sm:text-base font-bold rounded-2xl bg-background-secondary border-2 border-border text-foreground outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:font-medium placeholder:text-foreground-subtle"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-foreground-subtle hover:text-foreground hover:bg-secondary cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => handlePrint(false)}
            className="inline-flex items-center gap-2 h-11 sm:h-12 px-4 text-xs sm:text-sm font-bold rounded-2xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs transition-colors cursor-pointer shrink-0"
            title="Print or save current day routine as PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Print ({currentDay})</span>
          </button>

          <button
            type="button"
            onClick={() => handlePrint(true)}
            className="inline-flex items-center gap-2 h-11 sm:h-12 px-4 text-xs sm:text-sm font-bold rounded-2xl bg-card hover:bg-secondary border-2 border-border text-foreground transition-colors shadow-xs cursor-pointer shrink-0"
            title="Print all 5 days"
          >
            <FileSpreadsheet className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">All 5 Days</span>
            <span className="sm:hidden">All</span>
          </button>

          <div className="relative" ref={toolsRef}>
            <button
              type="button"
              onClick={() => setIsToolsOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors shadow-xs cursor-pointer shrink-0 ${isToolsOpen
                ? "bg-secondary text-foreground border-primary/40 ring-2 ring-primary/10"
                : "bg-card hover:bg-secondary border-border text-foreground"
                }`}
              title="Routine Management and Settings"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-foreground-muted" />
              <span>Tools</span>
              <ChevronDown
                className={`w-3 h-3 text-foreground-subtle transition-transform ${isToolsOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {isToolsOpen && (
              <div className="absolute right-0 mt-2 w-56 p-1.5 rounded-2xl bg-card border border-border shadow-lg z-50 flex flex-col gap-1 text-xs">
                {onAddSection && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsOpen(false);
                      setIsClassModalOpen(true);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-background-secondary text-left transition-colors cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span>Manage Classes</span>
                  </button>
                )}

                {teachers &&
                  onAddTeacher &&
                  onRemoveTeacher &&
                  onEditTeacher && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsToolsOpen(false);
                        setIsTeacherModalOpen(true);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-background-secondary text-left transition-colors cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Manage Faculty</span>
                    </button>
                  )}

                {onUpdateTimings && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsOpen(false);
                      setIsTimingModalOpen(true);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-background-secondary text-left transition-colors cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Change Timings</span>
                  </button>
                )}

                <div className="h-px bg-border my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setIsToolsOpen(false);
                    onExportJSON();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-background-secondary text-left transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-primary" />
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsToolsOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-background-secondary text-left transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-foreground-muted" />
                  <span>Import JSON</span>
                </button>

                <div className="h-px bg-border my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setIsToolsOpen(false);
                    if (
                      confirm(
                        "Reset routine to original 13 Sep 2026 PDF defaults?",
                      )
                    ) {
                      onResetAll();
                    }
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-danger hover:bg-danger-bg text-left transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset to Defaults</span>
                </button>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Routine Grid Display (Authentic PDF replica format) - Dedicated Print Area */}
      <div className="routine-print-area space-y-10 font-serif">
        {displayedDays.map((dayRoutine) => (
          <div
            key={dayRoutine.day}
            className="routine-sheet min-h-[297mm] flex flex-col justify-between p-3 sm:p-5 print:p-0 bg-white border border-border shadow-xs text-black transition-colors"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              color: "#000000",
              backgroundColor: "#ffffff",
            }}
          >
            <div className="flex-1 flex flex-col">
              <div className="college-header-banner text-center pb-1 relative">
                <div className="flex items-center justify-between text-[10.5px] font-bold tracking-wide">
                  <span style={{ color: "#FF0000" }}>
                    WEF: {getTodaysFullDate()}
                  </span>
                  <span className="text-zinc-600 text-[10px] uppercase font-semibold">
                    EMMS
                  </span>
                </div>

                <div className="mt-0.5 space-y-0.5">
                  <h1
                    className="text-base sm:text-lg lg:text-xl font-bold tracking-wide uppercase text-black"
                    style={{
                      fontFamily: "'Times New Roman', Times, serif",
                      fontWeight: 700,
                    }}
                  >
                    RAJUK UTTARA MODEL COLLEGE
                  </h1>
                  <h2
                    className="text-[11px] sm:text-xs font-bold tracking-wide uppercase text-black"
                    style={{
                      fontFamily: "'Times New Roman', Times, serif",
                      fontWeight: 700,
                    }}
                  >
                    DAYWISE CLASS ROUTINE-2026
                  </h2>
                  <h3
                    className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase"
                    style={{
                      color: "#00B050",
                      fontFamily: "'Times New Roman', Times, serif",
                      fontWeight: 700,
                    }}
                  >
                    ENGLISH MEDIUM-MORNING SHIFT
                  </h3>
                </div>
              </div>

              <div className="no-print sm:hidden flex items-center justify-between text-[11px] text-zinc-500 py-1 px-1">
                <span>Swipe horizontally to view all periods</span>
                <span className="font-bold text-primary">&rarr;</span>
              </div>

              <div className="timetable-wrapper overflow-x-auto mt-1 -mx-2 sm:mx-0">
                <table
                  className="routine-table w-full border-collapse text-center text-[13.5px]"
                  style={{
                    border: "1.5px solid #000000",
                    fontFamily: "'Times New Roman', Times, serif",
                  }}
                >
                  <thead>
                    <tr
                      className="pdf-header-day"
                      style={{
                        backgroundColor: "#FFFF00",
                        borderBottom: "1px solid #000000",
                      }}
                    >
                      <th
                        colSpan={9}
                        className="py-0.5 text-center font-bold tracking-widest text-sm sm:text-base text-black uppercase"
                        style={{
                          backgroundColor: "#FFFF00",
                          color: "#000000",
                          border: "1px solid #000000",
                        }}
                      >
                        {dayRoutine.day}
                      </th>
                    </tr>

                    <tr
                      className="pdf-header-periods text-black font-bold"
                      style={{
                        backgroundColor: "#8DB3E2",
                        borderBottom: "1px solid #000000",
                      }}
                    >
                      <th
                        onClick={() => onAddSection && setIsClassModalOpen(true)}
                        className="py-0.5 px-1 text-center w-12 whitespace-nowrap text-[13.5px] font-bold cursor-pointer hover:bg-[#7aa4da] transition-colors sticky left-0 z-20"
                        title="Click to add, edit, or remove classes and sections"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#8DB3E2",
                          color: "#000000",
                        }}
                      >
                        Class
                      </th>
                      <th
                        onClick={() =>
                          onUpdateTimings && setIsTimingModalOpen(true)
                        }
                        className="py-0.5 px-0.5 text-center min-w-[76px] font-bold cursor-pointer hover:bg-[#7aa4da] transition-colors"
                        title="Click to edit timings"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#8DB3E2",
                          color: "#000000",
                        }}
                      >
                        <div className="period-num text-[13.5px]">1st</div>
                        <div className="period-timing text-[10.5px] font-normal leading-none mt-0.5">
                          {getPeriodTime(1, "7.30-8.10")}
                        </div>
                      </th>
                      <th
                        onClick={() =>
                          onUpdateTimings && setIsTimingModalOpen(true)
                        }
                        className="py-0.5 px-0.5 text-center min-w-[76px] font-bold cursor-pointer hover:bg-[#7aa4da] transition-colors"
                        title="Click to edit timings"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#8DB3E2",
                          color: "#000000",
                        }}
                      >
                        <div className="period-num text-[13.5px]">2nd</div>
                        <div className="period-timing text-[10.5px] font-normal leading-none mt-0.5">
                          {getPeriodTime(2, "8.10-8.45")}
                        </div>
                      </th>
                      <th
                        onClick={() =>
                          onUpdateTimings && setIsTimingModalOpen(true)
                        }
                        className="py-0.5 px-0.5 text-center min-w-[76px] font-bold cursor-pointer hover:bg-[#7aa4da] transition-colors"
                        title="Click to edit timings"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#8DB3E2",
                          color: "#000000",
                        }}
                      >
                        <div className="period-num text-[13.5px]">3rd</div>
                        <div className="period-timing text-[10.5px] font-normal leading-none mt-0.5">
                          {getPeriodTime(3, "8.45-9.20")}
                        </div>
                      </th>
                      <th
                        onClick={() =>
                          onUpdateTimings && setIsTimingModalOpen(true)
                        }
                        className="py-0.5 px-0.5 text-center min-w-[76px] font-bold cursor-pointer hover:bg-[#7aa4da] transition-colors"
                        title="Click to edit timings"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#8DB3E2",
                          color: "#000000",
                        }}
                      >
                        <div className="period-num text-[13.5px]">4th</div>
                        <div className="period-timing text-[10.5px] font-normal leading-none mt-0.5">
                          {getPeriodTime(4, "9.20-9.55")}
                        </div>
                      </th>
                      <th
                        onClick={() =>
                          onUpdateTimings && setIsTimingModalOpen(true)
                        }
                        className="pdf-break-col py-0.5 px-0.5 text-center w-8 min-w-[28px] max-w-[34px] text-[12.5px] font-bold cursor-pointer hover:bg-[#7aa4da] transition-colors"
                        title="Click to edit timings"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#8DB3E2",
                          color: "#000000",
                          width: "30px",
                        }}
                      >
                        <div className="period-num text-[12.5px]">Break</div>
                        <div className="period-timing text-[9.5px] font-normal leading-none mt-0.5">
                          ({getPeriodTime(0, "9.55-10:25")})
                        </div>
                      </th>
                      <th
                        onClick={() =>
                          onUpdateTimings && setIsTimingModalOpen(true)
                        }
                        className="py-0.5 px-0.5 text-center min-w-[76px] font-bold cursor-pointer hover:bg-[#7aa4da] transition-colors"
                        title="Click to edit timings"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#8DB3E2",
                          color: "#000000",
                        }}
                      >
                        <div className="period-num text-[13.5px]">5th</div>
                        <div className="period-timing text-[10.5px] font-normal leading-none mt-0.5">
                          {getPeriodTime(5, "10.25-11.00")}
                        </div>
                      </th>
                      <th
                        onClick={() =>
                          onUpdateTimings && setIsTimingModalOpen(true)
                        }
                        className="py-0.5 px-0.5 text-center min-w-[76px] font-bold cursor-pointer hover:bg-[#7aa4da] transition-colors"
                        title="Click to edit timings"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#8DB3E2",
                          color: "#000000",
                        }}
                      >
                        <div className="period-num text-[13.5px]">6th</div>
                        <div className="period-timing text-[10.5px] font-normal leading-none mt-0.5">
                          {getPeriodTime(6, "11.00-11.35")}
                        </div>
                      </th>
                      <th
                        onClick={() =>
                          onUpdateTimings && setIsTimingModalOpen(true)
                        }
                        className="py-0.5 px-0.5 text-center min-w-[76px] font-bold cursor-pointer hover:bg-[#7aa4da] transition-colors"
                        title="Click to edit timings"
                        style={{
                          border: "1px solid #000000",
                          backgroundColor: "#8DB3E2",
                          color: "#000000",
                        }}
                      >
                        <div className="period-num text-[13.5px]">7th</div>
                        <div className="period-timing text-[10.5px] font-normal leading-none mt-0.5">
                          {getPeriodTime(7, "11.35-12.10")}
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {dayRoutine.sections.map((sec, secIdx) => {
                      const isSuspended = !sec.isActive;

                      return (
                        <tr
                          key={sec.sectionId}
                          className={isSuspended ? "pdf-suspended-row" : ""}
                          style={{
                            borderBottom: "1px solid #000000",
                          }}
                        >
                          <td
                            className="pdf-section-col py-0.5 px-0.5 font-bold text-black whitespace-nowrap text-center text-[13.5px] relative group sticky left-0 z-10"
                            style={{
                              border: "1px solid #000000",
                              backgroundColor: "#FFFF00",
                              color: "#000000",
                            }}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span>{sec.sectionId}</span>
                              {onToggleSectionStatus && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleSectionStatus(
                                      dayRoutine.day,
                                      sec.sectionId,
                                      !sec.isActive,
                                      sec.statusReason || "Suspended",
                                    );
                                  }}
                                  className="no-print opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-600 hover:text-red-600 hover:bg-black/5 transition-opacity cursor-pointer"
                                  title={
                                    isSuspended
                                      ? "Reactivate this section"
                                      : "Suspend this section"
                                  }
                                >
                                  <Power className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </td>

                          {isSuspended ? (
                            <>
                              <td
                                colSpan={4}
                                onClick={() => {
                                  if (onToggleSectionStatus) {
                                    const newReason = prompt(
                                      `Edit close reason for ${sec.sectionId} (leave empty to reactivate):`,
                                      sec.statusReason || "Exam",
                                    );
                                    if (newReason !== null) {
                                      if (newReason.trim()) {
                                        onToggleSectionStatus(
                                          dayRoutine.day,
                                          sec.sectionId,
                                          false,
                                          newReason.trim(),
                                        );
                                      } else {
                                        onToggleSectionStatus(
                                          dayRoutine.day,
                                          sec.sectionId,
                                          true,
                                          "Normal",
                                        );
                                      }
                                    }
                                  }
                                }}
                                className="py-1 px-2 text-center font-bold tracking-wider text-[13px] cursor-pointer hover:bg-rose-200 transition-colors"
                                title="Click to edit close reason or reactivate"
                                style={{
                                  border: "1px solid #000000",
                                  backgroundColor: "#FEE2E2",
                                  color: "#991B1B",
                                }}
                              >
                                <span className="uppercase font-bold tracking-wide">
                                  {sec.statusReason
                                    ? `Closed: ${sec.statusReason}`
                                    : "Class Suspended / Closed"}
                                </span>
                              </td>

                              {secIdx === 0 && (
                                <td
                                  rowSpan={dayRoutine.sections.length}
                                  className="pdf-break-col text-center text-black font-bold tracking-widest align-middle select-none"
                                  style={{
                                    border: "1px solid #000000",
                                    backgroundColor: "#8DB3E2",
                                    color: "#000000",
                                    writingMode: "vertical-rl",
                                    transform: "rotate(180deg)",
                                    width: "30px",
                                    minWidth: "28px",
                                    maxWidth: "34px",
                                    fontSize: "13px",
                                    letterSpacing: "4px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  BREAK / TIFFIN
                                </td>
                              )}

                              <td
                                colSpan={3}
                                onClick={() => {
                                  if (onToggleSectionStatus) {
                                    const newReason = prompt(
                                      `Edit close reason for ${sec.sectionId} (leave empty to reactivate):`,
                                      sec.statusReason || "Exam",
                                    );
                                    if (newReason !== null) {
                                      if (newReason.trim()) {
                                        onToggleSectionStatus(
                                          dayRoutine.day,
                                          sec.sectionId,
                                          false,
                                          newReason.trim(),
                                        );
                                      } else {
                                        onToggleSectionStatus(
                                          dayRoutine.day,
                                          sec.sectionId,
                                          true,
                                          "Normal",
                                        );
                                      }
                                    }
                                  }
                                }}
                                className="py-1 px-2 text-center font-bold tracking-wider text-[13px] cursor-pointer hover:bg-rose-200 transition-colors"
                                title="Click to edit close reason or reactivate"
                                style={{
                                  border: "1px solid #000000",
                                  backgroundColor: "#FEE2E2",
                                  color: "#991B1B",
                                }}
                              >
                                <span className="uppercase font-bold tracking-wide">
                                  {sec.statusReason
                                    ? `Closed: ${sec.statusReason}`
                                    : "Class Suspended / Closed"}
                                </span>
                              </td>
                            </>
                          ) : (
                            <>
                              {[0, 1, 2, 3].map((periodIndex) =>
                                renderRoutineCell(
                                  sec.periods[periodIndex],
                                  periodIndex,
                                  sec.sectionId,
                                  dayRoutine.day,
                                  sec.className,
                                ),
                              )}

                              {secIdx === 0 && (
                                <td
                                  rowSpan={dayRoutine.sections.length}
                                  className="pdf-break-col text-center text-black font-bold tracking-widest align-middle select-none"
                                  style={{
                                    border: "1px solid #000000",
                                    backgroundColor: "#8DB3E2",
                                    color: "#000000",
                                    writingMode: "vertical-rl",
                                    transform: "rotate(180deg)",
                                    width: "30px",
                                    minWidth: "28px",
                                    maxWidth: "34px",
                                    fontSize: "13px",
                                    letterSpacing: "4px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  BREAK / TIFFIN
                                </td>
                              )}

                              {[4, 5, 6].map((periodIndex) =>
                                renderRoutineCell(
                                  sec.periods[periodIndex],
                                  periodIndex,
                                  sec.sectionId,
                                  dayRoutine.day,
                                  sec.className,
                                ),
                              )}
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              className="routine-signature-footer mt-auto pt-8 pb-2 print:pt-4 print:pb-1 flex items-center justify-between text-[11px] font-bold text-black px-4"
              style={{
                fontFamily: "'Times New Roman', Times, serif",
                color: "#000000",
              }}
            >
              <div className="text-center">
                <div
                  className="sig-line w-32 mb-1"
                  style={{ borderBottom: "1px solid #000000" }}
                />
                <span>Sign of OIC Routine Comm.</span>
              </div>
              <div className="text-center">
                <div
                  className="sig-line w-36 mb-1"
                  style={{ borderBottom: "1px solid #000000" }}
                />
                <span>Sign of Chairman Routine Comm.</span>
              </div>
              <div className="text-center">
                <div
                  className="sig-line w-32 mb-1"
                  style={{ borderBottom: "1px solid #000000" }}
                />
                <span>Sign of VP (EMMS)</span>
              </div>
            </div>
          </div>
        ))}
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
                const form = e.currentTarget;
                const subject = (
                  form.elements.namedItem("subject") as HTMLInputElement
                )?.value.trim();
                const teacherCode = (
                  form.elements.namedItem("teacherCode") as HTMLInputElement
                )?.value.trim();
                const subTeacherCode = (
                  form.elements.namedItem("substituteTeacherCode") as HTMLInputElement
                )?.value.trim();
                const subSubject = (
                  form.elements.namedItem("substituteSubject") as HTMLInputElement
                )?.value.trim();
                const subReason = (
                  form.elements.namedItem("substituteReason") as HTMLInputElement
                )?.value.trim();

                if (!subject || !teacherCode) {
                  if (editingCell.cell?.substituteTeacherCode && onRevertSubstitution) {
                    onRevertSubstitution(
                      editingCell.day,
                      editingCell.periodIndex,
                      editingCell.sectionId,
                    );
                  }
                  onUpdateCell(
                    editingCell.day,
                    editingCell.sectionId,
                    editingCell.periodIndex,
                    null,
                  );
                } else if (subTeacherCode) {
                  if (onApplySubstitution) {
                    onApplySubstitution(
                      editingCell.day,
                      editingCell.periodIndex,
                      editingCell.sectionId,
                      teacherCode,
                      subTeacherCode,
                      subReason || undefined,
                      subSubject || subject,
                    );
                  } else {
                    onUpdateCell(
                      editingCell.day,
                      editingCell.sectionId,
                      editingCell.periodIndex,
                      {
                        subject: subSubject || subject,
                        originalSubject: editingCell.cell?.originalSubject || subject,
                        teacherCode,
                        room: editingCell.cell?.room,
                        substituteTeacherCode: subTeacherCode,
                        substituteSubject: subSubject || subject,
                        substituteReason: subReason || undefined,
                      },
                    );
                  }
                } else {
                  if (editingCell.cell?.substituteTeacherCode && onRevertSubstitution) {
                    onRevertSubstitution(
                      editingCell.day,
                      editingCell.periodIndex,
                      editingCell.sectionId,
                    );
                  }
                  onUpdateCell(
                    editingCell.day,
                    editingCell.sectionId,
                    editingCell.periodIndex,
                    {
                      subject,
                      teacherCode,
                      room: editingCell.cell?.room,
                      substituteTeacherCode: undefined,
                      substituteSubject: undefined,
                      substituteReason: undefined,
                      originalSubject: undefined,
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
                  defaultValue={editingCell.cell?.originalSubject || editingCell.cell?.subject || ""}
                  placeholder="e.g. Physics, Higher Math, ICT"
                  className="w-full px-3 py-2 rounded-xl bg-background-secondary border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">
                  Regular Teacher Acronym
                </label>
                <input
                  name="teacherCode"
                  defaultValue={editingCell.cell?.teacherCode || ""}
                  placeholder="e.g. NC"
                  className="w-full px-3 py-2 rounded-xl bg-background-secondary border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 uppercase font-mono"
                />
              </div>

              {isAssigningSub ? (
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-purple-700 dark:text-purple-300">
                      Replacement Teacher
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAssigningSub(false);
                        if (editingCell.cell?.substituteTeacherCode && onRevertSubstitution) {
                          onRevertSubstitution(
                            editingCell.day,
                            editingCell.periodIndex,
                            editingCell.sectionId,
                          );
                        }
                        if (editingCell.cell) {
                          onUpdateCell(
                            editingCell.day,
                            editingCell.sectionId,
                            editingCell.periodIndex,
                            {
                              ...editingCell.cell,
                              substituteTeacherCode: undefined,
                              substituteReason: undefined,
                              substituteSubject: undefined,
                              subject: editingCell.cell.originalSubject || editingCell.cell.subject,
                              originalSubject: undefined,
                            },
                          );
                        }
                      }}
                      className="text-[11px] font-semibold text-danger hover:underline cursor-pointer"
                    >
                      Remove Replacement
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-purple-900 dark:text-purple-200 block mb-1">
                        Substitute Acronym
                      </label>
                      <input
                        name="substituteTeacherCode"
                        defaultValue={editingCell.cell?.substituteTeacherCode || ""}
                        placeholder="e.g. RH"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-card border border-purple-300 dark:border-purple-700 text-foreground font-mono uppercase font-bold text-xs outline-hidden focus:ring-1 focus:ring-purple-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-purple-900 dark:text-purple-200 block mb-1">
                        Replacement Subject
                      </label>
                      <input
                        name="substituteSubject"
                        defaultValue={
                          editingCell.cell?.substituteSubject ||
                          (editingCell.cell?.substituteTeacherCode
                            ? editingCell.cell.subject
                            : "")
                        }
                        placeholder="e.g. Biology"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-card border border-purple-300 dark:border-purple-700 text-foreground text-xs outline-hidden focus:ring-1 focus:ring-purple-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-purple-900 dark:text-purple-200 block mb-1">
                      Reason / Remarks (Optional)
                    </label>
                    <input
                      name="substituteReason"
                      defaultValue={editingCell.cell?.substituteReason || ""}
                      placeholder="e.g. Sick leave, Meeting, Exam duty"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-card border border-purple-300 dark:border-purple-700 text-foreground text-xs outline-hidden focus:ring-1 focus:ring-purple-400"
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAssigningSub(true)}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-purple-300 dark:border-purple-700/50 hover:bg-purple-500/5 text-purple-700 dark:text-purple-300 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign Replacement Teacher</span>
                </button>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateCell(
                      editingCell.day,
                      editingCell.sectionId,
                      editingCell.periodIndex,
                      null,
                    );
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

      {/* Timing Editor Modal */}
      {onUpdateTimings && (
        <TimingEditorModal
          isOpen={isTimingModalOpen}
          onClose={() => setIsTimingModalOpen(false)}
          timings={timings}
          onSaveTimings={onUpdateTimings}
          onResetTimings={onResetTimings || (() => { })}
        />
      )}

      {/* Class & Section Manager Modal */}
      {isClassModalOpen && onAddSection && onRemoveSection && onEditSection && (
        <ClassManagerModal
          isOpen={isClassModalOpen}
          onClose={() => setIsClassModalOpen(false)}
          routineData={routineData}
          onAddSection={onAddSection}
          onRemoveSection={onRemoveSection}
          onEditSection={onEditSection}
          onReorderSections={onReorderSections}
          onAddClass={onAddClass}
          onRenameClass={onRenameClass}
          onDeleteClass={onDeleteClass}
        />
      )}

      {/* Teacher & Faculty Manager Modal */}
      {isTeacherModalOpen &&
        teachers &&
        onAddTeacher &&
        onRemoveTeacher &&
        onEditTeacher && (
          <TeacherManagerModal
            isOpen={isTeacherModalOpen}
            onClose={() => setIsTeacherModalOpen(false)}
            teachers={teachers}
            onAddTeacher={onAddTeacher}
            onRemoveTeacher={onRemoveTeacher}
            onEditTeacher={onEditTeacher}
            onResetTeachers={onResetTeachers}
          />
        )}

      {/* Strict Print CSS: Ensures each day routine fits precisely on 1 single page without any overflow */}
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
            height: 285mm !important;
            max-height: 287mm !important;
            min-height: 280mm !important;
            page-break-before: auto !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
            break-after: page !important;
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

          .routine-sheet:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          .college-header-banner {
            flex-shrink: 0 !important;
            padding-bottom: 2px !important;
            margin-bottom: 2px !important;
          }

          .college-header-banner h1 {
            font-size: 13.5pt !important;
            line-height: 1.1 !important;
            margin: 0 !important;
          }

          .college-header-banner h2 {
            font-size: 9pt !important;
            line-height: 1.1 !important;
            margin: 1px 0 !important;
          }

          .college-header-banner h3 {
            font-size: 8.5pt !important;
            line-height: 1.1 !important;
            margin: 0 !important;
          }

          .timetable-wrapper {
            flex: 0 1 auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            display: block !important;
          }

          table.routine-table {
            width: 100% !important;
            height: auto !important;
            border: 1.5px solid #000000 !important;
            border-collapse: collapse !important;
            border-spacing: 0 !important;
            table-layout: fixed !important;
            font-family: "Times New Roman", Times, serif !important;
          }

          table.routine-table thead,
          table.routine-table tbody,
          table.routine-table tr {
            border-color: #000000 !important;
          }

          table.routine-table thead tr.pdf-header-day th {
            height: 5mm !important;
            max-height: 5mm !important;
            padding: 0 !important;
            font-size: 10.5pt !important;
            line-height: 1.1 !important;
            background-color: #ffff00 !important;
            border: 1px solid #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          table.routine-table thead tr.pdf-header-periods th {
            height: 7.2mm !important;
            max-height: 7.5mm !important;
            padding: 0.5px 0.5px !important;
            line-height: 1.05 !important;
            background-color: #8db3e2 !important;
            border: 1px solid #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          table.routine-table thead tr.pdf-header-periods th .period-num {
            font-size: 9.2pt !important;
            font-weight: bold !important;
            line-height: 1 !important;
          }

          table.routine-table thead tr.pdf-header-periods th .period-timing {
            font-size: 7.2pt !important;
            font-weight: normal !important;
            line-height: 1 !important;
          }

          table.routine-table tbody tr {
            height: 8.0mm !important;
            max-height: 8.4mm !important;
          }

          table.routine-table tbody td {
            border: 1px solid #000000 !important;
            border-color: #000000 !important;
            background-clip: padding-box !important;
            box-shadow: inset 0 0 0 0.5px #000000 !important;
            padding: 0.5px 0.5px !important;
            vertical-align: middle !important;
            line-height: 1.05 !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          table.routine-table tbody td.pdf-section-col {
            width: 36px !important;
            font-size: 9.2pt !important;
            font-weight: bold !important;
            background-color: #ffff00 !important;
            border: 1px solid #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          table.routine-table tbody td.pdf-break-col {
            width: 30px !important;
            max-width: 34px !important;
            background-color: #8db3e2 !important;
            border: 1px solid #000000 !important;
            font-size: 9.2pt !important;
            font-weight: bold !important;
            text-align: center !important;
            vertical-align: middle !important;
            writing-mode: vertical-rl !important;
            transform: rotate(180deg) !important;
            letter-spacing: 3px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          table.routine-table tbody tr.pdf-suspended-row td {
            background-color: #fee2e2 !important;
            color: #991b1b !important;
            font-size: 9pt !important;
            border: 1px solid #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .cell-content {
            font-size: 8.8pt !important;
            line-height: 1.05 !important;
          }

          .sub-indicator {
            font-size: 7pt !important;
            line-height: 1 !important;
            margin-top: 0px !important;
          }

          .routine-signature-footer {
            flex-shrink: 0 !important;
            margin-top: auto !important;
            padding-top: 4mm !important;
            padding-bottom: 2mm !important;
            font-size: 8pt !important;
            line-height: 1.1 !important;
          }

          .routine-signature-footer .sig-line {
            width: 105px !important;
            margin-bottom: 2px !important;
          }
        }
      `}</style>
    </div>
  );
}
