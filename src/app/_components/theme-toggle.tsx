"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const storageKey = "consensus-theme";

function getCurrentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(getCurrentTheme());
  }, []);

  const toggleTheme = () => {
    const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
    const root = document.documentElement;

    root.classList.add("theme-changing");
    root.classList.toggle("dark", nextTheme === "dark");
    root.style.colorScheme = nextTheme;
    try {
      localStorage.setItem(storageKey, nextTheme);
    } catch {
      // The visual toggle should still work when storage is unavailable.
    }
    setTheme(nextTheme);

    window.setTimeout(() => root.classList.remove("theme-changing"), 220);
  };

  const isDark = theme === "dark";
  const label = isDark ? "Activar tema claro" : "Activar tema oscuro";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      data-theme-toggle
      className="grid size-9 shrink-0 place-items-center rounded-full border border-primary-light/20 bg-white/30 text-slate-700 transition hover:border-primary-light/40 hover:bg-cyan-50 hover:text-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:border-cyan-300/20 dark:bg-cyan-300/8 dark:text-cyan-100 dark:shadow-none dark:hover:border-cyan-200/45 dark:hover:bg-cyan-300/15 dark:hover:text-white dark:focus-visible:outline-cyan-300"
    >
      <span
        data-theme-toggle-icon
        className="grid size-4 place-items-center"
      >
        <span className="grid place-items-center dark:hidden">
          <MoonIcon />
        </span>
        <span className="hidden place-items-center dark:grid">
          <SunIcon />
        </span>
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8 8.5 8.5 0 1 0 20.2 15.2Z" />
    </svg>
  );
}
