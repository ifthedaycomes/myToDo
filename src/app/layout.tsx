import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "myToDo",
  description: "할 일 + 주간 계획 + 1년 목표 관리 앱",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html lang="ko" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full bg-background text-foreground">
        <Sidebar user={user} />
        <main className="w-full flex-1 p-4 sm:p-10">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </body>
    </html>
  );
}
