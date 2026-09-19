"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";

const emptySubscribe = () => () => {};

export function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function ThemeTogglePill({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "system", label: "System", icon: Laptop },
    { value: "dark", label: "Dark", icon: Moon },
  ] as const;

  if (!mounted) {
    return (
      <div
        className={`inline-flex items-center gap-1 p-1 rounded-full bg-secondary/60 border border-border ${className}`}
        aria-hidden="true"
      >
        <div className="w-8 h-8 rounded-full bg-transparent" />
        <div className="w-8 h-8 rounded-full bg-transparent" />
        <div className="w-8 h-8 rounded-full bg-transparent" />
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme selection"
      className={`inline-flex items-center gap-1 p-1 rounded-full bg-secondary/80 border border-border/80 shadow-xs backdrop-blur-xs transition-colors ${className}`}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isActive}
            aria-label={`Switch to ${opt.label} mode`}
            onClick={() => setTheme(opt.value)}
            className={`group relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-card text-foreground shadow-xs ring-1 ring-border font-semibold"
                : "text-foreground-muted hover:text-foreground hover:bg-card/40"
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 ${
                isActive
                  ? opt.value === "light"
                    ? "text-amber-500"
                    : opt.value === "dark"
                      ? "text-sky-400"
                      : "text-primary"
                  : ""
              }`}
            />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ThemeToggleIconButton({
  className = "",
  showTooltip = false,
}: {
  className?: string;
  showTooltip?: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl bg-secondary/50 border border-border ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={
        showTooltip ? `Switch to ${isDark ? "Light" : "Dark"} mode` : undefined
      }
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl bg-card border border-border hover:border-primary/50 text-foreground hover:text-primary transition-all duration-200 shadow-xs active:scale-95 cursor-pointer card-glow-hover ${className}`}
    >
      <Sun
        className={`w-4 h-4 text-amber-500 transition-all duration-300 ${
          isDark
            ? "rotate-90 scale-0 opacity-0 absolute"
            : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        className={`w-4 h-4 text-sky-400 transition-all duration-300 ${
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0 absolute"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
