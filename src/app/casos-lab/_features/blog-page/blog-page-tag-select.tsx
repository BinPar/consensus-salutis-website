"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

type TagOption = { tag: string | undefined; label: string; count: number };

export function BlogPageTagSelect({
  entries,
  activeTag,
  onSelect,
}: {
  entries: TagOption[];
  activeTag?: string;
  onSelect: (tag: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const selected =
    entries.find((entry) => entry.tag === activeTag) ?? entries[0]!;

  useLayoutEffect(() => {
    if (open)
      menu.current
        ?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
        ?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1025px)");
    const resize = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", resize);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    return () => {
      desktop.removeEventListener("change", resize);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (event.key === "Tab") {
      close();
      return;
    }
    const items = [
      ...(menu.current?.querySelectorAll<HTMLButtonElement>(
        '[role="option"]',
      ) ?? []),
    ];
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    let next: number;
    switch (event.key) {
      case "ArrowDown":
        next = (index + 1) % items.length;
        break;
      case "ArrowUp":
        next = (index - 1 + items.length) % items.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = items.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    items[next]?.focus();
  };

  return (
    <div ref={root} className="relative mt-10 min-w-0 py-1 min-[1025px]:hidden">
      <button
        ref={trigger}
        type="button"
        aria-label={`Filtrar por etiqueta: ${selected.label}, ${selected.count} artículos`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="font-body focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark border-primary-light/60 hover:border-primary-light/35 dark:hover:border-primary-dark flex h-[32px] w-full cursor-pointer items-center justify-between gap-2 rounded-full border bg-white/80 px-3 text-xs font-medium text-slate-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 dark:border-cyan-300/20 dark:bg-[#152230]/90 dark:text-slate-300"
      >
        <span className="min-w-0 truncate">{selected.label}</span>
        <span
          aria-hidden="true"
          className="bg-primary-light/10 text-primary-light dark:bg-primary-dark/15 dark:text-primary-dark ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold tabular-nums"
        >
          {selected.count}
        </span>
        <ChevronDown
          aria-hidden="true"
          size={14}
          strokeWidth={1.8}
          className={`shrink-0 transition-transform duration-150 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          ref={menu}
          id={menuId}
          role="listbox"
          aria-label="Filtrar por etiqueta"
          onKeyDown={handleKey}
          className="shadow-big-blocks absolute top-full left-0 z-40 mt-1 max-h-72 w-max max-w-[calc(100vw-40px)] min-w-full overflow-y-auto overscroll-contain rounded-xl border border-cyan-800/15 bg-white/95 p-1.5 backdrop-blur-md dark:border-cyan-300/20 dark:bg-[#102231]/95"
        >
          {entries.map((entry) => {
            const active = entry.tag === activeTag;
            return (
              <button
                key={entry.tag ?? "all"}
                type="button"
                role="option"
                aria-selected={active}
                tabIndex={-1}
                onClick={() => {
                  onSelect(entry.tag);
                  close();
                }}
                className={`font-body focus-visible:ring-primary-light/35 dark:focus-visible:ring-primary-dark/35 flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-colors hover:bg-cyan-800/5 focus-visible:bg-cyan-800/5 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset dark:hover:bg-cyan-300/10 dark:focus-visible:bg-cyan-300/10 ${active ? "bg-primary-light/5 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark" : "text-slate-600 dark:text-slate-300"}`}
              >
                <span className="min-w-0 flex-1">{entry.label}</span>
                <span className="bg-primary-light/10 text-primary-light dark:bg-primary-dark/15 dark:text-primary-dark inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold tabular-nums">
                  {entry.count}
                </span>
                <span className="size-3.5 shrink-0">
                  {active && (
                    <Check aria-hidden="true" size={14} strokeWidth={1.8} />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
