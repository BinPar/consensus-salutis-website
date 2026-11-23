"use client";

import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

// Navegación y tamaños del editor; selector coherente con la barra del blog.
const pageSizes = [15, 25, 50] as const;
export type BlogPageSize = (typeof pageSizes)[number];
export const BLOG_POSTS_PER_PAGE: BlogPageSize = 15;

function paginationItems(page: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "ellipsis-end", total];
  if (page >= total - 3)
    return [
      1,
      "ellipsis-start",
      total - 4,
      total - 3,
      total - 2,
      total - 1,
      total,
    ];
  return [1, "ellipsis-start", page - 1, page, page + 1, "ellipsis-end", total];
}

const buttonClass =
  "font-body inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm font-semibold shadow-none transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light disabled:pointer-events-none disabled:opacity-50 motion-reduce:transform-none dark:focus-visible:outline-primary-dark";
const outlineClass =
  "border border-primary-light/25 bg-white/65 text-cyan-800 backdrop-blur-sm hover:border-primary-light/45 hover:bg-cyan-50 dark:border-cyan-300/30 dark:bg-white/[0.03] dark:text-cyan-50 dark:hover:border-cyan-200/50 dark:hover:bg-cyan-300/10";

export function BlogPagination({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  currentPage: number;
  totalPages: number;
  pageSize: BlogPageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: BlogPageSize) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();

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
    <nav
      aria-label="Paginación del blog"
      className="font-body mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-cyan-800/10 pt-3 dark:border-cyan-300/10"
    >
      <div
        className="flex max-w-full min-w-0 flex-wrap items-center gap-1"
        aria-label={`Página ${currentPage} de ${totalPages}`}
      >
        <button
          type="button"
          className={`${buttonClass} ${outlineClass}`}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft
            aria-hidden="true"
            className="size-4"
            strokeWidth={1.8}
          />
        </button>
        {paginationItems(currentPage, totalPages).map((item) =>
          typeof item === "number" ? (
            <button
              key={item}
              type="button"
              className={`${buttonClass} ${item === currentPage ? "bg-primary-light dark:bg-primary-dark dark:hover:bg-primary-dark/85 text-white hover:-translate-y-0.5 hover:bg-[#087a85] dark:text-[#03111d]" : outlineClass}`}
              onClick={() => onPageChange(item)}
              aria-label={
                item === currentPage
                  ? `Página ${item}, actual`
                  : `Ir a la página ${item}`
              }
              aria-current={item === currentPage ? "page" : undefined}
            >
              {item}
            </button>
          ) : (
            <span
              key={item}
              className="grid size-8 place-items-center text-xs text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            >
              …
            </span>
          ),
        )}
        <button
          type="button"
          className={`${buttonClass} ${outlineClass}`}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Página siguiente"
        >
          <ChevronRight
            aria-hidden="true"
            className="size-4"
            strokeWidth={1.8}
          />
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs whitespace-nowrap text-slate-600 dark:text-slate-400">
        <span className="hidden sm:inline">Resultados por página</span>
        <div ref={root} className="relative w-20 min-w-0">
          <button
            ref={trigger}
            type="button"
            aria-label={`Resultados por página: ${pageSize}`}
            aria-haspopup="listbox"
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
            {pageSize}
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
              aria-label="Resultados por página"
              onKeyDown={handleMenuKey}
              className="shadow-big-blocks absolute right-0 bottom-full z-40 mb-2 w-20 rounded-xl border border-cyan-800/15 bg-white/95 p-1.5 backdrop-blur-md dark:border-cyan-300/20 dark:bg-[#102231]/95"
            >
              {pageSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  role="option"
                  aria-selected={pageSize === size}
                  tabIndex={-1}
                  onClick={() => {
                    onPageSizeChange(size);
                    close();
                  }}
                  className={`font-body focus-visible:ring-primary-light/35 dark:focus-visible:ring-primary-dark/35 flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-colors hover:bg-cyan-800/5 focus-visible:bg-cyan-800/5 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset dark:hover:bg-cyan-300/10 dark:focus-visible:bg-cyan-300/10 ${pageSize === size ? "bg-primary-light/5 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark" : "text-slate-600 dark:text-slate-300"}`}
                >
                  {size}
                  {pageSize === size && (
                    <Check
                      aria-hidden="true"
                      size={14}
                      strokeWidth={1.8}
                      className="shrink-0"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
