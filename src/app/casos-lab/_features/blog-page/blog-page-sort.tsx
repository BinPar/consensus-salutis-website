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

export type BlogSort = "newest" | "oldest" | "title";
const options: { value: BlogSort; label: string }[] = [
  { value: "newest", label: "Más recientes" },
  { value: "oldest", label: "Más antiguos" },
  { value: "title", label: "Título (A–Z)" },
];

export function BlogPageSort({
  value,
  onChange,
}: {
  value: BlogSort;
  onChange: (value: BlogSort) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const selected = options.find((option) => option.value === value)!;

  useLayoutEffect(() => {
    if (open)
      menu.current
        ?.querySelector<HTMLButtonElement>('[aria-checked="true"]')
        ?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const handleMenuKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (event.key === "Tab") {
      // Devuelve el foco al disparador para continuar el orden de tabulación.
      close();
      return;
    }
    const items = [
      ...(menu.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitemradio"]',
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
    <div ref={root} className="relative z-30 w-36 min-w-0 shrink">
      <button
        ref={trigger}
        type="button"
        aria-label={`Ordenar artículos: ${selected.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="font-body focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark border-primary-light/60 hover:border-primary-light/35 dark:hover:border-primary-dark flex h-[32px] w-full cursor-pointer items-center justify-between gap-2 rounded-full border bg-white/80 px-3 text-xs font-medium text-slate-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 dark:border-cyan-300/20 dark:bg-[#152230]/90 dark:text-slate-300"
      >
        <span className="min-w-0 truncate">{selected.label}</span>
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
          role="menu"
          aria-label="Ordenar artículos"
          onKeyDown={handleMenuKey}
          className="shadow-big-blocks absolute top-full right-0 mt-2 w-48 rounded-xl border border-cyan-800/15 bg-white/95 p-1.5 backdrop-blur-md dark:border-cyan-300/20 dark:bg-[#102231]/95"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={value === option.value}
              tabIndex={-1}
              onClick={() => {
                onChange(option.value);
                close();
              }}
              className={`font-body focus-visible:ring-primary-light/35 dark:focus-visible:ring-primary-dark/35 flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-colors hover:bg-cyan-800/5 focus-visible:bg-cyan-800/5 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset dark:hover:bg-cyan-300/10 dark:focus-visible:bg-cyan-300/10 ${value === option.value ? "bg-primary-light/5 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark" : "text-slate-600 dark:text-slate-300"}`}
            >
              {option.label}
              {value === option.value && (
                <Check aria-hidden="true" size={14} strokeWidth={1.8} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
