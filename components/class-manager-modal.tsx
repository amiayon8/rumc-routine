"use client";

import * as React from "react";
import { DayRoutine, SectionRoutine } from "../lib/routine-data";
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  GraduationCap,
  Search,
  Layers,
} from "lucide-react";

interface ClassManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  routineData: DayRoutine[];
  onAddSection: (section: {
    sectionId: string;
    className: string;
    sectionName?: string;
  }) => boolean;
  onRemoveSection: (sectionId: string) => void;
  onEditSection: (
    oldSectionId: string,
    updated: { sectionId: string; className: string; sectionName?: string },
  ) => boolean;
  onReorderSections?: (orderedSectionIds: string[]) => void;
  onAddClass?: (className: string, initialSectionName?: string) => boolean;
  onRenameClass?: (oldClassName: string, newClassName: string) => boolean;
  onDeleteClass?: (className: string) => void;
  initialTab?: "classes" | "sections";
}

export function ClassManagerModal({
  isOpen,
  onClose,
  routineData,
  onAddSection,
  onRemoveSection,
  onEditSection,
  onReorderSections,
  onAddClass,
  onRenameClass,
  onDeleteClass,
  initialTab = "classes",
}: ClassManagerModalProps) {
  if (!isOpen) return null;

  return (
    <ClassManagerModalContent
      onClose={onClose}
      routineData={routineData}
      onAddSection={onAddSection}
      onRemoveSection={onRemoveSection}
      onEditSection={onEditSection}
      onReorderSections={onReorderSections}
      onAddClass={onAddClass}
      onRenameClass={onRenameClass}
      onDeleteClass={onDeleteClass}
      initialTab={initialTab}
    />
  );
}

function ClassManagerModalContent({
  onClose,
  routineData,
  onAddSection,
  onRemoveSection,
  onEditSection,
  onReorderSections,
  onAddClass,
  onRenameClass,
  onDeleteClass,
  initialTab = "classes",
}: Omit<ClassManagerModalProps, "isOpen">) {
  const [viewMode, setViewMode] = React.useState<"classes" | "sections">(
    initialTab,
  );

  const [newClassInput, setNewClassInput] = React.useState<string>("");
  const [newClassSectionInput, setNewClassSectionInput] =
    React.useState<string>("A");
  const [classActionError, setClassActionError] = React.useState<string | null>(
    null,
  );
  const [editingClassName, setEditingClassName] = React.useState<string | null>(
    null,
  );
  const [editClassNameVal, setEditClassNameVal] = React.useState<string>("");

  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedClassFilter, setSelectedClassFilter] =
    React.useState<string>("All");

  const [newClassName, setNewClassName] = React.useState<string>("Class 6");
  const [newSectionName, setNewSectionName] = React.useState<string>("");
  const [customSectionId, setCustomSectionId] = React.useState<string>("");
  const [formError, setFormError] = React.useState<string | null>(null);

  const [editingSectionId, setEditingSectionId] = React.useState<string | null>(
    null,
  );
  const [editFormData, setEditFormData] = React.useState<{
    sectionId: string;
    className: string;
    sectionName: string;
  }>({ sectionId: "", className: "", sectionName: "" });

  const sections: SectionRoutine[] = React.useMemo(() => {
    const dayOne = routineData[0];
    return dayOne ? dayOne.sections : [];
  }, [routineData]);

  const classGroups = React.useMemo(() => {
    const map = new Map<string, SectionRoutine[]>();
    sections.forEach((s) => {
      const existing = map.get(s.className) || [];
      existing.push(s);
      map.set(s.className, existing);
    });
    return Array.from(map.entries()).map(([className, secList]) => ({
      className,
      sections: secList,
    }));
  }, [sections]);

  const uniqueClasses = React.useMemo(() => {
    const set = new Set<string>();
    sections.forEach((s) => set.add(s.className));
    return ["All", ...Array.from(set)];
  }, [sections]);

  const suggestedSectionId = React.useMemo(() => {
    if (customSectionId.trim()) return customSectionId.trim();
    const classNum = newClassName.replace(/\D/g, "");
    const secLetter = newSectionName.trim().toUpperCase();
    return classNum ? `${classNum}${secLetter}` : secLetter;
  }, [newClassName, newSectionName, customSectionId]);

  const handleAddClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClassActionError(null);
    const trimmed = newClassInput.trim();
    if (!trimmed) {
      setClassActionError("Class name cannot be empty.");
      return;
    }
    if (
      sections.some(
        (s) => s.className.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setClassActionError(`Class "${trimmed}" already exists.`);
      return;
    }

    if (onAddClass) {
      const ok = onAddClass(trimmed, newClassSectionInput.trim() || "A");
      if (ok) {
        setNewClassInput("");
        setNewClassSectionInput("A");
        setClassActionError(null);
      } else {
        setClassActionError("Failed to add class.");
      }
    } else {
      const num = trimmed.replace(/\D/g, "");
      const secLetter = newClassSectionInput.trim().toUpperCase() || "A";
      const targetId = num
        ? `${num}${secLetter}`
        : `${trimmed.slice(0, 3).toUpperCase()}${secLetter}`;
      const ok = onAddSection({
        sectionId: targetId,
        className: trimmed,
        sectionName: secLetter,
      });
      if (ok) {
        setNewClassInput("");
        setNewClassSectionInput("A");
        setClassActionError(null);
      } else {
        setClassActionError("Failed to add class.");
      }
    }
  };

  const handleStartRenameClass = (clsName: string) => {
    setEditingClassName(clsName);
    setEditClassNameVal(clsName);
  };

  const handleSaveRenameClass = (oldClassName: string) => {
    const trimmedNew = editClassNameVal.trim();
    if (!trimmedNew || trimmedNew === oldClassName) {
      setEditingClassName(null);
      return;
    }

    if (onRenameClass) {
      onRenameClass(oldClassName, trimmedNew);
    } else {
      const matching = sections.filter((s) => s.className === oldClassName);
      matching.forEach((s) => {
        onEditSection(s.sectionId, {
          sectionId: s.sectionId,
          className: trimmedNew,
          sectionName: s.sectionName,
        });
      });
    }
    setEditingClassName(null);
  };

  const handleDeleteClassClick = (clsName: string, secCount: number) => {
    if (
      confirm(
        `Are you sure you want to delete "${clsName}" and all its ${secCount} section(s)?\n\nThis will remove it across all 5 days of the routine.`,
      )
    ) {
      if (onDeleteClass) {
        onDeleteClass(clsName);
      } else {
        const matching = sections.filter((s) => s.className === clsName);
        matching.forEach((s) => onRemoveSection(s.sectionId));
      }
    }
  };

  const handleQuickAddSectionToClass = (clsName: string) => {
    setViewMode("sections");
    setNewClassName(clsName);
    const existingForClass = sections.filter((s) => s.className === clsName);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const usedLetters = existingForClass.map((s) => s.sectionName.toUpperCase());
    const nextLetter =
      alphabet.split("").find((l) => !usedLetters.includes(l)) || "A";
    setNewSectionName(nextLetter);
    const num = clsName.replace(/\D/g, "");
    setCustomSectionId(num ? `${num}${nextLetter}` : "");
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const targetId = suggestedSectionId.trim().toUpperCase();
    if (!targetId) {
      setFormError("Section code cannot be empty.");
      return;
    }

    if (
      sections.some(
        (s) => s.sectionId.toLowerCase() === targetId.toLowerCase(),
      )
    ) {
      setFormError(
        `Section code "${targetId}" already exists. Please choose another code.`,
      );
      return;
    }

    const success = onAddSection({
      sectionId: targetId,
      className: newClassName.trim(),
      sectionName: newSectionName.trim() || targetId.slice(-1),
    });

    if (success) {
      setNewSectionName("");
      setCustomSectionId("");
      setFormError(null);
    } else {
      setFormError("Failed to add section. Code may already exist.");
    }
  };

  const handleStartEdit = (sec: SectionRoutine) => {
    setEditingSectionId(sec.sectionId);
    setEditFormData({
      sectionId: sec.sectionId,
      className: sec.className,
      sectionName: sec.sectionName,
    });
  };

  const handleSaveEdit = (oldId: string) => {
    if (!editFormData.sectionId.trim()) return;

    const success = onEditSection(oldId, {
      sectionId: editFormData.sectionId.trim().toUpperCase(),
      className: editFormData.className.trim(),
      sectionName: editFormData.sectionName.trim(),
    });

    if (success) {
      setEditingSectionId(null);
    } else {
      alert("Failed to update section. The code may already be in use.");
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (!onReorderSections) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newOrder = sections.map((s) => s.sectionId);
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    onReorderSections(newOrder);
  };

  const handleDelete = (sec: SectionRoutine) => {
    if (
      confirm(
        `Are you sure you want to delete "${sec.sectionId}" (${sec.className})?\n\nThis will remove it across all 5 days of the routine.`,
      )
    ) {
      onRemoveSection(sec.sectionId);
    }
  };

  const filteredSections = sections.filter((sec) => {
    if (
      selectedClassFilter !== "All" &&
      sec.className !== selectedClassFilter
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        sec.sectionId.toLowerCase().includes(q) ||
        sec.className.toLowerCase().includes(q) ||
        sec.sectionName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
      <div className="bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Class &amp; Section Manager
              </h2>
              <p className="text-xs text-foreground-muted">
                Add, rename, or delete entire classes and configure individual
                sections across all 5 days.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-secondary text-foreground-muted cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 sm:px-6 pt-4 border-b border-border/80">
          <div className="flex items-center gap-2 p-1 bg-background-secondary rounded-2xl border border-border text-xs font-semibold w-fit">
            <button
              type="button"
              onClick={() => setViewMode("classes")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === "classes"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Classes (Names)</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/15 font-bold">
                {classGroups.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("sections")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === "sections"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Sections &amp; Ordering</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/15 font-bold">
                {sections.length}
              </span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
          {viewMode === "classes" ? (
            <div className="space-y-4 sm:space-y-5">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-background-secondary border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-primary" />
                    <span>Add New Class Name</span>
                  </span>
                  <span className="text-[11px] text-foreground-muted hidden sm:inline">
                    Creates the class and its initial section across all 5 days
                  </span>
                </div>

                <form onSubmit={handleAddClassSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="sm:col-span-2">
                      <label className="font-semibold text-foreground-muted block mb-1">
                        New Class Name
                      </label>
                      <input
                        type="text"
                        value={newClassInput}
                        onChange={(e) => setNewClassInput(e.target.value)}
                        placeholder="e.g. Class 5, Grade 10, HSC 1st Year"
                        className="w-full px-3 py-2 sm:py-1.5 rounded-xl bg-card border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-foreground-muted block mb-1">
                        Initial Section
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newClassSectionInput}
                          onChange={(e) =>
                            setNewClassSectionInput(e.target.value)
                          }
                          placeholder="e.g. A"
                          className="w-full px-3 py-2 sm:py-1.5 rounded-xl bg-card border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 font-mono uppercase"
                          required
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 sm:py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                        >
                          Add Class
                        </button>
                      </div>
                    </div>
                  </div>

                  {classActionError && (
                    <div className="text-[11px] font-semibold text-danger flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{classActionError}</span>
                    </div>
                  )}
                </form>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-foreground-muted px-1">
                  <span className="font-bold text-foreground">
                    Existing Classes ({classGroups.length})
                  </span>
                  <span>Rename or delete classes</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {classGroups.map((group) => {
                    const isEditingThisClass =
                      editingClassName === group.className;

                    return (
                      <div
                        key={group.className}
                        className="p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        {isEditingThisClass ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={editClassNameVal}
                              onChange={(e) =>
                                setEditClassNameVal(e.target.value)
                              }
                              className="px-3 py-1.5 rounded-xl bg-background-secondary border border-border text-foreground font-bold outline-hidden focus:ring-2 focus:ring-primary/20 flex-1"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleSaveRenameClass(group.className)
                              }
                              className="px-3 py-1.5 rounded-xl bg-success text-white hover:bg-emerald-600 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingClassName(null)}
                              className="px-3 py-1.5 rounded-xl bg-secondary text-foreground hover:bg-muted font-semibold transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground">
                                {group.className}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-secondary text-foreground-muted text-[10px] font-semibold">
                                {group.sections.length} sections
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1">
                              {group.sections.map((sec) => (
                                <span
                                  key={sec.sectionId}
                                  className="px-2 py-0.5 rounded-md bg-background-secondary border border-border text-foreground font-mono text-[11px] font-bold"
                                >
                                  {sec.sectionId}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {!isEditingThisClass && (
                          <div className="flex items-center gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickAddSectionToClass(group.className)
                              }
                              className="px-2.5 py-1.5 rounded-xl bg-secondary hover:bg-muted text-foreground font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
                              title="Add another section to this class"
                            >
                              <Plus className="w-3.5 h-3.5 text-primary" />
                              <span>Section</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleStartRenameClass(group.className)
                              }
                              className="p-1.5 rounded-xl hover:bg-primary/10 text-foreground-muted hover:text-primary transition-colors cursor-pointer"
                              title="Rename this class across all 5 days"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteClassClick(
                                  group.className,
                                  group.sections.length,
                                )
                              }
                              className="p-1.5 rounded-xl hover:bg-danger-bg text-foreground-muted hover:text-danger transition-colors cursor-pointer"
                              title="Delete this class and all its sections"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-background-secondary border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-primary" />
                    <span>Add New Section</span>
                  </span>
                  <span className="text-[11px] text-foreground-muted hidden sm:inline">
                    Added across all 5 days with 7 empty periods
                  </span>
                </div>

                <form onSubmit={handleCreateSection} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div>
                      <label className="font-semibold text-foreground-muted block mb-1">
                        Class Name
                      </label>
                      <input
                        type="text"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="e.g. Class 6"
                        className="w-full px-3 py-2 sm:py-1.5 rounded-xl bg-card border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-foreground-muted block mb-1">
                        Section Name / Stream
                      </label>
                      <input
                        type="text"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        placeholder="e.g. D, Science, BST"
                        className="w-full px-3 py-2 sm:py-1.5 rounded-xl bg-card border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-foreground-muted block mb-1">
                        Section Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customSectionId}
                          onChange={(e) => setCustomSectionId(e.target.value)}
                          placeholder={suggestedSectionId || "e.g. 6D"}
                          className="w-full px-3 py-2 sm:py-1.5 rounded-xl bg-card border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 font-mono font-bold"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 sm:py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                        >
                          Add Section
                        </button>
                      </div>
                    </div>
                  </div>

                  {formError && (
                    <div className="text-[11px] font-semibold text-danger flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{formError}</span>
                    </div>
                  )}
                </form>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-bold text-foreground mr-1 text-[11px]">
                    Filter:
                  </span>
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

                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-subtle" />
                  <input
                    type="text"
                    placeholder="Search code or class..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-background-secondary border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-background-secondary/80 border-b border-border text-foreground-muted font-bold">
                        <th className="py-2.5 px-3 w-14 text-center">#</th>
                        <th className="py-2.5 px-3 w-28">Section Code</th>
                        <th className="py-2.5 px-4">Class Name</th>
                        <th className="py-2.5 px-3">Section Stream</th>
                        <th className="py-2.5 px-3 text-center w-28">Reorder</th>
                        <th className="py-2.5 px-3 text-right w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredSections.map((sec, idx) => {
                        const isEditing = editingSectionId === sec.sectionId;
                        const originalIndex = sections.findIndex(
                          (s) => s.sectionId === sec.sectionId,
                        );

                        if (isEditing) {
                          return (
                            <tr key={sec.sectionId} className="bg-primary/5">
                              <td className="py-2 px-3 text-center font-mono text-foreground-subtle">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={editFormData.sectionId}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      sectionId: e.target.value,
                                    })
                                  }
                                  className="w-20 px-2 py-1 rounded-lg bg-card border border-border text-foreground font-mono font-bold"
                                />
                              </td>
                              <td className="py-2 px-4">
                                <input
                                  type="text"
                                  value={editFormData.className}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      className: e.target.value,
                                    })
                                  }
                                  className="w-full max-w-xs px-2 py-1 rounded-lg bg-card border border-border text-foreground"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={editFormData.sectionName}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      sectionName: e.target.value,
                                    })
                                  }
                                  className="w-24 px-2 py-1 rounded-lg bg-card border border-border text-foreground"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className="text-foreground-subtle text-[11px]">
                                  Editing
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSaveEdit(sec.sectionId)
                                    }
                                    className="p-1 rounded-lg bg-success text-white hover:bg-emerald-600 transition-colors cursor-pointer"
                                    title="Save"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSectionId(null)}
                                    className="p-1 rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr
                            key={sec.sectionId}
                            className="hover:bg-background-secondary/40 transition-colors"
                          >
                            <td className="py-2.5 px-3 text-center font-mono text-foreground-subtle">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold font-mono text-foreground">
                                {sec.sectionId}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-semibold text-foreground">
                              {sec.className}
                            </td>
                            <td className="py-2.5 px-3 text-foreground-muted">
                              {sec.sectionName}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMove(originalIndex, "up")}
                                  disabled={originalIndex === 0}
                                  className="p-1 rounded-md hover:bg-secondary text-foreground-muted disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                  title="Move up"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleMove(originalIndex, "down")
                                  }
                                  disabled={
                                    originalIndex === sections.length - 1
                                  }
                                  className="p-1 rounded-md hover:bg-secondary text-foreground-muted disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                  title="Move down"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(sec)}
                                  className="p-1 rounded-lg hover:bg-primary/10 text-foreground-muted hover:text-primary transition-colors cursor-pointer"
                                  title="Edit Class Name & Section Code"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(sec)}
                                  className="p-1 rounded-lg hover:bg-danger-bg text-foreground-muted hover:text-danger transition-colors cursor-pointer"
                                  title="Delete Section"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredSections.length === 0 && (
                  <div className="p-8 text-center text-xs text-foreground-muted">
                    No classes or sections match your filter.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-background-secondary/50 flex items-center justify-between text-xs">
          <span className="text-foreground-muted">
            Total:{" "}
            <strong className="text-foreground">
              {classGroups.length} Classes
            </strong>{" "}
            •{" "}
            <strong className="text-foreground">
              {sections.length} Sections
            </strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
