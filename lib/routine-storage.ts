import * as React from "react";
import {
  DayRoutine,
  RoutineCell,
  DEFAULT_ROUTINE_DATA,
  PeriodTiming,
  DEFAULT_PERIOD_TIMINGS,
  sortDaysCanonical,
  TeacherInfo,
  TEACHER_DIRECTORY,
} from "./routine-data";
import {
  fetchRoutineFromSupabase,
  saveRoutineToSupabase,
  logSubstitutionToSupabase,
  fetchTimingsFromSupabase,
  saveTimingsToSupabase,
} from "./supabase";

const STORAGE_KEY = "rumc_emms_routine_data_v1";
const TIMINGS_STORAGE_KEY = "rumc_emms_timings_v1";
const TEACHERS_STORAGE_KEY = "rumc_emms_teachers_v1";

let memoryRoutine: DayRoutine[] = DEFAULT_ROUTINE_DATA;
let memoryTimings: PeriodTiming[] = DEFAULT_PERIOD_TIMINGS;
let memoryTeachers: Record<string, TeacherInfo> = TEACHER_DIRECTORY;
let hasLoadedFromStorage = false;
let cloudSyncStatus: "synced" | "syncing" | "offline" = "synced";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): DayRoutine[] {
  if (typeof window !== "undefined" && !hasLoadedFromStorage) {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryRoutine = sortDaysCanonical(parsed);
        }
      }
      const timingsItem = window.localStorage.getItem(TIMINGS_STORAGE_KEY);
      if (timingsItem) {
        const parsedTimings = JSON.parse(timingsItem);
        if (Array.isArray(parsedTimings) && parsedTimings.length > 0) {
          memoryTimings = parsedTimings;
        }
      }
      const teachersItem = window.localStorage.getItem(TEACHERS_STORAGE_KEY);
      if (teachersItem) {
        const parsedTeachers = JSON.parse(teachersItem);
        if (parsedTeachers && typeof parsedTeachers === "object") {
          memoryTeachers = parsedTeachers;
        }
      }
    } catch (e) {
      console.error("Failed to parse routine from localStorage:", e);
    }
    hasLoadedFromStorage = true;
  }
  return memoryRoutine;
}

function getTimingsSnapshot(): PeriodTiming[] {
  if (typeof window !== "undefined" && !hasLoadedFromStorage) {
    getSnapshot(); // loads all
  }
  return memoryTimings;
}

function getTeachersSnapshot(): Record<string, TeacherInfo> {
  if (typeof window !== "undefined" && !hasLoadedFromStorage) {
    getSnapshot(); // loads all
  }
  return memoryTeachers;
}

function getServerSnapshot(): DayRoutine[] {
  return DEFAULT_ROUTINE_DATA;
}

function getServerTimingsSnapshot(): PeriodTiming[] {
  return DEFAULT_PERIOD_TIMINGS;
}

function getServerTeachersSnapshot(): Record<string, TeacherInfo> {
  return TEACHER_DIRECTORY;
}

function getCloudSnapshot(): "synced" | "syncing" | "offline" {
  return cloudSyncStatus;
}

function updateTeachersState(next: Record<string, TeacherInfo>) {
  memoryTeachers = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Failed to save teachers to localStorage:", e);
    }
  }
  listeners.forEach((l) => l());
}

function updateState(next: DayRoutine[], persistToCloud = true) {
  const sorted = sortDaysCanonical(next);
  memoryRoutine = sorted;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    } catch (e) {
      console.error("Failed to save routine to localStorage:", e);
    }
  }

  listeners.forEach((l) => l());

  if (persistToCloud && typeof window !== "undefined") {
    cloudSyncStatus = "syncing";
    listeners.forEach((l) => l());

    saveRoutineToSupabase(sorted)
      .then((ok) => {
        cloudSyncStatus = ok ? "synced" : "offline";
        listeners.forEach((l) => l());
      })
      .catch(() => {
        cloudSyncStatus = "offline";
        listeners.forEach((l) => l());
      });
  }
}

function updateTimingsState(nextTimings: PeriodTiming[], persistToCloud = true) {
  memoryTimings = nextTimings;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(TIMINGS_STORAGE_KEY, JSON.stringify(nextTimings));
    } catch (e) {
      console.error("Failed to save timings to localStorage:", e);
    }
  }

  listeners.forEach((l) => l());

  if (persistToCloud && typeof window !== "undefined") {
    saveTimingsToSupabase(nextTimings)
      .then(() => {
        listeners.forEach((l) => l());
      })
      .catch((err) => {
        console.warn("Supabase timings save error:", err);
      });
  }
}

export function useRoutineStore() {
  const routineData = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const timings = React.useSyncExternalStore<PeriodTiming[]>(
    subscribe,
    getTimingsSnapshot,
    getServerTimingsSnapshot
  );

  const cloudStatus = React.useSyncExternalStore<"synced" | "syncing" | "offline">(
    subscribe,
    getCloudSnapshot,
    () => "synced"
  );

  const teachers = React.useSyncExternalStore<Record<string, TeacherInfo>>(
    subscribe,
    getTeachersSnapshot,
    getServerTeachersSnapshot
  );

  // Sync with Supabase on initial mount
  React.useEffect(() => {
    let active = true;

    fetchRoutineFromSupabase().then((cloudData) => {
      if (!active) return;
      if (cloudData && cloudData.length > 0) {
        updateState(cloudData, false);
        cloudSyncStatus = "synced";
        listeners.forEach((l) => l());
      } else {
        // Seed Supabase with initial routine
        saveRoutineToSupabase(DEFAULT_ROUTINE_DATA).then((ok) => {
          if (!active) return;
          cloudSyncStatus = ok ? "synced" : "offline";
          listeners.forEach((l) => l());
        });
      }
    });

    fetchTimingsFromSupabase().then((cloudTimings) => {
      if (!active) return;
      if (cloudTimings && cloudTimings.length > 0) {
        updateTimingsState(cloudTimings, false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const updateCell = React.useCallback(
    (
      dayName: string,
      sectionId: string,
      periodIndex: number,
      newCell: RoutineCell | null
    ) => {
      const next = memoryRoutine.map((day) => {
        if (day.day !== dayName) return day;
        return {
          ...day,
          sections: day.sections.map((sec) => {
            if (sec.sectionId !== sectionId) return sec;
            const newPeriods = [...sec.periods];
            newPeriods[periodIndex] = newCell;
            return {
              ...sec,
              periods: newPeriods,
            };
          }),
        };
      });
      updateState(next);
    },
    []
  );

  const toggleSectionStatus = React.useCallback(
    (dayName: string, sectionId: string, isActive: boolean, statusReason?: string) => {
      const next = memoryRoutine.map((day) => {
        if (day.day !== dayName) return day;
        return {
          ...day,
          sections: day.sections.map((sec) => {
            if (sec.sectionId !== sectionId) return sec;
            return {
              ...sec,
              isActive,
              statusReason: statusReason || undefined,
            };
          }),
        };
      });
      updateState(next);
    },
    []
  );

  const addSection = React.useCallback(
    (newSec: { sectionId: string; className: string; sectionName?: string }): boolean => {
      const id = newSec.sectionId.trim();
      if (!id) return false;
      const exists = memoryRoutine.some((day) =>
        day.sections.some((s) => s.sectionId.toLowerCase() === id.toLowerCase())
      );
      if (exists) return false;

      const next = memoryRoutine.map((day) => ({
        ...day,
        sections: [
          ...day.sections,
          {
            sectionId: id,
            className: newSec.className.trim() || `Class ${id.replace(/\D/g, "") || id}`,
            sectionName: (newSec.sectionName || id.replace(/^\d+/, "") || id).trim(),
            isActive: true,
            periods: [null, null, null, null, null, null, null],
          },
        ],
      }));
      updateState(next);
      return true;
    },
    []
  );

  const removeSection = React.useCallback((sectionId: string) => {
    const next = memoryRoutine.map((day) => ({
      ...day,
      sections: day.sections.filter((s) => s.sectionId !== sectionId),
    }));
    updateState(next);
  }, []);

  const editSection = React.useCallback(
    (
      oldSectionId: string,
      updated: { sectionId: string; className: string; sectionName?: string }
    ): boolean => {
      const newId = updated.sectionId.trim();
      if (!newId) return false;
      if (
        newId.toLowerCase() !== oldSectionId.toLowerCase() &&
        memoryRoutine.some((day) =>
          day.sections.some((s) => s.sectionId.toLowerCase() === newId.toLowerCase())
        )
      ) {
        return false;
      }

      const next = memoryRoutine.map((day) => ({
        ...day,
        sections: day.sections.map((sec) => {
          if (sec.sectionId !== oldSectionId) return sec;
          return {
            ...sec,
            sectionId: newId,
            className: updated.className.trim() || sec.className,
            sectionName: updated.sectionName?.trim() || sec.sectionName,
          };
        }),
      }));
      updateState(next);
      return true;
    },
    []
  );

  const reorderSections = React.useCallback((orderedSectionIds: string[]) => {
    const orderMap = new Map(orderedSectionIds.map((id, index) => [id, index]));
    const next = memoryRoutine.map((day) => {
      const sortedSections = [...day.sections].sort((a, b) => {
        const orderA = orderMap.get(a.sectionId) ?? 999;
        const orderB = orderMap.get(b.sectionId) ?? 999;
        return orderA - orderB;
      });
      return { ...day, sections: sortedSections };
    });
    updateState(next);
  }, []);

  const addTeacher = React.useCallback(
    (newTeacher: { code: string; dept: string; subject: string }): boolean => {
      const code = newTeacher.code.trim().toUpperCase();
      if (!code) return false;
      const updated = {
        ...memoryTeachers,
        [code]: {
          code,
          name: code,
          dept: newTeacher.dept.trim() || "General",
          subject: newTeacher.subject.trim() || "General",
        },
      };
      updateTeachersState(updated);
      return true;
    },
    []
  );

  const removeTeacher = React.useCallback((code: string) => {
    const updated = { ...memoryTeachers };
    delete updated[code];
    updateTeachersState(updated);
  }, []);

  const editTeacher = React.useCallback(
    (
      oldCode: string,
      updated: { code: string; dept: string; subject: string }
    ): boolean => {
      const newCode = updated.code.trim().toUpperCase();
      if (!newCode) return false;

      const nextTeachers = { ...memoryTeachers };
      if (newCode !== oldCode) {
        delete nextTeachers[oldCode];
      }
      nextTeachers[newCode] = {
        code: newCode,
        name: newCode,
        dept: updated.dept.trim() || "General",
        subject: updated.subject.trim() || "General",
      };
      updateTeachersState(nextTeachers);

      if (newCode !== oldCode) {
        const nextRoutine = memoryRoutine.map((day) => ({
          ...day,
          sections: day.sections.map((sec) => ({
            ...sec,
            periods: sec.periods.map((cell) => {
              if (!cell) return cell;
              let changed = false;
              let tCode = cell.teacherCode;
              let subCode = cell.substituteTeacherCode;

              if (tCode === oldCode) {
                tCode = newCode;
                changed = true;
              }
              if (subCode === oldCode) {
                subCode = newCode;
                changed = true;
              }

              if (changed) {
                return {
                  ...cell,
                  teacherCode: tCode,
                  substituteTeacherCode: subCode,
                };
              }
              return cell;
            }),
          })),
        }));
        updateState(nextRoutine);
      }

      return true;
    },
    []
  );

  const resetTeachers = React.useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(TEACHERS_STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }
    }
    updateTeachersState(TEACHER_DIRECTORY);
  }, []);

  const applySubstitution = React.useCallback(
    (
      dayName: string,
      periodIndex: number,
      sectionId: string,
      originalTeacherCode: string,
      substituteTeacherCode: string,
      reason?: string
    ) => {
      const next = memoryRoutine.map((day) => {
        if (day.day !== dayName) return day;
        return {
          ...day,
          sections: day.sections.map((sec) => {
            if (sec.sectionId !== sectionId) return sec;
            const newPeriods = sec.periods.map((cell, idx) => {
              if (idx !== periodIndex || !cell) return cell;
              return {
                ...cell,
                substituteTeacherCode,
                substituteReason: reason || undefined,
              };
            });
            return { ...sec, periods: newPeriods };
          }),
        };
      });
      updateState(next);

      logSubstitutionToSupabase({
        day: dayName,
        sectionId,
        periodIndex,
        originalTeacherCode,
        substituteTeacherCode,
        reason,
      });
    },
    []
  );

  const revertSubstitution = React.useCallback(
    (dayName: string, periodIndex: number, sectionId: string) => {
      const next = memoryRoutine.map((day) => {
        if (day.day !== dayName) return day;
        return {
          ...day,
          sections: day.sections.map((sec) => {
            if (sec.sectionId !== sectionId) return sec;
            const newPeriods = sec.periods.map((cell, idx) => {
              if (idx !== periodIndex || !cell) return cell;
              const copy = { ...cell };
              delete copy.substituteTeacherCode;
              delete copy.substituteReason;
              return copy;
            });
            return { ...sec, periods: newPeriods };
          }),
        };
      });
      updateState(next);
    },
    []
  );

  const updateTimings = React.useCallback((newTimings: PeriodTiming[]) => {
    updateTimingsState(newTimings, true);
  }, []);

  const updatePeriodTime = React.useCallback(
    (index: number, newTime: string, newName?: string) => {
      const next = memoryTimings.map((t) => {
        if (t.index !== index) return t;
        return {
          ...t,
          time: newTime,
          name: newName || t.name,
        };
      });
      updateTimingsState(next, true);
    },
    []
  );

  const resetTimings = React.useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(TIMINGS_STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }
    }
    updateTimingsState(DEFAULT_PERIOD_TIMINGS, true);
  }, []);

  const resetAll = React.useCallback(() => {
    hasLoadedFromStorage = true;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(TIMINGS_STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }
    }
    updateState(DEFAULT_ROUTINE_DATA, true);
    updateTimingsState(DEFAULT_PERIOD_TIMINGS, true);
  }, []);

  const exportJSON = React.useCallback(() => {
    const payload = {
      version: "2.0",
      exportDate: new Date().toISOString(),
      timings: memoryTimings,
      routine: memoryRoutine,
    };
    const dataStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `RUMC_EMMS_Routine_with_Timings_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const importJSON = React.useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.routine && Array.isArray(parsed.routine)) {
        updateState(parsed.routine, true);
        if (parsed.timings && Array.isArray(parsed.timings)) {
          updateTimingsState(parsed.timings, true);
        }
        return true;
      }
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].sections) {
        updateState(parsed, true);
        return true;
      }
    } catch (e) {
      console.error("Invalid JSON for routine:", e);
    }
    return false;
  }, []);

  return {
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
    updatePeriodTime,
    resetTimings,
    resetAll,
    exportJSON,
    importJSON,
    teachers,
    addTeacher,
    removeTeacher,
    editTeacher,
    resetTeachers,
  };
}
