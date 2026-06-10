"use client";

import Link from "next/link";
import { useState } from "react";

export function FooterBandMenu({
  label,
  items,
}: {
  label: string;
  items: Array<{ href: string; label: string }>;
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
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition outline-none hover:bg-cyan-300/10 hover:text-cyan-50 focus-visible:ring-1 focus-visible:ring-cyan-300/60 [&::-webkit-details-marker]:hidden">
        {label}
        <span
          aria-hidden="true"
          className="text-[10px] text-cyan-300 transition group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="absolute bottom-full left-1/2 z-50 min-w-48 -translate-x-1/2 pb-2">
        <div className="rounded-md border border-cyan-300/15 bg-[#05111f]/98 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-sm px-3 py-2 text-sm text-slate-400 transition outline-none hover:bg-cyan-300/10 hover:text-cyan-50 focus-visible:bg-cyan-300/10 focus-visible:text-cyan-50"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </details>
  );
}
