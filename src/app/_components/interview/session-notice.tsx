/**
 * «No hay sesión utilizable», en un solo sitio.
 *
 * Sale por dos caminos que no se pueden juntar: la página de servidor, cuando la
 * cookie no verifica antes de pintar nada, y el componente de cliente, cuando el
 * endpoint responde 401 a mitad de la entrevista. El estado es el mismo y el
 * texto tiene que ser el mismo, así que vive aquí y no duplicado en los dos —dos
 * copias de un texto de producto divergen a la primera revisión de copy.
 *
 * Sin `"use client"`: es marcado estático, así que sirve igual desde el servidor
 * y desde dentro de un componente de cliente.
 */

import Link from "next/link";

import { Eyebrow } from "~/app/_components/eyebrow";

export function SessionNotice({ expired }: { expired: boolean }) {
  return (
    <div className="relative z-10 mx-auto w-full max-w-2xl px-5 pt-32 pb-24 sm:px-8">
      <div className="shadow-big-blocks rounded-3xl border border-cyan-800/20 bg-white/85 p-7 backdrop-blur-sm dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:shadow-2xl dark:shadow-cyan-950/30">
        <Eyebrow>{expired ? "Sesión caducada" : "Evaluación no iniciada"}</Eyebrow>
        <h1 className="font-display mt-4 text-2xl font-extrabold tracking-tight text-[#05215e] sm:text-3xl dark:text-slate-50">
          {expired
            ? "Necesitamos que vuelvas a identificarte"
            : "Empieza por identificarte"}
        </h1>
        {/*
          El mensaje dice qué ha pasado, qué se conserva y qué hacer. Es lo que
          separa esto de un fallo silencioso: quien lleva ocho minutos
          respondiendo necesita saber, antes que nada, que no ha perdido nada.
        */}
        <p className="font-body mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {expired
            ? "Por seguridad, la sesión de la evaluación caduca al cabo de un tiempo. Todo lo que habías respondido sigue guardado: al identificarte con el mismo correo retomarás la entrevista donde la dejaste."
            : "La entrevista arranca desde la ficha de identificación. Son cinco campos y menos de un minuto; después empieza la conversación."}
        </p>
        <Link
          href="/evaluador"
          className="bg-primary-light font-body dark:bg-primary-dark dark:hover:bg-primary-dark-lighter focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark mt-6 inline-flex min-h-10 items-center rounded-full px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-[#04111e] dark:shadow-[0_0_34px_rgba(45,212,191,0.26)]"
        >
          {expired ? "Volver a identificarme" : "Ir al formulario"}
        </Link>
      </div>
    </div>
  );
}
