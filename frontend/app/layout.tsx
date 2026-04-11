import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "Система учёта футбольных турниров",
  description: "Фронтенд MVP учебного проекта по системной и программной инженерии",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
