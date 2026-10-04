import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Badge, Button, Card, EmptyState, Flash, I18nInput, LinkButton,
  PageHeader, Price, Select, Table, Td, TranslationBadge,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n-field";
import { deleteCategory, moveItem, saveCategory, toggleItemAvailability } from "../../actions";

export const metadata = { title: "Category" };

/*
 * One category: its own settings, and the items inside it.
 *
 * Availability is a one-click toggle straight from the list because that is the
 * thing staff actually do mid-service — "we've run out of pistachio" — and it
 * should not cost them a round trip through an edit form.
 */
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { ok, error } = await searchParams;

  const category = await db.menuCategory.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { position: "asc" },
        include: { image: { select: { url: true } } },
      },
    },
  });
  if (!category) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        title={t(category.name, "fr") || "Category"}
        description={`${category.items.length} item(s). ${
          category.source === "printed-menu"
            ? "From the café's printed menu — these carry prices."
            : "Posted online and not priced on the printed menu."
        }`}
      >
        <LinkButton href="/admin/menu" variant="ghost">
          ← All categories
        </LinkButton>
        <LinkButton href={`/admin/menu/item/new?category=${category.id}`} variant="primary">
          Add item
        </LinkButton>
      </PageHeader>

      <Flash ok={ok} error={error} />

      <Card>
        {category.items.length === 0 ? (
          <EmptyState
            title="No items yet"
            description="Add the first one — name, price and a photo if there is one."
            action={
              <LinkButton href={`/admin/menu/item/new?category=${category.id}`} variant="primary">
                Add item
              </LinkButton>
            }
          />
        ) : (
          <Table head={["", "Item", "Price", "Translations", "On menu", "Order", ""]}>
            {category.items.map((item, i) => (
              <tr key={item.id}>
                <Td className="w-14">
                  {item.image ? (
                    <Image
                      src={item.image.url}
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
                    href={`/admin/menu/item/${item.id}`}
                    className="font-display text-[0.98rem] hover:underline"
                  >
                    {t(item.name, "fr") || "(unnamed)"}
                  </Link>
                  {item.featured ? (
                    <span className="ml-2">
                      <Badge tone="info">featured</Badge>
                    </span>
                  ) : null}
                </Td>
                <Td>
                  <Price value={item.price} />
                </Td>
                <Td>
                  <TranslationBadge value={item.name} />
                </Td>
                <Td>
                  <form action={toggleItemAvailability}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="rounded-full px-2.5 py-1 text-[0.7rem] font-medium tracking-[0.06em] uppercase transition-colors"
                      style={
                        item.available
                          ? { background: "color-mix(in oklab, var(--color-matcha) 12%, white)", color: "var(--color-matcha)" }
                          : { background: "color-mix(in oklab, var(--color-hibiscus) 12%, white)", color: "var(--color-hibiscus)" }
                      }
                    >
                      {item.available ? "available" : "sold out"}
                    </button>
                  </form>
                </Td>
                <Td>
                  <div className="flex gap-1">
                    <form action={moveItem}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button
                        type="submit"
                        disabled={i === 0}
                        aria-label={`Move ${t(item.name, "fr")} up`}
                        className="rounded px-2 py-1 text-taupe hover:bg-shell disabled:opacity-30"
                      >
                        ↑
                      </button>
                    </form>
                    <form action={moveItem}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button
                        type="submit"
                        disabled={i === category.items.length - 1}
                        aria-label={`Move ${t(item.name, "fr")} down`}
                        className="rounded px-2 py-1 text-taupe hover:bg-shell disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </form>
                  </div>
                </Td>
                <Td>
                  <Link
                    href={`/admin/menu/item/${item.id}`}
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

      <Card title="Category settings">
        <form action={saveCategory} className="space-y-5">
          <input type="hidden" name="id" value={category.id} />
          <I18nInput name="name" label="Name" value={category.name} required />
          <I18nInput name="note" label="Note under the heading" value={category.note} />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[0.78rem] font-semibold text-espresso">Source</span>
              <Select name="source" defaultValue={category.source}>
                <option value="printed-menu">Printed menu (has prices)</option>
                <option value="instagram">Posted online (no prices)</option>
              </Select>
            </label>
            <label className="flex items-end gap-3 pb-2.5">
              <input
                type="checkbox"
                name="published"
                defaultChecked={category.published}
                className="h-4 w-4 accent-[var(--color-cocoa)]"
              />
              <span className="text-[0.88rem]">Visible on the site</span>
            </label>
          </div>
          <Button type="submit">Save category</Button>
        </form>
      </Card>

      <Card
        title="Delete this category"
        description="Only possible once it is empty — deleting a category would take its items with it."
      >
        <form action={deleteCategory}>
          <input type="hidden" name="id" value={category.id} />
          <Button type="submit" variant="danger" disabled={category.items.length > 0}>
            Delete category
          </Button>
        </form>
      </Card>
    </div>
  );
}
