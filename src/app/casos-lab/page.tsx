import { getBlogPosts, getBlogTags } from "~/lib/blog";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SuccessCasesLab } from "./_shared/success-cases-lab";
import { caseDirections } from "./_features/cases/case-directions";
import { productDirections } from "./_features/product/product-directions";
import { homeDirections } from "./_features/home/home-directions";
import { volumeDirections } from "./_features/volume/volume-directions";
import { contactDirections } from "./_features/contact/contact-directions";
import { footerDirections } from "./_features/footer/footer-directions";
import { teamDirections } from "./_features/team-astra/team-directions";
import { parseTeamSol61State } from "./_features/team-sol61/team-sol61-state";
import { parseBlogCardsDirection } from "./_features/blog-cards/blog-cards-directions";

import { parseBlogImagesDirection } from "./_features/blog-images/blog-images-directions";
import { parseBlogPageDirection } from "./_features/blog-page/blog-page-directions";

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
    teamVariant?: string;
    member?: string;
    teamSol61Variant?: string;
    teamSol61View?: string;
    teamSol61Member?: string;
    blogCardsVariant?: string;
    blogImagesVariant?: string;
    blogPageVariant?: string;
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
    teamVariant,
    member,
    teamSol61Variant,
    teamSol61View,
    teamSol61Member,
    blogCardsVariant,
    blogImagesVariant,
    blogPageVariant,
  } = await searchParams;
  const direction = caseDirections.find((item) => item.id === variant)?.id;
  const blogPosts = getBlogPosts();
  const teamSol61State = parseTeamSol61State(
    new URLSearchParams({
      teamSol61Variant: teamSol61Variant ?? "",
      teamSol61View: teamSol61View ?? "",
      teamSol61Member: teamSol61Member ?? "",
    }),
  );
  return (
    <SuccessCasesLab
      blogPosts={blogPosts.slice(0, 4)}
      blogPagePosts={blogPosts}
      blogPageTags={getBlogTags(blogPosts)}
      initialBlogPageDirection={parseBlogPageDirection(blogPageVariant)}
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
                  : lab === "team"
                    ? "team"
                    : lab === "team-sol6-1"
                      ? "team-sol6-1"
                      : lab === "blog-cards"
                        ? "blog-cards"
                        : lab === "blog-images"
                          ? "blog-images"
                          : lab === "blog-page"
                            ? "blog-page"
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
      initialTeamDirection={
        teamDirections.find((item) => item.id === teamVariant)?.id ?? "indice"
      }
      initialTeamMember={member}
      initialTeamSol61Direction={teamSol61State.direction}
      initialTeamSol61View={teamSol61State.view}
      initialTeamSol61Member={teamSol61State.member}
      initialBlogImagesDirection={parseBlogImagesDirection(blogImagesVariant)}
      initialBlogCardsDirection={parseBlogCardsDirection(blogCardsVariant)}
    />
  );
}
