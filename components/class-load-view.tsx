"use client";

import * as React from "react";
import { DayRoutine, TeacherInfo } from "../lib/routine-data";
import { calculateTeacherLoads, TeacherLoadSummary } from "../lib/substitution-engine";
import { TeacherManagerModal } from "./teacher-manager-modal";
import {
  BarChart3,
  Search,
  Flame,
  Calendar,
  ChevronRight,
  Clock,
  Briefcase,
  Users,
} from "lucide-react";

interface ClassLoadViewProps {
  routineData: DayRoutine[];
  teachers?: Record<string, TeacherInfo>;
  onAddTeacher?: (teacher: { code: string; dept: string; subject: string }) => boolean;
  onRemoveTeacher?: (code: string) => void;
  onEditTeacher?: (
    oldCode: string,
    updated: { code: string; dept: string; subject: string }
  ) => boolean;
  onResetTeachers?: () => void;
}

export function ClassLoadView({
  routineData,
  teachers,
  onAddTeacher,
  onRemoveTeacher,
  onEditTeacher,
  onResetTeachers,
}: ClassLoadViewProps) {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = React.useState<TeacherLoadSummary | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = React.useState<boolean>(false);

  const teacherLoads = React.useMemo(() => {
    return calculateTeacherLoads(routineData);
  }, [routineData]);

  const loadList = React.useMemo(() => {
    return Object.values(teacherLoads).sort((a, b) => b.totalWeekLoad - a.totalWeekLoad);
  }, [teacherLoads]);

  const filteredList = React.useMemo(() => {
    return loadList.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase();
        return (
          item.teacher.code.toLowerCase().includes(q) ||
          item.teacher.dept.toLowerCase().includes(q) ||
          item.teacher.subject.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [loadList, statusFilter, searchTerm]);

  // Overall Statistics
  const totalPeriodsWeek = loadList.reduce((acc, curr) => acc + curr.totalWeekLoad, 0);
  const avgLoadPerTeacher = (totalPeriodsWeek / Math.max(1, loadList.length)).toFixed(1);
  const overloadedCount = loadList.filter((t) => t.status === "overloaded").length;

  const getStatusBadge = (status: TeacherLoadSummary["status"]) => {
    switch (status) {
      case "overloaded":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "heavy":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "optimal":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "light":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* High-Level Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-foreground-muted mb-1">
            <span>Total Faculty</span>
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground">{loadList.length}</p>
          <p className="text-[11px] text-foreground-muted mt-0.5">Active Teaching Staff</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-foreground-muted mb-1">
            <span>Weekly Periods</span>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground">{totalPeriodsWeek}</p>
          <p className="text-[11px] text-foreground-muted mt-0.5">Across 23 Sections (5 Days)</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-foreground-muted mb-1">
            <span>Average Workload</span>
            <BarChart3 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-foreground">{avgLoadPerTeacher}p</p>
          <p className="text-[11px] text-foreground-muted mt-0.5">Per Teacher / Week</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-foreground-muted mb-1">
            <span>Overloaded Teachers</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{overloadedCount}</p>
          <p className="text-[11px] text-foreground-muted mt-0.5">5+ periods/day threshold</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" />
          <input
            type="text"
            placeholder="Search teacher code, name, dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-background-secondary border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: "all", label: "All Teachers" },
            { id: "overloaded", label: "Overloaded" },
            { id: "heavy", label: "Heavy (4+)" },
            { id: "optimal", label: "Optimal" },
            { id: "light", label: "Light (<3)" },
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "bg-background-secondary text-foreground-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {teachers && onAddTeacher && onRemoveTeacher && onEditTeacher && (
          <button
            type="button"
            onClick={() => setIsTeacherModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Faculty</span>
          </button>
        )}
      </div>

      {/* Teacher Load Table Matrix */}
      <div className="rounded-3xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-background-secondary/80 border-b border-border text-foreground-muted font-bold">
                <th className="py-3 px-4">Faculty Code</th>
                <th className="py-3 px-4">Department / Subject</th>
                <th className="py-3 px-3 text-center">Sun</th>
                <th className="py-3 px-3 text-center">Mon</th>
                <th className="py-3 px-3 text-center">Tue</th>
                <th className="py-3 px-3 text-center">Wed</th>
                <th className="py-3 px-3 text-center">Thu</th>
                <th className="py-3 px-3 text-center">Total Week</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredList.map((item) => (
                <tr
                  key={item.teacher.code}
                  className="hover:bg-primary/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedTeacher(item)}
                >
                  <td className="py-3 px-4 font-mono font-bold text-foreground">
                    <span className="px-2 py-0.5 rounded-md bg-secondary border border-border">
                      {item.teacher.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-foreground-muted">
                    <span className="font-medium text-foreground">{item.teacher.dept}</span>
                    <span className="text-foreground-subtle ml-1">({item.teacher.subject})</span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-medium">
                    {item.dailyLoads.Sunday}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-medium">
                    {item.dailyLoads.Monday}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-medium">
                    {item.dailyLoads.Tuesday}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-medium">
                    {item.dailyLoads.Wednesday}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-medium">
                    {item.dailyLoads.Thursday}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-sm text-foreground">
                    {item.totalWeekLoad}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-foreground-muted">
                    <ChevronRight className="w-4 h-4 inline text-foreground-subtle" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Free Periods Details Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-2xl max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <span>Faculty Code:</span>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 font-bold">
                    {selectedTeacher.teacher.code}
                  </span>
                </h3>
                <p className="text-xs text-foreground-muted">
                  Department: {selectedTeacher.teacher.dept} • Weekly Load: {selectedTeacher.totalWeekLoad} periods
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="p-1.5 rounded-xl hover:bg-secondary text-foreground-muted cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Daily Schedule breakdown */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Free Periods Availability Timeline</span>
              </h4>

              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"].map((dayName) => {
                const freeSlots = selectedTeacher.freeSlotsByDay[dayName] || [];
                const load = selectedTeacher.dailyLoads[dayName] || 0;

                return (
                  <div
                    key={dayName}
                    className="p-3 rounded-xl bg-background-secondary border border-border flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-foreground mr-2">{dayName}</span>
                      <span className="text-foreground-muted font-mono">({load} periods)</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3, 4, 5, 6].map((pIdx) => {
                        const isFree = freeSlots.includes(pIdx);
                        return (
                          <span
                            key={pIdx}
                            title={`Period ${pIdx + 1}: ${isFree ? "Free" : "Class Active"}`}
                            className={`w-6 h-6 rounded-md text-[10px] font-mono font-bold flex items-center justify-center border ${
                              isFree
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                : "bg-zinc-200 dark:bg-zinc-800 text-foreground-subtle border-border"
                            }`}
                          >
                            P{pIdx + 1}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-secondary text-foreground hover:bg-muted cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher & Faculty Manager Modal */}
      {isTeacherModalOpen && teachers && onAddTeacher && onRemoveTeacher && onEditTeacher && (
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
    </div>
  );
}
