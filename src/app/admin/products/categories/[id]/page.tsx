import { notFound } from "next/navigation";
import {
  Button,
  Card,
  Checkbox,
  Flash,
  I18nInput,
  LinkButton,
  PageHeader,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n-field";
import { deleteCategory, saveCategory } from "../../actions";

export const metadata = { title: "Shelf" };

export default async function CategoryEditor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { ok, error } = await searchParams;
  const isNew = id === "new";

  const category = isNew
    ? null
    : await db.productCategory.findUnique({
        where: { id },
        include: { _count: { select: { products: true } } },
      });
  if (!isNew && !category) notFound();

  return (
    <div className="space-y-8">
      <PageHeader title={isNew ? "New shelf" : t(category!.name, "fr") || "Shelf"}>
        <LinkButton href="/admin/products/categories" variant="ghost">
          ← Shelves
        </LinkButton>
      </PageHeader>
      <Flash ok={ok} error={error} />

      <form action={saveCategory} className="space-y-6">
        {category ? <input type="hidden" name="id" value={category.id} /> : null}

        <Card title="The shelf">
          <div className="space-y-5">
            <I18nInput name="name" label="Name" value={category?.name} required />
            <I18nInput
              name="note"
              label="Note"
              hint="One line under the heading on the boutique page — optional"
              value={category?.note}
              multiline
            />
          </div>
        </Card>

        <Card title="Visibility">
          <Checkbox
            name="published"
            label="Show this shelf"
            hint="Hiding it hides every product on it too"
            defaultChecked={category?.published ?? true}
          />
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit">{isNew ? "Add shelf" : "Save shelf"}</Button>
          <LinkButton href="/admin/products/categories" variant="ghost">
            Cancel
          </LinkButton>
        </div>
      </form>

      {category ? (
        <Card
          title="Delete"
          description={
            category._count.products > 0
              ? `${category._count.products} product${
                  category._count.products === 1 ? "" : "s"
                } sit here. Deleting the shelf keeps them — they become uncategorised and still show in the shop.`
              : "Nothing sits on this shelf."
          }
        >
          <form action={deleteCategory}>
            <input type="hidden" name="id" value={category.id} />
            <Button type="submit" variant="danger">
              Delete shelf
            </Button>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
