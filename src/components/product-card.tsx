import Image from "next/image";
import Link from "next/link";
import type { Dictionary, Locale } from "@/i18n";
import { fill } from "@/i18n";
import type { PublicProduct } from "@/lib/content";

/*
 * One product on a shelf.
 *
 * Price is optional on purpose: the café has never published boutique prices,
 * so an empty one reads "ask at the counter" rather than becoming a zero. Out
 * of stock stays visible and greyed — knowing the café sells a thing is useful
 * even on a day it has run out.
 */
export function ProductCard({
  t,
  lang,
  product,
}: {
  t: Dictionary;
  lang: Locale;
  product: PublicProduct;
}) {
  const out = product.stock === "out";

  return (
    <article className="group">
      <Link
        href={`/${lang}/boutique/${product.slug}`}
        className="block focus-visible:outline-none"
        aria-label={fill(t.shop.viewProduct, { product: product.name })}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.1rem] bg-shell">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 24vw, (min-width: 640px) 40vw, 46vw"
              loading="lazy"
              className={[
                "object-cover transition-transform duration-[1100ms] ease-[var(--ease-drift)]",
                "group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
                out ? "opacity-55 saturate-50" : "",
              ].join(" ")}
            />
          ) : null}

          {product.featured && !out ? (
            <span className="absolute top-3 start-3 rounded-full bg-cream/90 px-3 py-1 text-[0.66rem] font-medium tracking-[0.1em] text-cocoa uppercase backdrop-blur-sm">
              {t.shop.featured}
            </span>
          ) : null}

          {out ? (
            <span className="absolute top-3 start-3 rounded-full bg-espresso/85 px-3 py-1 text-[0.66rem] font-medium tracking-[0.1em] text-cream uppercase">
              {t.shop.stock.out}
            </span>
          ) : null}
        </div>

        <h3 className="mt-3.5 font-display text-[1.08rem] leading-snug group-hover:underline">
          {product.name}
        </h3>
      </Link>

      <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {product.price !== null ? (
          <span className="text-[0.95rem] tabular-nums">{product.price} DA</span>
        ) : (
          <span className="text-[0.86rem] text-taupe">{t.shop.askPrice}</span>
        )}
        {product.stock === "low" ? (
          <span className="text-[0.76rem] text-rust">{t.shop.stock.low}</span>
        ) : null}
      </p>
    </article>
  );
}
