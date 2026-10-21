"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { BlogPost } from "~/lib/blog";
import { BlogPageReferenceCard } from "./blog-page-reference-card";
import { BlogPageReveal } from "./blog-page-reveal";

export function BlogPageAnimatedGrid({ posts }: { posts: BlogPost[] }) {
  const grid = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);

  useLayoutEffect(() => {
    const element = grid.current;
    if (!element) return;
    // La cadencia se reinicia en cada fila, también cuando cambia el ancho.
    const measure = () => {
      const tracks = getComputedStyle(element).gridTemplateColumns;
      setColumns(tracks === "none" ? 1 : tracks.trim().split(/\s+/).length);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={grid}
      data-blog-animated-grid=""
      className="mt-14 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {posts.map((post, index) => (
        <BlogPageReveal
          key={post.slug}
          className="h-full"
          delay={(index % columns) * 0.08}
        >
          <BlogPageReferenceCard article={post} />
        </BlogPageReveal>
      ))}
    </div>
  );
}
