"use client";

import * as React from "react";
import {
  DayRoutine,
  sortDaysCanonical,
  getTodaysWeekday,
} from "../lib/routine-data";
import {
  CheckCircle2,
  XCircle,
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { ClassManagerModal } from "./class-manager-modal";

interface ClassStatusManagerProps {
  routineData: DayRoutine[];
  currentDay: string;
  onToggleSectionStatus: (
    dayName: string,
    sectionId: string,
    isActive: boolean,
    reason?: string,
  ) => void;
  onAddClass?: (className: string, initialSectionName?: string) => boolean;
  onRenameClass?: (oldClassName: string, newClassName: string) => boolean;
  onDeleteClass?: (className: string) => void;
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
}

export function ClassStatusManager({
  routineData,
  currentDay,
  onToggleSectionStatus,
  onAddClass,
  onRenameClass,
  onDeleteClass,
  onAddSection,
  onRemoveSection,
  onEditSection,
  onReorderSections,
}: ClassStatusManagerProps) {
  const [prevCurrentDay, setPrevCurrentDay] =
    React.useState<string>(currentDay);
  const [selectedDay, setSelectedDay] = React.useState<string>(
    currentDay || getTodaysWeekday(),
  );

  if (currentDay && currentDay !== prevCurrentDay) {
    setPrevCurrentDay(currentDay);
    setSelectedDay(currentDay);
  }

  const activeDayRoutine =
    routineData.find((d) => d.day === selectedDay) || routineData[0];
  const sections = activeDayRoutine.sections;

  const activeCount = sections.filter((s) => s.isActive).length;
  const closedCount = sections.length - activeCount;

  const [bulkReason, setBulkReason] = React.useState<string>("Exam");
  const [isClassModalOpen, setIsClassModalOpen] =
    React.useState<boolean>(false);
  const [isAddClassOpen, setIsAddClassOpen] = React.useState<boolean>(false);
  const [newClassNameInput, setNewClassNameInput] = React.useState<string>("");
  const [newClassSectionInput, setNewClassSectionInput] =
    React.useState<string>("A");
  const [addClassError, setAddClassError] = React.useState<string | null>(null);

  const [editingClassName, setEditingClassName] = React.useState<string | null>(
    null,
  );
  const [editClassNameInput, setEditClassNameInput] =
    React.useState<string>("");
  const [classActionError, setClassActionError] = React.useState<string | null>(
    null,
  );

  const classNames = React.useMemo(() => {
    const list: string[] = [];
    sections.forEach((s) => {
      if (s.className && !list.includes(s.className)) {
        list.push(s.className);
      }
    });
    return list;
  }, [sections]);

  const getSectionsForClass = (clsName: string) => {
    return sections
      .filter((s) => s.className === clsName)
      .map((s) => s.sectionId);
  };

  const isClassClosed = (clsName: string) => {
    const classSections = sections.filter((s) => s.className === clsName);
    return classSections.length > 0 && classSections.every((s) => !s.isActive);
  };

  const isHscClosed = sections
    .filter(
      (s) =>
        s.className.includes("11") ||
        s.className.includes("12") ||
        s.className.toLowerCase().includes("hsc"),
    )
    .every((s) => !s.isActive);

  const toggleClassBulk = (clsName: string) => {
    const classSections = getSectionsForClass(clsName);
    const currentlyClosed = isClassClosed(clsName);
    const reasonText = bulkReason.trim()
      ? `${clsName} ${bulkReason.trim()}`
      : `${clsName} Exam`;
    handleBulkSetStatus(
      classSections,
      currentlyClosed,
      currentlyClosed ? "Normal" : reasonText,
    );
  };

  const handleBulkSetStatus = (
    sectionIds: string[],
    isActive: boolean,
    reason: string,
  ) => {
    sectionIds.forEach((id) => {
      onToggleSectionStatus(selectedDay, id, isActive, reason);
    });
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    setAddClassError(null);
    const trimmed = newClassNameInput.trim();
    if (!trimmed) {
      setAddClassError("Class name cannot be empty");
      return;
    }
    if (classNames.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setAddClassError(`A class named "${trimmed}" already exists`);
      return;
    }
    if (onAddClass) {
      const success = onAddClass(trimmed, newClassSectionInput.trim() || "A");
      if (success) {
        setNewClassNameInput("");
        setNewClassSectionInput("A");
        setIsAddClassOpen(false);
      } else {
        setAddClassError("Failed to add class");
      }
    }
  };

  const handleSaveRenameClass = (oldName: string) => {
    setClassActionError(null);
    const trimmed = editClassNameInput.trim();
    if (!trimmed) {
      setClassActionError("Class name cannot be empty");
      return;
    }
    if (trimmed.toLowerCase() === oldName.toLowerCase()) {
      setEditingClassName(null);
      return;
    }
    if (classNames.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setClassActionError(`Class "${trimmed}" already exists`);
      return;
    }
    if (onRenameClass) {
      const success = onRenameClass(oldName, trimmed);
      if (success) {
        setEditingClassName(null);
        setEditClassNameInput("");
      } else {
        setClassActionError("Failed to rename class");
      }
    }
  };

  const handleDeleteClass = (className: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${className} and all its sections across all days? This action can be undone with Ctrl+Z.`,
    );
    if (!confirmDelete) return;
    if (onDeleteClass) {
      onDeleteClass(className);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary-subtle text-primary">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-lg text-foreground tracking-tight">
                Classes Active &amp; Closed Manager
              </h2>
            </div>
            <p className="text-xs text-foreground-muted mt-1">
              Add new classes, rename, delete, or toggle active status. Marking
              classes as closed automatically frees assigned teachers for
              substitution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsAddClassOpen((prev) => !prev)}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Class</span>
            </button>

            <button
              type="button"
              onClick={() => setIsClassModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-background-secondary border border-border text-foreground font-semibold text-xs hover:bg-secondary transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Manage Directory</span>
            </button>

            <div className="px-3 py-1.5 rounded-xl bg-success-bg text-success border border-success/30 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{activeCount} Active</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-danger-bg text-danger border border-danger/30 text-xs font-bold flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              <span>{closedCount} Closed</span>
            </div>
          </div>
        </div>

        {isAddClassOpen && (
          <form
            onSubmit={handleCreateClass}
            className="p-4 rounded-2xl bg-background-secondary border border-primary/30 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-primary" />
                Add New Class to Schedule
              </span>
              <button
                type="button"
                onClick={() => setIsAddClassOpen(false)}
                className="text-foreground-subtle hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  value={newClassNameInput}
                  onChange={(e) => setNewClassNameInput(e.target.value)}
                  placeholder="e.g. Class 5, Grade 11, O Level"
                  className="w-full px-3 py-1.5 rounded-xl bg-card border border-border text-foreground font-medium outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground-muted mb-1">
                  Initial Section
                </label>
                <input
                  type="text"
                  value={newClassSectionInput}
                  onChange={(e) => setNewClassSectionInput(e.target.value)}
                  placeholder="e.g. A"
                  className="w-full px-3 py-1.5 rounded-xl bg-card border border-border text-foreground font-medium outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {addClassError && (
              <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{addClassError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddClassOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-foreground-muted hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover cursor-pointer"
              >
                Create Class
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Day:</span>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-background-secondary border border-border text-foreground font-semibold outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                {sortDaysCanonical(routineData).map((d) => (
                  <option key={d.day} value={d.day}>
                    {d.day}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">
                Close Reason:
              </span>
              <input
                type="text"
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                placeholder="e.g. Exam, Sports Day"
                className="px-2.5 py-1.5 text-xs rounded-xl bg-background-secondary border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 w-32 sm:w-40 font-medium"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() =>
                handleBulkSetStatus(
                  sections.map((s) => s.sectionId),
                  true,
                  "Normal",
                )
              }
              className="px-3 py-1.5 rounded-xl bg-secondary text-foreground hover:bg-muted font-bold transition-colors cursor-pointer shadow-xs"
            >
              Mark All Active
            </button>

            <button
              type="button"
              onClick={() => {
                const hscSections = sections
                  .filter(
                    (s) =>
                      s.className.includes("11") ||
                      s.className.includes("12") ||
                      s.className.toLowerCase().includes("hsc"),
                  )
                  .map((s) => s.sectionId);
                const reasonText = bulkReason.trim()
                  ? `HSC ${bulkReason.trim()}`
                  : "College Prep Leave";
                handleBulkSetStatus(
                  hscSections,
                  isHscClosed,
                  isHscClosed ? "Normal" : reasonText,
                );
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                isHscClosed
                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
              }`}
            >
              {isHscClosed
                ? "Reactivate HSC (11 & 12)"
                : "Close All HSC (11 & 12)"}
            </button>
          </div>
        </div>
      </div>

      {classActionError && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{classActionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setClassActionError(null)}
            className="p-1 hover:bg-rose-500/20 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="space-y-6">
        {classNames.map((clsName) => {
          const classSections = sections.filter((s) => s.className === clsName);
          const closed = isClassClosed(clsName);
          const isEditing = editingClassName === clsName;

          return (
            <div
              key={clsName}
              className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editClassNameInput}
                        onChange={(e) => setEditClassNameInput(e.target.value)}
                        className="px-2.5 py-1 text-sm font-bold rounded-lg bg-background-secondary border border-primary text-foreground outline-hidden"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRenameClass(clsName)}
                        className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover cursor-pointer"
                        title="Save class name"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingClassName(null)}
                        className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-muted cursor-pointer"
                        title="Cancel editing"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-foreground tracking-tight">
                        {clsName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-secondary text-foreground-muted">
                        {classSections.length} sections
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingClassName(clsName);
                          setEditClassNameInput(clsName);
                        }}
                        className="p-1.5 rounded-lg text-foreground-subtle hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                        title={`Rename ${clsName}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteClass(clsName)}
                        className="p-1.5 rounded-lg text-foreground-subtle hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title={`Delete ${clsName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleClassBulk(clsName)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                      closed
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/25"
                        : "bg-background-secondary text-foreground-muted hover:text-foreground border border-border hover:bg-secondary"
                    }`}
                  >
                    {closed
                      ? `Reactivate ${clsName}`
                      : `Close ${clsName} (${bulkReason})`}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {classSections.map((sec) => (
                  <div
                    key={sec.sectionId}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      sec.isActive
                        ? "bg-background-secondary/60 border-border shadow-2xs"
                        : "bg-rose-500/[0.04] dark:bg-rose-500/[0.08] border-rose-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-foreground font-mono">
                        {sec.sectionId}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          onToggleSectionStatus(
                            selectedDay,
                            sec.sectionId,
                            !sec.isActive,
                            sec.isActive
                              ? bulkReason.trim()
                                ? `${sec.className} ${bulkReason.trim()}`
                                : "Class Exam"
                              : "Normal",
                          )
                        }
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                          sec.isActive
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/25"
                        }`}
                      >
                        {sec.isActive ? "Active" : "Closed"}
                      </button>
                    </div>

                    <div className="text-[11px] text-foreground-muted space-y-1.5 pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-medium shrink-0">Reason:</span>
                        {sec.isActive ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                            {sec.statusReason || "Regular"}
                          </span>
                        ) : (
                          <input
                            type="text"
                            value={sec.statusReason || "Exam"}
                            onChange={(e) =>
                              onToggleSectionStatus(
                                selectedDay,
                                sec.sectionId,
                                false,
                                e.target.value,
                              )
                            }
                            className="px-1.5 py-0.5 text-[11px] rounded bg-background border border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold outline-hidden focus:ring-1 focus:ring-rose-400 w-full text-right"
                            title="Edit close reason"
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Periods:</span>
                        <span className="font-mono text-foreground font-semibold">
                          {sec.periods.filter(Boolean).length} / 7
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setIsAddClassOpen(true)}
          className="w-full p-4 rounded-3xl border-2 border-dashed border-border hover:border-primary/50 bg-card/50 hover:bg-primary-subtle/30 text-foreground-muted hover:text-primary transition-all flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Class</span>
        </button>
      </div>

      <ClassManagerModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        routineData={routineData}
        onAddSection={onAddSection || (() => false)}
        onRemoveSection={onRemoveSection || (() => {})}
        onEditSection={onEditSection || (() => false)}
        onReorderSections={onReorderSections}
        onAddClass={onAddClass}
        onRenameClass={onRenameClass}
        onDeleteClass={onDeleteClass}
      />
    </div>
  );
}
