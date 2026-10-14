import { getBlogPosts } from "~/lib/blog";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SuccessCasesLab } from "./_components/success-cases-lab";
import { caseDirections } from "./_components/case-directions";
import { productDirections } from "./_components/product-directions";
import { homeDirections } from "./_components/home-directions";
import { volumeDirections } from "./_components/volume-directions";
import { contactDirections } from "./_components/contact-directions";
import { footerDirections } from "./_components/footer-directions";

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
    volumeVariant?: string;
    contactVariant?: string;
    footerVariant?: string;
  }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const {
    variant,
    lab,
    productVariant,
    homeVariant,
    volumeVariant,
    contactVariant,
    footerVariant,
  } = await searchParams;
  const direction = caseDirections.find((item) => item.id === variant)?.id;
  return (
    <SuccessCasesLab
      blogPosts={getBlogPosts().slice(0, 4)}
      initialDirection={direction ?? "trace-balanced"}
      initialLab={
        lab === "home"
          ? "home"
          : lab === "product"
            ? "product"
            : lab === "volume"
              ? "volume"
              : lab === "contact"
                ? "contact"
                : lab === "footer"
                  ? "footer"
                  : "cases"
      }
      initialProductDirection={
        productDirections.find((item) => item.id === productVariant)?.id ??
        "convergence"
      }
      initialHomeDirection={
        homeDirections.find((item) => item.id === homeVariant)?.id ?? "corpus"
      }
      initialVolumeDirection={
        volumeDirections.find((item) => item.id === volumeVariant)?.id ??
        "editorial"
      }
      initialFooterDirection={
        footerDirections.find((item) => item.id === footerVariant)?.id ??
        "reference"
      }
      initialContactDirection={
        contactDirections.find((item) => item.id === contactVariant)?.id ??
        "assistant"
      }
    />
  );
}
