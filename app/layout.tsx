import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { shadCn } from "../lib/utils";
import { ThemeProvider } from "../app/context/ThemeContext";
import CookieConsent from "@/components/ui/cookie"; // Ensure the import path is correct

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body
        className={shadCn(
          "min-h-screen font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider>
          {children}
          <CookieConsent /> 
        </ThemeProvider>
      </body>
    </html>
  );
}
