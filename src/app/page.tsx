import {
  HorizontalHome,
  VerticalHome,
} from "~/app/_components/horizontal-home";
import { HomeShell } from "~/app/_components/site";
import { env } from "~/env";

export default function Home() {
  const vertical = env.VERTICAL_HOME;

  return (
    <HomeShell vertical={vertical}>
      {vertical ? <VerticalHome /> : <HorizontalHome />}
    </HomeShell>
  );
}
