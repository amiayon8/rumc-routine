"use client";

import * as React from "react";
import { DayRoutine } from "../lib/routine-data";
import {
  CheckCircle2,
  XCircle,
  Layers,
} from "lucide-react";

interface ClassStatusManagerProps {
  routineData: DayRoutine[];
  currentDay: string;
  onToggleSectionStatus: (
    dayName: string,
    sectionId: string,
    isActive: boolean,
    reason?: string
  ) => void;
}

export function ClassStatusManager({
  routineData,
  currentDay,
  onToggleSectionStatus,
}: ClassStatusManagerProps) {
  const [selectedDay, setSelectedDay] = React.useState<string>(currentDay);

  const activeDayRoutine = routineData.find((d) => d.day === selectedDay) || routineData[0];
  const sections = activeDayRoutine.sections;

  const activeCount = sections.filter((s) => s.isActive).length;
  const closedCount = sections.length - activeCount;

  const handleBulkSetStatus = (sectionIds: string[], isActive: boolean, reason: string) => {
    sectionIds.forEach((id) => {
      onToggleSectionStatus(selectedDay, id, isActive, reason);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Status Summary */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary-subtle text-primary">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-lg text-foreground tracking-tight">
                Classes Active & Closed Manager
              </h2>
            </div>
            <p className="text-xs text-foreground-muted mt-1">
              Toggle which classes and sections are active today. Marking a class as &quot;Closed / Exam&quot;
              updates the routine grid and automatically frees its teachers into the substitution pool!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-success-bg text-success border border-success/30 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{activeCount} Active</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-danger-bg text-danger border border-danger/30 text-xs font-bold flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              <span>{closedCount} Closed</span>
            </div>
          </div>
        </div>

        {/* Day Selector & Bulk Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Day:</span>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-background-secondary border border-border text-foreground font-semibold outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {routineData.map((d) => (
                <option key={d.day} value={d.day}>
                  {d.day}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-foreground-muted mr-1 font-medium">Quick Bulk Actions:</span>
            <button
              type="button"
              onClick={() =>
                handleBulkSetStatus(
                  sections.map((s) => s.sectionId),
                  true,
                  "Normal"
                )
              }
              className="px-2.5 py-1 rounded-lg bg-secondary text-foreground hover:bg-muted font-medium transition-colors cursor-pointer"
            >
              Mark All Active
            </button>
            <button
              type="button"
              onClick={() =>
                handleBulkSetStatus(
                  ["8A", "8B", "8C"],
                  false,
                  "Class 8 Exam"
                )
              }
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium transition-colors cursor-pointer"
            >
              Class 8 Exam (Close 8)
            </button>
            <button
              type="button"
              onClick={() =>
                handleBulkSetStatus(
                  ["11A", "11B", "11C", "11BST", "12A", "12B", "12C", "12BST"],
                  false,
                  "College Prep Leave"
                )
              }
              className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-medium transition-colors cursor-pointer"
            >
              Close All HSC (11 & 12)
            </button>
          </div>
        </div>
      </div>

      {/* Sections Grid with Interactive Toggle Switches */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sections.map((sec) => (
          <div
            key={sec.sectionId}
            className={`p-4 rounded-2xl border transition-all ${
              sec.isActive
                ? "bg-card border-border/90 shadow-xs"
                : "bg-rose-500/[0.04] dark:bg-rose-500/[0.08] border-rose-500/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-foreground font-mono">
                  {sec.sectionId}
                </span>
                <span className="text-xs text-foreground-muted">{sec.className}</span>
              </div>

              {/* Status Pill Toggle */}
              <button
                type="button"
                onClick={() =>
                  onToggleSectionStatus(
                    selectedDay,
                    sec.sectionId,
                    !sec.isActive,
                    sec.isActive ? "Exam / Closed" : "Normal"
                  )
                }
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  sec.isActive
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/25"
                }`}
              >
                {sec.isActive ? "Active" : "Closed"}
              </button>
            </div>

            {/* Reason or period summary */}
            <div className="text-xs text-foreground-muted space-y-1 mt-2 pt-2 border-t border-border/70">
              <div className="flex items-center justify-between text-[11px]">
                <span>Status:</span>
                <span className={sec.isActive ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-rose-600 dark:text-rose-400 font-semibold"}>
                  {sec.statusReason || (sec.isActive ? "Regular Classes" : "Suspended")}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span>Scheduled Periods:</span>
                <span className="font-mono text-foreground">
                  {sec.periods.filter(Boolean).length} / 7
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
