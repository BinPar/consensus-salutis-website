"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { BlogPost } from "~/lib/blog";
import { BlogArticleCard } from "~/app/_components/blog-article-card";
import { BlogReveal } from "./blog-reveal";

export function BlogAnimatedGrid({ posts }: { posts: BlogPost[] }) {
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
        <BlogReveal
          key={post.slug}
          className="h-full"
          delay={(index % columns) * 0.08}
        >
          <BlogArticleCard article={post} />
        </BlogReveal>
      ))}
    </div>
  );
}
