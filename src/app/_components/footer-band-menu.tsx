"use client";

import Link from "next/link";
import { useState } from "react";

export function FooterBandMenu({
  label,
  items,
}: {
  label: string;
  items: Array<{ href: string; label: string; disabled?: boolean }>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <details
      open={open}
      className="group relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="hover:bg-primary-light/10 focus-visible:ring-primary-light/50 flex cursor-pointer list-none items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition outline-none hover:text-cyan-800 focus-visible:ring-1 dark:text-slate-300 dark:hover:bg-primary-dark/10 dark:hover:text-primary-dark dark:focus-visible:ring-primary-dark/60 [&::-webkit-details-marker]:hidden">
        {label}
        <span
          aria-hidden="true"
          className="text-primary-light dark:text-primary-dark text-[10px] transition group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="absolute bottom-full left-1/2 z-50 min-w-48 -translate-x-1/2 pb-2">
        <div className="rounded-xl border border-cyan-800/10 bg-white/98 p-1.5 shadow-2xl shadow-slate-900/15 backdrop-blur-xl dark:border-primary-dark/15 dark:bg-[#05111f]/98 dark:shadow-black/40">
          {items.map((item) =>
            item.disabled ? (
              <span
                key={item.href}
                role="link"
                aria-disabled="true"
                className="block cursor-not-allowed rounded-lg px-3 py-2 text-sm text-slate-600 opacity-45 dark:text-slate-400"
              >
                {item.label}
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="hover:bg-primary-light/10 focus-visible:bg-primary-light/10 block rounded-lg px-3 py-2 text-sm text-slate-600 transition outline-none hover:text-cyan-800 focus-visible:text-cyan-800 dark:text-slate-400 dark:hover:bg-primary-dark/10 dark:hover:text-primary-dark dark:focus-visible:bg-primary-dark/10 dark:focus-visible:text-primary-dark"
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
      </div>
    </details>
  );
}
