// Firmas de correo en HTML: tablas y estilos en línea, sin <style>, clases ni
// SVG, para que Outlook, Gmail y Apple Mail las conserven al pegar. El texto es
// texto real; solo la fotografía, la tesela, los iconos y el logotipo son
// imágenes, a su tamaño y sin deformarse.
export type SignatureData = {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phone?: string;
  // Identificador de la persona en la sección de equipo; su fotografía se toma
  // de /images/team/{slug}.jpg. Sin ella, la tesela oficial.
  photo?: string;
};

export type ContactIcon = "mail" | "phone" | "map-pin" | "globe";
export type ContactRow = { icon: ContactIcon; label: string; href: string };

const display = "Sora,'Segoe UI',Helvetica,Arial,sans-serif";
const body = "'Plus Jakarta Sans','Segoe UI',Helvetica,Arial,sans-serif";

// Valores del manual por tema. Los filetes son el cian al 15–20 % ya mezclado
// con su superficie: Outlook no admite transparencia en los bordes.
const night = {
  surface: "#06111F",
  headline: "#F8FAFC",
  accent: "#00BCBB",
  text: "#90A1B9",
  hairline: "#153C4B",
  icon: "turquoise",
  iconSize: 16,
  tile: "tile-dark@3x.png",
  logo: "logo-dark-24@3x.png",
};
// Tema claro de Abierta: sin superficie propia, los clientes en modo oscuro
// aclaran sus textos y la firma sigue legible.
// Nombre y datos en slate casi negro y neutro: al invertirlos, los clientes los
// llevan a casi blanco en lugar de a un azul o un gris apagado.
const light: Theme = {
  surface: "#06111F",
  headline: "#0F172B",
  accent: "#006D79",
  text: "#1D293D",
  hairline: "#D9E7EB",
  // Iconos en tesela oscura, como el logotipo: no cambian en ningún modo.
  icon: "tile",
  iconSize: 24,
  // Sin foto, siempre la tesela oscura.
  tile: "tile-dark@3x.png",
  logo: "logo-dark-24@3x.png",
};
type Theme = {
  surface: string;
  headline: string;
  accent: string;
  text: string;
  hairline: string;
  icon: string;
  iconSize: number;
  tile: string;
  logo: string;
};

export const company = {
  web: "https://binpar.com",
  office: "Paseo de la Castellana 43, Madrid",
  map: "https://maps.google.com/?q=Paseo+de+la+Castellana+43,+28046+Madrid",
};

// Texto legal oficial de BINPAR TEAM, S.L.
const legalText = [
  "ADVERTENCIA | La información contenida en este correo electrónico, y en su caso, cualquier fichero anexo al mismo, son de carácter privado y confidencial siendo para uso exclusivo de su destinatario. Si usted no es el destinatario correcto, el empleado o agente responsable de entregar el mensaje al destinatario, o ha recibido esta comunicación por error, le informamos que está totalmente prohibida cualquier divulgación, distribución o reproducción de esta comunicación según la legislación vigente y le rogamos que nos lo notifique inmediatamente, procediendo a su destrucción sin continuar su lectura. Le informamos que su dirección de correo electrónico, así como el resto de los datos de carácter personal de la tarjeta de visita que nos facilite, podrían ser objeto de tratamiento automatizado en nuestros sistemas de información, con la finalidad de gestionar la agenda de contactos de BINPAR TEAM, S.L. Usted puede en cualquier momento ejercer sus derechos de acceso, rectificación, cancelación y oposición en los términos establecidos en el Reglamento (UE) 2016/679 de Protección de Datos y la Ley Orgánica 3/2018 de 5 de diciembre de Protección de Datos de Carácter Personal y Garantías de Derechos Digitales (LOPDGDD) mediante notificación escrita, aportando copia del DNI o tarjeta identificativa, a ",
  "Isabel@binpar.com",
  ". Usted puede consultar nuestra política de Protección de Datos en ",
  "www.binpar.com",
] as const;

// Slate 500: un tono medio legible sobre fondos claros y oscuros.
const neutral = "#62748E";

const table = (style = "") =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;${style}">`;

function escape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function type(family: string, size: number, lineHeight: number, rest: string) {
  return `font-family:${family};font-size:${size}px;line-height:${lineHeight}px;mso-line-height-rule:exactly;${rest}`;
}

// Imagen a su tamaño exacto: nunca se amplía, se estrecha ni se deforma.
function image(
  src: string,
  width: number,
  height: number,
  alt: string,
  extra = "",
) {
  return `<img src="${escape(src)}" width="${width}" height="${height}" alt="${escape(alt)}" style="display:block;width:${width}px;min-width:${width}px;max-width:none;height:${height}px;border:0;outline:none;text-decoration:none;${extra}">`;
}

// Recursos de la firma, publicados con la web junto a las fotos de equipo.
const asset = (base: string, file: string) => `${base}/email-signature/${file}`;

export function fullName(data: SignatureData) {
  return `${data.firstName} ${data.lastName}`.trim();
}

export function contactRows(data: SignatureData): ContactRow[] {
  const phone = data.phone?.trim();
  const rows: ContactRow[] = [
    { icon: "mail", label: data.email, href: `mailto:${data.email}` },
  ];
  if (phone)
    rows.push({
      icon: "phone",
      label: phone,
      href: `tel:${phone.replace(/[^\d+]/g, "")}`,
    });
  rows.push(
    { icon: "globe", label: "binpar.com", href: company.web },
    { icon: "map-pin", label: company.office, href: company.map },
  );
  return rows;
}

// Fotografía de la sección de equipo, con radio de 16 px; sin ella, la tesela.
function aside(data: SignatureData, theme: Theme, base: string, size: number) {
  return data.photo
    ? image(
        `${base}/images/team/${data.photo}.jpg`,
        size,
        size,
        fullName(data),
        "border-radius:16px;",
      )
    : image(asset(base, theme.tile), 48, 48, "BinPar");
}

function identity(data: SignatureData, theme: Theme) {
  return `<div style="${type(display, 10, 14, `font-weight:700;letter-spacing:2.2px;text-transform:uppercase;color:${theme.accent};`)}">${escape(data.role)}</div><div style="padding-top:6px;${type(display, 20, 25, `font-weight:800;letter-spacing:-0.4px;color:${theme.headline};`)}">${escape(fullName(data))}</div>`;
}

// Cada dato con su icono Lucide (16 px, trazo 1,8) y su enlace.
function details(data: SignatureData, theme: Theme, base: string) {
  const gap = theme.iconSize > 16 ? 6 : 9;
  return `${table()}${contactRows(data)
    .map(
      (row, index) =>
        `<tr><td valign="middle" style="vertical-align:middle;padding-top:${index ? gap : 0}px;width:${theme.iconSize}px;">${image(asset(base, `icon-${row.icon}-${theme.icon}@3x.png`), theme.iconSize, theme.iconSize, "")}</td><td valign="middle" style="vertical-align:middle;padding:${index ? gap : 0}px 0 0 10px;word-break:break-word;${type(body, 13, 16, `color:${theme.text};`)}"><a href="${escape(row.href)}" style="color:${theme.text};text-decoration:none;">${escape(row.label)}</a></td></tr>`,
    )
    .join("")}</table>`;
}

const rule = (color: string) =>
  `<tr><td style="padding:18px 0 16px;"><div style="height:1px;line-height:1px;font-size:0;background-color:${color};">&nbsp;</div></td></tr>`;

function legal() {
  const [warning, email, policy, web] = legalText;
  const link = `color:${neutral};text-decoration:underline;`;
  return `<div style="padding-top:18px;${type(body, 10, 15, `color:${neutral};`)}">${warning}<a href="mailto:${email}" style="${link}">${email}</a>${policy}<a href="https://${web}" style="${link}">${web}</a></div>`;
}

// Noche: tarjeta a todo el ancho con foto o tesela y nombre centrados
// en vertical, datos con iconos y el logotipo en su propia fila.
function card(data: SignatureData, theme: Theme, base: string) {
  return `${table(`width:100%;background-color:${theme.surface};border:1px solid ${theme.hairline};border-radius:16px;`)}<tr><td bgcolor="${theme.surface}" style="background-color:${theme.surface};border-radius:16px;padding:22px;">${table("width:100%;")}<tr><td>${table()}<tr><td valign="middle" style="vertical-align:middle;padding-right:16px;">${aside(data, theme, base, 72)}</td><td valign="middle" style="vertical-align:middle;">${identity(data, theme)}</td></tr></table></td></tr>${rule(theme.hairline)}<tr><td>${details(data, theme, base)}</td></tr>${rule(theme.hairline)}<tr><td>${image(asset(base, theme.logo), 78, 24, "BinPar")}</td></tr></table></td></tr></table>`;
}

// Banda del logotipo, del filete de marca (binpar-filete2.svg) escalado a 48 px
// de alto. Sus dos extremos son imágenes recortadas del original: a la
// izquierda la esquina con el logotipo y a la derecha la cinta, que sobresale
// 5 px por arriba y por abajo. El tramo central es azul noche en HTML, repetido
// como degradado para que Gmail no lo invierta, y se estira con el ancho.
function band(base: string) {
  const surface = `background-color:${night.surface};background-image:linear-gradient(${night.surface},${night.surface});`;
  // Borde blanco al 20 % de 1 px por fuera de la banda, como en los extremos.
  // Va como degradado y no como border, para que Gmail no lo invierta.
  const ring = "rgba(255,255,255,0.2)";
  const edge = (line: string) =>
    `height:5px;line-height:5px;font-size:0;background-image:linear-gradient(${line});`;
  return `${table("width:100%;")}<tr><td rowspan="3" valign="middle" style="vertical-align:middle;width:121px;">${image(asset(base, "band-left-v2@3x.png"), 121, 58, "BinPar")}</td><td style="${edge(`transparent 4px,${ring} 4px`)}">&nbsp;</td><td rowspan="3" valign="middle" style="vertical-align:middle;width:111px;">${image(asset(base, "band-right-v2@3x.png"), 111, 58, "")}</td></tr><tr><td bgcolor="${night.surface}" style="height:48px;line-height:48px;font-size:0;${surface}">&nbsp;</td></tr><tr><td style="${edge(`${ring} 1px,transparent 1px`)}">&nbsp;</td></tr></table>`;
}

// Abierta: la misma maquetación sin tarjeta, en el tema claro. El logotipo va
// en la banda azul noche del filete de marca, con su cinta turquesa, que se ve igual en
// cualquier modo para que la palabra del logotipo sea siempre legible.
function open(data: SignatureData, base: string) {
  const grid = asset(base, "signature-grid.png");
  // Retícula de fondo de toda la firma, centrada y más ancha que cualquier
  // ventana para que se adapte al ancho; donde no se carga, la firma queda igual.
  // Las retículas van a tamaño real: Gmail descarta background-size.
  // Sin filete separador: no coincidiría con las líneas de la retícula.
  return `${table("width:100%;")}<tr><td background="${escape(grid)}" style="background-image:url('${escape(grid)}');background-position:center top;background-repeat:no-repeat;">${table("width:100%;")}<tr><td>${table()}<tr><td valign="middle" style="vertical-align:middle;padding-right:16px;">${aside(data, light, base, 72)}</td><td valign="middle" style="vertical-align:middle;">${identity(data, light)}</td></tr></table></td></tr><tr><td style="height:22px;line-height:22px;font-size:0;">&nbsp;</td></tr><tr><td>${details(data, light, base)}</td></tr><tr><td style="padding-top:20px;">${band(base)}</td></tr></table></td></tr></table>`;
}

export type SignatureVariant = "night" | "open";

export function renderSignature(
  data: SignatureData,
  base = "",
  variant: SignatureVariant = "night",
) {
  return `${variant === "open" ? open(data, base) : card(data, night, base)}${legal()}`;
}

export function renderSignatureText(data: SignatureData) {
  return [
    fullName(data),
    `${data.role} · BinPar`,
    ...contactRows(data).map((row) => row.label),
    "",
    legalText.join(""),
  ].join("\n");
}
