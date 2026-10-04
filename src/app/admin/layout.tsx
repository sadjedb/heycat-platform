import type { Metadata } from "next";
import Link from "next/link";
import { Playfair_Display, Fredoka, Inter } from "next/font/google";
import { PawMark } from "@/components/brand";
import { getSessionAdmin } from "@/lib/auth";
import { logoutAction } from "./actions";
import "../globals.css";

/*
 * The admin shell.
 *
 * The admin is its own root layout — it does not sit under /[lang], because the
 * public site's locale segment is for visitors and the dashboard is a single
 * tool for one café. It shares the public site's fonts and colour tokens so it
 * belongs to HEYCAT, but it is denser and plainer: this is somewhere work gets
 * done, not somewhere to be impressed.
 *
 * Note the guard here is for *navigation* only. Every Server Action calls
 * `requireAdmin()` itself — a layout cannot protect a POST.
 */

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "HEYCAT admin", template: "%s — HEYCAT admin" },
  // The dashboard must never appear in search results.
  robots: { index: false, follow: false, nocache: true },
};

const NAV = [
  { group: "Today", links: [{ href: "/admin", label: "Dashboard" }] },
  {
    group: "Service",
    links: [
      { href: "/admin/reservations", label: "Reservations" },
      { href: "/admin/tables", label: "Floor plan" },
      { href: "/admin/today", label: "Today at HEYCAT" },
      { href: "/admin/events", label: "Events" },
    ],
  },
  {
    group: "Content",
    links: [
      { href: "/admin/menu", label: "Menu" },
      { href: "/admin/cats", label: "Cats" },
      { href: "/admin/products", label: "Boutique" },
      { href: "/admin/media", label: "Media" },
    ],
  },
  {
    group: "Business",
    links: [
      { href: "/admin/settings", label: "Settings" },
      { href: "/admin/analytics", label: "Analytics" },
    ],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getSessionAdmin();

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${fredoka.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-cream text-espresso">
        {admin ? (
          <div className="flex min-h-screen flex-col lg:flex-row">
            <aside className="shrink-0 border-b border-sand bg-white lg:w-60 lg:border-r lg:border-b-0">
              <div className="flex items-center justify-between gap-4 px-5 py-4 lg:block">
                <Link href="/admin" className="flex items-center gap-2.5">
                  <PawMark className="h-6 w-6 text-espresso" />
                  <span className="font-brand text-[1.05rem] font-semibold">HEYCAT</span>
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  className="text-[0.74rem] tracking-[0.08em] text-taupe uppercase hover:text-espresso lg:mt-3 lg:block"
                >
                  View site ↗
                </Link>
              </div>

              <nav className="px-3 pb-4 lg:px-3" aria-label="Admin">
                <ul className="m-0 flex list-none flex-wrap gap-1 p-0 lg:block">
                  {NAV.map((section) => (
                    <li key={section.group} className="lg:mb-4">
                      <span className="hidden px-2 text-[0.68rem] tracking-[0.14em] text-mist uppercase lg:mb-1 lg:block">
                        {section.group}
                      </span>
                      <ul className="m-0 flex list-none flex-wrap gap-1 p-0 lg:block">
                        {section.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="block rounded-lg px-2.5 py-1.5 text-[0.86rem] text-taupe transition-colors hover:bg-shell hover:text-espresso"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-sand px-5 py-4 lg:mt-auto">
                <p className="truncate text-[0.78rem] text-taupe">{admin.name}</p>
                <p className="truncate text-[0.72rem] text-mist">{admin.email}</p>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="mt-2 text-[0.74rem] tracking-[0.08em] text-taupe uppercase hover:text-hibiscus"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </aside>

            <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">
              <div className="mx-auto max-w-5xl">{children}</div>
            </main>
          </div>
        ) : (
          // Login and first-run setup render without the shell.
          <main className="flex min-h-screen items-center justify-center px-5 py-12">
            {children}
          </main>
        )}
      </body>
    </html>
  );
}
