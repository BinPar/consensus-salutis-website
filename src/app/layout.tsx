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
    <html lang="es">
      <body
        className={`${plusJakartaSans.variable} min-h-screen bg-[#06111f] font-sans text-slate-50 antialiased`}
      >
        <MotionProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
