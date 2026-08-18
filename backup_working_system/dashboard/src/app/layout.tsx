import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fashion Gallery — AI WhatsApp Dashboard",
  description: "AI-powered WhatsApp Business Assistant admin dashboard. Manage products, orders, discount rules, and customer conversations.",
  keywords: "WhatsApp business, AI assistant, order management, fashion",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
