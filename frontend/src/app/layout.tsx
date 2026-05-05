import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nested Tags Tree",
  description: "AIMonk Full Stack Assignment – Nested Tags Tree",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
