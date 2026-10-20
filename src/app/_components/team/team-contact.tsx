"use client";

import { ContactAssistant } from "~/app/_components/contact-assistant/contact-assistant";
import { HomePaintPanel } from "~/app/_components/home-paint-panel";
import { HomeMotionBackground } from "~/app/_components/motion-system";

export function TeamContact() {
  return (
    <HomePaintPanel>
      {(visible, panelRef) => (
        <div
          ref={panelRef}
          id="contacto"
          tabIndex={-1}
          className="relative isolate scroll-mt-24 [clip-path:inset(0)] focus:outline-none"
        >
          <HomeMotionBackground />
          <div className="relative z-10">
            <ContactAssistant active={visible} />
          </div>
        </div>
      )}
    </HomePaintPanel>
  );
}
