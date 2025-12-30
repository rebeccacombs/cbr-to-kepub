import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CBR to KEPUB Converter",
  description: "Convert Comic Book RAR files to Kobo EPUB format",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

