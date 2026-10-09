import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SuccessCasesLab } from "./_components/success-cases-lab";
import { caseDirections } from "./_components/case-directions";

export const metadata: Metadata = {
  title: "Casos · Laboratorio visual",
  robots: { index: false, follow: false },
};

export default async function CasesLabPage({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { variant } = await searchParams;
  const direction = caseDirections.find((item) => item.id === variant)?.id;
  return <SuccessCasesLab initialDirection={direction ?? "trace-balanced"} />;
}
