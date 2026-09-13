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
} from "lucide-react";

interface ClassManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  routineData: DayRoutine[];
  onAddSection: (section: { sectionId: string; className: string; sectionName?: string }) => boolean;
  onRemoveSection: (sectionId: string) => void;
  onEditSection: (
    oldSectionId: string,
    updated: { sectionId: string; className: string; sectionName?: string }
  ) => boolean;
  onReorderSections?: (orderedSectionIds: string[]) => void;
}

export function ClassManagerModal({
  isOpen,
  onClose,
  routineData,
  onAddSection,
  onRemoveSection,
  onEditSection,
  onReorderSections,
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
}: Omit<ClassManagerModalProps, "isOpen">) {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedClassFilter, setSelectedClassFilter] = React.useState<string>("All");

  // New section form state
  const [newClassName, setNewClassName] = React.useState<string>("Class 6");
  const [newSectionName, setNewSectionName] = React.useState<string>("");
  const [customSectionId, setCustomSectionId] = React.useState<string>("");
  const [formError, setFormError] = React.useState<string | null>(null);

  // In-line editing state
  const [editingSectionId, setEditingSectionId] = React.useState<string | null>(null);
  const [editFormData, setEditFormData] = React.useState<{
    sectionId: string;
    className: string;
    sectionName: string;
  }>({ sectionId: "", className: "", sectionName: "" });

  // Get canonical sections from the first day
  const sections: SectionRoutine[] = React.useMemo(() => {
    const dayOne = routineData[0];
    return dayOne ? dayOne.sections : [];
  }, [routineData]);

  // Derive unique classes
  const uniqueClasses = React.useMemo(() => {
    const set = new Set<string>();
    sections.forEach((s) => set.add(s.className));
    return ["All", ...Array.from(set)];
  }, [sections]);

  // Suggested Section ID calculation
  const suggestedSectionId = React.useMemo(() => {
    if (customSectionId.trim()) return customSectionId.trim();
    const classNum = newClassName.replace(/\D/g, "");
    const secLetter = newSectionName.trim().toUpperCase();
    return classNum ? `${classNum}${secLetter}` : secLetter;
  }, [newClassName, newSectionName, customSectionId]);

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const targetId = suggestedSectionId.trim().toUpperCase();
    if (!targetId) {
      setFormError("Section code cannot be empty.");
      return;
    }

    if (sections.some((s) => s.sectionId.toLowerCase() === targetId.toLowerCase())) {
      setFormError(`Section code "${targetId}" already exists. Please choose another code.`);
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
        `Are you sure you want to delete "${sec.sectionId}" (${sec.className})?\n\nThis will remove it across all 5 days of the routine.`
      )
    ) {
      onRemoveSection(sec.sectionId);
    }
  };

  // Filter sections
  const filteredSections = sections.filter((sec) => {
    if (selectedClassFilter !== "All" && sec.className !== selectedClassFilter) {
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Class &amp; Section Manager</h2>
              <p className="text-xs text-foreground-muted">
                Add, edit class names, rename section codes, or remove classes across all 5 days.
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. Add New Class / Section Box */}
          <div className="p-4 rounded-2xl bg-background-secondary border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-primary" />
                <span>Add New Class / Section</span>
              </span>
              <span className="text-[11px] text-foreground-muted">
                Automatically added across all 5 days with 7 empty periods
              </span>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* Class Name */}
                <div>
                  <label className="font-semibold text-foreground-muted block mb-1">
                    Class Name
                  </label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="e.g. Class 6"
                    className="w-full px-3 py-1.5 rounded-xl bg-card border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                {/* Section Name / Letter */}
                <div>
                  <label className="font-semibold text-foreground-muted block mb-1">
                    Section Name / Stream
                  </label>
                  <input
                    type="text"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="e.g. D, Science, BST"
                    className="w-full px-3 py-1.5 rounded-xl bg-card border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                {/* Section Code */}
                <div>
                  <label className="font-semibold text-foreground-muted block mb-1">
                    Section Code (Table Column)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSectionId}
                      onChange={(e) => setCustomSectionId(e.target.value)}
                      placeholder={suggestedSectionId || "e.g. 6D"}
                      className="w-full px-3 py-1.5 rounded-xl bg-card border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 font-mono font-bold"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                    >
                      Add
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

          {/* 2. Filter & Search Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            {/* Filter by class */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-bold text-foreground mr-1 text-[11px]">Filter:</span>
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

            {/* Search */}
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

          {/* 3. Existing Sections Table / List */}
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
                    const originalIndex = sections.findIndex((s) => s.sectionId === sec.sectionId);

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
                                setEditFormData((prev) => ({
                                  ...prev,
                                  sectionId: e.target.value,
                                }))
                              }
                              className="w-24 px-2 py-1 text-xs rounded-lg bg-card border border-primary font-mono font-bold text-foreground outline-hidden"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <input
                              type="text"
                              value={editFormData.className}
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  className: e.target.value,
                                }))
                              }
                              className="w-full px-2 py-1 text-xs rounded-lg bg-card border border-border text-foreground outline-hidden"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={editFormData.sectionName}
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  sectionName: e.target.value,
                                }))
                              }
                              className="w-24 px-2 py-1 text-xs rounded-lg bg-card border border-border text-foreground outline-hidden"
                            />
                          </td>
                          <td className="py-2 px-3 text-center text-foreground-subtle text-[11px]">
                            Editing
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(sec.sectionId)}
                                className="p-1 rounded-lg bg-success-bg text-success hover:bg-success/20 cursor-pointer"
                                title="Save changes"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSectionId(null)}
                                className="p-1 rounded-lg hover:bg-secondary text-foreground-muted cursor-pointer"
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
                      <tr key={sec.sectionId} className="hover:bg-card/80 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono text-foreground-subtle">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                          <span className="px-2 py-0.5 rounded-md bg-secondary border border-border text-[11px]">
                            {sec.sectionId}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-medium text-foreground">
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
                              onClick={() => handleMove(originalIndex, "down")}
                              disabled={originalIndex === sections.length - 1}
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
                              title="Edit Class Name &amp; Section Code"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(sec)}
                              className="p-1 rounded-lg hover:bg-danger-bg text-foreground-muted hover:text-danger transition-colors cursor-pointer"
                              title="Delete Class / Section"
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

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-background-secondary/50 flex items-center justify-between text-xs">
          <span className="text-foreground-muted">
            Total Classes: <strong className="text-foreground">{sections.length} sections</strong>
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
