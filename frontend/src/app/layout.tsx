import type { Metadata } from "next";
import "./globals.css";
import "./reviewer.css";
import { WalletProvider } from "@/components/WalletProvider";
import { AppShell } from "@/components/AppShell";
import { ContractProvider } from "@/components/ContractProvider";

export const metadata: Metadata = {
  title: "VCDAO Alpha V3",
  description: "An evidence-driven autonomous seed fund secured by GenLayer.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ContractProvider><WalletProvider><AppShell>{children}</AppShell></WalletProvider></ContractProvider></body></html>;
}
