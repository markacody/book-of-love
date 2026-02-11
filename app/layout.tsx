import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Book of Love",
  description: "Our story, one message at a time",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-cream text-gray-900 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="border-b border-blush bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="text-lg font-bold text-rose tracking-tight"
            >
              The Book of Love
            </Link>
            <div className="flex gap-1">
              <Link
                href="/timeline"
                className="rounded-full px-4 py-1.5 text-sm font-medium text-steel transition-colors hover:bg-blush/50 hover:text-rose"
              >
                Timeline
              </Link>
              <Link
                href="/search"
                className="rounded-full px-4 py-1.5 text-sm font-medium text-steel transition-colors hover:bg-blush/50 hover:text-rose"
              >
                Search
              </Link>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
