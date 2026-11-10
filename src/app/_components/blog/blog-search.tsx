"use client";

import { Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export function BlogSearch({
  value,
  onChange,
  label = "Buscar artículos",
}: {
  value: string;
  onChange: (value: string) => void;
  /** Accessible name and placeholder, «Buscar artículos» on the blog. */
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const inputId = useId();

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open || value.trim()) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open, value]);

  const close = () => {
    onChange("");
    setOpen(false);
    trigger.current?.focus();
  };

  return (
    <div
      ref={root}
      data-blog-search=""
      data-expanded={open}
      className={`font-body relative flex h-[32px] shrink-0 items-center overflow-hidden rounded-full bg-white/80 text-slate-600 transition-[width] duration-250 ease-out motion-reduce:transition-none dark:bg-[#152230]/90 dark:text-slate-300 ${open ? "w-56 max-md:absolute max-md:inset-x-0 max-md:z-40 max-md:w-full max-md:bg-[#fbfdff] dark:max-md:bg-[#152230]" : "w-[32px]"}`}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }}
    >
      <span
        aria-hidden="true"
        className="border-primary-light/60 dark:border-primary-dark/20 pointer-events-none absolute inset-0 z-10 rounded-full border"
      />
      <button
        ref={trigger}
        type="button"
        aria-label={open ? "Enfocar búsqueda" : label}
        aria-expanded={open}
        aria-controls={open ? inputId : undefined}
        onClick={() => {
          setOpen(true);
          input.current?.focus();
        }}
        className="focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark dark:hover:text-primary-dark grid size-[32px] shrink-0 cursor-pointer place-items-center rounded-full hover:text-cyan-800 focus-visible:outline-2 focus-visible:-outline-offset-3"
      >
        <Search aria-hidden="true" size={15} strokeWidth={1.8} />
      </button>
      {open && (
        <>
          <input
            ref={input}
            id={inputId}
            type="search"
            aria-label={label}
            placeholder={`${label}…`}
            value={value}
            onChange={(event) => onChange(event.currentTarget.value)}
            className="min-w-0 flex-1 bg-transparent py-1 text-xs leading-5 placeholder:text-slate-400 focus:outline-none dark:placeholder:text-slate-500 [&::-webkit-search-cancel-button]:appearance-none"
          />
          <button
            type="button"
            aria-label="Cerrar y limpiar búsqueda"
            onClick={close}
            className="focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark dark:hover:text-primary-dark grid size-[32px] shrink-0 cursor-pointer place-items-center rounded-full hover:text-cyan-800 focus-visible:outline-2 focus-visible:-outline-offset-3"
          >
            <X aria-hidden="true" size={14} strokeWidth={1.8} />
          </button>
        </>
      )}
    </div>
  );
}
