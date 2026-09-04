import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppStateProvider } from "@/components/AppStateProvider";
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
          <div className="flex min-h-dvh items-center justify-center">
            {children}
          </div>
        </AppStateProvider>
      </body>
    </html>
  );
}
