"use client";

import * as React from "react";
import { ThemeTogglePill } from "./theme-toggle";
import {
  FileSpreadsheet,
  Users,
  BarChart3,
  Layers,
  Cloud,
  FileText,
  Undo2,
  Redo2,
} from "lucide-react";

export type ViewTab =
  | "routine-pdf"
  | "individual-routine"
  | "substitution"
  | "class-load"
  | "class-status";

interface NavbarProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  cloudStatus: "synced" | "syncing" | "offline";
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function Navbar({
  activeTab,
  onTabChange,
  cloudStatus,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: NavbarProps) {
  const navTabs = [
    { id: "routine-pdf", label: "Routine Grid", icon: FileSpreadsheet },
    {
      id: "individual-routine",
      label: "Teacher / Class Routine",
      icon: FileText,
    },
    { id: "substitution", label: "Auto-Replacements", icon: Users },
    { id: "class-load", label: "Faculty Load", icon: BarChart3 },
    { id: "class-status", label: "Class Status", icon: Layers },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-border/80 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-background-secondary dark:bg-gray-800 border border-border/80 shadow-xs">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
              className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all ${
                canUndo
                  ? "text-foreground hover:bg-card hover:shadow-xs cursor-pointer active:scale-95"
                  : "text-foreground-subtle cursor-not-allowed opacity-40"
              }`}
            >
              <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              aria-label="Redo"
              className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all ${
                canRedo
                  ? "text-foreground hover:bg-card hover:shadow-xs cursor-pointer active:scale-95"
                  : "text-foreground-subtle cursor-not-allowed opacity-40"
              }`}
            >
              <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-background-secondary border border-border/80 shadow-xs"
          >
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-card text-foreground shadow-xs ring-1 ring-border"
                      : "text-foreground-muted hover:text-foreground hover:bg-card/40"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-primary" : "text-foreground-subtle"
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl border text-[11px] font-medium shadow-xs transition-colors ${
                cloudStatus === "synced"
                  ? "bg-success-bg text-success border-success/30"
                  : cloudStatus === "syncing"
                    ? "bg-primary-subtle text-primary border-primary/30"
                    : "bg-secondary text-foreground-muted border-border"
              }`}
              title={`Supabase Database: ${cloudStatus}`}
            >
              <Cloud
                className={`w-3.5 h-3.5 ${
                  cloudStatus === "syncing" ? "animate-pulse text-primary" : ""
                }`}
              />
              <span className="capitalize hidden sm:inline">
                {cloudStatus === "synced"
                  ? "Synced"
                  : cloudStatus === "syncing"
                    ? "Saving..."
                    : "Offline"}
              </span>
            </div>

            <ThemeTogglePill />
          </div>
        </div>

        <nav
          aria-label="Mobile Navigation"
          className="md:hidden pb-2.5 pt-0.5 overflow-x-auto no-scrollbar -mx-3 px-3 flex items-center gap-1.5 scroll-smooth"
        >
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs ring-1 ring-primary"
                    : "bg-background-secondary text-foreground-muted hover:text-foreground border border-border/80"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive
                      ? "text-primary-foreground"
                      : "text-foreground-subtle"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
