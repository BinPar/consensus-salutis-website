"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { menuItemClass, menuPanelClass } from "./select-menu";

export type NavigationLink = { href: string; label: string };

/**
 * A main-navigation entry with subpages. The label stays a link to its page;
 * the chevron next to it opens the subpages in the panel of the site selector
 * (SelectMenu), as links. It also opens on hover with a pointer, and closes on
 * Escape, outside the control and when the route changes.
 */
export function NavigationDropdown({
  label,
  links,
  children,
}: {
  /** Name of the entry, for the toggle's accessible label. */
  label: string;
  links: readonly NavigationLink[];
  /** The entry's own link, rendered before the toggle. */
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLUListElement>(null);
  const hoverTimer = useRef(0);
  const openedByHover = useRef(false);
  const menuId = useId();

  useEffect(() => {
    openedByHover.current = false;
    setOpen(false);
  }, [pathname]);

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

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const items = () => [
    ...(menu.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []),
  ];
  // Opened from the keyboard: the first link takes the focus once painted.
  const focusFirst = useRef(false);
  useLayoutEffect(() => {
    if (!open || !focusFirst.current) return;
    focusFirst.current = false;
    menu.current?.querySelector("a")?.focus();
  }, [open]);

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      toggle.current?.focus();
      return;
    }
    if (!open) return;
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLAnchorElement);
    if (index === -1) return;
    let next: number;
    switch (event.key) {
      case "ArrowDown":
        next = (index + 1) % list.length;
        break;
      case "ArrowUp":
        next = (index - 1 + list.length) % list.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = list.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    list[next]?.focus();
  };

  // Hover opens at once and closes after a short grace, so the pointer can
  // travel from the entry to the panel. A click on a panel hover opened keeps
  // it open instead of toggling it shut.
  const hover = (next: boolean) => (event: { pointerType: string }) => {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(hoverTimer.current);
    if (next) {
      openedByHover.current = !open;
      setOpen(true);
    } else {
      hoverTimer.current = window.setTimeout(() => {
        openedByHover.current = false;
        setOpen(false);
      }, 160);
    }
  };
  const handleClick = () => {
    if (openedByHover.current) {
      openedByHover.current = false;
      return;
    }
    setOpen((current) => !current);
  };

  return (
    <div
      ref={root}
      className="relative flex items-center gap-1"
      onKeyDown={handleKey}
      onPointerEnter={hover(true)}
      onPointerLeave={hover(false)}
    >
      {children}
      <button
        ref={toggle}
        type="button"
        aria-label={`Más páginas de ${label}`}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            if (open) menu.current?.querySelector("a")?.focus();
            else {
              focusFirst.current = true;
              setOpen(true);
            }
          }
        }}
        className="focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark dark:hover:text-primary-dark grid size-5 cursor-pointer place-items-center rounded-full transition-colors hover:text-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <ChevronDown
          aria-hidden="true"
          size={14}
          strokeWidth={1.8}
          className={`transition-transform duration-150 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        // The top padding bridges the gap to the panel for the pointer.
        <div className="absolute top-full left-1/2 z-50 -translate-x-1/2 pt-3">
          <ul
            ref={menu}
            id={menuId}
            aria-label={label}
            className={`w-52 list-none ${menuPanelClass}`}
          >
            {links.map((link) => {
              const current = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={current ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={menuItemClass(current)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
