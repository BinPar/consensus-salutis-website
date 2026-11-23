"use client";

import Image from "next/image";

// Shared only inside the visual laboratory. Add supplied photographs here to
// update every Astra and Sol6.1 team view and profile together.
export const realTeamPortraits: Readonly<Record<string, string>> = {
  "adrian-rodriguez": "/lab/team-portraits/adrian-rodriguez.jpg",
  "alberto-blanco": "/lab/team-portraits/alberto-blanco.jpg",
  "beatriz-ortega": "/lab/team-portraits/beatriz-ortega.jpg",
  "carolina-carcamo": "/lab/team-portraits/carolina-carcamo.jpg",
  "cristian-alvarez": "/lab/team-portraits/cristian-alvarez.jpg",
  "fabian-padilla": "/lab/team-portraits/fabian-padilla.jpg",
  "guillermo-hernandez": "/lab/team-portraits/guillermo-hernandez.jpg",
  "ignacio-ferro": "/lab/team-portraits/ignacio-ferro.jpg",
  "isabel-ferro": "/lab/team-portraits/isabel-ferro.jpg",
  "jeronimo-ekerdt": "/lab/team-portraits/jeronimo-ekerdt.jpg",
  "jimmy-montano": "/lab/team-portraits/jimmy-montano.jpg",
  "marcos-gonzalez": "/lab/team-portraits/marcos-gonzalez.jpg",
  "nicolas-arianoutsos": "/lab/team-portraits/nicolas-arianoutsos.jpg",
  "pablo-emilio": "/lab/team-portraits/pablo-emilio.jpg",
  "yaiza-vallejo": "/lab/team-portraits/yaiza-vallejo.jpg",
};

const framing: Readonly<Record<string, { scale: number; origin: string }>> = {
  "cristian-alvarez": { scale: 1.12, origin: "50% 24%" },
  "marcos-gonzalez": { scale: 1.22, origin: "50% 24%" },
  "jeronimo-ekerdt": { scale: 1.22, origin: "50% 25%" },
  "yaiza-vallejo": { scale: 1.15, origin: "50% 42%" },
  "carolina-carcamo": { scale: 1.08, origin: "50% 15%" },
};

export function RealTeamPortrait({
  slug,
  name,
  className = "",
  priority = false,
  unoptimized = false,
  sizes = "(max-width: 640px) 100vw, 600px",
  onError,
}: {
  slug: string;
  name: string;
  className?: string;
  priority?: boolean;
  unoptimized?: boolean;
  sizes?: string;
  onError?: () => void;
}) {
  const src = realTeamPortraits[slug];
  if (!src) return null;
  const crop = framing[slug];
  return (
    <Image
      src={src}
      alt={name}
      width={1254}
      height={1254}
      priority={priority}
      unoptimized={unoptimized}
      sizes={sizes}
      onError={onError}
      data-team-portrait={slug}
      className={`lab-team-real-portrait ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: "saturate(0.75)",
        transform: crop ? `scale(${crop.scale})` : undefined,
        transformOrigin: crop?.origin,
      }}
    />
  );
}
