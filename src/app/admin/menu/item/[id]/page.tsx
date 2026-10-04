import { notFound } from "next/navigation";
import {
  Button, Card, Checkbox, Field, Flash, I18nInput, Input,
  LinkButton, PageHeader, Select,
} from "@/components/admin/ui";
import { MediaPicker } from "@/components/admin/media-picker";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n-field";
import { deleteItem, saveItem } from "../../actions";

export const metadata = { title: "Menu item" };

/** The design system's flavour colours — the same ones the café's own drink
 *  posters are printed in. Free text here would let a typo through. */
const ACCENTS = [
  { value: "", label: "None" },
  { value: "var(--color-walnut)", label: "Walnut — coffee" },
  { value: "var(--color-rust)", label: "Rust — latte" },
  { value: "var(--color-cocoa)", label: "Cocoa — chocolate" },
  { value: "var(--color-matcha)", label: "Matcha — green" },
  { value: "var(--color-hibiscus)", label: "Hibiscus — deep red" },
  { value: "var(--color-berry)", label: "Berry — strawberry" },
  { value: "var(--color-ube)", label: "Ube — purple" },
  { value: "var(--color-citrus)", label: "Citrus — orange" },
  { value: "var(--color-banana)", label: "Banana — yellow" },
  { value: "var(--color-gold)", label: "Gold — caramel" },
];

export default async function MenuItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string; category?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { ok, error, category: categoryParam } = await searchParams;

  const isNew = id === "new";
  const [item, categories] = await Promise.all([
    isNew ? null : db.menuItem.findUnique({ where: { id } }),
    db.menuCategory.findMany({ orderBy: { position: "asc" } }),
  ]);
  if (!isNew && !item) notFound();

  const categoryId = item?.categoryId ?? categoryParam ?? categories[0]?.id ?? "";
  const flavours = Array.isArray(item?.flavours) ? (item.flavours as string[]).join(", ") : "";

  return (
    <div className="space-y-8">
      <PageHeader
        title={isNew ? "New item" : t(item!.name, "fr") || "Item"}
        description={
          isNew
            ? "Name it in at least one language. Everything else can wait."
            : "Changes are live on the public site as soon as you save."
        }
      >
        <LinkButton href={`/admin/menu/category/${categoryId}`} variant="ghost">
          ← Back
        </LinkButton>
      </PageHeader>

      <Flash ok={ok} error={error} />

      <form action={saveItem} className="space-y-6">
        {item ? <input type="hidden" name="id" value={item.id} /> : null}

        <Card title="What it is">
          <div className="space-y-5">
            <I18nInput
              name="name"
              label="Name"
              value={item?.name}
              required
              hint="The café's own names are English in all three — that is deliberate"
            />
            <I18nInput
              name="description"
              label="Description"
              value={item?.description}
              multiline
              hint="Optional. The café writes these in French."
            />
            <Field
              label="Flavours"
              hint="Comma separated. The printed menu says 'assorted flavors'."
            >
              <Input name="flavours" defaultValue={flavours} placeholder="Classic, Hazelnut, Pistachio" />
            </Field>
          </div>
        </Card>

        <Card title="Price and placement">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Price in DA"
              hint="Leave empty if it is not priced on the printed menu"
            >
              <Input
                type="number"
                name="price"
                min={0}
                step={10}
                defaultValue={item?.price ?? ""}
                placeholder="650"
                inputMode="numeric"
              />
            </Field>
            <Field label="Category">
              <Select name="categoryId" defaultValue={categoryId} required>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {t(c.name, "fr")}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Accent colour" hint="Shown as a dot beside unphotographed items">
              <Select name="accent" defaultValue={item?.accent ?? ""}>
                {ACCENTS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="pt-6">
              <Checkbox
                name="available"
                label="On the menu"
                defaultChecked={item?.available ?? true}
                hint="Uncheck when it sells out — it stays listed but greyed."
              />
              <Checkbox
                name="featured"
                label="Featured"
                defaultChecked={item?.featured ?? false}
                hint="Highlights it in its category."
              />
            </div>
          </div>
        </Card>

        <Card title="Photograph">
          <MediaPicker selectedId={item?.imageId} />
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit">{isNew ? "Add item" : "Save item"}</Button>
          <LinkButton href={`/admin/menu/category/${categoryId}`} variant="ghost">
            Cancel
          </LinkButton>
        </div>
      </form>

      {item ? (
        <Card title="Delete" description="This cannot be undone.">
          <form action={deleteItem}>
            <input type="hidden" name="id" value={item.id} />
            <Button type="submit" variant="danger">
              Delete item
            </Button>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
