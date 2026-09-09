import {
  HorizontalHome,
  VerticalHome,
} from "~/app/_components/horizontal-home";
import { HomeShell } from "~/app/_components/site";
import { env } from "~/env";
import { getBlogPosts } from "~/lib/blog";

export default function Home() {
  const vertical = env.VERTICAL_HOME;
  /*
    Los posts se leen aquí y bajan por props: el loader es `node:fs` y las dos
    homes son componentes de cliente.
  */
  const posts = getBlogPosts();

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
