import type { RefObject } from "react";

function LinkedInLabel() {
  return (
    <>
      <span className="social-follow-label">Síguenos</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="currentColor"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    </>
  );
}

export function SideLinkedInLink({
  visible,
  contrastRef,
}: {
  visible: boolean;
  contrastRef: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <a
      href="https://www.linkedin.com/company/binpar/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Sigue a BinPar en LinkedIn (se abre en una pestaña nueva)"
      className="social-follow font-body"
      data-visible={visible}
      aria-hidden={!visible}
      inert={!visible}
    >
      <span className="social-follow-content" aria-hidden="true">
        <LinkedInLabel />
      </span>
      <span
        ref={contrastRef}
        className="social-follow-content social-follow-contrast"
        aria-hidden="true"
      >
        <LinkedInLabel />
      </span>
    </a>
  );
}
