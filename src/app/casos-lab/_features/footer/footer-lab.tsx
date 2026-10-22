"use client";

import { ReferenceFooter } from "~/app/_components/site-footer";
import { ContactLab } from "../contact/contact-lab";
import type { ContactDirection } from "../contact/contact-directions";
import type { FooterDirection } from "./footer-directions";
import { FooterProposal } from "./footer-proposals";

export function FooterLab({
  context,
  replay,
  direction,
  contactDirection,
}: {
  context: boolean;
  replay: number;
  direction: FooterDirection;
  contactDirection: ContactDirection;
}) {
  return (
    <div aria-label="Laboratorio de footer" className="relative z-10">
      {context && (
        <ContactLab
          context={false}
          replay={replay}
          posts={[]}
          direction={contactDirection}
        />
      )}
      <div
        key={`${direction}-${replay}`}
        id="footer-preview"
        className="relative [scroll-margin-top:calc(var(--lab-toolbar-height,80px)+24px)]"
      >
        {direction === "reference" ? (
          <ReferenceFooter />
        ) : (
          <FooterProposal direction={direction} />
        )}
      </div>
    </div>
  );
}
