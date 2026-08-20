"use client";

/**
 * Copiar el enlace del informe (issue #6 §1).
 *
 * Es la única compensación por no generar PDF: el informe se reenvía como URL o
 * no se reenvía. Por eso lleva el relleno de acento y por eso no hay botón de
 * imprimir al lado — ofrecer ⌘P sin maquetar la salida prometería algo que no se
 * va a cuidar. Va en segundo lugar, detrás de «Empezar la conversación»: reenviar
 * el informe dentro de la institución importa, pero escribirnos importa antes.
 *
 * Único componente de cliente de la página: el resto se sirve renderizado. El
 * portapapeles exige gesto del usuario y `navigator.clipboard`, así que no hay
 * versión de servidor posible de esta pieza.
 */

import { Check, Link2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function CopyReportLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2400);
    } catch {
      // Sin permiso de portapapeles no hay nada que romper: la URL sigue en la
      // barra de direcciones y escrita en el pie, que existe justo para esto.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="bg-primary-light dark:bg-primary-dark shadow-big-blocks inline-flex min-h-11 items-center gap-2.5 rounded-full px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800 dark:text-[#03111d] dark:hover:bg-[#71fffe]"
    >
      {copied ? (
        <Check aria-hidden="true" strokeWidth={1.8} className="size-4" />
      ) : (
        <Link2 aria-hidden="true" strokeWidth={1.8} className="size-4" />
      )}
      {copied ? "Enlace copiado" : "Copiar enlace del informe"}
      <span aria-live="polite" className="sr-only">
        {copied ? "El enlace del informe se ha copiado al portapapeles." : ""}
      </span>
    </button>
  );
}
