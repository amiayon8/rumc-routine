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
  Menu,
  X,
  ChevronRight,
  GraduationCap,
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
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(false);

  const navTabs = [
    { id: "substitution", label: "Replacements", icon: Users },
    { id: "routine-pdf", label: "Routine Grid", icon: FileSpreadsheet },
    {
      id: "individual-routine",
      label: "Teacher / Class Routine",
      icon: FileText,
    },
    { id: "class-load", label: "Class Load", icon: BarChart3 },
    { id: "class-status", label: "Class Status", icon: Layers },
  ] as const;

  // Close sidebar on Escape key or desktop resize
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const activeTabItem = navTabs.find((t) => t.id === activeTab);

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-border/80 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              {/* Mobile Sidebar Hamburger Trigger */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open Navigation Menu"
                className="md:hidden flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-background-secondary border border-border text-foreground hover:bg-secondary cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                <Menu className="w-5 h-5 text-primary shrink-0" />
                <span className="text-xs font-bold truncate max-w-[120px]">
                  {activeTabItem?.label || "Menu"}
                </span>
              </button>

              {/* Undo / Redo controls */}
              <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-background-secondary dark:bg-gray-800 border border-border/80 shadow-xs">
                <button
                  type="button"
                  onClick={onUndo}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z)"
                  aria-label="Undo"
                  className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all ${canUndo
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
                  className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all ${canRedo
                    ? "text-foreground hover:bg-card hover:shadow-xs cursor-pointer active:scale-95"
                    : "text-foreground-subtle cursor-not-allowed opacity-40"
                    }`}
                >
                  <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Desktop Navigation Navbar */}
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${isActive
                      ? "bg-card text-foreground shadow-xs ring-1 ring-border"
                      : "text-foreground-muted hover:text-foreground hover:bg-card/40"
                      }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-foreground-subtle"
                        }`}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Status & Theme Controls */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl border text-[11px] font-medium shadow-xs transition-colors ${cloudStatus === "synced"
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
        </div>
      </header>

      {/* Mobile Sidebar Drawer Modal */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Sidebar Panel */}
          <aside
            aria-label="Mobile Navigation Sidebar"
            className="fixed inset-y-0 left-0 w-72 sm:w-80 bg-card border-r-2 border-border shadow-2xl flex flex-col justify-between p-5 z-50 animate-in slide-in-from-left duration-200"
          >
            <div className="space-y-6">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-base text-foreground leading-tight">
                      RUMC Routine
                    </h2>
                    <p className="text-xs font-semibold text-foreground-muted">
                      Portal Navigation
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label="Close sidebar"
                  className="p-2 rounded-xl text-foreground-subtle hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-foreground-subtle px-1">
                  Views & Tabs
                </div>
                <nav className="space-y-1.5">
                  {navTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          onTabChange(tab.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${isActive
                          ? "bg-primary text-primary-foreground shadow-md font-black"
                          : "bg-background-secondary text-foreground hover:bg-secondary border border-border/70"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 ${isActive
                              ? "text-primary-foreground"
                              : "text-primary"
                              }`}
                          />
                          <span>{tab.label}</span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 ${isActive ? "opacity-90" : "opacity-40"
                            }`}
                        />
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between text-xs text-foreground-muted font-bold px-1">
                <span>Database Sync</span>
                <span
                  className={`capitalize px-2 py-0.5 rounded-md text-[11px] font-bold ${cloudStatus === "synced"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : cloudStatus === "syncing"
                      ? "bg-primary/15 text-primary"
                      : "bg-secondary text-foreground-muted"
                    }`}
                >
                  {cloudStatus}
                </span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
