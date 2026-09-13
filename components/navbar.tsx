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
}

export function Navbar({ activeTab, onTabChange, cloudStatus }: NavbarProps) {

  const navTabs = [
    { id: "routine-pdf", label: "Routine Grid", icon: FileSpreadsheet },
    { id: "individual-routine", label: "Teacher / Class Routine", icon: FileText },
    { id: "substitution", label: "Auto-Replacements", icon: Users },
    { id: "class-load", label: "Faculty Load", icon: BarChart3 },
    { id: "class-status", label: "Class Status", icon: Layers },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-border/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Center: Segmented Navigation Pills */}
        <nav
          aria-label="Main Navigation"
          className="flex items-center gap-1 p-1 rounded-2xl bg-background-secondary border border-border/80 shadow-xs"
        >
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${isActive
                  ? "bg-card text-foreground shadow-xs ring-1 ring-border"
                  : "text-foreground-muted hover:text-foreground hover:bg-card/40"
                  }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-foreground-subtle"
                    }`}
                />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Cloud Sync Status & Theme Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Supabase status indicator */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-medium shadow-xs transition-colors ${cloudStatus === "synced"
              ? "bg-success-bg text-success border-success/30"
              : cloudStatus === "syncing"
                ? "bg-primary-subtle text-primary border-primary/30"
                : "bg-secondary text-foreground-muted border-border"
              }`}
            title={`Supabase Database: ${cloudStatus}`}
          >
            <Cloud
              className={`w-3.5 h-3.5 ${cloudStatus === "syncing" ? "animate-pulse text-primary" : ""
                }`}
            />
            <span className="capitalize">
              {cloudStatus === "synced"
                ? "Synced"
                : cloudStatus === "syncing"
                  ? "Saving..."
                  : "Offline"}
            </span>
          </div>

          {/* Theme switcher */}
          <ThemeTogglePill />
        </div>
      </div>
    </header>
  );
}
