import type { Metadata } from "next";

import {
  HorizontalHome,
  VerticalHome,
} from "~/app/_components/horizontal-home";
import { localizeBlogPosts } from "~/app/_components/blog/localize-blog-posts";
import { HomeShell } from "~/app/_components/site";
import { env } from "~/env";
import { localizedMetadata } from "~/i18n/metadata";
import { resolveLocale, type LocaleParams } from "~/i18n/server";
import { getBlogPosts } from "~/lib/blog";

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);

  return localizedMetadata(locale, "/");
}

export default async function Home({ params }: LocaleParams) {
  const locale = await resolveLocale(params);

  const vertical = env.VERTICAL_HOME;
  /*
    Los posts se leen aquí y bajan por props: el loader es `node:fs` y las dos
    homes son componentes de cliente.
  */
  const posts = await localizeBlogPosts(getBlogPosts(locale), locale);

  return (
    <HomeShell vertical={vertical}>
      {vertical ? (
        <VerticalHome posts={posts} />
      ) : (
        <HorizontalHome posts={posts} />
      )}
    </HomeShell>
  );
}
