"use client";

import * as React from "react";
import { PeriodTiming, DEFAULT_PERIOD_TIMINGS } from "../lib/routine-types";
import { Clock, RotateCcw, X, Check, Sparkles } from "lucide-react";

interface TimingEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  timings: PeriodTiming[];
  onSaveTimings: (newTimings: PeriodTiming[]) => void;
  onResetTimings: () => void;
}

export function TimingEditorModal(props: TimingEditorModalProps) {
  if (!props.isOpen) return null;
  return <TimingEditorContent {...props} />;
}

function TimingEditorContent({
  onClose,
  timings,
  onSaveTimings,
  onResetTimings,
}: TimingEditorModalProps) {
  const [formData, setFormData] = React.useState<PeriodTiming[]>(() => timings);

  const handleChange = (index: number, newTime: string) => {
    setFormData((prev) =>
      prev.map((t) => (t.index === index ? { ...t, time: newTime } : t))
    );
  };

  const handleApplyPreset = (type: "default" | "winter" | "ramadan") => {
    if (type === "default") {
      setFormData(DEFAULT_PERIOD_TIMINGS);
    } else if (type === "winter") {
      setFormData([
        { index: 1, name: "1st", time: "8.00-8.40" },
        { index: 2, name: "2nd", time: "8.40-9.15" },
        { index: 3, name: "3rd", time: "9.15-9.50" },
        { index: 4, name: "4th", time: "9.50-10.25" },
        { index: 0, name: "Break", time: "10.25-10:55", isBreak: true },
        { index: 5, name: "5th", time: "10.55-11.30" },
        { index: 6, name: "6th", time: "11.30-12.05" },
        { index: 7, name: "7th", time: "12.05-12.40" },
      ]);
    } else if (type === "ramadan") {
      setFormData([
        { index: 1, name: "1st", time: "8.30-9.05" },
        { index: 2, name: "2nd", time: "9.05-9.35" },
        { index: 3, name: "3rd", time: "9.35-10.05" },
        { index: 4, name: "4th", time: "10.05-10.35" },
        { index: 0, name: "Break", time: "10.35-10:55", isBreak: true },
        { index: 5, name: "5th", time: "10.55-11.25" },
        { index: 6, name: "6th", time: "11.25-11.55" },
        { index: 7, name: "7th", time: "11.55-12.25" },
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTimings(formData);
    onClose();
  };

  // Find period 1 and period 7 for shift summary
  const p1 = formData.find((t) => t.index === 1);
  const p7 = formData.find((t) => t.index === 7);
  const pBreak = formData.find((t) => t.index === 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
      <div className="bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto space-y-4 sm:space-y-5 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-subtle text-primary">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Class Routine Period Timings
              </h2>
              <p className="text-xs text-foreground-muted">
                Change timings for each period. Updates are reflected across the routine grid, PDF print, and shift indicators.
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

        {/* Quick Schedule Presets */}
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-background-secondary border border-border text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Presets:
          </span>
          <button
            type="button"
            onClick={() => handleApplyPreset("default")}
            className="px-2.5 py-1 rounded-lg bg-card hover:bg-muted border border-border font-medium text-foreground transition-colors cursor-pointer"
          >
            Official 2026 (7:30–12:10)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset("winter")}
            className="px-2.5 py-1 rounded-lg bg-card hover:bg-muted border border-border font-medium text-foreground transition-colors cursor-pointer"
          >
            Winter Shift (8:00–12:40)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset("ramadan")}
            className="px-2.5 py-1 rounded-lg bg-card hover:bg-muted border border-border font-medium text-foreground transition-colors cursor-pointer"
          >
            Ramadan Shift (8:30–12:25)
          </button>
        </div>

        {/* Timings Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formData.map((timing) => {
              const isBreak = timing.index === 0;

              return (
                <div
                  key={timing.index}
                  className={`p-3 rounded-2xl border transition-all ${
                    isBreak
                      ? "bg-amber-500/5 border-amber-500/30 dark:bg-amber-500/10"
                      : "bg-background-secondary border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                          isBreak
                            ? "bg-amber-500 text-white"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {isBreak ? "B" : timing.index}
                      </span>
                      <span>
                        {timing.name} {isBreak ? "Duration" : "Period"}
                      </span>
                    </label>
                    <span className="text-[10px] text-foreground-muted font-mono">
                      {isBreak ? "Break Slot" : `Col ${timing.index}`}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={timing.time}
                    onChange={(e) => handleChange(timing.index, e.target.value)}
                    placeholder="e.g. 7.30-8.10"
                    className="w-full px-3 py-1.5 text-xs font-medium rounded-xl bg-card border border-border text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 font-mono"
                    required
                  />
                </div>
              );
            })}
          </div>

          {/* Live Table Header Preview */}
          <div className="mt-4 p-3 rounded-2xl bg-card border border-border space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block">
              Live Routine Header Preview
            </span>
            <div className="overflow-x-auto">
              <table
                className="w-full text-center text-[10px] border-collapse font-serif"
                style={{
                  border: "1px solid #000",
                  fontFamily: "'Times New Roman', Times, serif",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#8DB3E2", color: "#000" }}>
                    <th style={{ border: "1px solid #000", padding: "4px" }}>Class</th>
                    {formData.slice(0, 4).map((t) => (
                      <th key={t.index} style={{ border: "1px solid #000", padding: "4px" }}>
                        <div className="font-bold">{t.name}</div>
                        <div className="font-normal text-[9px]">{t.time}</div>
                      </th>
                    ))}
                    {/* Break */}
                    {pBreak && (
                      <th style={{ border: "1px solid #000", padding: "4px" }}>
                        <div className="font-bold">Break</div>
                        <div className="font-normal text-[9px]">({pBreak.time})</div>
                      </th>
                    )}
                    {formData.slice(5).map((t) => (
                      <th key={t.index} style={{ border: "1px solid #000", padding: "4px" }}>
                        <div className="font-bold">{t.name}</div>
                        <div className="font-normal text-[9px]">{t.time}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>
            <div className="flex items-center justify-between text-[11px] text-foreground-muted pt-1">
              <span>
                Shift: {p1?.time.split("-")[0] || "7.30"} AM – {p7?.time.split("-")[1] || "12.10"} PM
              </span>
              <span>Break: {pBreak?.time || "9.55-10:25"}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => {
                if (confirm("Reset period timings to official 13 Sep 2026 defaults?")) {
                  onResetTimings();
                  setFormData(DEFAULT_PERIOD_TIMINGS);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-foreground-muted hover:text-danger hover:bg-danger-bg rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs rounded-xl bg-secondary text-foreground hover:bg-muted font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Timings</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
