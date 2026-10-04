"use server";

import { db } from "@/lib/db";
import { fieldFromForm } from "@/lib/i18n-field";
import { TAGS } from "@/lib/content";
import { bool, done, fail, guard, int, optionalStr, slugify, str, uniqueSlug } from "@/lib/admin-action";

const LIST = "/admin/products";

/*
 * The boutique.
 *
 * `price` stays nullable all the way through: the café has never published
 * boutique prices, and an empty field must keep meaning "ask at the counter"
 * rather than quietly becoming 0 DA.
 */

const STOCK = ["in-stock", "low", "out", "unlisted"];

export async function saveProduct(formData: FormData) {
  return guard([TAGS.products], async () => {
    const id = str(formData, "id");
    const name = fieldFromForm(formData, "name");
    if (!name.fr && !name.en && !name.ar) fail(LIST, "A product needs a name.");

    const stock = str(formData, "stock") || "in-stock";
    if (!STOCK.includes(stock)) fail(LIST, "Unknown stock state.");

    const price = int(formData, "price");
    if (price !== null && (price < 0 || price > 10_000_000)) {
      fail(LIST, "That price does not look right.");
    }

    const data = {
      name,
      description: fieldFromForm(formData, "description"),
      details: fieldFromForm(formData, "details"),
      categoryId: optionalStr(formData, "categoryId"),
      sku: optionalStr(formData, "sku", 60),
      price,
      imageId: optionalStr(formData, "imageId"),
      stock,
      featured: bool(formData, "featured"),
      published: bool(formData, "published"),
    };

    const productId = id
      ? (await db.product.update({ where: { id }, data })).id
      : (
          await db.product.create({
            data: {
              ...data,
              slug: await uniqueSlug(
                slugify(name.en ?? name.fr ?? "", "product"),
                async (slug) =>
                  Boolean(await db.product.findUnique({ where: { slug }, select: { id: true } })),
              ),
              position:
                ((await db.product.findFirst({ orderBy: { position: "desc" } }))?.position ?? -1) + 1,
            },
          })
        ).id;

    /*
     * The gallery is replaced wholesale rather than diffed: the form posts the
     * complete list of chosen images, so anything absent was deselected.
     */
    const gallery = formData.getAll("gallery").map(String).filter(Boolean);
    await db.productImage.deleteMany({ where: { productId } });
    if (gallery.length) {
      await db.productImage.createMany({
        data: gallery.map((mediaId, position) => ({ productId, mediaId, position })),
      });
    }

    done(LIST, id ? "Product saved." : "Product added.");
  });
}

export async function deleteProduct(formData: FormData) {
  return guard([TAGS.products], async () => {
    await db.product.delete({ where: { id: str(formData, "id") } });
    done(LIST, "Product deleted.");
  });
}

/** The quick switch from the list — "we've sold out of the totes". */
export async function cycleStock(formData: FormData) {
  return guard([TAGS.products], async () => {
    const id = str(formData, "id");
    const product = await db.product.findUnique({ where: { id } });
    if (!product) fail(LIST, "That product no longer exists.");
    const next = STOCK[(STOCK.indexOf(product.stock) + 1) % STOCK.length];
    await db.product.update({ where: { id }, data: { stock: next } });
    done(LIST, `Marked ${next.replace("-", " ")}.`);
  });
}

export async function moveProduct(formData: FormData) {
  return guard([TAGS.products], async () => {
    const id = str(formData, "id");
    const direction = str(formData, "direction") === "up" ? "up" : "down";
    const current = await db.product.findUnique({ where: { id } });
    if (!current) fail(LIST, "That product no longer exists.");

    /*
     * Reordering is scoped to the product's own category, because that is how
     * the shop renders it — swapping with a product from another shelf would
     * move it nowhere the customer can see.
     */
    const neighbour = await db.product.findFirst({
      where: {
        categoryId: current.categoryId,
        position: direction === "up" ? { lt: current.position } : { gt: current.position },
      },
      orderBy: { position: direction === "up" ? "desc" : "asc" },
    });
    if (!neighbour) done(LIST, "Already at the end.");

    await db.$transaction([
      db.product.update({ where: { id: current.id }, data: { position: neighbour.position } }),
      db.product.update({ where: { id: neighbour.id }, data: { position: current.position } }),
    ]);
    done(LIST, "Order updated.");
  });
}

// ------------------------------------------------------------------ categories

export async function saveCategory(formData: FormData) {
  return guard([TAGS.products], async () => {
    const id = str(formData, "id");
    const name = fieldFromForm(formData, "name");
    if (!name.fr && !name.en && !name.ar) fail(`${LIST}/categories`, "A category needs a name.");

    const data = {
      name,
      note: fieldFromForm(formData, "note"),
      published: bool(formData, "published"),
    };

    if (id) {
      await db.productCategory.update({ where: { id }, data });
      done(`${LIST}/categories`, "Category saved.");
    }
    const last = await db.productCategory.findFirst({ orderBy: { position: "desc" } });
    await db.productCategory.create({
      data: {
        ...data,
        slug: await uniqueSlug(slugify(name.en ?? name.fr ?? "", "category"), async (slug) =>
          Boolean(await db.productCategory.findUnique({ where: { slug }, select: { id: true } })),
        ),
        position: (last?.position ?? -1) + 1,
      },
    });
    done(`${LIST}/categories`, "Category added.");
  });
}

export async function deleteCategory(formData: FormData) {
  return guard([TAGS.products], async () => {
    const id = str(formData, "id");
    // Products survive; they simply become uncategorised and still show in the
    // shop, which is better than vanishing with the category.
    await db.productCategory.delete({ where: { id } });
    done(`${LIST}/categories`, "Category deleted. Its products are now uncategorised.");
  });
}
