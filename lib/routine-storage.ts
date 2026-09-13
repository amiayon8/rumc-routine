import * as React from "react";
import {
  DayRoutine,
  RoutineCell,
  DEFAULT_ROUTINE_DATA,
  PeriodTiming,
  DEFAULT_PERIOD_TIMINGS,
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

let memoryRoutine: DayRoutine[] = DEFAULT_ROUTINE_DATA;
let memoryTimings: PeriodTiming[] = DEFAULT_PERIOD_TIMINGS;
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
          memoryRoutine = parsed;
        }
      }
      const timingsItem = window.localStorage.getItem(TIMINGS_STORAGE_KEY);
      if (timingsItem) {
        const parsedTimings = JSON.parse(timingsItem);
        if (Array.isArray(parsedTimings) && parsedTimings.length > 0) {
          memoryTimings = parsedTimings;
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
    getSnapshot(); // loads both
  }
  return memoryTimings;
}

function getServerSnapshot(): DayRoutine[] {
  return DEFAULT_ROUTINE_DATA;
}

function getServerTimingsSnapshot(): PeriodTiming[] {
  return DEFAULT_PERIOD_TIMINGS;
}

function getCloudSnapshot(): "synced" | "syncing" | "offline" {
  return cloudSyncStatus;
}

function updateState(next: DayRoutine[], persistToCloud = true) {
  memoryRoutine = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Failed to save routine to localStorage:", e);
    }
  }

  listeners.forEach((l) => l());

  if (persistToCloud && typeof window !== "undefined") {
    cloudSyncStatus = "syncing";
    listeners.forEach((l) => l());

    saveRoutineToSupabase(next)
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
    applySubstitution,
    revertSubstitution,
    updateTimings,
    updatePeriodTime,
    resetTimings,
    resetAll,
    exportJSON,
    importJSON,
  };
}
