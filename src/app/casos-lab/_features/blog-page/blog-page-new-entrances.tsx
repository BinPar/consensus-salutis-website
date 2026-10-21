"use client";

import {
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { ArrowDown, ArrowUpRight, Maximize2, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { BlogPost, BlogTag } from "~/lib/blog";
import { HomeGrid } from "~/app/_components/motion-system";
import { BlogPageSceneCover } from "./blog-page-scene-cover";
import type { NewBlogPageDirection } from "./blog-page-directions";

const ease = [0.22, 1, 0.36, 1] as const;
type StageProps = {
  visible: boolean;
  reduced: boolean;
  posts: BlogPost[];
  tags: BlogTag[];
};

function Isotype({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-block ${className}`}>
      <Image
        src="/logos/binpar-brand/binpar-isotipo-light.svg"
        width={64}
        height={64}
        alt=""
        className="h-full w-full dark:hidden"
      />
      <Image
        src="/logos/binpar-brand/binpar-isotipo-dark.svg"
        width={64}
        height={64}
        alt=""
        className="hidden h-full w-full dark:block"
      />
    </span>
  );
}

function Explore({ reduced }: { reduced: boolean }) {
  return (
    <a
      href="#blog-page-gallery"
      onClick={(event) => {
        const gallery = document.getElementById("blog-page-gallery");
        if (!gallery) return;
        event.preventDefault();
        gallery.scrollIntoView({
          behavior: reduced ? "instant" : "smooth",
          block: "start",
        });
        gallery.focus({ preventScroll: true });
      }}
      className="font-body bg-primary-light dark:bg-primary-dark focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark inline-flex min-h-12 items-center justify-center gap-4 rounded-full px-6 text-sm font-semibold text-white shadow-[0_6px_20px_-10px_#006d79] transition hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-4 dark:text-[#04111e] dark:hover:bg-cyan-200"
    >
      Explorar artículos{" "}
      <ArrowDown size={17} strokeWidth={1.8} aria-hidden="true" />
    </a>
  );
}

function WindowBar({ label }: { label: string }) {
  return (
    <div className="font-body flex h-10 items-center justify-between border-b border-cyan-800/10 bg-[#f4f9fb] px-4 text-[10px] font-medium text-slate-500 dark:border-cyan-300/15 dark:bg-[#102736] dark:text-slate-400">
      <span className="flex items-center gap-2">
        <Isotype className="size-4" />
        {label}
      </span>
      <Maximize2 size={11} strokeWidth={1.8} />
    </div>
  );
}

/** Las ventanas son fragmentos del mismo artículo, no artículos de muestra. */
function Windows({ visible, reduced, posts, tags }: StageProps) {
  const post = posts[0];
  const surface =
    "overflow-hidden rounded-2xl border border-cyan-800/15 bg-white shadow-[0_24px_70px_-28px_rgba(5,33,94,0.28)] dark:border-cyan-300/15 dark:bg-[#0b1e2c]";
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse,transparent_25%,black)] opacity-55">
          <HomeGrid />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_20%,#e7f3f6_100%)] dark:bg-[radial-gradient(ellipse_at_50%_50%,transparent_20%,#0a2332_100%)]" />
        {post && (
          <motion.div
            initial={{ x: 140, y: 100, scale: 0.75, opacity: 0 }}
            animate={visible ? { x: 0, y: 0, scale: 1, opacity: 1 } : undefined}
            transition={{ duration: reduced ? 0 : 1.25, ease }}
            className={`${surface} absolute top-[11%] -left-14 w-[340px] max-lg:top-[5%] max-lg:-left-12 max-lg:w-44 max-sm:-left-14 max-sm:w-36 xl:left-[3%]`}
          >
            <WindowBar label="Blog" />
            <div className="relative aspect-[1.65]">
              {post.image ? (
                <Image
                  src={post.image}
                  fill
                  sizes="340px"
                  alt=""
                  className="object-cover"
                />
              ) : (
                <BlogPageSceneCover slug={post.slug} />
              )}
            </div>
          </motion.div>
        )}
        {tags.length > 0 && (
          <motion.div
            initial={{ x: -130, y: 90, scale: 0.75, opacity: 0 }}
            animate={visible ? { x: 0, y: 0, scale: 1, opacity: 1 } : undefined}
            transition={{
              duration: reduced ? 0 : 1.3,
              delay: reduced ? 0 : 0.1,
              ease,
            }}
            className={`${surface} absolute top-[18%] -right-8 w-[250px] max-lg:top-[7%] max-lg:-right-16 max-lg:w-48 max-sm:-right-12 max-sm:w-36 xl:right-[3%]`}
          >
            <WindowBar label="Temas" />
            <div className="flex flex-wrap gap-2 p-5 max-sm:p-3">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.tag}
                  className="font-body rounded-full border border-cyan-800/15 px-3 py-1.5 text-xs text-cyan-800 max-sm:text-[9px] dark:border-cyan-300/20 dark:text-cyan-100"
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </motion.div>
        )}
        {post && (
          <motion.div
            initial={{ x: 100, y: -90, scale: 0.8, opacity: 0 }}
            animate={visible ? { x: 0, y: 0, scale: 1, opacity: 1 } : undefined}
            transition={{
              duration: reduced ? 0 : 1.35,
              delay: reduced ? 0 : 0.15,
              ease,
            }}
            className={`${surface} absolute bottom-[8%] left-[5%] w-[310px] max-lg:bottom-[4%] max-lg:-left-10 max-lg:w-52 max-sm:bottom-[3%] max-sm:w-44`}
          >
            <WindowBar label="Lectura" />
            <div className="p-5 max-sm:p-3">
              <p className="font-display text-xl leading-tight font-semibold tracking-tight text-[#05215e] max-sm:text-sm dark:text-slate-100">
                {post.title}
              </p>
              <div className="mt-4 flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>{post.readTime}</span>
                <ArrowUpRight size={13} />
              </div>
            </div>
          </motion.div>
        )}
        <motion.div
          initial={{ scale: 0.2, opacity: 0 }}
          animate={visible ? { scale: 1, opacity: 1 } : undefined}
          transition={{
            duration: reduced ? 0 : 1.15,
            delay: reduced ? 0 : 0.25,
            ease,
          }}
          className="absolute right-[9%] bottom-[13%] grid size-24 place-items-center rounded-3xl border border-cyan-800/10 bg-[#e1f1f3] max-lg:right-[7%] max-lg:bottom-[10%] max-lg:size-16 dark:border-cyan-300/10 dark:bg-[#103341]"
        >
          <Isotype className="size-12 max-lg:size-8" />
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0.4, y: 20 }}
        animate={visible ? { opacity: 1, y: 0 } : undefined}
        transition={{
          duration: reduced ? 0 : 0.8,
          delay: reduced ? 0 : 0.15,
          ease,
        }}
        className="relative z-10 mx-auto w-full max-w-[720px] px-5 py-36 text-center max-lg:py-40"
      >
        <p className="font-display text-primary-light dark:text-primary-dark text-xs font-bold tracking-[0.22em] uppercase">
          Blog de BinPar
        </p>
        <h1
          id="blog-page-title"
          className="font-display mt-6 text-4xl leading-[1.12] font-extrabold tracking-tight text-balance text-[#05215e] sm:text-5xl xl:text-[64px] dark:text-slate-50"
        >
          Una nueva mirada
          <br />
          <span className="text-primary-light dark:text-primary-dark">
            al conocimiento.
          </span>
        </h1>
        <p className="font-body mx-auto mt-6 max-w-[520px] text-sm leading-6 text-balance text-slate-600 sm:text-lg sm:leading-8 dark:text-slate-400">
          IA médica, tendencias sanitarias y nuevas formas de transformar la
          asistencia al paciente.
        </p>
        <div className="mt-8">
          <Explore reduced={reduced} />
        </div>
      </motion.div>
    </>
  );
}

function Manifesto({ visible, reduced, tags }: StageProps) {
  const lines = ["El conocimiento", "no se detiene."];
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(0deg,black,transparent_70%)] opacity-50"
      >
        <HomeGrid />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 size-[650px] rounded-full bg-[radial-gradient(ellipse,#cdebed_0%,transparent_65%)] dark:bg-[radial-gradient(ellipse,#0c3543_0%,transparent_65%)]"
      />
      <div className="relative mx-auto w-full max-w-[1344px] px-5 py-20 sm:px-8">
        <div className="flex items-center gap-4">
          <Isotype className="size-9" />
          <p className="font-display text-primary-light dark:text-primary-dark text-xs font-bold tracking-[0.22em] uppercase">
            Lecturas clínicas · Blog
          </p>
        </div>
        <h1
          id="blog-page-title"
          className="font-display mt-10 text-[clamp(38px,6.6vw,100px)] leading-[1.09] font-extrabold tracking-[-0.045em] text-[#05215e] dark:text-slate-50"
        >
          {lines.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-2">
              <motion.span
                initial={{ y: "105%" }}
                animate={visible ? { y: 0 } : undefined}
                transition={{
                  duration: reduced ? 0 : 1.05,
                  delay: reduced ? 0 : i * 0.13,
                  ease,
                }}
                className={`block ${i ? "text-primary-light dark:text-primary-dark" : ""}`}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={visible ? { scaleX: 1 } : undefined}
          transition={{
            duration: reduced ? 0 : 1.2,
            delay: reduced ? 0 : 0.2,
            ease,
          }}
          className="mt-9 h-px origin-left bg-cyan-800/20 dark:bg-cyan-300/20"
        />
        <motion.div
          initial={{ opacity: 0.3, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : undefined}
          transition={{
            duration: reduced ? 0 : 0.8,
            delay: reduced ? 0 : 0.4,
            ease,
          }}
          className="mt-8 flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end"
        >
          <div>
            <p className="font-body max-w-[580px] text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 dark:text-slate-400">
              Lecturas recientes sobre IA médica, tendencias sanitarias y nuevas
              formas de transformar la asistencia al paciente.
            </p>
            {tags.length > 0 && (
              <p className="font-body mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-cyan-800 dark:text-cyan-200">
                {tags.slice(0, 3).map((tag) => (
                  <span key={tag.tag}>{tag.label}</span>
                ))}
              </p>
            )}
          </div>
          <div className="shrink-0">
            <Explore reduced={reduced} />
          </div>
        </motion.div>
      </div>
    </>
  );
}

function Stage({
  direction,
  posts,
  tags,
}: {
  direction: NewBlogPageDirection;
  posts: BlogPost[];
  tags: BlogTag[];
}) {
  const root = useRef<HTMLElement>(null);
  const visible = useInView(root, { once: true, amount: 0.15 });
  const reduced = !!useReducedMotion();
  const Scene = { windows: Windows, kinetic: Manifesto }[
    direction
  ];
  return (
    <section
      ref={root}
      data-blog-entrance={direction}
      aria-labelledby="blog-page-title"
      className="relative isolate flex min-h-[calc(100svh-var(--lab-toolbar-height,80px))] items-center overflow-hidden bg-[#fbfdff] dark:bg-[#06111f]"
    >
      <Scene visible={visible} reduced={reduced} posts={posts} tags={tags} />
    </section>
  );
}

export function BlogPageNewEntrances(props: {
  direction: NewBlogPageDirection;
  posts: BlogPost[];
  tags: BlogTag[];
}) {
  const [replay, setReplay] = useState(0);
  return (
    <div className="relative">
      <Stage key={`${props.direction}-${replay}`} {...props} />
      <button
        type="button"
        onClick={() => setReplay((value) => value + 1)}
        aria-label="Repetir animación de entrada"
        title="Repetir entrada"
        className="text-primary-light dark:text-primary-dark focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark absolute right-5 bottom-5 z-20 grid size-10 place-items-center rounded-full border border-cyan-800/15 bg-white/80 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 dark:border-cyan-300/15 dark:bg-[#102231]"
      >
        <RotateCcw size={16} strokeWidth={1.8} aria-hidden="true" />
      </button>
    </div>
  );
}
