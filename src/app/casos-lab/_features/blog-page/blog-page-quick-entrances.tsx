"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { BlogPost } from "~/lib/blog";
import { BlogPageSceneCover } from "./blog-page-scene-cover";

type Direction = "focus" | "reading" | "impact";
const ease = [0.22, 1, 0.36, 1] as const;
const title = "font-display font-extrabold tracking-tight text-[#05215e] dark:text-slate-50";
const label = "font-display text-primary-light dark:text-primary-dark text-[10px] font-bold tracking-[0.22em] uppercase sm:text-xs";
const frame = "relative isolate flex min-h-[calc(100svh-var(--lab-toolbar-height,80px))] items-center overflow-hidden bg-[#fbfdff] dark:bg-[#06111f]";

function Cover({ post }: { post?: BlogPost }) {
  return post?.image ? <Image src={post.image} fill sizes="100vw" alt="" className="object-cover" /> : post ? <BlogPageSceneCover slug={post.slug} /> : <div className="h-full bg-[#d4ecef] dark:bg-[#10313e]" />;
}

function Explore({ reduced }: { reduced: boolean }) {
  return <a href="#blog-page-gallery" onClick={event => {
    const gallery = document.getElementById("blog-page-gallery");
    if (!gallery) return;
    event.preventDefault();
    gallery.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
    gallery.focus({ preventScroll: true });
  }} className="font-body bg-primary-light dark:bg-primary-dark focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark inline-flex min-h-12 shrink-0 items-center justify-center gap-5 rounded-full px-6 text-sm font-semibold text-white transition hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-4 dark:text-[#04111e] dark:hover:bg-cyan-200">Explorar artículos <ArrowDown size={17} strokeWidth={1.8} aria-hidden="true" /></a>;
}

export function BlogPageQuickEntrances({ direction, posts }: { direction: Direction; posts: BlogPost[] }) {
  const reduced = !!useReducedMotion();
  const post = posts[0];
  const transition = { duration: reduced ? 0 : 1.15, ease };

  if (direction === "focus") return <section key={direction} data-blog-entrance={direction} aria-labelledby="blog-page-title" className={frame}>
    <motion.div aria-hidden="true" initial={{ x: 100, scale: 1.1, opacity: 0.3 }} animate={{ x: 0, scale: 1, opacity: 1 }} transition={transition} className="pointer-events-none absolute inset-y-0 right-0 w-3/4 max-sm:w-full"><Cover post={post} /></motion.div>
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#fbfdff_20%,#fbfdffed_40%,#fbfdff00_85%)] max-sm:bg-[linear-gradient(0deg,#fbfdff_15%,#fbfdffed_48%,#fbfdff22_100%)] dark:bg-[linear-gradient(90deg,#06111f_20%,#06111fed_40%,#06111f00_85%)] max-sm:dark:bg-[linear-gradient(0deg,#06111f_15%,#06111fed_48%,#06111f22_100%)]" />
    <div className="relative mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-10 lg:px-16">
      <p className={label}>Blog de BinPar {post ? "· Última lectura" : ""}</p>
      <motion.h1 id="blog-page-title" initial={{ y: 35, opacity: 0.3 }} animate={{ y: 0, opacity: 1 }} transition={transition} className={`${title} mt-8 max-w-[780px] text-[clamp(36px,4.6vw,68px)] leading-[1.12] text-balance`}>{post?.title ?? "El conocimiento sigue avanzando."}</motion.h1>
      <p className="font-body mt-7 max-w-[510px] text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 dark:text-slate-300">{post?.excerpt ?? "Lecturas sobre IA médica y práctica clínica."}</p>
      {post && <p className="font-body mt-6 text-xs text-slate-500 dark:text-slate-400">{post.createdAtLabel} <span className="px-2">·</span> {post.readTime}</p>}
      <div className="mt-10"><Explore reduced={reduced} /></div>
    </div>
  </section>;

  if (direction === "reading") return <section key={direction} data-blog-entrance={direction} aria-labelledby="blog-page-title" className={frame}>
    <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_90%,#c7e8e9_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_80%_90%,#0b3543_0%,transparent_60%)]" />
    <div className="relative mx-auto w-full max-w-[1344px] px-5 py-16 sm:px-8">
      <p className={label}>BinPar · Lecturas clínicas</p>
      <h1 id="blog-page-title" className={`${title} mt-10 max-w-[1100px] text-[clamp(40px,6.7vw,96px)] leading-[1.08]`}>
        <span className="block overflow-hidden pb-2"><motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={transition} className="block">Ideas que merecen</motion.span></span>
        <span className="block overflow-hidden pb-2"><motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ ...transition, delay: reduced ? 0 : 0.12 }} className="text-primary-light dark:text-primary-dark block">una pausa.</motion.span></span>
      </h1>
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={transition} className="mt-10 h-px origin-left bg-cyan-800/25 dark:bg-cyan-300/20" />
      <div className="mt-8 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
        <div className="max-w-[640px]">
          <p className="font-body text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 dark:text-slate-400">IA médica y práctica clínica. Perspectivas para entender lo que está cambiando y abrir nuevas preguntas.</p>
          {post && <div className="mt-8 flex items-start gap-4"><span aria-hidden="true" className="text-primary-light dark:text-primary-dark pt-1"><ArrowUpRight size={22} strokeWidth={1.5} /></span><div><p className={`${label} mb-2`}>La última lectura</p><p className="font-body text-sm leading-6 font-medium text-[#05215e] dark:text-slate-200">{post.title}</p></div></div>}
        </div>
        <Explore reduced={reduced} />
      </div>
    </div>
  </section>;

  return <section key={direction} data-blog-entrance={direction} aria-labelledby="blog-page-title" className={frame}>
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-45 dark:opacity-30"><Cover post={post} /></div>
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#fbfdff_0%,#fbfdffed_25%,#fbfdff00_100%)] dark:bg-[linear-gradient(0deg,#06111f_0%,#06111fed_25%,#06111f00_100%)]" />
    <div className="relative mx-auto w-full max-w-[1440px] px-5 py-14 sm:px-10 lg:px-16">
      <p className={label}>BinPar · IA médica · Conocimiento</p>
      <h1 id="blog-page-title" aria-label="Blog de BinPar" className={`${title} mt-5 flex overflow-hidden text-[clamp(110px,24vw,340px)] leading-[1.05] tracking-[-0.075em]`}>
        {"Blog".split("").map((letter, i) => <motion.span aria-hidden="true" key={i} initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ ...transition, delay: reduced ? 0 : i * 0.08 }} className="inline-block">{letter}</motion.span>)}<motion.span aria-hidden="true" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...transition, delay: reduced ? 0 : 0.3 }} className="text-primary-light dark:text-primary-dark">.</motion.span>
      </h1>
      <div className="mt-10 flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
        <div><p className="font-display text-2xl leading-tight font-semibold tracking-tight text-[#05215e] sm:text-3xl dark:text-slate-100">El conocimiento también<br />se comparte.</p><p className="font-body mt-5 max-w-[500px] text-sm leading-6 text-slate-600 sm:text-base sm:leading-7 dark:text-slate-400">Lecturas sobre IA médica, tendencias sanitarias y nuevas formas de transformar la asistencia al paciente.</p></div>
        <Explore reduced={reduced} />
      </div>
    </div>
  </section>;
}
