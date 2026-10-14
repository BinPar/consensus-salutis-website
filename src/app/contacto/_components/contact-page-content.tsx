"use client";

import { ContactAssistant } from "~/app/_components/contact-assistant/contact-assistant";
import { HomePaintPanel } from "~/app/_components/home-paint-panel";
import { SignalField } from "~/app/_components/motion-system";
import { ProductSignalLeft } from "~/app/_components/product-signal-left";
import { ContactDetails } from "./contact-details";

export function ContactPageContent() {
  return (
    <>
      <HomePaintPanel>
        {(visible, panelRef) => (
          <div
            ref={panelRef}
            data-contact-painted={visible}
            className="relative pt-16 [clip-path:inset(0)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none fixed inset-0 -right-50 z-0"
            >
              <SignalField
                className="-top-48 h-[calc(100%+12rem)]"
                intensity="hero"
                opacity={0.72}
              />
            </div>
            <ProductSignalLeft className="fixed -bottom-80 -left-200 w-250 rotate-20 sm:-left-155" />
            <ContactAssistant layout="page" active={visible} />
          </div>
        )}
      </HomePaintPanel>
      <HomePaintPanel>
        {(visible, panelRef) => (
          <ContactDetails visible={visible} panelRef={panelRef} />
        )}
      </HomePaintPanel>
    </>
  );
}
