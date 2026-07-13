import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "VCDAO Alpha V2",
  description: "An evidence-driven autonomous seed fund secured by GenLayer.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><WalletProvider><AppShell>{children}</AppShell></WalletProvider></body></html>;
}
