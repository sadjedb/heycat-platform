import Link from "next/link";
import {
  Badge,
  Card,
  EmptyState,
  Flash,
  LinkButton,
  PageHeader,
  Table,
  Td,
  TranslationBadge,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n-field";

export const metadata = { title: "Boutique shelves" };

/*
 * The shelves the boutique is divided into.
 *
 * Deliberately a flat list with no reordering of its own yet: there are two of
 * them and the public page renders them in creation order. If the café ends up
 * with six, this is where a pair of arrows goes.
 */
export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const { ok, error } = await searchParams;

  const categories = await db.productCategory.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Boutique shelves"
        description="How the shop is grouped — tableware, bags, and whatever else the café starts selling. Each shelf becomes a heading on the boutique page."
      >
        <LinkButton href="/admin/products" variant="ghost">
          ← Boutique
        </LinkButton>
        <LinkButton href="/admin/products/categories/new" variant="primary">
          Add shelf
        </LinkButton>
      </PageHeader>
      <Flash ok={ok} error={error} />

      <Card>
        {categories.length === 0 ? (
          <EmptyState
            title="No shelves yet"
            description="Products work without one — they simply appear in a single ungrouped list."
            action={
              <LinkButton href="/admin/products/categories/new" variant="primary">
                Add the first shelf
              </LinkButton>
            }
          />
        ) : (
          <Table head={["Shelf", "Products", "Languages", ""]}>
            {categories.map((c) => (
              <tr key={c.id}>
                <Td>
                  <Link
                    href={`/admin/products/categories/${c.id}`}
                    className="font-display text-[1rem] hover:underline"
                  >
                    {t(c.name, "fr") || "(unnamed)"}
                  </Link>
                  {!c.published ? (
                    <span className="ms-2">
                      <Badge tone="warn">hidden</Badge>
                    </span>
                  ) : null}
                </Td>
                <Td className="tabular-nums">{c._count.products}</Td>
                <Td>
                  <TranslationBadge value={c.name} />
                </Td>
                <Td>
                  <Link
                    href={`/admin/products/categories/${c.id}`}
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
    </div>
  );
}
