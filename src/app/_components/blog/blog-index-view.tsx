import { BlogHero } from "./blog-hero";
import { BlogGallery, type BlogGalleryProps } from "./blog-gallery";

/** Presentación Horizonte, con el header y el footer de producción en PageShell. */
export function BlogIndexView(props: BlogGalleryProps) {
  return (
    <main className="relative bg-[#fbfdff] pt-16 dark:bg-[#06111f]">
      <BlogHero posts={props.allPosts} />
      <BlogGallery {...props} />
    </main>
  );
}
