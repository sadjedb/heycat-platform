import Image from "next/image";
import type { Cat } from "@/data/cats";

/*
 * A cat at small size.
 *
 * The source portraits frame the whole sitting cat, which disappears once the
 * circle is 48px across. Scaling 2× about a point above centre lands on head and
 * shoulders for all eleven — checked against every card, not just one.
 */
export function CatAvatar({
  cat,
  sizes,
  alt,
  className = "",
  decorative = false,
}: {
  cat: Cat;
  sizes: string;
  /** Localised alt text. Omit only when `decorative`. */
  alt?: string;
  className?: string;
  decorative?: boolean;
}) {
  return (
    <span className={`relative block overflow-hidden rounded-full bg-shell ${className}`}>
      <Image
        src={cat.image}
        alt={decorative ? "" : (alt ?? `${cat.name}, ${cat.breed}.`)}
        fill
        sizes={sizes}
        className="cat-portrait scale-[2] object-cover origin-[50%_22%]"
      />
    </span>
  );
}
