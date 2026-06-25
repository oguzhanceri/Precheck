import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Precheck AI | Yayın Öncesi Web Denetim Platformu",
    template: "%s | Precheck AI",
  },
  description:
    "Precheck AI; frontend projelerinde responsive, SEO, performans, erişilebilirlik ve UI hatalarını yayın öncesi yakalamak için tasarlanmış denetim platformudur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
