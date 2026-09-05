import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppStateProvider } from "@/components/AppStateProvider";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { PhoneFrame } from "@/components/PhoneFrame";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Goodreads AI — Book recommendations",
  description:
    "Describe a mood, genre or subject and get book recommendations, optionally informed by your reading history.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AppStateProvider>
          {/*
            * The device lives in the layout, not in the pages. A shared layout
            * is not remounted when you navigate between sibling routes, so the
            * frame measures its scale once and holds it. When each page
            * rendered its own PhoneFrame, every navigation remounted it, and it
            * starts at scale 1 and only corrects in an effect — which is the
            * jump you saw on submit.
            */}
          <div className="flex min-h-dvh items-center justify-center">
            <PhoneFrame>
              {/*
                * The header and the nav live here rather than in the screens.
                * They are identical on both, and inside a screen they sat in
                * the template that remounts on navigation — so the sand bar and
                * the whole nav vanished with the body and faded back in, which
                * is the white flash. Painted continuously from here, only the
                * body between them cross-fades.
                */}
              <AppHeader />
              {children}
              <BottomNav />
            </PhoneFrame>
          </div>
        </AppStateProvider>
      </body>
    </html>
  );
}
