"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowUpRight, Paperclip } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { BlogPost } from "~/lib/blog";
import { BlogPageSceneCover } from "./blog-page-scene-cover";

const prompt = "Muéstrame el último artículo del blog.";
const promptStartAt = 1200;
const promptCharacterMs = 55;
const promptReadMs = 1800;
const sentAt = promptStartAt + prompt.length * promptCharacterMs + promptReadMs;
const answerAt = sentAt + 400;
const excerptCharacterMs = 26;

/** Ficha vertical que se dibuja dentro del mock. Exclusiva de Horizonte. */
export function BlogPageFeaturedArticle({
  post,
  visible,
  reduced,
}: {
  post?: BlogPost;
  visible: boolean;
  reduced: boolean;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const alignGridRef = useRef<(() => void) | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const titleAt = answerAt + 300;
  const excerptAt = titleAt + (post?.title.length ?? 0) * 18 + 150;
  const duration = excerptAt + (post?.excerpt.length ?? 0) * excerptCharacterMs;

  useEffect(() => {
    if (!visible || reduced) return;
    const start = performance.now();
    const timer = window.setInterval(() => {
      const next = performance.now() - start;
      setElapsed(Math.min(next, duration));
      if (next >= duration) window.clearInterval(timer);
    }, 30);
    return () => window.clearInterval(timer);
  }, [visible, reduced, duration]);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const section = grid.closest("section");
    const homeGrid = section?.querySelector<HTMLElement>("[data-home-grid]");
    // Los anclajes quedan fuera de los elementos animados: el origen no se
    // desplaza durante la entrada. Todo se aplica únicamente a esta sección.
    const mock = section?.querySelector<HTMLElement>("[data-blog-mock-anchor]");
    const copy = section?.querySelector<HTMLElement>("[data-blog-copy-anchor]");
    if (!homeGrid || !mock) return;
    let frame = 0;
    let ownedPosition = "";
    let copyOffsetX = 0;
    let copyOffsetY = 0;
    const alignGrid = () => {
      frame = 0;
      const bounds = mock.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const originX = (bounds.left + window.scrollX) % 44;
      const originY = (bounds.top + window.scrollY) % 44;
      ownedPosition = `${originX}px ${originY}px`;
      homeGrid.style.setProperty("--home-grid-position", ownedPosition);
      // La textura interior se pinta en coordenadas locales. Compensamos su
      // posición real (borde y animación incluidos) respecto al fondo exterior.
      const outside = homeGrid.getBoundingClientRect();
      const inside = grid.getBoundingClientRect();
      grid.style.backgroundPosition = `${(outside.left + originX - inside.left) % 44}px ${(outside.top + originY - inside.top) % 44}px`;
      if (copy && window.matchMedia("(min-width: 900px)").matches) {
        const copyBounds = copy.getBoundingClientRect();
        const left = copyBounds.left - copyOffsetX;
        const top = copyBounds.top - copyOffsetY;
        copyOffsetX = bounds.left + Math.round((left - bounds.left) / 44) * 44 - left;
        copyOffsetY = bounds.top + Math.round((top - bounds.top) / 44) * 44 - top;
        copy.style.setProperty("--blog-copy-offset", `${copyOffsetX}px ${copyOffsetY}px`);
      } else if (copy) {
        // En la composición vertical prima el centrado de ambos bloques.
        copy.style.removeProperty("--blog-copy-offset");
        copyOffsetX = 0;
        copyOffsetY = 0;
      }
    };
    const scheduleAlignment = () => {
      if (!frame) frame = requestAnimationFrame(alignGrid);
    };
    alignGridRef.current = alignGrid;
    alignGrid();
    const observer = new ResizeObserver(scheduleAlignment);
    observer.observe(mock);
    observer.observe(document.documentElement);
    if (section) observer.observe(section);
    if (copy) observer.observe(copy);
    window.addEventListener("resize", scheduleAlignment);
    window.addEventListener("scroll", scheduleAlignment, { passive: true });
    document.fonts.addEventListener("loadingdone", scheduleAlignment);
    return () => {
      cancelAnimationFrame(frame);
      alignGridRef.current = null;
      observer.disconnect();
      copy?.style.removeProperty("--blog-copy-offset");
      if (homeGrid.style.getPropertyValue("--home-grid-position") === ownedPosition) {
        homeGrid.style.removeProperty("--home-grid-position");
      }
      window.removeEventListener("resize", scheduleAlignment);
      window.removeEventListener("scroll", scheduleAlignment);
      document.fonts.removeEventListener("loadingdone", scheduleAlignment);
    };
  }, []);

  if (!post) return null;

  const time = reduced ? duration : elapsed;
  const centered = time < sentAt;
  const answering = time >= answerAt;
  const complete = time >= duration;
  const titleLength = Math.max(0, Math.floor((time - titleAt) / 18));
  const excerptLength = Math.max(0, Math.floor((time - excerptAt) / excerptCharacterMs));
  const inputText =
    time < promptStartAt
      ? "Pregunta al comité…"
      : centered
        ? prompt.slice(
            0,
            Math.floor((time - promptStartAt) / promptCharacterMs),
          )
        : complete
          ? "Pregunta al comité…"
          : "El comité está respondiendo…";

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 28 }}
      animate={visible ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: reduced ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      onUpdate={() => alignGridRef.current?.()}
      onAnimationComplete={() => alignGridRef.current?.()}
      className="w-full"
    >
      <Link
        href={post.href}
        aria-label={`Leer artículo: ${post.title}`}
        inert={!complete}
        data-blog-article-mock=""
        className="group shadow-big-blocks @container focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark relative isolate block min-h-[430px] overflow-hidden rounded-3xl border border-cyan-800/15 bg-white/80 backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-4 dark:border-cyan-300/15 dark:bg-[#06111f]"
      >
        <div
          ref={gridRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(8,145,178,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.1)_1px,transparent_1px)] bg-size-[44px_44px] dark:bg-[linear-gradient(rgba(125,211,252,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.045)_1px,transparent_1px)]"
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 -z-10 bg-white mask-[linear-gradient(to_right,transparent,black_18%,black_82%,transparent)] transition-opacity duration-300 motion-reduce:transition-none dark:bg-[#06111f] ${centered ? "opacity-0" : "opacity-100"}`}
        />

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute right-6 bottom-[calc(50%+20px)] left-6 text-center transition-opacity duration-150 motion-reduce:transition-none ${centered ? "opacity-100" : "opacity-0"}`}
        >
          <span className="mx-auto mb-3 block size-10">
            <Image
              src="/logos/binpar-brand/binpar-isotipo-light.svg"
              alt=""
              width={121.76}
              height={131.79}
              className="size-full object-contain dark:hidden"
            />
            <Image
              src="/logos/binpar-brand/binpar-isotipo-dark.svg"
              alt=""
              width={121.76}
              height={131.79}
              className="hidden size-full object-contain dark:block"
            />
          </span>
          <p className="font-display text-primary-light dark:text-primary-dark text-[10px] font-bold tracking-[0.22em] uppercase">
            BinPar
          </p>
          <p className="font-display mt-2 text-lg font-extrabold tracking-tight text-[#05215e] dark:text-slate-50">
            Comité clínico
          </p>
        </div>

        <article
          aria-label="Último artículo del blog"
          inert={!answering}
          className={`relative px-5 pt-5 pb-20 transition-opacity duration-300 motion-reduce:transition-none ${answering ? "opacity-100" : "opacity-0"}`}
        >
          <motion.div
            initial={
              reduced
                ? false
                : { opacity: 0, clipPath: "inset(0 0 100% 0 round 16px)" }
            }
            animate={
              visible && answering
                ? { opacity: 1, clipPath: "inset(0 0 0% 0 round 16px)" }
                : undefined
            }
            transition={{
              duration: reduced ? 0 : 0.65,
              delay: 0,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative h-[178px] overflow-hidden rounded-2xl bg-[#e5f1f4] dark:bg-[#102231]"
          >
            {post.image ? (
              <Image
                src={post.image}
                alt={post.imageAlt ?? ""}
                fill
                sizes="(max-width: 639px) calc(100vw - 72px), (max-width: 1023px) 378px, 484px"
                className="object-cover"
              />
            ) : (
              <BlogPageSceneCover slug={post.slug} />
            )}
          </motion.div>
          <h2 className="font-display mt-3 text-lg leading-[1.35] font-semibold tracking-tight text-[#05215e] dark:text-slate-50">
            <TypedText
              text={post.title}
              length={titleLength}
              active={time >= titleAt && time < excerptAt - 150}
            />
          </h2>
          <p className="font-body mt-2 text-[13px] leading-5.5 text-slate-800 dark:text-slate-200">
            <TypedText
              text={post.excerpt}
              length={excerptLength}
              active={time >= excerptAt && !complete}
            />
          </p>
          <div
            className={`mt-3 flex min-h-6 items-center justify-between gap-3 transition-opacity duration-300 motion-reduce:transition-none ${complete ? "opacity-100" : "opacity-0"}`}
            inert={!complete}
          >
            <p className="font-body flex flex-wrap items-center gap-x-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
              <span>{post.createdAtLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{post.readTime}</span>
            </p>
            <span
              aria-hidden="true"
              className="text-primary-light dark:text-primary-dark inline-flex size-6 shrink-0 items-center justify-center rounded-full transition-colors group-hover:bg-cyan-800/5 group-focus-visible:bg-cyan-800/5 dark:group-hover:bg-cyan-300/10 dark:group-focus-visible:bg-cyan-300/10"
            >
              <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
            </span>
          </div>
        </article>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-5 left-5 z-10 transition-[top,translate] duration-280 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{
            top: centered ? "50%" : "calc(100% - 24px)",
            translate: centered ? "0 0" : "0 -100%",
          }}
        >
          <div className="font-body shadow-big-blocks grid min-h-11 grid-cols-[44px_minmax(0,1fr)_44px] overflow-hidden rounded-[28px] border border-cyan-800/15 bg-white/85 text-[13px] leading-5.5 backdrop-blur-md dark:border-cyan-300/15 dark:bg-[#152230]/90 dark:shadow-[0_0_32px_rgba(0,188,187,0.12)]">
            <span className="grid size-7 place-items-center place-self-center rounded-full border border-cyan-800/15 text-slate-500 dark:border-cyan-300/15 dark:text-slate-400">
              <Paperclip className="size-3.5" strokeWidth={1.8} />
            </span>
            <span className="min-w-0 self-center truncate py-2 text-slate-500 dark:text-slate-400">
              {inputText}
            </span>
            <span
              className={`bg-primary-light dark:bg-primary-dark grid size-7 place-items-center place-self-center rounded-full text-white dark:text-[#04111e] ${centered && time >= promptStartAt ? "opacity-100" : "opacity-45"}`}
            >
              <ArrowUp className="size-4" strokeWidth={1.8} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/** Reserva el tamaño final para que la escritura no desplace la ficha ni la barra. */
function TypedText({
  text,
  length,
  active,
}: {
  text: string;
  length: number;
  active: boolean;
}) {
  return (
    <span className="relative block">
      <span className="invisible block" aria-hidden="true">
        {text}
      </span>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="absolute inset-0">
        {text.slice(0, length)}
        {active && (
          <span className="bg-primary-light dark:bg-primary-dark ml-0.5 inline-block h-[0.8em] w-px animate-pulse align-baseline motion-reduce:animate-none" />
        )}
      </span>
    </span>
  );
}
