// app/layout.tsx
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { shadCn } from "../lib/utils";
import { ThemeProvider } from "../app/context/ThemeContext";
import { StrictMode } from "react";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ElJardin Auth",
  description: "Login and create user for ElJardin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StrictMode>
      <html lang="en">
        <body
          className={shadCn(
            "min-h-screen font-sans antialiased",
            fontSans.variable
          )}
        >
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </StrictMode>
  );
}
