"use client";

import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ArrowUp, Maximize2, MessageSquare, Minimize2 } from "lucide-react";
import "./contact-message-composer.css";

// Match apps/chat/src/components/chat-composer.tsx in the platform.
const COMPACT_HEIGHT = 50;
const ACTIONS_HEIGHT = 56;
const MIN_EXPANDED_HEIGHT = 44;

export function ContactMessageComposer({
  value,
  onChange,
  onSubmit,
  inputRef,
  id,
  errorId,
  invalid,
  placeholder,
  disabled = false,
  submitLabel = "Enviar consulta",
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  inputRef: (element: HTMLTextAreaElement | null) => void;
  id: string;
  errorId: string;
  invalid: boolean;
  placeholder: string;
  disabled?: boolean;
  submitLabel?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const compactMirror = useRef<HTMLTextAreaElement>(null);
  const contentMirror = useRef<HTMLTextAreaElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [fades, setFades] = useState({ top: false, bottom: false });
  const focusAfterResize = useRef(false);
  const selection = useRef({ start: 0, end: 0 });
  const [viewportVersion, setViewportVersion] = useState(0);
  const usesExpandedLayout = expanded || fullscreen;

  const updateFades = useCallback(() => {
    const el = textarea.current;
    if (!el) return;
    const overflow = el.scrollHeight - el.clientHeight > 1;
    const next = {
      top: overflow && el.scrollTop > 2,
      bottom: overflow && el.scrollHeight - el.scrollTop - el.clientHeight > 2,
    };
    setFades((previous) =>
      previous.top === next.top && previous.bottom === next.bottom
        ? previous
        : next,
    );
  }, []);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(() =>
      setViewportVersion((previous) => previous + 1),
    );
    if (compactMirror.current) observer.observe(compactMirror.current);
    const resize = () => setViewportVersion((previous) => previous + 1);
    window.addEventListener("resize", resize);
    window.visualViewport?.addEventListener("resize", resize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("resize", resize);
    };
  }, [fullscreen]);

  useLayoutEffect(() => {
    const el = textarea.current;
    const compact = compactMirror.current;
    const content = contentMirror.current;
    const box = root.current;
    if (!el || !compact || !content || !box) return;
    const nextExpanded =
      value.length > 0 && compact.scrollHeight > COMPACT_HEIGHT + 1;
    setExpanded(nextExpanded);
    content.style.height = "1px";
    const naturalHeight = content.scrollHeight;
    const style = getComputedStyle(content);
    const lineHeight = parseFloat(style.lineHeight) || 24;
    const padding =
      parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    setCanExpand(Math.ceil((naturalHeight - padding - 0.5) / lineHeight) >= 6);
    const viewportHeight = window.visualViewport?.height ?? innerHeight;
    const bottomGap = Math.min(
      96,
      Math.max(32, Math.floor(viewportHeight * 0.08)),
    );
    const available =
      viewportHeight +
      (window.visualViewport?.offsetTop ?? 0) -
      box.getBoundingClientRect().top -
      ACTIONS_HEIGHT -
      bottomGap -
      2;
    const maxHeight = fullscreen
      ? Math.max(
          MIN_EXPANDED_HEIGHT,
          Math.min(Math.floor(viewportHeight * 0.8), viewportHeight - 32) - 58,
        )
      : Math.max(
          MIN_EXPANDED_HEIGHT,
          Math.min(Math.floor(viewportHeight * 0.42), available),
        );
    const nextHeight = fullscreen
      ? maxHeight
      : nextExpanded
        ? Math.min(maxHeight, Math.max(MIN_EXPANDED_HEIGHT, naturalHeight))
        : COMPACT_HEIGHT;
    box.style.setProperty("--cm-height", `${nextHeight}px`);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY =
      (nextExpanded || fullscreen) && naturalHeight > maxHeight
        ? "auto"
        : "hidden";
    const caretAtEnd =
      document.activeElement === el &&
      el.selectionStart === value.length &&
      el.selectionEnd === value.length;
    if (caretAtEnd && naturalHeight > maxHeight) el.scrollTop = el.scrollHeight;
    else if (naturalHeight <= maxHeight) el.scrollTop = 0;
    updateFades();
  }, [value, expanded, fullscreen, canExpand, viewportVersion, updateFades]);

  function toggleFullscreen(next: boolean) {
    const el = textarea.current;
    if (el)
      selection.current = { start: el.selectionStart, end: el.selectionEnd };
    focusAfterResize.current = true;
    setFullscreen(next);
  }

  useLayoutEffect(() => {
    if (!focusAfterResize.current) return;
    const frame = requestAnimationFrame(() => {
      textarea.current?.focus({ preventScroll: true });
      textarea.current?.setSelectionRange(
        selection.current.start,
        selection.current.end,
      );
    });
    focusAfterResize.current = false;
    return () => cancelAnimationFrame(frame);
  }, [fullscreen]);

  useEffect(() => {
    if (!fullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        toggleFullscreen(false);
      }
    };
    window.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", escape);
    };
  }, [fullscreen]);

  function submit() {
    if (disabled || !value.trim()) return;
    if (fullscreen) setFullscreen(false);
    onSubmit();
  }

  const editor = (
    <div
      ref={root}
      className="cm-composer shadow-big-blocks"
      data-expanded={usesExpandedLayout}
      data-fullscreen={fullscreen}
    >
      <div className="cm-compact-mirror" aria-hidden="true">
        <textarea
          ref={compactMirror}
          value={value}
          readOnly
          tabIndex={-1}
          rows={1}
        />
      </div>
      <div className="cm-content-mirror" aria-hidden="true">
        <textarea
          ref={contentMirror}
          value={value}
          readOnly
          tabIndex={-1}
          rows={1}
          className={canExpand || fullscreen ? "cm-reserved-control" : ""}
        />
      </div>
      <div className="cm-editor">
        <textarea
          ref={(element) => {
            textarea.current = element;
            inputRef(element);
          }}
          id={id}
          value={value}
          maxLength={3000}
          disabled={disabled}
          placeholder={placeholder}
          aria-describedby={errorId}
          aria-invalid={invalid}
          rows={1}
          className={canExpand || fullscreen ? "cm-reserved-control" : ""}
          onChange={(event) => onChange(event.target.value)}
          onScroll={updateFades}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              submit();
            }
          }}
        />
        <div
          className="cm-scroll-fade cm-scroll-fade-top"
          aria-hidden="true"
          data-visible={fades.top}
        />
        <div
          className="cm-scroll-fade cm-scroll-fade-bottom"
          aria-hidden="true"
          data-visible={fades.bottom}
        />
      </div>
      {(canExpand || fullscreen) && (
        <button
          type="button"
          className="cm-expand"
          aria-controls={id}
          aria-expanded={fullscreen}
          aria-label={fullscreen ? "Reducir editor" : "Ampliar editor"}
          title={fullscreen ? "Reducir editor" : "Ampliar editor"}
          onClick={() => toggleFullscreen(!fullscreen)}
        >
          {fullscreen ? (
            <Minimize2 size={16} strokeWidth={1.8} />
          ) : (
            <Maximize2 size={16} strokeWidth={1.8} />
          )}
        </button>
      )}
      <span className="cm-message-icon" aria-hidden="true">
        <MessageSquare size={16} strokeWidth={1.8} />
      </span>
      <button
        type="button"
        className="cm-send"
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label={disabled ? "Enviando consulta" : submitLabel}
        title={disabled ? "Enviando consulta" : submitLabel}
      >
        <ArrowUp size={18} strokeWidth={1.8} aria-hidden="true" />
      </button>
    </div>
  );

  return fullscreen
    ? createPortal(
        <div
          className="cm-fullscreen-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Editor de tu consulta"
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const targets = [
              ...root.current!.querySelectorAll<HTMLElement>(
                "textarea:not([readonly]), button:not([disabled])",
              ),
            ];
            const first = targets[0],
              last = targets[targets.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            }
            if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }}
        >
          {editor}
        </div>,
        document.body,
      )
    : editor;
}
