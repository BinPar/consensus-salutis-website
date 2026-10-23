"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Ellipsis,
  FileText,
  LocateFixed,
  Maximize2,
  Menu,
  MessageCircle,
  PanelLeft,
  Paperclip,
  Pencil,
  Pin,
  PinOff,
  RotateCcw,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  CHAT_NAVIGATION_RAIL_WIDTH,
  CHAT_NAVIGATION_WIDTH_MIN,
  clampChatNavigationWidth,
  resizeChatNavigation,
  resizeChatNavigationFromRail,
} from "./chat-navigation-sizing";
import {
  THREE_PANEL_MIN_WIDTH,
  WORKSPACE_PANEL_WIDTH_MIN,
  resizeThreePanelWorkspace,
  threePanelSideMaximumWidth,
  workspacePanelLayout,
  workspaceRailPanelMaximumWidth,
} from "./chat-workspace-sizing";
import {
  closeSourceTab,
  initialCitation,
  initialConversations,
  openSourceTab,
  type PreviewCitation,
  type PreviewConversation,
  type SourceTabs,
} from "./preview-data";
import {
  PreviewAnswer,
  PreviewAvatar,
  PreviewDocument,
  PreviewIconButton,
  PreviewLogo,
  PreviewProfile,
} from "./preview-ui";
import { writtenCharacters } from "../clinical-process-typing";
import "./platform-preview.css";

type NavigationPhase =
  | "collapsed"
  | "rail-fading-out"
  | "expanding"
  | "expanded-revealing"
  | "expanded"
  | "fading-out"
  | "contracting";
type SourcePhase =
  | "closed"
  | "waiting-for-navigation"
  | "expanding"
  | "open"
  | "contracting";
type Popup = "pinned" | "recent" | "examples" | { conversation: string } | null;
type Drag = {
  kind: "navigation" | "source";
  mode: "expanded" | "rail" | "three-panel" | "standard";
  x: number;
  width: number;
  navigationWidth: number;
  scale: number;
};
const navigationDurations: Partial<Record<NavigationPhase, number>> = {
  "rail-fading-out": 100,
  expanding: 220,
  "expanded-revealing": 140,
  "fading-out": 100,
  contracting: 190,
};
const navigationNext: Partial<Record<NavigationPhase, NavigationPhase>> = {
  "rail-fading-out": "expanding",
  expanding: "expanded-revealing",
  "expanded-revealing": "expanded",
  "fading-out": "contracting",
  contracting: "collapsed",
};

export function PlatformPreview() {
  const outer = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const messages = useRef<HTMLDivElement>(null);
  const navigationToggle = useRef<HTMLButtonElement>(null);
  const sourceClose = useRef<HTMLButtonElement>(null);
  const returnTrigger = useRef<HTMLElement | null>(null);
  const drag = useRef<Drag | null>(null);
  const draftText = useRef<HTMLSpanElement>(null);
  const restoreNavigation = useRef(false);
  const lastNavigationWidth = useRef(320);
  const [dimensions, setDimensions] = useState({
    width: 1440,
    height: 724,
    scale: 1,
  });
  const [pageDark, setPageDark] = useState(false);
  const [theme, setTheme] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);
  const [navigation, setNavigation] = useState<NavigationPhase>("expanded");
  const [navigationWidth, setNavigationWidth] = useState(320);
  const [sourceWidth, setSourceWidth] = useState(360);
  const [sourcePhase, setSourcePhase] = useState<SourcePhase>("closed");
  const [sourceTabs, setSourceTabs] = useState<SourceTabs>({
    tabs: [],
    activeKey: null,
  });
  const [fullDocument, setFullDocument] = useState(false);
  const [locateKey, setLocateKey] = useState(0);
  const [profile, setProfile] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [popup, setPopup] = useState<Popup>(null);
  const [popupPosition, setPopupPosition] = useState({ left: 48, top: 100 });
  const [sections, setSections] = useState({ pinned: false, recent: true });
  const [conversations, setConversations] =
    useState<readonly PreviewConversation[]>(initialConversations);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [typing, setTyping] = useState<{
    id: string;
    autoSend: boolean;
  } | null>(null);
  const [typedCharacters, setTypedCharacters] = useState(0);
  const [editing, setEditing] = useState<{
    id: string;
    kind: "rename" | "delete";
  } | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [resizing, setResizing] = useState(false);
  const [sourceRail, setSourceRail] = useState(false);
  const [showBottom, setShowBottom] = useState(true);
  const draftQuestion =
    initialConversations.find((c) => c.id === draft)?.messages.at(-2)?.text ??
    "";
  const dark = theme ?? pageDark;
  const mobile = dimensions.width < 768;
  const navigationExpanded = [
    "expanding",
    "expanded-revealing",
    "expanded",
    "fading-out",
  ].includes(navigation);
  const navigationVisible =
    navigation === "expanded" || navigation === "expanded-revealing";
  const navigationStable =
    navigation === "expanded" || navigation === "collapsed";
  const effectiveNavigationWidth = mobile
    ? 0
    : navigationExpanded
      ? navigationWidth
      : CHAT_NAVIGATION_RAIL_WIDTH;
  const layout = workspacePanelLayout({
    viewportWidth: dimensions.width,
    navigationWidth: sourceRail
      ? CHAT_NAVIGATION_RAIL_WIDTH
      : effectiveNavigationWidth,
    navigationExpanded: !mobile && navigationExpanded && !sourceRail,
    preferredPanelWidth: sourceWidth,
  });
  const split = layout.mode !== "fullscreen";
  const sourceExpanded = sourcePhase === "open" || sourcePhase === "expanding";
  const sourceRendered =
    sourcePhase !== "closed" && sourcePhase !== "waiting-for-navigation";
  const sourceCompactsNavigation =
    split && dimensions.width < THREE_PANEL_MIN_WIDTH;
  const selectedConversation = conversations.find((c) => c.id === selected);
  const currentSource =
    sourceTabs.tabs.find((t) => t.key === sourceTabs.activeKey)?.citation ??
    initialCitation;
  const navigationMaximum =
    dimensions.width >= THREE_PANEL_MIN_WIDTH
      ? threePanelSideMaximumWidth(dimensions.width)
      : 420;

  useLayoutEffect(() => {
    const element = outer.current;
    if (!element) return;
    const measure = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (!width || !height) return;
      const scale = window.innerWidth >= 1024 ? Math.min(1, width / 1440) : 1;
      // Desktop is a fixed product viewport: width and height scale together.
      const next =
        window.innerWidth >= 1024
          ? { width: 1440, height: 724, scale }
          : { width, height, scale: 1 };
      setDimensions((previous) =>
        Math.abs(previous.width - next.width) < 0.1 &&
        Math.abs(previous.height - next.height) < 0.1 &&
        previous.scale === scale
          ? previous
          : next,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  useEffect(() => {
    const sync = () =>
      setPageDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    sync();
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduced(media.matches);
    motion();
    media.addEventListener("change", motion);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", motion);
    };
  }, []);
  useEffect(() => {
    const next = navigationNext[navigation];
    if (!next) return;
    const timer = window.setTimeout(
      () => setNavigation(next),
      reduced ? 0 : navigationDurations[navigation],
    );
    return () => window.clearTimeout(timer);
  }, [navigation, reduced]);
  useEffect(() => {
    if (
      sourcePhase === "waiting-for-navigation" &&
      (navigation === "contracting" || navigation === "collapsed")
    ) {
      setSourcePhase("expanding");
      return;
    }
    if (sourcePhase !== "expanding" && sourcePhase !== "contracting") return;
    const timer = window.setTimeout(
      () => {
        if (sourcePhase === "expanding") setSourcePhase("open");
        else {
          setSourcePhase("closed");
          setSourceTabs({ tabs: [], activeKey: null });
          returnTrigger.current?.focus({ preventScroll: true });
        }
      },
      reduced ? 0 : sourcePhase === "expanding" ? 260 : 310,
    );
    return () => window.clearTimeout(timer);
  }, [sourcePhase, navigation, reduced]);
  useEffect(() => {
    if (navigation === "expanded" && !resizing) setSourceRail(false);
  }, [navigation, resizing]);
  useEffect(() => {
    if (!mobile) setMobileMenu(false);
  }, [mobile]);
  useEffect(() => {
    // Match the product when a resize crosses into the two-panel layout.
    if (
      sourceCompactsNavigation &&
      sourceExpanded &&
      navigation === "expanded"
    ) {
      restoreNavigation.current = true;
      setProfile(false);
      setNavigation(reduced ? "collapsed" : "fading-out");
    }
  }, [sourceCompactsNavigation, sourceExpanded, navigation, reduced]);
  useEffect(() => {
    if (profile)
      root.current
        ?.querySelector<HTMLElement>(".pp-profile-heading button")
        ?.focus({ preventScroll: true });
    else if (mobileMenu)
      root.current
        ?.querySelector<HTMLElement>(".pp-mobile-navigation button")
        ?.focus({ preventScroll: true });
    else if (popup)
      root.current
        ?.querySelector<HTMLElement>(".pp-popup button")
        ?.focus({ preventScroll: true });
  }, [mobileMenu, popup, profile]);
  useEffect(() => {
    const viewport = messages.current;
    if (!viewport) return;
    viewport.scrollTop = 0;
    setShowBottom(viewport.scrollHeight > viewport.clientHeight + 80);
  }, [selected]);
  useEffect(() => {
    const closeOutside = (e: globalThis.PointerEvent) => {
      const target = e.target;
      if (target instanceof Element && target.closest("[data-preview-popover]"))
        return;
      setPopup(null);
      if (!navigationExpanded) setProfile(false);
    };
    if (!popup && !(profile && !navigationExpanded)) return;
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [popup, profile, navigationExpanded]);

  useEffect(() => {
    if (!typing) return;
    const example = initialConversations.find((c) => c.id === typing.id)!;
    const question = example.messages.at(-2)!.text;
    let elapsed = 0;
    let previous = performance.now();
    let request = 0;
    let completeTimer = 0;
    const finish = () => {
      setTyping(null);
      if (typing.autoSend) {
        setConversations((current) =>
          current.some((c) => c.id === example.id)
            ? current
            : [...current, example],
        );
        setSelected(example.id);
        setDraft(null);
      }
    };
    if (reduced) {
      setTypedCharacters(question.length);
      finish();
      return;
    }
    const advance = (now: number) => {
      elapsed += Math.min((now - previous) / 1000, 0.1);
      previous = now;
      const count = writtenCharacters(elapsed, 0.2, question.length, false);
      setTypedCharacters(count);
      if (count === question.length)
        completeTimer = window.setTimeout(finish, typing.autoSend ? 450 : 0);
      else request = requestAnimationFrame(advance);
    };
    request = requestAnimationFrame(advance);
    return () => {
      cancelAnimationFrame(request);
      window.clearTimeout(completeTimer);
    };
  }, [typing, reduced]);
  useLayoutEffect(() => {
    const text = draftText.current;
    if (text) text.scrollTop = text.scrollHeight;
  }, [typedCharacters]);

  function beginExample(id: string, autoSend: boolean) {
    setSelected(null);
    setDraft(id);
    setTypedCharacters(0);
    setTyping({ id, autoSend });
    setPopup(null);
    setMobileMenu(false);
    setProfile(false);
    if (sourcePhase !== "closed") closeSource();
  }
  function changeNavigation(expanded: boolean) {
    setProfile(false);
    setPopup(null);
    if (expanded) {
      setNavigationWidth(lastNavigationWidth.current);
      if (sourceCompactsNavigation && sourceExpanded) {
        restoreNavigation.current = false;
        closeSource(false);
      }
    }
    setNavigation(
      reduced
        ? expanded
          ? "expanded"
          : "collapsed"
        : expanded
          ? "rail-fading-out"
          : "fading-out",
    );
  }
  function openCitation(citation: PreviewCitation, trigger?: HTMLElement) {
    if (trigger) returnTrigger.current = trigger;
    setSourceTabs((current) => openSourceTab(current, citation));
    setFullDocument(false);
    setLocateKey((k) => k + 1);
    setPopup(null);
    if (sourceExpanded) return;
    const collapse = sourceCompactsNavigation && navigationExpanded;
    restoreNavigation.current = collapse;
    if (collapse) {
      changeNavigation(false);
      setSourcePhase(reduced ? "open" : "waiting-for-navigation");
    } else setSourcePhase(reduced ? "open" : "expanding");
    requestAnimationFrame(() =>
      sourceClose.current?.focus({ preventScroll: true }),
    );
  }
  function closeSource(restore = restoreNavigation.current) {
    setSourcePhase(reduced ? "closed" : "contracting");
    if (reduced) {
      setSourceTabs({ tabs: [], activeKey: null });
      returnTrigger.current?.focus({ preventScroll: true });
    }
    if (restore) {
      restoreNavigation.current = false;
      changeNavigation(true);
    }
  }
  function chooseConversation(id: string | null) {
    setTyping(null);
    setSelected(id);
    setDraft(null);
    setPopup(null);
    setMobileMenu(false);
    setProfile(false);
    if (sourcePhase !== "closed") closeSource();
  }
  function loadExample(id: string) {
    const conversation = initialConversations.find((c) => c.id === id)!;
    setConversations((current) =>
      current.some((c) => c.id === id) ? current : [...current, conversation],
    );
    chooseConversation(id);
  }
  function reset() {
    setTyping(null);
    setTypedCharacters(0);
    setConversations(initialConversations);
    setSelected(null);
    setDraft(null);
    setNavigation("expanded");
    setNavigationWidth(320);
    lastNavigationWidth.current = 320;
    setSourceWidth(360);
    setSourceTabs({ tabs: [], activeKey: null });
    setSourcePhase("closed");
    setFullDocument(false);
    setLocateKey((k) => k + 1);
    setProfile(false);
    setPopup(null);
    setMobileMenu(false);
    setEditing(null);
    setTheme(null);
    restoreNavigation.current = false;
    if (messages.current) messages.current.scrollTop = 0;
  }
  function popupAt(next: Popup, trigger: HTMLElement) {
    returnTrigger.current = trigger;
    const box = trigger.getBoundingClientRect();
    const bounds = root.current!.getBoundingClientRect();
    const left = Math.max(
      8,
      Math.min(
        dimensions.width - 300,
        (box.left - bounds.left) / dimensions.scale,
      ),
    );
    const top = Math.max(
      8,
      Math.min(
        dimensions.height - 220,
        (box.bottom - bounds.top) / dimensions.scale + 6,
      ),
    );
    setPopupPosition({ left, top });
    setPopup((current) => (current === next ? null : next));
  }
  function startDrag(kind: Drag["kind"], event: PointerEvent<HTMLDivElement>) {
    if (kind === "source" && layout.mode !== "split-resizable") return;
    if (kind === "navigation" && !navigationStable) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setResizing(true);
    drag.current = {
      kind,
      x: event.clientX,
      width: kind === "navigation" ? navigationWidth : layout.panelWidth,
      navigationWidth,
      scale: dimensions.scale,
      mode:
        kind === "navigation"
          ? navigationExpanded
            ? "expanded"
            : "rail"
          : navigationExpanded && dimensions.width >= THREE_PANEL_MIN_WIDTH
            ? "three-panel"
            : "standard",
    };
  }
  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start) return;
    const delta = (event.clientX - start.x) / start.scale;
    if (start.kind === "navigation") {
      if (start.mode === "rail") {
        if (
          !resizeChatNavigationFromRail({ startX: 0, currentX: delta }).expand
        )
          return;
        changeNavigation(true);
        setNavigationWidth(CHAT_NAVIGATION_WIDTH_MIN);
        lastNavigationWidth.current = CHAT_NAVIGATION_WIDTH_MIN;
        start.mode = "expanded";
        start.x = event.clientX;
        start.width = CHAT_NAVIGATION_WIDTH_MIN;
        return;
      }
      const next = resizeChatNavigation({
        startWidth: start.width,
        startX: 0,
        currentX: delta,
        maximumWidth: navigationMaximum,
      });
      setNavigationWidth(next.width);
      if (next.collapse) {
        changeNavigation(false);
        start.mode = "rail";
        start.x = event.clientX;
      } else lastNavigationWidth.current = next.width;
    } else if (start.mode === "three-panel") {
      const next = resizeThreePanelWorkspace({
        viewportWidth: dimensions.width,
        startPanelWidth: start.width,
        startNavigationWidth: start.navigationWidth,
        delta: -delta,
      });
      setSourceWidth(next.panelWidth);
      setNavigationWidth(next.navigationWidth);
      if (next.collapseNavigation) {
        lastNavigationWidth.current = next.navigationWidth;
        restoreNavigation.current = false;
        setSourceRail(true);
        changeNavigation(false);
        start.mode = "rail";
        start.x = event.clientX;
        start.width = next.panelWidth;
      } else lastNavigationWidth.current = next.navigationWidth;
    } else {
      const maximum =
        start.mode === "rail"
          ? workspaceRailPanelMaximumWidth(dimensions.width)
          : layout.panelMaximumWidth;
      setSourceWidth(
        Math.min(
          maximum,
          Math.max(WORKSPACE_PANEL_WIDTH_MIN, start.width - delta),
        ),
      );
    }
  }
  function endDrag(event: PointerEvent<HTMLDivElement>) {
    drag.current = null;
    setResizing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function resizeKey(kind: Drag["kind"], event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const step = event.shiftKey ? 48 : 16;
    if (kind === "navigation") {
      if (!navigationExpanded) {
        if (event.key === "ArrowRight" || event.key === "End")
          changeNavigation(true);
        return;
      }
      const width =
        event.key === "Home"
          ? CHAT_NAVIGATION_WIDTH_MIN
          : event.key === "End"
            ? navigationMaximum
            : navigationWidth + (event.key === "ArrowRight" ? step : -step);
      if (width < CHAT_NAVIGATION_WIDTH_MIN) changeNavigation(false);
      else {
        const next = clampChatNavigationWidth(width, navigationMaximum);
        setNavigationWidth(next);
        lastNavigationWidth.current = next;
      }
    } else if (event.key === "Home") setSourceWidth(WORKSPACE_PANEL_WIDTH_MIN);
    else if (
      navigationExpanded &&
      dimensions.width >= THREE_PANEL_MIN_WIDTH &&
      (event.key === "End" || event.key === "ArrowLeft")
    ) {
      const next = resizeThreePanelWorkspace({
        viewportWidth: dimensions.width,
        startPanelWidth: layout.panelWidth,
        startNavigationWidth: navigationWidth,
        delta:
          event.key === "End"
            ? dimensions.width
            : step + (navigationWidth <= CHAT_NAVIGATION_WIDTH_MIN ? 48 : 0),
      });
      setSourceWidth(next.panelWidth);
      setNavigationWidth(next.navigationWidth);
      lastNavigationWidth.current = next.navigationWidth;
      if (next.collapseNavigation) {
        setSourceRail(true);
        restoreNavigation.current = false;
        changeNavigation(false);
      }
    } else
      setSourceWidth(
        event.key === "End"
          ? layout.panelMaximumWidth
          : Math.min(
              layout.panelMaximumWidth,
              Math.max(
                WORKSPACE_PANEL_WIDTH_MIN,
                layout.panelWidth + (event.key === "ArrowLeft" ? step : -step),
              ),
            ),
      );
  }
  function togglePin(id: string) {
    setConversations((current) =>
      current.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
    );
    setPopup(null);
  }
  function editConversation(id: string, kind: "rename" | "delete") {
    setNewTitle(conversations.find((c) => c.id === id)?.title ?? "");
    setEditing({ id, kind });
    setPopup(null);
  }
  function commitEdit() {
    if (!editing) return;
    if (editing.kind === "rename") {
      if (!newTitle.trim()) return;
      setConversations((current) =>
        current.map((c) =>
          c.id === editing.id ? { ...c, title: newTitle.trim() } : c,
        ),
      );
    } else {
      setConversations((current) => current.filter((c) => c.id !== editing.id));
      if (selected === editing.id) chooseConversation(null);
    }
    setEditing(null);
    requestAnimationFrame(() =>
      returnTrigger.current?.focus({ preventScroll: true }),
    );
  }
  function handleEscape(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Tab" && mobileMenu) {
      const controls = Array.from(
        root.current?.querySelectorAll<HTMLElement>(
          ".pp-mobile-navigation button, .pp-mobile-navigation input",
        ) ?? [],
      ).filter((el) => el.getClientRects().length > 0);
      const first = controls[0],
        last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
      return;
    }
    if (event.key !== "Escape") return;
    if (editing) setEditing(null);
    else if (popup) setPopup(null);
    else if (profile) {
      setProfile(false);
      root.current
        ?.querySelector<HTMLElement>(
          mobileMenu
            ? ".pp-mobile-navigation .pp-navigation-header .pp-icon-button"
            : navigationExpanded
              ? ".pp-expanded-navigation .pp-navigation-header .pp-icon-button"
              : ".pp-rail-account",
        )
        ?.focus({ preventScroll: true });
      event.stopPropagation();
      return;
    } else if (mobileMenu) setMobileMenu(false);
    else if (sourceRendered) {
      closeSource();
      event.stopPropagation();
      return;
    } else return;
    event.stopPropagation();
    returnTrigger.current?.focus({ preventScroll: true });
  }

  const threadRows = (pinned?: boolean) => {
    const list = conversations.filter(
      (c) => pinned === undefined || c.pinned === pinned,
    );
    return list.length ? (
      list.map((c) => (
        <div className="pp-thread" data-active={selected === c.id} key={c.id}>
          <button
            type="button"
            className="pp-thread-link"
            title={c.title}
            onClick={() => beginExample(c.id, true)}
          >
            {c.title}
          </button>
          <div className="pp-thread-actions">
            <PreviewIconButton
              icon={c.pinned ? PinOff : Pin}
              label={(c.pinned ? "Desanclar " : "Anclar ") + c.title}
              onClick={() => togglePin(c.id)}
            />
            <button
              type="button"
              className="pp-icon-button"
              aria-label={"Opciones de " + c.title}
              title="Opciones"
              data-preview-popover=""
              onClick={(e) => popupAt({ conversation: c.id }, e.currentTarget)}
            >
              <Ellipsis size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </div>
      ))
    ) : (
      <p className="pp-empty">
        {pinned ? "No hay chats anclados" : "No hay conversaciones recientes"}
      </p>
    );
  };
  const sidebarContent = (
    <>
      <div className="pp-navigation-header">
        <button
          type="button"
          className="pp-brand-button"
          onClick={() => chooseConversation(null)}
          aria-label="BinPar · Nuevo chat"
        >
          <PreviewLogo dark={dark} />
        </button>
        <button
          ref={navigationToggle}
          type="button"
          className="pp-icon-button"
          aria-label={
            mobile ? "Cerrar navegación del chat" : "Contraer barra lateral"
          }
          title={mobile ? "Cerrar navegación" : "Contraer barra lateral"}
          onClick={() =>
            mobile ? setMobileMenu(false) : changeNavigation(false)
          }
        >
          <PanelLeft size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
      {profile ? (
        <PreviewProfile
          dark={dark}
          onThemeChange={() => setTheme(!dark)}
          onClose={() => {
            setProfile(false);
            returnTrigger.current?.focus({ preventScroll: true });
          }}
          onReset={reset}
          inline
        />
      ) : (
        <>
          <div className="pp-history">
            <button
              type="button"
              className="pp-navigation-item"
              onClick={() => chooseConversation(null)}
            >
              <SquarePen size={19} strokeWidth={1.8} aria-hidden="true" />
              Nuevo chat
            </button>
            {(["pinned", "recent"] as const).map((section) => (
              <section key={section}>
                <button
                  type="button"
                  className="pp-navigation-item"
                  aria-expanded={sections[section]}
                  onClick={() =>
                    setSections((current) => ({
                      ...current,
                      [section]: !current[section],
                    }))
                  }
                >
                  {section === "pinned" ? (
                    <Pin size={18} strokeWidth={1.8} aria-hidden="true" />
                  ) : (
                    <MessageCircle
                      size={18}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  )}
                  {section === "pinned" ? "Anclados" : "Recientes"}
                  {sections[section] ? (
                    <ChevronDown
                      size={14}
                      className="pp-trailing"
                      aria-hidden="true"
                    />
                  ) : (
                    <ChevronRight
                      size={14}
                      className="pp-trailing"
                      aria-hidden="true"
                    />
                  )}
                </button>
                {sections[section] && threadRows(section === "pinned")}
              </section>
            ))}
          </div>
          <div className="pp-account">
            <button
              type="button"
              className="pp-account-trigger"
              onClick={(e) => {
                returnTrigger.current = e.currentTarget;
                setProfile(true);
                setPopup(null);
              }}
              aria-label="Abrir perfil y configuración"
              aria-expanded={profile}
            >
              <PreviewAvatar />
              <span>
                <strong>Dra. Ana García</strong>
                <small>Hospital de demostración</small>
              </span>
            </button>
          </div>
        </>
      )}
    </>
  );

  return (
    <div className="pp-preview">
      <div
        ref={outer}
        className="pp-frame"
        data-theme={dark ? "dark" : "light"}
      >
        <div
          ref={root}
          className="pp-root"
          data-theme={dark ? "dark" : "light"}
          data-reduced-motion={reduced}
          data-preview-root=""
          data-navigation-phase={navigation}
          data-source-phase={sourcePhase}
          onKeyDown={handleEscape}
          style={{
            width: dimensions.width,
            height: dimensions.height,
            transform: "scale(" + dimensions.scale + ")",
          }}
        >
          <div
            className="pp-workspace"
            data-resizing={resizing}
            inert={mobileMenu || Boolean(editing)}
            style={
              {
                gridTemplateColumns:
                  effectiveNavigationWidth +
                  "px minmax(0,1fr) " +
                  (split && sourceExpanded ? layout.panelWidth : 0) +
                  "px",
                "--navigation-width": effectiveNavigationWidth + "px",
              } as CSSProperties
            }
          >
            {!mobile && (
              <aside
                className="pp-navigation"
                data-expanded={navigationExpanded}
                aria-label="Navegación del chat"
              >
                <div
                  className="pp-expanded-navigation"
                  data-visible={navigationVisible}
                  inert={!navigationVisible}
                >
                  {sidebarContent}
                </div>
                <div
                  className="pp-rail"
                  data-visible={navigation === "collapsed"}
                  inert={navigation !== "collapsed"}
                  onClick={(e) => {
                    if (!(e.target as Element).closest("button"))
                      changeNavigation(true);
                  }}
                >
                  <button
                    className="pp-rail-brand"
                    type="button"
                    aria-label="Expandir barra lateral"
                    title="Expandir barra lateral"
                    onClick={() => changeNavigation(true)}
                  >
                    <span className="pp-rail-mark">
                      <PreviewLogo symbol dark={dark} />
                    </span>
                    <span className="pp-rail-toggle">
                      <PanelLeft
                        size={18}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </span>
                  </button>
                  <PreviewIconButton
                    icon={SquarePen}
                    label="Nuevo chat"
                    onClick={() => chooseConversation(null)}
                  />
                  <button
                    type="button"
                    className="pp-icon-button"
                    aria-label="Ver chats anclados"
                    aria-expanded={popup === "pinned"}
                    data-preview-popover=""
                    onClick={(e) => popupAt("pinned", e.currentTarget)}
                  >
                    <Pin size={18} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="pp-icon-button"
                    aria-label="Ver conversaciones recientes"
                    aria-expanded={popup === "recent"}
                    data-preview-popover=""
                    onClick={(e) => popupAt("recent", e.currentTarget)}
                  >
                    <MessageCircle
                      size={18}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    type="button"
                    className="pp-rail-account"
                    aria-label="Abrir perfil y configuración"
                    data-preview-popover=""
                    onClick={(e) => {
                      returnTrigger.current = e.currentTarget;
                      setProfile((p) => !p);
                      setPopup(null);
                    }}
                  >
                    <PreviewAvatar />
                  </button>
                </div>
                <div
                  className="pp-resizer pp-navigation-resizer"
                  role="separator"
                  tabIndex={0}
                  aria-orientation="vertical"
                  aria-label="Redimensionar panel de conversaciones"
                  aria-valuemin={48}
                  aria-valuemax={Math.round(navigationMaximum)}
                  aria-valuenow={Math.round(effectiveNavigationWidth)}
                  onPointerDown={(e) => startDrag("navigation", e)}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onKeyDown={(e) => resizeKey("navigation", e)}
                >
                  <span />
                </div>
              </aside>
            )}
            <section
              className="pp-chat"
              aria-label="Consulta clínica"
              inert={sourceExpanded && !split}
            >
              <div
                aria-hidden="true"
                className="pp-conversation-veil"
                data-visible={Boolean(selectedConversation)}
              />
              {mobile && (
                <header className="pp-mobile-header">
                  <button
                    type="button"
                    className="pp-icon-button"
                    aria-label="Abrir navegación del chat"
                    onClick={(e) => {
                      returnTrigger.current = e.currentTarget;
                      setMobileMenu(true);
                    }}
                  >
                    <Menu size={20} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                  <PreviewLogo symbol dark={dark} />
                  <strong>Consulta clínica</strong>
                  <PreviewIconButton
                    icon={SquarePen}
                    label="Nuevo chat"
                    onClick={() => chooseConversation(null)}
                  />
                </header>
              )}
              {selectedConversation ? (
                <div
                  ref={messages}
                  className="pp-messages"
                  tabIndex={0}
                  aria-label="Conversación de ejemplo"
                  onScroll={(e) =>
                    setShowBottom(
                      e.currentTarget.scrollHeight -
                        e.currentTarget.scrollTop -
                        e.currentTarget.clientHeight >
                        80,
                    )
                  }
                >
                  <div className="pp-message-column">
                    {selectedConversation.messages.map((message, i) =>
                      message.role === "user" ? (
                        <div key={i} className="pp-user-message">
                          {message.text}
                        </div>
                      ) : (
                        <PreviewAnswer
                          key={i}
                          text={message.text}
                          citations={message.citations}
                          onCitation={openCitation}
                        />
                      ),
                    )}
                    <section className="pp-bibliography">
                      <h3>Bibliografía</h3>
                      {selectedConversation.messages
                        .filter((m) => m.role === "assistant")
                        .at(-1)
                        ?.citations.map((c) => (
                          <button
                            type="button"
                            key={c.anchor}
                            className="items-start! text-left"
                            onClick={(e) => openCitation(c, e.currentTarget)}
                          >
                            <span className="shrink-0">{c.order}</span>
                            {c.title}
                          </button>
                        ))}
                    </section>
                  </div>
                </div>
              ) : (
                <div className="pp-welcome">
                  <PreviewLogo symbol dark={dark} />
                  <p>Hospital de demostración</p>
                  <h2>Consulta clínica</h2>
                </div>
              )}
              <div
                className={
                  "pp-composer-area " +
                  (!selectedConversation ? "pp-composer-centered" : "")
                }
              >
                {showBottom && selectedConversation && (
                  <button
                    type="button"
                    className="pp-scroll-bottom"
                    aria-label="Ir al final de la conversación"
                    onClick={() => {
                      messages.current?.scrollTo({
                        top: messages.current.scrollHeight,
                        behavior: reduced ? "instant" : "smooth",
                      });
                    }}
                  >
                    <ArrowDown size={18} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                )}
                {selectedConversation ? (
                  <button
                    type="button"
                    className="pp-composer pp-restart-consultation"
                    onClick={() => chooseConversation(null)}
                  >
                    <span>Reiniciar consulta</span>
                    <RotateCcw size={18} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                ) : (
                  <form
                    className="pp-composer"
                    data-expanded={Boolean(draft)}
                    data-typing={Boolean(typing)}
                    aria-busy={Boolean(typing)}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (draft && !typing) loadExample(draft);
                    }}
                    data-preview-popover=""
                  >
                    <button
                      type="button"
                      className="pp-attach"
                      title="Adjuntos disponibles en la plataforma"
                      aria-label="Adjuntos disponibles en la plataforma"
                      disabled
                    >
                      <Paperclip
                        size={18}
                        strokeWidth={1.1}
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      className="pp-composer-field"
                      aria-label="Elegir una consulta de ejemplo"
                      disabled={Boolean(typing)}
                      onClick={(e) => popupAt("examples", e.currentTarget)}
                    >
                      {draft ? (
                        <span
                          ref={draftText}
                          className="pp-draft-text"
                          data-typed-characters={typedCharacters}
                        >
                          {draftQuestion.slice(0, typedCharacters)}
                          {typing && (
                            <span
                              className="pp-typing-caret"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                      ) : (
                        "Pregunta clínica al comité..."
                      )}
                    </button>
                    <button
                      type="submit"
                      className="pp-send"
                      disabled={!draft || Boolean(typing)}
                      aria-label="Cargar consulta de ejemplo"
                    >
                      <ArrowUp size={18} strokeWidth={1.1} aria-hidden="true" />
                    </button>
                  </form>
                )}
              </div>
            </section>
            {sourceRendered && (
              <aside
                className="pp-source"
                data-visible={sourceExpanded}
                data-fullscreen={!split}
                aria-label="Panel de fuentes de consulta"
                inert={!sourceExpanded}
              >
                {layout.mode === "split-resizable" && (
                  <div
                    className="pp-resizer pp-source-resizer"
                    role="separator"
                    tabIndex={0}
                    aria-orientation="vertical"
                    aria-label="Redimensionar panel de fuentes de consulta"
                    aria-valuemin={360}
                    aria-valuemax={Math.round(
                      workspaceRailPanelMaximumWidth(dimensions.width),
                    )}
                    aria-valuenow={Math.round(layout.panelWidth)}
                    onPointerDown={(e) => startDrag("source", e)}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onKeyDown={(e) => resizeKey("source", e)}
                    onDoubleClick={() => setSourceWidth(360)}
                  >
                    <span />
                  </div>
                )}
                <div className="pp-source-content">
                  <div className="pp-source-tabs">
                    <div role="tablist" aria-label="Documentos abiertos">
                      {sourceTabs.tabs.map((tab) => (
                        <div
                          className="pp-source-tab"
                          key={tab.key}
                          data-active={tab.key === sourceTabs.activeKey}
                        >
                          <button
                            type="button"
                            role="tab"
                            aria-selected={tab.key === sourceTabs.activeKey}
                            title={tab.citation.title}
                            onClick={() => {
                              setSourceTabs((current) => ({
                                ...current,
                                activeKey: tab.key,
                              }));
                              setFullDocument(false);
                            }}
                          >
                            <FileText
                              size={14}
                              strokeWidth={1.8}
                              aria-hidden="true"
                            />
                            <span>{tab.citation.title}</span>
                          </button>
                          <button
                            type="button"
                            className="pp-tab-close"
                            aria-label={"Cerrar " + tab.citation.title}
                            onClick={() => {
                              const next = closeSourceTab(sourceTabs, tab.key);
                              if (!next.tabs.length) closeSource();
                              else setSourceTabs(next);
                            }}
                          >
                            <X size={12} strokeWidth={1.8} aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      ref={sourceClose}
                      type="button"
                      className="pp-icon-button"
                      aria-label="Cerrar panel de fuentes de consulta"
                      onClick={() => closeSource()}
                    >
                      <X size={18} strokeWidth={1.8} aria-hidden="true" />
                    </button>
                  </div>
                  <header className="pp-source-heading">
                    <div>
                      <p>Fuente de consulta</p>
                      <h2 title={currentSource.title}>{currentSource.title}</h2>
                    </div>
                    <button
                      type="button"
                      className="pp-source-scope"
                      onClick={() => setFullDocument((v) => !v)}
                    >
                      <Maximize2
                        size={15}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      {fullDocument ? "Ver capítulo" : "Ver documento completo"}
                    </button>
                  </header>
                  {fullDocument && (
                    <button
                      type="button"
                      className="pp-return-citation"
                      onClick={() => {
                        setFullDocument(false);
                        setLocateKey((k) => k + 1);
                      }}
                    >
                      <LocateFixed
                        size={14}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      Volver a la cita
                    </button>
                  )}
                  <PreviewDocument
                    citation={currentSource}
                    full={fullDocument}
                    locateKey={locateKey}
                  />
                </div>
              </aside>
            )}
          </div>
          {mobileMenu && mobile && (
            <div
              className="pp-drawer-layer"
              onClick={() => setMobileMenu(false)}
            >
              <aside
                className="pp-mobile-navigation"
                role="dialog"
                aria-modal="true"
                aria-label="Navegación del chat"
                onClick={(e) => e.stopPropagation()}
              >
                {sidebarContent}
              </aside>
            </div>
          )}
          {profile && !navigationExpanded && !mobile && (
            <PreviewProfile
              dark={dark}
              onThemeChange={() => setTheme(!dark)}
              onClose={() => {
                setProfile(false);
                returnTrigger.current?.focus({ preventScroll: true });
              }}
              onReset={reset}
              inline={false}
            />
          )}
          {popup && (
            <div
              className="pp-popup"
              data-preview-popover=""
              style={popupPosition}
              role="dialog"
              aria-label={
                typeof popup === "object"
                  ? "Opciones de conversación"
                  : popup === "examples"
                    ? "Consultas de ejemplo"
                    : popup === "pinned"
                      ? "Chats anclados"
                      : "Conversaciones recientes"
              }
            >
              {typeof popup === "object" ? (
                <>
                  {(() => {
                    const c = conversations.find(
                      (c) => c.id === popup.conversation,
                    );
                    return c ? (
                      <>
                        <button type="button" onClick={() => togglePin(c.id)}>
                          {c.pinned ? (
                            <PinOff size={16} aria-hidden="true" />
                          ) : (
                            <Pin size={16} aria-hidden="true" />
                          )}
                          {c.pinned ? "Desanclar" : "Anclar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => editConversation(c.id, "rename")}
                        >
                          <Pencil size={16} aria-hidden="true" />
                          Renombrar
                        </button>
                        <button
                          type="button"
                          onClick={() => editConversation(c.id, "delete")}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                          Eliminar
                        </button>
                      </>
                    ) : null;
                  })()}
                </>
              ) : popup === "examples" ? (
                <>
                  <h3>Consultas de ejemplo</h3>
                  {initialConversations.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => beginExample(c.id, false)}
                    >
                      {c.title}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <h3>{popup === "pinned" ? "Anclados" : "Recientes"}</h3>
                  {threadRows(popup === "pinned")}
                </>
              )}
            </div>
          )}
          {editing && (
            <PreviewEditDialog
              title={
                editing.kind === "rename"
                  ? "Renombrar conversación"
                  : "Eliminar conversación"
              }
              value={newTitle}
              renaming={editing.kind === "rename"}
              onChange={setNewTitle}
              onClose={() => {
                setEditing(null);
                returnTrigger.current?.focus({ preventScroll: true });
              }}
              onCommit={commitEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewEditDialog({
  title,
  value,
  renaming,
  onChange,
  onClose,
  onCommit,
}: {
  title: string;
  value: string;
  renaming: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onCommit: () => void;
}) {
  const dialog = useRef<HTMLFormElement>(null);
  useEffect(() => {
    dialog.current
      ?.querySelector<HTMLElement>("input,button")
      ?.focus({ preventScroll: true });
  }, []);
  return (
    <div className="pp-modal-layer" onClick={onClose}>
      <form
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="pp-edit-dialog"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onCommit();
        }}
        onKeyDown={(e) => {
          if (e.key !== "Tab") return;
          const controls = Array.from(
            dialog.current?.querySelectorAll<HTMLElement>("input,button") ?? [],
          );
          const first = controls[0],
            last = controls.at(-1);
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }}
      >
        <h2>{title}</h2>
        {renaming ? (
          <label>
            Nombre de la conversación
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              maxLength={160}
              required
            />
          </label>
        ) : (
          <p>Se eliminará «{value}» de esta demostración.</p>
        )}
        <div>
          <button type="button" className="pp-outline-button" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="pp-primary-button"
            disabled={renaming && !value.trim()}
          >
            {renaming ? "Guardar" : "Eliminar"}
          </button>
        </div>
      </form>
    </div>
  );
}
