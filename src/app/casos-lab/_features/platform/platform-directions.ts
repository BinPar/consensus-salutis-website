export const platformDirections = [
  { id: "reference", number: "01", label: "Referencia" },
  { id: "explorer", number: "02", label: "Explorador" },
  { id: "mosaic", number: "03", label: "Mosaico" },
  { id: "journey", number: "04", label: "Recorrido" },
  { id: "catalog", number: "05", label: "Catálogo" },
  { id: "disclosure", number: "06", label: "Desplegable" },
] as const;

export type PlatformDirection = (typeof platformDirections)[number]["id"];
export type PlatformToolsDirection = Exclude<PlatformDirection, "reference">;

export function parsePlatformDirection(
  value?: string | null,
): PlatformDirection {
  return (
    platformDirections.find((direction) => direction.id === value)?.id ??
    "reference"
  );
}
