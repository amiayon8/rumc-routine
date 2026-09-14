"use client";

import * as React from "react";
import { TeacherInfo } from "../lib/routine-data";
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Users,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Building2,
  Tag,
  Info,
} from "lucide-react";

export interface TeacherManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Record<string, TeacherInfo>;
  onAddTeacher: (teacher: { code: string; dept: string; subject: string }) => boolean;
  onRemoveTeacher: (code: string) => void;
  onEditTeacher: (
    oldCode: string,
    updated: { code: string; dept: string; subject: string }
  ) => boolean;
  onResetTeachers?: () => void;
}

export function TeacherManagerModal({
  isOpen,
  onClose,
  teachers,
  onAddTeacher,
  onRemoveTeacher,
  onEditTeacher,
  onResetTeachers,
}: TeacherManagerModalProps) {
  if (!isOpen) return null;

  return (
    <TeacherManagerModalContent
      onClose={onClose}
      teachers={teachers}
      onAddTeacher={onAddTeacher}
      onRemoveTeacher={onRemoveTeacher}
      onEditTeacher={onEditTeacher}
      onResetTeachers={onResetTeachers}
    />
  );
}

const COMMON_DEPTS = [
  "Bangla",
  "English",
  "Math",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Social Science",
  "Commerce",
  "ICT",
  "Religion",
  "Physical Education",
  "Art & Craft",
  "General",
];

function TeacherManagerModalContent({
  onClose,
  teachers,
  onAddTeacher,
  onRemoveTeacher,
  onEditTeacher,
  onResetTeachers,
}: Omit<TeacherManagerModalProps, "isOpen">) {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedDeptFilter, setSelectedDeptFilter] = React.useState<string>("All");

  // Add new faculty form state
  const [newCode, setNewCode] = React.useState<string>("");
  const [newDept, setNewDept] = React.useState<string>("Math");
  const [newSubject, setNewSubject] = React.useState<string>("");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [formSuccess, setFormSuccess] = React.useState<string | null>(null);

  // In-line editing state
  const [editingCode, setEditingCode] = React.useState<string | null>(null);
  const [editFormData, setEditFormData] = React.useState<{
    code: string;
    dept: string;
    subject: string;
  }>({ code: "", dept: "", subject: "" });
  const [editError, setEditError] = React.useState<string | null>(null);

  // Deletion confirmation state
  const [confirmDeleteCode, setConfirmDeleteCode] = React.useState<string | null>(null);

  // Convert teachers record to array
  const teacherList = React.useMemo(() => {
    return Object.values(teachers).sort((a, b) => a.code.localeCompare(b.code));
  }, [teachers]);

  // Unique departments for filter
  const departmentsList = React.useMemo(() => {
    const set = new Set<string>();
    teacherList.forEach((t) => {
      if (t.dept) set.add(t.dept.trim());
    });
    return ["All", ...Array.from(set).sort()];
  }, [teacherList]);

  // Filtered teachers
  const filteredTeachers = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return teacherList.filter((t) => {
      const matchesSearch =
        !query ||
        t.code.toLowerCase().includes(query) ||
        t.dept.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query);

      const matchesDept =
        selectedDeptFilter === "All" ||
        t.dept.toLowerCase() === selectedDeptFilter.toLowerCase();

      return matchesSearch && matchesDept;
    });
  }, [teacherList, searchQuery, selectedDeptFilter]);

  // Parse subject string into discrete variation tags
  const parseSubjectTags = (subjStr: string) => {
    if (!subjStr) return [];
    return subjStr
      .split(/[,/|;]/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const code = newCode.trim().toUpperCase();
    const dept = newDept.trim();
    const subject = newSubject.trim();

    if (!code) {
      setFormError("Teacher acronym (code) is required.");
      return;
    }

    if (teachers[code]) {
      setFormError(`Teacher acronym "${code}" already exists in the directory.`);
      return;
    }

    if (!subject) {
      setFormError("At least one subject name or variation is required.");
      return;
    }

    const ok = onAddTeacher({
      code,
      dept: dept || "General",
      subject: subject || "General",
    });

    if (ok) {
      setFormSuccess(`Teacher "${code}" added successfully.`);
      setNewCode("");
      setNewSubject("");
      setTimeout(() => setFormSuccess(null), 3000);
    } else {
      setFormError("Failed to add teacher. Please verify details.");
    }
  };

  const startEdit = (t: TeacherInfo) => {
    setEditingCode(t.code);
    setEditFormData({
      code: t.code,
      dept: t.dept,
      subject: t.subject,
    });
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingCode(null);
    setEditFormData({ code: "", dept: "", subject: "" });
    setEditError(null);
  };

  const saveEdit = (oldCode: string) => {
    setEditError(null);
    const newTargetCode = editFormData.code.trim().toUpperCase();
    const newTargetDept = editFormData.dept.trim();
    const newTargetSubj = editFormData.subject.trim();

    if (!newTargetCode) {
      setEditError("Acronym cannot be empty.");
      return;
    }

    if (newTargetCode !== oldCode && teachers[newTargetCode]) {
      setEditError(`Acronym "${newTargetCode}" is already taken by another teacher.`);
      return;
    }

    if (!newTargetSubj) {
      setEditError("Subject cannot be empty.");
      return;
    }

    const ok = onEditTeacher(oldCode, {
      code: newTargetCode,
      dept: newTargetDept || "General",
      subject: newTargetSubj || "General",
    });

    if (ok) {
      setEditingCode(null);
    } else {
      setEditError("Failed to update teacher. Please try again.");
    }
  };

  const handleDeleteTeacher = (code: string) => {
    onRemoveTeacher(code);
    setConfirmDeleteCode(null);
    if (editingCode === code) {
      cancelEdit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2.5 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[94vh] w-full max-w-5xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Faculty & Subject Directory
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {teacherList.length}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Manage faculty acronyms and subject variations across classes for routines and smart substitutions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body: Two columns (Left: Add Form & Tips, Right: Search & Teacher List) */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {/* Left Column: Add New Teacher Form */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-border bg-muted/20 p-4 sm:p-5 overflow-y-auto max-h-64 md:max-h-none">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Add New Teacher
            </h3>

            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Teacher Acronym / Code <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="e.g., FAJ, YK, SRK"
                    maxLength={10}
                    className="w-full uppercase font-mono font-bold rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Unique 2-4 letter faculty initials.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Department
                </label>
                <div className="relative">
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  >
                    {COMMON_DEPTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Subjects / Class Variations <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Math, H.Math, G.Math, B.Math"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm resize-none"
                />
                <div className="mt-1 flex items-start gap-1 text-[11px] text-muted-foreground">
                  <Info className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                  <span>
                    Separate with commas. Handles naming differences across grades (e.g. Math vs H.Math).
                  </span>
                </div>

                {/* Real-time preview of parsed subject pills */}
                {newSubject.trim() && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {parseSubjectTags(newSubject).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {formError && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Teacher
              </button>
            </form>

            {/* Quick Guidance Box */}
            <div className="mt-6 rounded-xl border border-border/80 bg-background/50 p-3.5 text-xs space-y-2">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span>Class Subject Variations</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Teachers often teach different subject aliases in different grades (e.g., <strong>General Math</strong> in Class 8 vs <strong>Higher Math</strong> in Class 9).
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Entering variations ensures the intelligent substitution engine matches them with full subject compatibility.
              </p>
            </div>
          </div>

          {/* Right Column: Search, Filter & Faculty Directory List */}
          <div className="flex flex-1 flex-col overflow-hidden p-5">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by acronym (e.g. AA), department, or subject..."
                  className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                >
                  {departmentsList.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept === "All" ? "All Departments" : dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Teacher List Cards */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
              {filteredTeachers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Users className="h-10 w-10 stroke-1 mb-2 opacity-40" />
                  <p className="text-sm font-medium">No teachers found</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    Try adjusting your search query or department filter.
                  </p>
                </div>
              ) : (
                filteredTeachers.map((t) => {
                  const isEditing = editingCode === t.code;
                  const isConfirmingDelete = confirmDeleteCode === t.code;
                  const subjectTags = parseSubjectTags(t.subject);

                  if (isEditing) {
                    return (
                      <div
                        key={t.code}
                        className="rounded-xl border-2 border-primary/50 bg-accent/20 p-4 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-primary">
                            Editing Faculty: {t.code}
                          </span>
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Changing acronym updates routine cells
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                              Acronym / Code
                            </label>
                            <input
                              type="text"
                              value={editFormData.code}
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  code: e.target.value.toUpperCase(),
                                }))
                              }
                              className="w-full uppercase font-mono font-bold rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                              Department
                            </label>
                            <input
                              type="text"
                              value={editFormData.dept}
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  dept: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                              Subjects (Comma separated)
                            </label>
                            <input
                              type="text"
                              value={editFormData.subject}
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  subject: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm"
                            />
                          </div>
                        </div>

                        {editError && (
                          <div className="text-xs text-rose-500 font-medium">
                            {editError}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={cancelEdit}
                            className="rounded-lg border border-border px-3 py-1 text-xs font-medium hover:bg-accent text-muted-foreground"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEdit(t.code)}
                            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Save Changes
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={t.code}
                      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border border-border bg-card hover:border-primary/40 p-3 px-4 shadow-sm hover:shadow transition-all gap-3"
                    >
                      {/* Left: Code badge and Dept */}
                      <div className="flex items-center gap-3.5 min-w-[150px]">
                        <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 font-mono font-bold text-sm text-primary">
                          {t.code}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                            <span>{t.dept}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Subject Variations Badges */}
                      <div className="flex-1 flex flex-wrap items-center gap-1.5">
                        {subjectTags.map((subj, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground border border-border/60"
                          >
                            <BookOpen className="h-3 w-3 opacity-60" />
                            {subj}
                          </span>
                        ))}
                      </div>

                      {/* Right: Actions (Edit & Delete) */}
                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 rounded-lg px-2.5 py-1">
                            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                              Delete {t.code}?
                            </span>
                            <button
                              onClick={() => handleDeleteTeacher(t.code)}
                              className="rounded bg-rose-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-rose-700"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDeleteCode(null)}
                              className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground hover:bg-accent"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(t)}
                              title={`Edit ${t.code}`}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteCode(t.code)}
                              title={`Remove ${t.code}`}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Info Bar & Reset Option */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filteredTeachers.length} of {teacherList.length} faculty members
              </span>

              {onResetTeachers && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to reset the teacher directory back to default faculty members?"
                      )
                    ) {
                      onResetTeachers();
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-rose-600 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset to Default Directory</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/40 px-6 py-3">
          <div className="text-xs text-muted-foreground">
            All additions and modifications are saved automatically to your device.
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
