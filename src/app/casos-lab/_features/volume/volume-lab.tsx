"use client";

import {
  BlogContent,
  MetricsIntro,
  MetricsPanel,
  StaggeredMetricGrid,
} from "~/app/_components/horizontal-home";
import { ProductStrataSection } from "~/app/_components/product-strata/product-strata-section";
import { ThemeSection } from "~/app/_components/site";
import type { BlogPost } from "~/lib/blog";
import { VolumeProposal } from "./volume-proposals";
import type { VolumeDirection } from "./volume-directions";

export function VolumeLab({
  direction,
  context,
  replay,
  posts,
}: {
  direction: VolumeDirection;
  context: boolean;
  replay: number;
  posts: BlogPost[];
}) {
  return (
    <main aria-label="Laboratorio de volumen" className="relative z-10">
      {context && <ProductStrataSection layout="mobile" />}
      <div
        key={`${direction}-${replay}`}
        id="volume-preview"
        className="relative [scroll-margin-top:calc(var(--lab-toolbar-height,80px)+24px)]"
      >
        {direction === "reference" ? (
          <>
            <div className="hidden lg:block">
              <MetricsPanel
                visible
                panelRef={() => undefined}
                layout="vertical"
              />
            </div>
            <ThemeSection compact variant="deep" className="lg:hidden">
              <div className="px-5 sm:px-10">
                <MetricsIntro compact />
                <StaggeredMetricGrid className="mt-8" />
              </div>
            </ThemeSection>
          </>
        ) : (
          <VolumeProposal direction={direction} />
        )}
      </div>
      {context && posts.length > 0 && (
        <ThemeSection
          compact
          variant="transparent"
          className="bg-white dark:bg-transparent"
        >
          <div className="mx-auto w-[calc(100%-40px)] max-w-7xl md:w-[calc(100%-80px)]">
            <div className="lg:hidden">
              <BlogContent compact posts={posts} />
            </div>
            <div className="hidden lg:block">
              <BlogContent posts={posts} />
            </div>
          </div>
        </ThemeSection>
      )}
    </main>
  );
}
