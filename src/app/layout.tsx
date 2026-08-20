import "~/styles/globals.css";

import { type Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";

import { MotionProvider } from "~/app/_components/motion-system";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: {
    default: "Consensus Salutis",
    template: "%s | Consensus Salutis",
  },
  description:
    "Plataforma de IA médica institucional para soporte a la toma de decisiones, evidencia clínica y gobierno del conocimiento sanitario.",
  icons: {
    icon: [
      {
        url: "/favicon.svg?v=7eaf3efa",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
    shortcut: [
      {
        url: "/favicon.svg?v=7eaf3efa",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem("consensus-theme");const d=t==="dark";document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme="light"}`,
          }}
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${sora.variable} min-h-screen bg-[#f4f9fc] font-sans text-slate-900 antialiased dark:bg-[#06111f] dark:text-slate-50`}
      >
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
