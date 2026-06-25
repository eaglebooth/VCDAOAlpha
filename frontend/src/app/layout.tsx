import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VC-DAO Alpha",
  description: "Autonomous GenLayer venture DAO for AI-driven seed investing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
