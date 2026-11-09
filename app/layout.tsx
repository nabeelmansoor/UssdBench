import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  JetBrains_Mono,
  Noto_Kufi_Arabic,
  Noto_Sans_Devanagari,
} from "next/font/google";
import { BottomNav, MobileTopBar, Sidebar } from "@/components/nav";
import { Footer } from "@/components/site-footer";
import { SessionProvider } from "@/lib/session";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const code = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
});

// JetBrains Mono has no Arabic or Devanagari glyphs. The mono stack in globals.css falls through to these.
const arabic = Noto_Kufi_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
});

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
});

export const metadata: Metadata = {
  title: {
    default: "USSD Bench",
    template: "%s · USSD Bench",
  },
  description:
    "Fit a USSD menu before the gateway cuts it. Clean characters that break a paste and count SMS segments. The text stays in the browser.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${display.variable} ${body.variable} ${code.variable} ${arabic.variable} ${devanagari.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <SessionProvider>
          <div className="lg:flex lg:min-h-screen">
            <Sidebar />
            <div className="app-dots relative isolate flex min-h-screen min-w-0 flex-1 flex-col pb-16 lg:pb-0">
              <MobileTopBar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </div>
          <BottomNav />
        </SessionProvider>
      </body>
    </html>
  );
}
