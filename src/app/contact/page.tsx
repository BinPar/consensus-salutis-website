import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-8">
      <header className="border-b border-slate-200 pb-5">
        <Link href="/" className="text-sm font-semibold">
          Consensus Salutis
        </Link>
      </header>
      <section className="py-24">
        <h1 className="text-3xl font-semibold">Contact</h1>
        <p className="mt-6 max-w-2xl leading-7 text-slate-600">
          Pagina reservada para definir los canales de contacto.
        </p>
      </section>
    </main>
  );
}
