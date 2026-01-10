import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Ken Rotaris - Full-Stack Developer",
  description: "Portfolio of Ken Rotaris, a Swiss full-stack developer specializing in Java, TypeScript, and modern web technologies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className="min-h-screen">
        <Header />
        {children}
      </body>
    </html>
  );
}
