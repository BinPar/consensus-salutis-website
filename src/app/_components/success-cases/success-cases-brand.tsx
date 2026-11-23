import Image from "next/image";
import type { InstitutionalCase } from "./success-cases-data";

export function InstitutionalLogo({
  item,
  className = "h-12",
}: {
  item: InstitutionalCase;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex max-w-full items-center select-none ${className}`}
    >
      <Image
        src={item.logo}
        alt={item.name}
        draggable={false}
        width={item.width}
        height={item.height}
        className={`pointer-events-none h-full w-auto max-w-full object-contain ${item.darkLogo ? "dark:hidden" : "dark:brightness-0 dark:invert"}`}
      />
      {item.darkLogo && (
        <Image
          src={item.darkLogo}
          alt={item.name}
          draggable={false}
          width={item.width}
          height={item.height}
          className="pointer-events-none hidden h-full w-auto max-w-full object-contain dark:block"
        />
      )}
    </span>
  );
}
