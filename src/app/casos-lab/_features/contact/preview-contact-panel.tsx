"use client";

// Local copy of the reference panel; production markup stays untouched.
import { Reveal } from "~/app/_components/motion-system";
import { ProductSignalAccent } from "~/app/_components/horizontal-home";
import { Eyebrow } from "~/app/_components/site";
import { IntroductionBottomFade } from "~/app/_components/success-cases/success-cases-surfaces";
import { PreviewContactForm } from "./preview-contact-form";

type DesktopLayout = "horizontal" | "vertical";
type PanelHeight = "natural" | "viewport";
type PanelRef = (node: HTMLElement | null) => void;

function PreviewPanel({
  id,
  children,
  className = "",
  panelRef,
  layout = "horizontal",
  height = "natural",
  fadeBottom = false,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  panelRef: PanelRef;
  layout?: DesktopLayout;
  height?: PanelHeight;
  fadeBottom?: boolean;
}) {
  const layoutClassName =
    layout === "horizontal"
      ? "flex h-full w-screen shrink-0 items-center px-10 py-12"
      : height === "viewport"
        ? "flex min-h-[calc(100svh)] items-center px-10 py-20"
        : "px-10 py-18";

  return (
    <section
      id={id}
      tabIndex={id ? -1 : undefined}
      data-section-anchor={id ? "" : undefined}
      ref={panelRef}
      className={`relative overflow-hidden ${layout === "vertical" ? "section-navigation-inset" : ""} ${layoutClassName} ${className}`}
    >
      {fadeBottom && <IntroductionBottomFade />}
      <div className="relative z-10 mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}

export function PreviewContactPanel({
  visible,
  panelRef,
  layout = "horizontal",
}: {
  visible: boolean;
  panelRef: PanelRef;
  layout?: DesktopLayout;
}) {
  return (
    <PreviewPanel
      className="min-h-fit bg-[#deedf3]/82 dark:bg-[#030916]/82"
      panelRef={panelRef}
      layout={layout}
      height={layout === "vertical" ? "natural" : "viewport"}
    >
      <ProductSignalAccent className="-top-30 -left-35 w-170" />
      <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="relative">
          {/* <ContactSignalAccent /> */}
          <div className="relative z-10">
            <Reveal visible={visible}>
              <Eyebrow>Siguiente paso</Eyebrow>
            </Reveal>
            <Reveal visible={visible} delay={0.1}>
              <h2 className="font-display mt-4 max-w-3xl text-5xl font-extrabold tracking-tight text-[#05215e] dark:text-slate-50">
                Una conversación seria sobre tu organización sanitaria.
              </h2>
            </Reveal>
            <Reveal visible={visible} delay={0.2}>
              <p className="font-body mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                Revisamos caso de uso, restricciones de seguridad, requisitos de
                integración y el nivel de evidencia necesario para un piloto
                institucional.
              </p>
            </Reveal>
          </div>
        </div>
        <Reveal visible={visible} delay={0.3}>
          <PreviewContactForm compact />
        </Reveal>
      </div>
    </PreviewPanel>
  );
}
