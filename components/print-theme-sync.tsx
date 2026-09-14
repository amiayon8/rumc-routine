"use client";

import * as React from "react";
import { useTheme } from "next-themes";

export function PrintThemeSync() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const originalThemeRef = React.useRef<string | null>(null);
  const isPrintingRef = React.useRef(false);

  React.useEffect(() => {
    const applyPrintTheme = () => {
      if (isPrintingRef.current) return;
      isPrintingRef.current = true;

      const currentResolved = resolvedTheme || (document.documentElement.classList.contains("dark") ? "dark" : "light");

      if (currentResolved === "dark") {
        originalThemeRef.current = theme || "dark";
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
        document.documentElement.style.colorScheme = "light";
        setTheme("light");
      } else {
        originalThemeRef.current = null;
      }
    };

    const restoreOriginalTheme = () => {
      if (!isPrintingRef.current) return;
      isPrintingRef.current = false;

      const previousTheme = originalThemeRef.current;
      originalThemeRef.current = null;

      if (previousTheme) {
        setTheme(previousTheme);
        if (previousTheme === "dark") {
          document.documentElement.classList.remove("light");
          document.documentElement.classList.add("dark");
          document.documentElement.style.colorScheme = "dark";
        }
      }
    };

    window.addEventListener("beforeprint", applyPrintTheme);
    window.addEventListener("afterprint", restoreOriginalTheme);

    const mediaQueryList = window.matchMedia("print");
    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        applyPrintTheme();
      } else {
        restoreOriginalTheme();
      }
    };

    mediaQueryList.addEventListener("change", handleMediaChange);

    return () => {
      window.removeEventListener("beforeprint", applyPrintTheme);
      window.removeEventListener("afterprint", restoreOriginalTheme);
      mediaQueryList.removeEventListener("change", handleMediaChange);
    };
  }, [theme, resolvedTheme, setTheme]);

  return null;
}
