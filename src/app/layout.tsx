import type { Metadata } from "next";
import { Fraunces, Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Panelist remarks (CR Change 5) must support Urdu — Nastaliq fonts render Latin text poorly, so
// this is applied conditionally per remark via the `.urdu-text` class, never as a blanket swap.
const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "DFCL Sensory Evaluation",
  description: "Sensory Evaluation Software — Dawn Foods Corp. Ltd. Commercial Quality Assurance",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${notoNastaliqUrdu.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-ui)]">
        {children}
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
