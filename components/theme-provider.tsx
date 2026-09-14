"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import { PrintThemeSync } from "./print-theme-sync";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <PrintThemeSync />
      {children}
    </NextThemesProvider>
  );
}
