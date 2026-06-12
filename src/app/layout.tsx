import "~/styles/globals.css";

import { type Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { MotionProvider } from "~/app/_components/motion-system";
import { TRPCReactProvider } from "~/trpc/react";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Consensus Salutis",
    template: "%s | Consensus Salutis",
  },
  description:
    "Plataforma de IA médica institucional para soporte a la toma de decisiones, evidencia clínica y gobierno del conocimiento sanitario.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem("consensus-theme");const d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} min-h-screen bg-[#f4f9fc] font-sans text-slate-900 antialiased dark:bg-[#06111f] dark:text-slate-50`}
      >
        <MotionProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
