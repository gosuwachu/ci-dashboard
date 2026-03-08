import type { Metadata } from "next";
import "./globals.css";
import NavTabs from "@/components/NavTabs";
import AppSelector from "@/components/AppSelector";

export const metadata: Metadata = {
  title: "Mobile CI Dashboard",
  description: "CI monitoring dashboard for mobile apps",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <h1 className="text-lg font-bold tracking-tight">Mobile CI Dashboard</h1>
            <div className="flex items-center gap-4">
              <AppSelector />
              <NavTabs />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
