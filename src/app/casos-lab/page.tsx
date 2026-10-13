import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SuccessCasesLab } from "./_components/success-cases-lab";
import { caseDirections } from "./_components/case-directions";
import { productDirections } from "./_components/product-directions";
import { homeDirections } from "./_components/home-directions";

export const metadata: Metadata = {
  title: "Laboratorio visual",
  robots: { index: false, follow: false },
};

export default async function CasesLabPage({
  searchParams,
}: {
  searchParams: Promise<{
    variant?: string;
    lab?: string;
    productVariant?: string;
    homeVariant?: string;
  }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { variant, lab, productVariant, homeVariant } = await searchParams;
  const direction = caseDirections.find((item) => item.id === variant)?.id;
  return (
    <SuccessCasesLab
      initialDirection={direction ?? "trace-balanced"}
      initialLab={
        lab === "home" ? "home" : lab === "product" ? "product" : "cases"
      }
      initialProductDirection={
        productDirections.find((item) => item.id === productVariant)?.id ??
        "convergence"
      }
      initialHomeDirection={
        homeDirections.find((item) => item.id === homeVariant)?.id ?? "corpus"
      }
    />
  );
}
