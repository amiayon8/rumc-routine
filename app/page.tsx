"use client";

import * as React from "react";
import { Navbar, type ViewTab } from "../components/navbar";
import { PdfRoutineView } from "../components/pdf-routine-view";
import { IndividualRoutineView } from "../components/individual-routine-view";
import { SubstitutionManager } from "../components/substitution-modal";
import { ClassLoadView } from "../components/class-load-view";
import { ClassStatusManager } from "../components/class-status-manager";
import { useRoutineStore } from "../lib/routine-storage";
import { getTodaysWeekday } from "../lib/routine-types";
import { School } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = React.useState<ViewTab>("routine-pdf");
  const [currentDay, setCurrentDay] = React.useState<string>(getTodaysWeekday);

  React.useEffect(() => {
    setCurrentDay(getTodaysWeekday());
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cloudStatus={cloudStatus}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
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
