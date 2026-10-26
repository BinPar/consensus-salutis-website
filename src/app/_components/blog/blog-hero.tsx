"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useRef } from "react";
import { useBlogHydrated } from "./use-blog-hydrated";
import { BlogFeaturedArticle } from "./blog-featured-article";
import { blogContentWidth } from "./blog-layout";
import {
  HomeMotionBackground,
  SignalField,
} from "~/app/_components/motion-system";
import { FixedSignalLayer } from "~/app/_components/horizontal-home";
import { ProductSignalLeft } from "~/app/_components/product-signal-left";
import type { BlogPost } from "~/lib/blog";

const ease = [0.22, 1, 0.36, 1] as const;
function Copy({
  centered,
  visible,
  reduced,
}: {
  centered: boolean;
  visible: boolean;
  reduced: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={visible ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: reduced ? 0 : 0.9,
        delay: reduced ? 0 : 0.35,
        ease,
      }}
      className={`relative z-10 ${centered ? "mx-auto max-w-[720px] text-center" : "min-w-0 max-[900px]:text-center"}`}
    >
      <p className="font-display text-primary-light dark:text-primary-dark text-xs font-bold tracking-[0.22em] uppercase">
        Lecturas clínicas · Blog
      </p>
      <h1
        id="blog-page-title"
        className="font-display mt-5 max-w-4xl text-[32px] leading-[1.08] font-extrabold tracking-tight text-[#05215e] sm:text-[40px] lg:text-[54px] dark:text-slate-50"
      >
        El conocimiento
        <br />
        <span className="text-primary-light dark:text-primary-dark">
          sigue avanzando.
        </span>
      </h1>
      <p
        className={`font-body mt-5 max-w-2xl text-sm leading-6 text-slate-600 sm:text-lg sm:leading-8 dark:text-slate-400 ${centered ? "mx-auto" : "max-[900px]:mx-auto"}`}
      >
        Exploramos la evolución de la IA médica y su papel en la práctica
        clínica. Compartimos lecturas y perspectivas para comprender los
        avances, contrastar enfoques y acercar el conocimiento a los retos
        cotidianos de la atención al paciente.
      </p>
      <a
        href="#blog-page-gallery"
        onClick={(event) => {
          const target = document.getElementById("blog-page-gallery");
          if (!target) return;
          event.preventDefault();
          target.scrollIntoView({
            behavior: reduced ? "instant" : "smooth",
            block: "start",
          });
          target.focus({ preventScroll: true });
        }}
        className="font-body bg-primary-light dark:bg-primary-dark focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark mt-7 inline-flex min-h-11 items-center justify-center gap-3 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-4 dark:text-[#04111e] dark:hover:bg-primary-dark/85"
      >
        Explorar artículos{" "}
        <ArrowDown size={17} strokeWidth={1.8} aria-hidden="true" />
      </a>
    </motion.div>
  );
}

function EntranceStage({
  post,
  postNumber,
}: {
  post?: BlogPost;
  postNumber: number;
}) {
  const root = useRef<HTMLElement>(null);
  const visible = useInView(root, { once: true, amount: 0.15 });
  const hydrated = useBlogHydrated();
  const motionPreference = useReducedMotion();
  // El primer render coincide con el servidor; la preferencia se aplica al hidratar.
  const reduced = hydrated && !!motionPreference;
  const split = !!post;
  const scene = (
    <BlogFeaturedArticle visible={visible} reduced={reduced} post={post} />
  );
  return (
    <section
      ref={root}
      aria-labelledby="blog-page-title"
      data-blog-entrance="horizon"
      className="relative isolate flex min-h-[calc(100svh-var(--blog-header-height,64px)+64px)] items-center overflow-hidden bg-[#fbfdff] pt-16 [clip-path:inset(0)] dark:bg-[#06111f]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_calc(100%_-_280px),#000c_calc(100%_-_180px),#0004_calc(100%_-_70px),transparent)]"
      >
        <HomeMotionBackground />
        <div className="hidden lg:block">
          <FixedSignalLayer />
        </div>
        <div className="lg:hidden">
          <SignalField intensity="hero" opacity={0.72} className="fixed" />
        </div>
        <ProductSignalLeft className="fixed -bottom-80 -left-200 w-250 rotate-20 sm:-left-155" />
      </div>
      <div
        className={`${blogContentWidth} relative z-10 py-20 ${split ? "grid items-center gap-8 max-[900px]:py-16 min-[900px]:grid-cols-[1.15fr_0.85fr] min-[900px]:gap-12" : ""}`}
      >
        <div
          data-blog-copy-anchor=""
          className="min-w-0"
          style={{ translate: "var(--blog-copy-offset, 0px 0px)" }}
        >
          <Copy centered={!split} visible={visible} reduced={reduced} />
        </div>
        {split && (
          <div
            data-blog-mock-anchor=""
            className="relative w-full min-w-0 max-[900px]:mx-auto max-[900px]:max-w-[420px]"
          >
            {post && (
              <p className="font-body absolute top-full right-0 mt-3 flex items-baseline justify-end gap-2 text-xs leading-5 font-medium whitespace-nowrap text-slate-500 tabular-nums dark:text-slate-400">
                <span>Última entrada</span>
                <span aria-hidden="true">·</span>
                <span>Nº {String(postNumber).padStart(2, "0")}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={post.date}>{post.createdAtLabel}</time>
              </p>
            )}
            {scene}
          </div>
        )}
      </div>
    </section>
  );
}

export function BlogHero({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="relative">
      <EntranceStage post={posts[0]} postNumber={posts.length} />
    </div>
  );
}
