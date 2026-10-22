"use client";

import {
  BlogContent,
  ProductSignalAccent,
} from "~/app/_components/horizontal-home";
import { PreviewContactForm } from "./preview-contact-form";
import { PreviewContactPanel } from "./preview-contact-panel";
import { ViewportReveal } from "~/app/_components/motion-system";
import { Eyebrow, ThemeSection } from "~/app/_components/site";
import { VerticalFooter } from "~/app/_components/site-footer";
import type { BlogPost } from "~/lib/blog";
import { ContactAssistant } from "./contact-assistant";
import type { ContactDirection } from "./contact-directions";

export function ContactLab({
  context,
  replay,
  posts,
  direction,
}: {
  context: boolean;
  replay: number;
  posts: BlogPost[];
  direction: ContactDirection;
}) {
  return (
    <main aria-label="Laboratorio de contacto" className="relative z-10">
      {context && posts.length > 0 && (
        <ThemeSection
          compact
          variant="transparent"
          className="bg-white dark:bg-transparent"
        >
          <div className="mx-auto w-[calc(100%-40px)] max-w-7xl md:w-[calc(100%-80px)]">
            <div className="hidden lg:block">
              <BlogContent posts={posts} />
            </div>
            <div className="lg:hidden">
              <BlogContent compact posts={posts} />
            </div>
          </div>
        </ThemeSection>
      )}
      <div
        key={`${direction}-${replay}`}
        id="contact-preview"
        className="relative [scroll-margin-top:calc(var(--lab-toolbar-height,80px)+24px)]"
      >
        {direction === "assistant" ? (
          <ContactAssistant />
        ) : (
          <>
            <div className="hidden lg:block">
              <PreviewContactPanel
                visible
                panelRef={() => undefined}
                layout="vertical"
              />
            </div>
            <ThemeSection compact variant="deep" className="lg:hidden">
              <div className="relative px-5 sm:px-10">
                <ProductSignalAccent className="-top-24 -left-18 w-120" />
                <ViewportReveal className="relative z-10">
                  <Eyebrow>Contacto</Eyebrow>
                  <h2 className="font-display mt-4 max-w-110 text-3xl font-extrabold tracking-tight text-[#05215e] sm:text-4xl dark:text-slate-50">
                    Hablemos de tu organización sanitaria.
                  </h2>
                  <p className="font-body mt-3.5 max-w-120 text-base leading-7 text-slate-600 sm:mt-5 dark:text-slate-400">
                    Revisamos caso de uso, restricciones de seguridad,
                    requisitos de integración y el nivel de evidencia necesario.
                  </p>
                </ViewportReveal>
                <PreviewContactForm className="mt-10" />
              </div>
            </ThemeSection>
          </>
        )}
      </div>
      {context && <VerticalFooter />}
    </main>
  );
}
