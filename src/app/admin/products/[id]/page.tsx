import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Button,
  Card,
  Checkbox,
  Field,
  Flash,
  I18nInput,
  Input,
  LinkButton,
  PageHeader,
  Select,
} from "@/components/admin/ui";
import { GalleryPicker, MediaPicker } from "@/components/admin/media-picker";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n-field";
import { deleteProduct, saveProduct } from "../actions";

export const metadata = { title: "Product" };

export default async function ProductEditor({
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

  const [product, categories] = await Promise.all([
    isNew
      ? null
      : db.product.findUnique({
          where: { id },
          include: { gallery: { orderBy: { position: "asc" }, select: { mediaId: true } } },
        }),
    db.productCategory.findMany({ orderBy: { position: "asc" } }),
  ]);
  if (!isNew && !product) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        title={isNew ? "New product" : t(product!.name, "fr") || "Product"}
        description={
          product
            ? `Public page: /fr/boutique/${product.slug}`
            : "Named in French at minimum — the other languages fall back to it."
        }
      >
        <LinkButton href="/admin/products" variant="ghost">
          ← Boutique
        </LinkButton>
      </PageHeader>
      <Flash ok={ok} error={error} />

      <form action={saveProduct} className="space-y-6">
        {product ? <input type="hidden" name="id" value={product.id} /> : null}

        <Card title="The product">
          <div className="space-y-5">
            <I18nInput name="name" label="Name" value={product?.name} required />
            <I18nInput
              name="description"
              label="Description"
              value={product?.description}
              multiline
            />
            <I18nInput
              name="details"
              label="Details"
              hint="Material, size, how to care for it — shown under the description"
              value={product?.details}
              multiline
            />
          </div>
        </Card>

        <Card
          title="Shelf"
          description="Which part of the boutique it sits on. Products with no shelf still appear, grouped at the end."
          action={
            <Link
              href="/admin/products/categories"
              className="text-[0.78rem] text-cocoa hover:underline"
            >
              manage shelves ↗
            </Link>
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category">
              <Select name="categoryId" defaultValue={product?.categoryId ?? ""}>
                <option value="">No shelf</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {t(c.name, "fr") || "(unnamed)"}
                    {c.published ? "" : " — hidden"}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Reference" hint="Optional — the café's own code for it">
              <Input name="sku" defaultValue={product?.sku ?? ""} maxLength={60} />
            </Field>
          </div>
        </Card>

        <Card title="Price and stock">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Price in DA" hint="Empty shows as “ask at the counter”">
              <Input
                type="number"
                name="price"
                min={0}
                step={10}
                defaultValue={product?.price ?? ""}
                inputMode="numeric"
              />
            </Field>
            <Field label="Stock">
              <Select name="stock" defaultValue={product?.stock ?? "in-stock"}>
                <option value="in-stock">In stock</option>
                <option value="low">Running low</option>
                <option value="out">Out of stock — shown, greyed, no enquiry button</option>
                <option value="unlisted">Hide from the site</option>
              </Select>
            </Field>
          </div>
        </Card>

        <Card
          title="Photographs"
          description="The first is the one customers see on the shelf. The rest stack underneath on the product's own page."
        >
          <div className="space-y-6">
            <MediaPicker selectedId={product?.imageId} label="Main photograph" />
            <GalleryPicker
              selectedIds={product?.gallery.map((g) => g.mediaId) ?? []}
              hint="numbers show the order"
            />
          </div>
        </Card>

        <Card title="Visibility">
          <div className="space-y-3">
            <Checkbox
              name="published"
              label="Show in the boutique"
              defaultChecked={product?.published ?? true}
            />
            <Checkbox
              name="featured"
              label="Feature it"
              hint="Carries a badge, and these come first on the homepage shop rail"
              defaultChecked={product?.featured ?? false}
            />
          </div>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit">{isNew ? "Add product" : "Save product"}</Button>
          <LinkButton href="/admin/products" variant="ghost">
            Cancel
          </LinkButton>
        </div>
      </form>

      {product ? (
        <Card title="Delete">
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={product.id} />
            <Button type="submit" variant="danger">
              Delete product
            </Button>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
