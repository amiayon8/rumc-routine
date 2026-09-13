"use client";

import * as React from "react";
import {
  DayRoutine,
  RoutineCell,
  PeriodTiming,
  DEFAULT_PERIOD_TIMINGS,
  getTodaysFullDate,
} from "../lib/routine-data";
import { TimingEditorModal } from "./timing-editor-modal";
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
  Layers,
  Clock,
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
    cell: RoutineCell | null
  ) => void;
  onUpdateTimings?: (newTimings: PeriodTiming[]) => void;
  onResetTimings?: () => void;
  onToggleSectionStatus?: (
    dayName: string,
    sectionId: string,
    isActive: boolean,
    reason?: string
  ) => void;
  onResetAll: () => void;
  onExportJSON: () => void;
  onImportJSON: (jsonStr: string) => boolean;
  onOpenSubstitution: (day: string) => void;
  onOpenClassStatus?: () => void;
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
  onOpenSubstitution,
  onOpenClassStatus,
}: PdfRoutineViewProps) {
  const [printAllDays, setPrintAllDays] = React.useState<boolean>(false);
  const [searchFilter, setSearchFilter] = React.useState<string>("");
  const [isTimingModalOpen, setIsTimingModalOpen] = React.useState<boolean>(false);
  const [editingCell, setEditingCell] = React.useState<{
    day: string;
    sectionId: string;
    periodIndex: number;
    cell: RoutineCell | null;
  } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const activeDayRoutine = routineData.find((d) => d.day === currentDay) || routineData[0];
  const daysList = routineData.map((d) => d.day);

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

  const displayedDays = printAllDays ? routineData : [activeDayRoutine];

  const getPeriodTime = (idx: number, fallback: string) => {
    const item = timings.find((t) => t.index === idx);
    return item ? item.time : fallback;
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar (Strictly hidden during printing) */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-xs">
        {/* Day Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {daysList.map((day) => {
            const isSelected = day === currentDay;
            return (
              <button
                key={day}
                onClick={() => {
                  setPrintAllDays(false);
                  onSelectDay(day);
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${isSelected
                    ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/20"
                    : "bg-background-secondary text-foreground-muted hover:text-foreground hover:bg-muted"
                  }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search in table */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-subtle" />
            <input
              type="text"
              placeholder="Highlight teacher or subject..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-background-secondary border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 w-40 sm:w-48"
            />
          </div>

          {/* Quick PDF Print / Generator */}
          <button
            type="button"
            onClick={() => handlePrint(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs transition-colors cursor-pointer"
            title="Print or Save current day routine as PDF matching official RUMC design"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF ({currentDay})</span>
          </button>

          <button
            type="button"
            onClick={() => handlePrint(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-card hover:bg-secondary border border-border text-foreground transition-colors shadow-xs cursor-pointer"
            title="Generate multi-page PDF with all 5 days"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">All 5 Days</span>
          </button>

          {onUpdateTimings && (
            <button
              type="button"
              onClick={() => setIsTimingModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-card hover:bg-secondary border border-border text-foreground transition-colors shadow-xs cursor-pointer"
              title="Change Routine Period and Break Timings"
            >
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Change Timings</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenSubstitution(currentDay)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-card hover:bg-secondary border border-border text-foreground transition-colors shadow-xs cursor-pointer"
            title="Open Teacher Auto-Replacement Manager"
          >
            <Users className="w-3.5 h-3.5 text-purple-500" />
            <span className="hidden sm:inline">Auto-Replace</span>
          </button>

          {onOpenClassStatus && (
            <button
              type="button"
              onClick={onOpenClassStatus}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-card hover:bg-secondary border border-border text-foreground transition-colors shadow-xs cursor-pointer"
              title="Manage Active and Suspended Classes/Sections"
            >
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Suspend Manager</span>
            </button>
          )}

          {/* Storage Menu Actions */}
          <div className="h-4 w-px bg-border hidden lg:block" />

          <button
            type="button"
            onClick={onExportJSON}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-background-secondary hover:bg-card border border-border text-foreground transition-colors cursor-pointer"
            title="Export Routine as JSON"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span className="hidden xl:inline">Export</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-background-secondary hover:bg-card border border-border text-foreground transition-colors cursor-pointer"
            title="Import Routine from JSON backup"
          >
            <Upload className="w-3.5 h-3.5 text-foreground-muted" />
            <span className="hidden xl:inline">Import</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => {
              if (confirm("Reset routine to original 13 Sep 2026 PDF defaults?")) {
                onResetAll();
              }
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-background-secondary hover:bg-danger-bg hover:text-danger border border-border transition-colors cursor-pointer"
            title="Restore original routine defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Routine Grid Display (Authentic PDF replica format) - Dedicated Print Area */}
      <div className="routine-print-area space-y-10 font-serif">
        {displayedDays.map((dayRoutine) => (
          <div
            key={dayRoutine.day}
            className="routine-sheet p-6 sm:p-8 bg-white border border-border shadow-xs text-black transition-colors"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              color: "#000000",
              backgroundColor: "#ffffff",
            }}
          >
            {/* College Header Banner - Exact replica of 13 Sep 2026 PDF */}
            <div className="text-center pb-2 relative">
              {/* Top line: WEF in RED (#FF0000) and Shift name */}
              <div className="flex items-center justify-between text-[11px] font-bold tracking-wide">
                <span style={{ color: "#FF0000" }}>WEF: {getTodaysFullDate()}</span>
                <span className="text-zinc-600 text-[10px] uppercase font-semibold">
                  Morning Shift • EMMS
                </span>
              </div>

              {/* Header Titles */}
              <div className="mt-1 space-y-0.5">
                <h1
                  className="text-xl sm:text-2xl font-bold tracking-wide uppercase text-black"
                  style={{
                    fontFamily: "'Times New Roman', Times, serif",
                    fontWeight: 700,
                  }}
                >
                  RAJUK UTTARA MODEL COLLEGE
                </h1>
                <h2
                  className="text-xs sm:text-sm font-bold tracking-wide uppercase text-black"
                  style={{
                    fontFamily: "'Times New Roman', Times, serif",
                    fontWeight: 700,
                  }}
                >
                  DAYWISE CLASS ROUTINE-2026
                </h2>
                <h3
                  className="text-xs font-bold tracking-wide uppercase"
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

            {/* Timetable Table Grid - Authentic PDF replica */}
            <div className="overflow-x-auto mt-2">
              <table
                className="w-full border-collapse text-center text-[13px]"
                style={{
                  border: "1.5px solid #000000",
                  fontFamily: "'Times New Roman', Times, serif",
                }}
              >
                <thead>
                  {/* Top Day Banner Row in Yellow (#FFFF00) */}
                  <tr
                    className="pdf-header-day"
                    style={{
                      backgroundColor: "#FFFF00",
                      borderBottom: "1px solid #000000",
                    }}
                  >
                    <th
                      colSpan={9}
                      className="py-1 text-center font-bold tracking-widest text-sm text-black uppercase"
                      style={{
                        backgroundColor: "#FFFF00",
                        color: "#000000",
                        border: "1px solid #000000",
                      }}
                    >
                      {dayRoutine.day}
                    </th>
                  </tr>

                  {/* Period Numbers & Timings in Soft Blue (#8DB3E2) */}
                  <tr
                    className="pdf-header-periods text-black font-bold"
                    style={{
                      backgroundColor: "#8DB3E2",
                      borderBottom: "1px solid #000000",
                      color: "#000000",
                    }}
                  >
                    <th
                      className="p-1 text-center w-14 whitespace-nowrap text-[13px] font-bold"
                      style={{
                        border: "1px solid #000000",
                        backgroundColor: "#8DB3E2",
                        color: "#000000",
                      }}
                    >
                      Class
                    </th>
                    <th
                      onClick={() => onUpdateTimings && setIsTimingModalOpen(true)}
                      className="p-1 text-center min-w-[84px] font-bold cursor-pointer hover:bg-[#7aa4da] transition-colors"
                      title="Click to edit timings"
                      style={{
                        border: "1px solid #000000",
                        backgroundColor: "#8DB3E2",
                        color: "#000000",
                      }}
                    >
                      <div className="text-[13px]">1st</div>
                      <div className="text-[11px] font-normal leading-none mt-0.5">
                        {getPeriodTime(1, "7.30-8.10")}
                      </div>
                    </th>
                    <th
                      onClick={() => onUpdateTimings && setIsTimingModalOpen(true)}
                      className="p-1 text-center min-w-[84px] font-bold cursor-pointer hover:bg-[#7aa4da] transition-colors"
                      title="Click to edit timings"
                      style={{
                        border: "1px solid #000000",
                        backgroundColor: "#8DB3E2",
                        color: "#000000",
                      }}
                    >
                      <div className="text-[13px]">2nd</div>
                      <div className="text-[11px] font-normal leading-none mt-0.5">
                        {getPeriodTime(2, "8.10-8.45")}
                      </div>
                    </th>
                    <th
                      onClick={() => onUpdateTimings && setIsTimingModalOpen(true)}
                      className="p-1 text-center min-w-[84px] font-bold cursor-pointer hover:bg-[#7aa4da] transition-colors"
                      title="Click to edit timings"
                      style={{
                        border: "1px solid #000000",
                        backgroundColor: "#8DB3E2",
                        color: "#000000",
                      }}
                    >
                      <div className="text-[13px]">3rd</div>
                      <div className="text-[11px] font-normal leading-none mt-0.5">
                        {getPeriodTime(3, "8.45-9.20")}
                      </div>
                    </th>
                    <th
                      onClick={() => onUpdateTimings && setIsTimingModalOpen(true)}
                      className="p-1 text-center min-w-[84px] font-bold cursor-pointer hover:bg-[#7aa4da] transition-colors"
                      title="Click to edit timings"
                      style={{
                        border: "1px solid #000000",
                        backgroundColor: "#8DB3E2",
                        color: "#000000",
                      }}
                    >
                      <div className="text-[13px]">4th</div>
                      <div className="text-[11px] font-normal leading-none mt-0.5">
                        {getPeriodTime(4, "9.20-9.55")}
                      </div>
                    </th>
                    <th
                      onClick={() => onUpdateTimings && setIsTimingModalOpen(true)}
                      className="pdf-break-col p-1 text-center w-16 text-[12px] font-bold cursor-pointer hover:bg-[#7aa4da] transition-colors"
                      title="Click to edit timings"
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
                      onClick={() => onUpdateTimings && setIsTimingModalOpen(true)}
                      className="p-1 text-center min-w-[84px] font-bold cursor-pointer hover:bg-[#7aa4da] transition-colors"
                      title="Click to edit timings"
                      style={{
                        border: "1px solid #000000",
                        backgroundColor: "#8DB3E2",
                        color: "#000000",
                      }}
                    >
                      <div className="text-[13px]">5th</div>
                      <div className="text-[11px] font-normal leading-none mt-0.5">
                        {getPeriodTime(5, "10.25-11.00")}
                      </div>
                    </th>
                    <th
                      onClick={() => onUpdateTimings && setIsTimingModalOpen(true)}
                      className="p-1 text-center min-w-[84px] font-bold cursor-pointer hover:bg-[#7aa4da] transition-colors"
                      title="Click to edit timings"
                      style={{
                        border: "1px solid #000000",
                        backgroundColor: "#8DB3E2",
                        color: "#000000",
                      }}
                    >
                      <div className="text-[13px]">6th</div>
                      <div className="text-[11px] font-normal leading-none mt-0.5">
                        {getPeriodTime(6, "11.00-11.35")}
                      </div>
                    </th>
                    <th
                      onClick={() => onUpdateTimings && setIsTimingModalOpen(true)}
                      className="p-1 text-center min-w-[84px] font-bold cursor-pointer hover:bg-[#7aa4da] transition-colors"
                      title="Click to edit timings"
                      style={{
                        border: "1px solid #000000",
                        backgroundColor: "#8DB3E2",
                        color: "#000000",
                      }}
                    >
                      <div className="text-[13px]">7th</div>
                      <div className="text-[11px] font-normal leading-none mt-0.5">
                        {getPeriodTime(7, "11.35-12.10")}
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {dayRoutine.sections.map((sec) => {
                    const isSuspended = !sec.isActive;

                    return (
                      <tr
                        key={sec.sectionId}
                        className={isSuspended ? "pdf-suspended-row" : ""}
                        style={{
                          borderBottom: "1px solid #000000",
                        }}
                      >
                        {/* Section Header Cell with Yellow (#FFFF00) Background */}
                        <td
                          className="pdf-section-col py-1 px-1 font-bold text-black whitespace-nowrap text-center text-[13px] relative group"
                          style={{
                            border: "1px solid #000000",
                            backgroundColor: "#FFFF00",
                            color: "#000000",
                          }}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>{sec.sectionId}</span>
                            {/* In-browser quick toggle for section suspend/resume */}
                            {onToggleSectionStatus && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleSectionStatus(
                                    dayRoutine.day,
                                    sec.sectionId,
                                    !sec.isActive,
                                    sec.statusReason || "Suspended"
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

                        {/* If whole section is suspended: span all periods cleanly */}
                        {isSuspended ? (
                          <td
                            colSpan={8}
                            className="p-1 text-center font-bold tracking-wider text-[13px]"
                            style={{
                              border: "1px solid #000000",
                              backgroundColor: "#FEE2E2",
                              color: "#991B1B",
                            }}
                          >
                            Class Suspended
                          </td>
                        ) : (
                          <>
                            {/* Periods 1 to 4 */}
                            {[0, 1, 2, 3].map((pIdx) => {
                              const cell = sec.periods[pIdx];
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
                                  key={pIdx}
                                  onClick={() =>
                                    setEditingCell({
                                      day: dayRoutine.day,
                                      sectionId: sec.sectionId,
                                      periodIndex: pIdx,
                                      cell,
                                    })
                                  }
                                  className={`p-1 text-center align-middle cursor-pointer transition-colors ${isHighlighted ? "bg-amber-200 text-black font-bold" : ""
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
                                    <div className="leading-tight text-[12px]">
                                      <span className="font-semibold text-black">
                                        {cell.subject}
                                      </span>
                                      <span className="text-black font-medium">
                                        {" - "}
                                        {cell.substituteTeacherCode ? (
                                          <span className="font-bold text-purple-800">
                                            {cell.substituteTeacherCode}
                                          </span>
                                        ) : (
                                          cell.teacherCode
                                        )}
                                      </span>

                                      {/* Substituted indicator if substituted (code only, no full name or reason) */}
                                      {cell.substituteTeacherCode && (
                                        <div className="text-[10px] font-bold text-purple-700 leading-none mt-0.5">
                                          (Sub: {cell.substituteTeacherCode})
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-zinc-400 font-bold">-</span>
                                  )}
                                </td>
                              );
                            })}

                            {/* Break Column */}
                            <td
                              className="pdf-break-col text-center text-black text-[11px] p-0.5 font-bold"
                              style={{
                                border: "1px solid #000000",
                                backgroundColor: "#8DB3E2",
                                color: "#000000",
                              }}
                            >
                              -
                            </td>

                            {/* Periods 5 to 7 */}
                            {[4, 5, 6].map((pIdx) => {
                              const cell = sec.periods[pIdx];
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
                                  key={pIdx}
                                  onClick={() =>
                                    setEditingCell({
                                      day: dayRoutine.day,
                                      sectionId: sec.sectionId,
                                      periodIndex: pIdx,
                                      cell,
                                    })
                                  }
                                  className={`p-1 text-center align-middle cursor-pointer transition-colors ${isHighlighted ? "bg-amber-200 text-black font-bold" : ""
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
                                    <div className="leading-tight text-[12px]">
                                      <span className="font-semibold text-black">
                                        {cell.subject}
                                      </span>
                                      <span className="text-black font-medium">
                                        {" - "}
                                        {cell.substituteTeacherCode ? (
                                          <span className="font-bold text-purple-800">
                                            {cell.substituteTeacherCode}
                                          </span>
                                        ) : (
                                          cell.teacherCode
                                        )}
                                      </span>

                                      {/* Substituted indicator if substituted (code only, no full name or reason) */}
                                      {cell.substituteTeacherCode && (
                                        <div className="text-[10px] font-bold text-purple-700 leading-none mt-0.5">
                                          (Sub: {cell.substituteTeacherCode})
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-zinc-400 font-bold">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Signature Footer - Exact replica of PDF */}
            <div
              className="mt-6 pt-2 flex items-center justify-between text-xs font-bold text-black px-4"
              style={{
                fontFamily: "'Times New Roman', Times, serif",
                color: "#000000",
              }}
            >
              <div className="text-center">
                <div
                  className="w-36 mb-1"
                  style={{ borderBottom: "1px solid #000000" }}
                />
                <span>Sign of OIC Routine Comm.</span>
              </div>
              <div className="text-center">
                <div
                  className="w-40 mb-1"
                  style={{ borderBottom: "1px solid #000000" }}
                />
                <span>Sign of Chairman Routine Comm.</span>
              </div>
              <div className="text-center">
                <div
                  className="w-36 mb-1"
                  style={{ borderBottom: "1px solid #000000" }}
                />
                <span>Sign of VP (EMMS)</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Cell Editor Modal (Strictly hidden during printing) */}
      {editingCell && (
        <div className="no-print fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-base text-foreground">
                  Edit Cell: {editingCell.sectionId} • Period {editingCell.periodIndex + 1}
                </h3>
                <p className="text-xs text-foreground-muted">Day: {editingCell.day}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCell(null)}
                className="p-1 rounded-lg hover:bg-secondary text-foreground-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const subject = (form.elements.namedItem("subject") as HTMLInputElement).value.trim();
                const teacherCode = (form.elements.namedItem("teacherCode") as HTMLInputElement).value.trim();
                if (!subject || !teacherCode) {
                  onUpdateCell(
                    editingCell.day,
                    editingCell.sectionId,
                    editingCell.periodIndex,
                    null
                  );
                } else {
                  onUpdateCell(
                    editingCell.day,
                    editingCell.sectionId,
                    editingCell.periodIndex,
                    {
                      subject,
                      teacherCode,
                      room: editingCell.cell?.room,
                      substituteTeacherCode: editingCell.cell?.substituteTeacherCode,
                      substituteReason: undefined, // Reason not needed
                    }
                  );
                }
                setEditingCell(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-medium text-foreground block mb-1">Subject Name</label>
                <input
                  name="subject"
                  defaultValue={editingCell.cell?.subject || ""}
                  placeholder="e.g. Physics, Higher Math, ICT"
                  className="w-full px-3 py-2 rounded-xl bg-background-secondary border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Teacher Code (e.g. AA, MR, ZI)</label>
                <input
                  name="teacherCode"
                  defaultValue={editingCell.cell?.teacherCode || ""}
                  placeholder="e.g. AA, MR, ZI, GCS, SM"
                  className="w-full px-3 py-2 rounded-xl bg-background-secondary border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 uppercase font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateCell(
                      editingCell.day,
                      editingCell.sectionId,
                      editingCell.periodIndex,
                      null
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
          onResetTimings={onResetTimings || (() => {})}
        />
      )}

      {/* Strict Print CSS: Prints ONLY the official routine sheets without any app chrome */}
      <style jsx global>{`
        @media print {
          @page {
            size: portrait;
            margin: 5mm 5mm 6mm 5mm;
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

          /* Hide EVERYTHING in the DOM */
          body * {
            visibility: hidden !important;
          }

          /* Only show the routine-print-area and its descendants */
          .routine-print-area,
          .routine-print-area * {
            visibility: visible !important;
          }

          /* Position the routine print container at top left */
          .routine-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Hide any UI buttons, modals, toolbars */
          .no-print {
            display: none !important;
          }

          .routine-sheet {
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 0 10mm 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }

          table {
            border: 1.5px solid #000000 !important;
            border-collapse: collapse !important;
            border-spacing: 0 !important;
            width: 100% !important;
          }

          thead,
          tbody,
          tr {
            border-color: #000000 !important;
          }

          th,
          td {
            border: 1px solid #000000 !important;
            border-color: #000000 !important;
            background-clip: padding-box !important;
            box-shadow: inset 0 0 0 0.5px #000000 !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-header-day,
          .pdf-header-day th {
            background-color: #FFFF00 !important;
            border: 1px solid #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-header-periods th {
            background-color: #8DB3E2 !important;
            border: 1px solid #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-section-col {
            background-color: #FFFF00 !important;
            border: 1px solid #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-break-col {
            background-color: #8DB3E2 !important;
            border: 1px solid #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-suspended-row td {
            background-color: #FEE2E2 !important;
            color: #991B1B !important;
            border: 1px solid #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
