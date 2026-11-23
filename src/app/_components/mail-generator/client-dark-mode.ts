// Aproximación de lo que hacen los clientes de correo del destinatario en modo
// oscuro. No forma parte de la firma: sirve para ver qué colores calcula cada
// cliente por su cuenta. Invierte la luminosidad conservando el tono, como
// Outlook y Gmail; las imágenes nunca se tocan.
export type ClientScheme = "light" | "keep" | "partial" | "full";

function toHsl(hex: string) {
  const [r, g, b] = [1, 3, 5].map(
    (index) => parseInt(hex.slice(index, index + 2), 16) / 255,
  ) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r
      ? ((g - b) / d + (g < b ? 6 : 0)) / 6
      : max === g
        ? ((b - r) / d + 2) / 6
        : ((r - g) / d + 4) / 6;
  return { h, s, l };
}

function toHex({ h, s, l }: { h: number; s: number; l: number }) {
  const channel = (t: number) => {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const k = (t + 1) % 1;
    const value =
      k < 1 / 6
        ? p + (q - p) * 6 * k
        : k < 1 / 2
          ? q
          : k < 2 / 3
            ? p + (q - p) * (2 / 3 - k) * 6
            : p;
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(h + 1 / 3)}${channel(h)}${channel(h - 1 / 3)}`.toUpperCase();
}

function flip(hex: string, when: (lightness: number) => boolean) {
  const color = toHsl(hex);
  return when(color.l) ? toHex({ ...color, l: 1 - color.l }) : hex;
}

export function recolor(html: string, scheme: ClientScheme) {
  if (scheme === "light" || scheme === "keep") return html;
  const always = () => true;
  // Recoloreado parcial: solo oscurece fondos claros y aclara textos oscuros.
  const background = scheme === "full" ? always : (l: number) => l > 0.5;
  const text = scheme === "full" ? always : (l: number) => l < 0.5;
  return html
    .replace(
      /(background-color:\s*|bgcolor=")(#[0-9a-f]{6})/gi,
      (_, prefix: string, hex: string) => prefix + flip(hex, background),
    )
    .replace(
      /(solid\s+)(#[0-9a-f]{6})/gi,
      (_, prefix: string, hex: string) => prefix + flip(hex, background),
    )
    .replace(
      /((?<![-\w])color:\s*)(#[0-9a-f]{6})/gi,
      (_, prefix: string, hex: string) => prefix + flip(hex, text),
    );
}
