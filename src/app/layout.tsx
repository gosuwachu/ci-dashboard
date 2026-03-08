import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
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
            <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight hover:text-gray-600 transition-colors">
              <svg className="h-6 w-6" viewBox="0 0 32 32" fill="none">
                <rect x="6" y="2" width="20" height="28" rx="3" fill="#1e293b"/>
                <rect x="8" y="5" width="16" height="19" rx="1" fill="#f1f5f9"/>
                <circle cx="16" cy="27.5" r="1.5" fill="#64748b"/>
                <path d="M12 14l3 3 5-6" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Mobile CI Dashboard
            </Link>
            <div className="flex items-center gap-4">
              <AppSelector />
              <NavTabs />
              <a
                href="https://github.com/gosuwachu/mobile-app"
                target="_blank"
                rel="noopener noreferrer"
                title="View on GitHub"
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </a>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
