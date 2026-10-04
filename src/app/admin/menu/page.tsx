import Link from "next/link";
import {
  Badge, Button, Card, Flash, I18nInput, LinkButton, PageHeader,
  Select, Table, Td, TranslationBadge,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n-field";
import { moveCategory, saveCategory } from "./actions";

export const metadata = { title: "Menu" };

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; add?: string }>;
}) {
  await requireAdmin();
  const { ok, error, add } = await searchParams;

  const categories = await db.menuCategory.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Menu"
        description="Categories, items and prices. Anything saved here is live on the public site straight away."
      >
        <LinkButton href="/admin/menu/options">Options</LinkButton>
        <LinkButton href="/admin/menu?add=1" variant="primary">
          Add category
        </LinkButton>
      </PageHeader>

      <Flash ok={ok} error={error} />

      {add ? (
        <Card title="New category">
          <form action={saveCategory} className="space-y-5">
            <I18nInput name="name" label="Name" required placeholder="Hot" />
            <I18nInput
              name="note"
              label="Note under the heading"
              placeholder="Poured into the house cup, paw side out."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[0.78rem] font-semibold text-espresso">
                  Source
                </span>
                <Select name="source" defaultValue="printed-menu">
                  <option value="printed-menu">Printed menu (has prices)</option>
                  <option value="instagram">Posted online (no prices)</option>
                </Select>
              </label>
              <label className="flex items-end gap-3 pb-2.5">
                <input type="checkbox" name="published" defaultChecked className="h-4 w-4 accent-[var(--color-cocoa)]" />
                <span className="text-[0.88rem]">Visible on the site</span>
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Add category</Button>
              <LinkButton href="/admin/menu" variant="ghost">Cancel</LinkButton>
            </div>
          </form>
        </Card>
      ) : null}

      <Card>
        <Table head={["Category", "Items", "Source", "Translations", "Order", ""]}>
          {categories.map((c, i) => (
            <tr key={c.id}>
              <Td>
                <Link href={`/admin/menu/category/${c.id}`} className="font-display text-[1rem] hover:underline">
                  {t(c.name, "fr") || "(unnamed)"}
                </Link>
                {!c.published ? <span className="ml-2"><Badge tone="warn">hidden</Badge></span> : null}
              </Td>
              <Td className="tabular-nums">{c._count.items}</Td>
              <Td>
                <Badge tone={c.source === "printed-menu" ? "info" : "neutral"}>
                  {c.source === "printed-menu" ? "printed" : "online"}
                </Badge>
              </Td>
              <Td><TranslationBadge value={c.name} /></Td>
              <Td>
                <div className="flex gap-1">
                  <form action={moveCategory}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button type="submit" disabled={i === 0} aria-label="Move up"
                      className="rounded px-2 py-1 text-taupe hover:bg-shell disabled:opacity-30">↑</button>
                  </form>
                  <form action={moveCategory}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button type="submit" disabled={i === categories.length - 1} aria-label="Move down"
                      className="rounded px-2 py-1 text-taupe hover:bg-shell disabled:opacity-30">↓</button>
                  </form>
                </div>
              </Td>
              <Td>
                <Link href={`/admin/menu/category/${c.id}`}
                  className="text-[0.8rem] tracking-[0.06em] text-cocoa uppercase hover:underline">
                  Open
                </Link>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
