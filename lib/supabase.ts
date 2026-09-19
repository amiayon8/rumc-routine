import { createClient } from "@supabase/supabase-js";
import { DayRoutine, sortDaysCanonical } from "./routine-data";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://abvzruratksjqzwhhekb.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidnpydXJhdGtzanF6d2hoZWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNzkwOTgsImV4cCI6MjEwNDg1NTA5OH0.5q-omO6DToETqli9m8aO4zvu_ed8TGOBF13J6ZR1a74";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchRoutineFromSupabase(): Promise<DayRoutine[] | null> {
  try {
    const { data, error } = await supabase
      .from("routine_store")
      .select("*")
      .neq("id", "timings_config")
      .order("id", { ascending: true });

    if (error || !data || data.length === 0) {
      return null;
    }

    const validDays = new Set([
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
    ]);
    const mapped = data
      .filter((row) => validDays.has(row.day))
      .map((row) => ({
        day: row.day,
        dateFormatted: row.date_formatted,
        sections: row.sections_data,
      }));
    return sortDaysCanonical(mapped);
  } catch (err) {
    console.warn("Supabase fetch failed, falling back:", err);
    return null;
  }
}

export async function saveRoutineToSupabase(
  days: DayRoutine[],
): Promise<boolean> {
  try {
    const rows = days.map((d) => ({
      id: d.day.toLowerCase(),
      day: d.day,
      date_formatted: d.dateFormatted || "",
      sections_data: d.sections,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("routine_store").upsert(rows);
    if (error) {
      console.error("Supabase upsert error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase save error:", err);
    return false;
  }
}

export async function logSubstitutionToSupabase(params: {
  day: string;
  sectionId: string;
  periodIndex: number;
  originalTeacherCode: string;
  substituteTeacherCode: string;
  reason?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from("substitutions_log").insert([
      {
        day: params.day,
        section_id: params.sectionId,
        period_index: params.periodIndex,
        original_teacher_code: params.originalTeacherCode,
        substitute_teacher_code: params.substituteTeacherCode,
        reason: params.reason || "",
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchTimingsFromSupabase(): Promise<
  import("./routine-types").PeriodTiming[] | null
> {
  try {
    const { data, error } = await supabase
      .from("routine_store")
      .select("*")
      .eq("id", "timings_config")
      .single();

    if (error || !data || !data.sections_data) return null;
    return data.sections_data as import("./routine-types").PeriodTiming[];
  } catch {
    return null;
  }
}

export async function saveTimingsToSupabase(
  timings: import("./routine-types").PeriodTiming[],
): Promise<boolean> {
  try {
    const { error } = await supabase.from("routine_store").upsert([
      {
        id: "timings_config",
        day: "Config",
        date_formatted: "Period Timings",
        sections_data: timings,
        updated_at: new Date().toISOString(),
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}
