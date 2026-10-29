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
  tile: "tile-dark@3x.png",
  logo: "logo-dark-24@3x.png",
};
type Theme = typeof night;

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
    { icon: "map-pin", label: company.office, href: company.map },
    { icon: "globe", label: "binpar.com", href: company.web },
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
  return `${table()}${contactRows(data)
    .map(
      (row, index) =>
        `<tr><td valign="middle" style="vertical-align:middle;padding-top:${index ? 9 : 0}px;width:16px;">${image(asset(base, `icon-${row.icon}-${theme.icon}@3x.png`), 16, 16, "")}</td><td valign="middle" style="vertical-align:middle;padding:${index ? 9 : 0}px 0 0 10px;word-break:break-word;${type(body, 13, 16, `color:${theme.text};`)}"><a href="${escape(row.href)}" style="color:${theme.text};text-decoration:none;">${escape(row.label)}</a></td></tr>`,
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

export function renderSignature(data: SignatureData, base = "") {
  return `${card(data, night, base)}${legal()}`;
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
