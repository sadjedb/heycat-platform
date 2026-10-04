import Image from "next/image";
import Link from "next/link";
import {
  Badge,
  Card,
  EmptyState,
  Flash,
  LinkButton,
  PageHeader,
  Price,
  Table,
  Td,
  TranslationBadge,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n-field";
import { cycleStock, moveProduct } from "./actions";

export const metadata = { title: "Boutique" };

const STOCK_TONE = { "in-stock": "good", low: "warn", out: "bad", unlisted: "neutral" } as const;
const STOCK_LABEL = {
  "in-stock": "in stock",
  low: "running low",
  out: "out of stock",
  unlisted: "hidden",
} as const;

/*
 * The shop, shelf by shelf.
 *
 * Grouped by category because that is how the public page renders it, and
 * because reordering only means anything within a shelf. Products with no
 * category get a shelf of their own at the end — the same place the public
 * page puts them — rather than disappearing from this list.
 */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const { ok, error } = await searchParams;

  const [categories, products] = await Promise.all([
    db.productCategory.findMany({ orderBy: { position: "asc" } }),
    db.product.findMany({
      orderBy: { position: "asc" },
      include: { image: { select: { url: true } }, _count: { select: { gallery: true } } },
    }),
  ]);

  const shelves = [
    ...categories.map((c) => ({
      id: c.id,
      name: t(c.name, "fr") || "(unnamed)",
      published: c.published,
      href: `/admin/products/categories/${c.id}`,
      items: products.filter((p) => p.categoryId === c.id),
    })),
    {
      id: null,
      name: "Uncategorised",
      published: true,
      href: null,
      items: products.filter((p) => !p.categoryId),
    },
  ].filter((s) => s.items.length > 0 || s.id !== null);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Boutique"
        description="The shop corner by the counter — cups, spoons, tote bags. Prices are optional: the café has never published any, and an empty price shows as “ask at the counter”."
      >
        <LinkButton href="/admin/products/categories" variant="ghost">
          Categories
        </LinkButton>
        <LinkButton href="/admin/products/new" variant="primary">
          Add product
        </LinkButton>
      </PageHeader>
      <Flash ok={ok} error={error} />

      {products.length === 0 ? (
        <Card>
          <EmptyState
            title="No products yet"
            description="Add the things the café sells across the counter. Each one gets its own page in the boutique."
            action={
              <LinkButton href="/admin/products/new" variant="primary">
                Add the first product
              </LinkButton>
            }
          />
        </Card>
      ) : null}

      {shelves.map((shelf) => (
        <Card
          key={shelf.id ?? "none"}
          title={shelf.name}
          action={
            shelf.href ? (
              <Link href={shelf.href} className="text-[0.78rem] text-cocoa hover:underline">
                edit shelf
              </Link>
            ) : undefined
          }
        >
          {!shelf.published ? (
            <p className="mb-4 text-[0.82rem] text-taupe">
              <Badge tone="warn">shelf hidden</Badge> This category and everything on it is hidden
              from the site.
            </p>
          ) : null}

          {shelf.items.length === 0 ? (
            <p className="py-3 text-[0.85rem] text-mist">Nothing on this shelf yet.</p>
          ) : (
            <Table head={["", "Product", "Price", "Stock", "Photos", "Languages", "", ""]}>
              {shelf.items.map((p, i) => (
                <tr key={p.id}>
                  <Td className="w-14">
                    {p.image ? (
                      <Image
                        src={p.image.url}
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="block h-11 w-11 rounded-lg bg-shell" />
                    )}
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="font-display text-[1rem] hover:underline"
                    >
                      {t(p.name, "fr") || "(unnamed)"}
                    </Link>
                    {p.featured ? (
                      <span className="ms-2">
                        <Badge tone="info">featured</Badge>
                      </span>
                    ) : null}
                    {!p.published ? (
                      <span className="ms-2">
                        <Badge tone="warn">hidden</Badge>
                      </span>
                    ) : null}
                    {p.sku ? (
                      <span className="ms-2 text-[0.74rem] text-mist tabular-nums">{p.sku}</span>
                    ) : null}
                  </Td>
                  <Td>
                    <Price value={p.price} />
                  </Td>
                  <Td>
                    {/* One click from behind the counter: "we've sold out of the totes". */}
                    <form action={cycleStock}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        title="Click to change"
                        className="cursor-pointer rounded-full"
                      >
                        <Badge tone={STOCK_TONE[p.stock as keyof typeof STOCK_TONE] ?? "neutral"}>
                          {STOCK_LABEL[p.stock as keyof typeof STOCK_LABEL] ?? p.stock}
                        </Badge>
                      </button>
                    </form>
                  </Td>
                  <Td className="tabular-nums">
                    {(p.image ? 1 : 0) + p._count.gallery || <span className="text-mist">—</span>}
                  </Td>
                  <Td>
                    <TranslationBadge value={p.name} />
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      <form action={moveProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button
                          type="submit"
                          disabled={i === 0}
                          aria-label={`Move ${t(p.name, "fr") || "product"} up`}
                          className="rounded px-2 py-1 text-taupe hover:bg-shell disabled:opacity-30"
                        >
                          ↑
                        </button>
                      </form>
                      <form action={moveProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          disabled={i === shelf.items.length - 1}
                          aria-label={`Move ${t(p.name, "fr") || "product"} down`}
                          className="rounded px-2 py-1 text-taupe hover:bg-shell disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </form>
                    </div>
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-[0.8rem] tracking-[0.06em] text-cocoa uppercase hover:underline"
                    >
                      Edit
                    </Link>
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      ))}
    </div>
  );
}
