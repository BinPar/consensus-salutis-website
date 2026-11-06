export const platformClaudeDirections = [
  { id: "reference", number: "01", label: "Referencia" },
  { id: "grid", number: "02", label: "Retícula" },
  { id: "rail", number: "03", label: "Carril" },
  { id: "focus", number: "04", label: "Foco" },
  { id: "guided", number: "05", label: "Guiado" },
  { id: "bellows", number: "06", label: "Fuelle" },
  { id: "index", number: "07", label: "Índice" },
  { id: "journey", number: "08", label: "Recorrido" },
  { id: "journey-2", number: "09", label: "Recorrido 2" },
  { id: "journey-3", number: "10", label: "Recorrido 3" },
  { id: "journey-4", number: "11", label: "Recorrido 4" },
] as const;

export type PlatformClaudeDirection =
  (typeof platformClaudeDirections)[number]["id"];

export function parsePlatformClaudeDirection(
  value?: string | null,
): PlatformClaudeDirection {
  return (
    platformClaudeDirections.find((direction) => direction.id === value)?.id ??
    "reference"
  );
}
