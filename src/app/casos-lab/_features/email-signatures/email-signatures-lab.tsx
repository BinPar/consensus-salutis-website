"use client";

import { MailGenerator } from "~/app/_components/mail-generator/mail-generator";
import { SIGNATURE_ASSET_ORIGIN } from "~/app/_components/mail-generator/signature-assets";
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
        assetOrigin={SIGNATURE_ASSET_ORIGIN}
        variant={direction}
        previewId="email-signatures-preview"
      />
    </div>
  );
}
