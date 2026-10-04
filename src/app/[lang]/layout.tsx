import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Playfair_Display, Fredoka, Inter, Caveat } from "next/font/google";
import { dirOf, getDictionary, isLocale, locales, type Locale } from "@/i18n";
import { siteUrl } from "@/data/site";
import "../globals.css";

/*
 * Type.
 *
 * Playfair is the serif HeyCat already sets its brunch and dessert posters in.
 * Fredoka is the closest available match to the rounded geometric sans of the
 * HEYCAT logotype on the fascia and the cups. Inter carries running text, and
 * Caveat stands in for the handwriting on the cat cards.
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

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "700"],
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(props: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);

  return {
    metadataBase: new URL(siteUrl),
    title: { default: t.meta.title, template: "%s — HEYCAT Coffee Shop" },
    description: t.meta.description,
    applicationName: "HEYCAT Coffee Shop",
    keywords: [
      "HeyCat",
      "cat café",
      "café à chats",
      "coffee shop",
      "Algeria",
      "Algérie",
      "brunch",
      "bubble tea",
      "tiramisu",
    ],
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "website",
      title: t.meta.title,
      description: t.meta.description,
      siteName: "HEYCAT Coffee Shop",
      locale: lang === "fr" ? "fr_DZ" : "en",
      url: `/${lang}`,
      images: [
        {
          url: "/og.jpg",
          width: 1200,
          height: 630,
          alt: "HEYCAT Coffee Shop — Come where #cats are.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
      images: ["/og.jpg"],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#f9f4ee",
  colorScheme: "light",
};

export default async function RootLayout(props: LayoutProps<"/[lang]">) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();

  return (
    <html
      lang={lang as Locale}
      dir={dirOf(lang as Locale)}
      className={`${playfair.variable} ${fredoka.variable} ${inter.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{props.children}</body>
    </html>
  );
}
