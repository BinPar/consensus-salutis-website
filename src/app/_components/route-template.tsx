import { RouteEntrance } from "~/app/_components/motion-system";

/** Entrada animada de cada página; la comparten todos los árboles raíz. */
export default function RouteTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteEntrance>{children}</RouteEntrance>;
}
