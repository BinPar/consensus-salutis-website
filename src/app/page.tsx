import Link from "next/link";

import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  await api.health.status();

  return (
    <HydrateClient>
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-8">
        <header className="flex items-center justify-between border-b border-slate-200 pb-5">
          <Link href="/" className="text-sm font-semibold">
            Consensus Salutis
          </Link>
          <nav className="flex items-center gap-5 text-sm text-slate-600">
            <Link href="/about" className="hover:text-slate-950">
              About
            </Link>
            <Link href="/contact" className="hover:text-slate-950">
              Contact
            </Link>
          </nav>
        </header>

        <section className="flex flex-1 flex-col justify-center py-24">
          <p className="text-sm font-medium text-slate-500">Base tecnologica</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-slate-950 sm:text-5xl">
            Consensus Salutis
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600">
            Boilerplate T3 preparado para construir el sitio corporativo.
          </p>
        </section>
      </main>
    </HydrateClient>
  );
}
