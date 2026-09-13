"use client";

import * as React from "react";
import { Navbar, type ViewTab } from "../components/navbar";
import { PdfRoutineView } from "../components/pdf-routine-view";
import { IndividualRoutineView } from "../components/individual-routine-view";
import { SubstitutionManager } from "../components/substitution-modal";
import { ClassLoadView } from "../components/class-load-view";
import { ClassStatusManager } from "../components/class-status-manager";
import { useRoutineStore } from "../lib/routine-storage";
import { getTodaysFormattedDate } from "../lib/routine-types";
import { School, Clock, CheckCircle2, AlertCircle, Bell } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = React.useState<ViewTab>("routine-pdf");
  const [currentDay, setCurrentDay] = React.useState<string>("Sunday");

  const {
    routineData,
    timings,
    cloudStatus,
    updateCell,
    toggleSectionStatus,
    addSection,
    removeSection,
    editSection,
    reorderSections,
    applySubstitution,
    revertSubstitution,
    updateTimings,
    resetTimings,
    resetAll,
    exportJSON,
    importJSON,
    teachers,
    addTeacher,
    removeTeacher,
    editTeacher,
    resetTeachers,
  } = useRoutineStore();

  const activeDayRoutine = routineData.find((d) => d.day === currentDay) || routineData[0];
  const activeSectionsCount = activeDayRoutine?.sections.filter((s) => s.isActive).length || 0;
  const closedSectionsCount = (activeDayRoutine?.sections.length || 23) - activeSectionsCount;

  // Derive dynamic shift timing from period 1 and 7
  const p1 = timings?.find((t) => t.index === 1);
  const p7 = timings?.find((t) => t.index === 7);
  const pBreak = timings?.find((t) => t.index === 0);
  const shiftDisplay = `${p1?.time.split("-")[0] || "7:30"} AM – ${p7?.time.split("-")[1] || "12:10"} PM`;
  const breakDisplay = pBreak?.time || "9:55 – 10:25 AM";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Sleek Minimalist Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cloudStatus={cloudStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Compact Status Bar (Hidden during PDF print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border shadow-xs text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-foreground">
              Day: <span className="text-primary">{currentDay}</span>
            </span>
            <span className="text-foreground-subtle">•</span>
            <span className="text-foreground-muted">
              WEF {getTodaysFormattedDate()} (EMMS)
            </span>
            <span className="text-foreground-subtle">•</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {activeSectionsCount} Classes Active
            </span>
            {closedSectionsCount > 0 && (
              <>
                <span className="text-foreground-subtle">•</span>
                <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {closedSectionsCount} Closed/Exam
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 text-foreground-muted">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Shift: {shiftDisplay}</span>
            </span>
            <span className="hidden sm:inline text-foreground-subtle">•</span>
            <span className="hidden sm:flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Bell className="w-3.5 h-3.5" />
              <span>Break: {breakDisplay}</span>
            </span>
          </div>
        </div>

        {/* View 1: Official PDF Routine Grid */}
        {activeTab === "routine-pdf" && (
          <PdfRoutineView
            routineData={routineData}
            currentDay={currentDay}
            timings={timings}
            onSelectDay={setCurrentDay}
            onUpdateCell={updateCell}
            onUpdateTimings={updateTimings}
            onResetTimings={resetTimings}
            onToggleSectionStatus={toggleSectionStatus}
            onResetAll={resetAll}
            onExportJSON={exportJSON}
            onImportJSON={importJSON}
            onOpenSubstitution={() => setActiveTab("substitution")}
            onOpenClassStatus={() => setActiveTab("class-status")}
            onAddSection={addSection}
            onRemoveSection={removeSection}
            onEditSection={editSection}
            onReorderSections={reorderSections}
            teachers={teachers}
            onAddTeacher={addTeacher}
            onRemoveTeacher={removeTeacher}
            onEditTeacher={editTeacher}
            onResetTeachers={resetTeachers}
          />
        )}

        {/* View 2: Individual Teacher & Class / Section Routines */}
        {activeTab === "individual-routine" && (
          <IndividualRoutineView
            routineData={routineData}
            timings={timings}
            teachers={teachers}
          />
        )}

        {/* View 3: Teacher Auto-Replacements */}
        {activeTab === "substitution" && (
          <SubstitutionManager
            routineData={routineData}
            currentDay={currentDay}
            teachers={teachers}
            onApplySubstitution={applySubstitution}
            onRevertSubstitution={revertSubstitution}
          />
        )}

        {/* View 3: Faculty Load Matrix */}
        {activeTab === "class-load" && (
          <ClassLoadView
            routineData={routineData}
            teachers={teachers}
            onAddTeacher={addTeacher}
            onRemoveTeacher={removeTeacher}
            onEditTeacher={editTeacher}
            onResetTeachers={resetTeachers}
          />
        )}

        {/* View 4: Classes Active & Closed Manager */}
        {activeTab === "class-status" && (
          <ClassStatusManager
            routineData={routineData}
            currentDay={currentDay}
            onToggleSectionStatus={toggleSectionStatus}
          />
        )}
      </main>

      {/* Clean Minimalist Footer (Hidden during PDF print) */}
      <footer className="no-print w-full border-t border-border/80 bg-card/40 py-4 text-xs text-foreground-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">
              Rajuk Uttara Model College
            </span>
            <span>•</span>
            <span>Daywise Class Routine 2026 (EMMS)</span>
          </div>
          <div className="flex items-center gap-2 text-foreground-subtle">
            <span>Powered by <a href="https://www.thenicedev.xyz" className="text-black dark:text-white">The Nice Developer</a></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
