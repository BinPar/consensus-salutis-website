"use client";

import { MailGenerator } from "~/app/_components/mail-generator/mail-generator";
import type { EmailSignaturesDirection } from "./email-signatures-directions";
import "./email-signatures-lab.css";

export function EmailSignaturesLab({
  direction,
}: {
  direction: EmailSignaturesDirection;
}) {
  return (
    <div data-mail-generator-lab="">
      <MailGenerator
        assetOrigin="https://consensussalutis.com"
        variant={direction}
        previewId="email-signatures-preview"
      />
    </div>
  );
}
