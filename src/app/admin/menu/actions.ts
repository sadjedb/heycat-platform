"use server";

import { db } from "@/lib/db";
import { fieldFromForm } from "@/lib/i18n-field";
import { TAGS } from "@/lib/content";
import { bool, done, fail, guard, int, optionalStr, slugify, str, uniqueSlug } from "@/lib/admin-action";

/*
 * Menu management.
 *
 * This is the feature the whole platform exists for: when the café changes a
 * price, nobody should have to call a developer. Everything here invalidates the
 * `menu` cache tag, so a saved price is live on the public site immediately.
 */

const LIST = "/admin/menu";

// ---------------------------------------------------------------- categories

export async function saveCategory(formData: FormData) {
  return guard([TAGS.menu], async () => {
    const id = str(formData, "id");
    const name = fieldFromForm(formData, "name");
    const note = fieldFromForm(formData, "note");

    if (!name.fr && !name.en && !name.ar) {
      fail(LIST, "A category needs a name in at least one language.");
    }

    const data = {
      name,
      note,
      source: str(formData, "source") === "instagram" ? "instagram" : "printed-menu",
      published: bool(formData, "published"),
    };

    if (id) {
      await db.menuCategory.update({ where: { id }, data });
      done(LIST, `Category "${name.fr ?? name.en}" saved.`);
    }

    const last = await db.menuCategory.findFirst({ orderBy: { position: "desc" } });
    await db.menuCategory.create({
      data: {
        ...data,
        slug: await uniqueSlug(
          slugify(name.fr ?? name.en ?? name.ar ?? "", "category"),
          async (slug) =>
            Boolean(await db.menuCategory.findUnique({ where: { slug }, select: { id: true } })),
        ),
        position: (last?.position ?? -1) + 1,
      },
    });
    done(LIST, "Category added.");
  });
}

export async function deleteCategory(formData: FormData) {
  return guard([TAGS.menu], async () => {
    const id = str(formData, "id");
    const count = await db.menuItem.count({ where: { categoryId: id } });
    if (count > 0) {
      fail(
        LIST,
        `That category still holds ${count} item(s). Move or delete them first — deleting a category deletes its items.`,
      );
    }
    await db.menuCategory.delete({ where: { id } });
    done(LIST, "Category deleted.");
  });
}

/** Swap a category with its neighbour. Up/down beats drag-and-drop here: it
 *  works without JavaScript and is reachable from a keyboard. */
export async function moveCategory(formData: FormData) {
  return guard([TAGS.menu], async () => {
    const id = str(formData, "id");
    const direction = str(formData, "direction") === "up" ? "up" : "down";
    const current = await db.menuCategory.findUnique({ where: { id } });
    if (!current) fail(LIST, "That category no longer exists.");

    const neighbour = await db.menuCategory.findFirst({
      where:
        direction === "up"
          ? { position: { lt: current.position } }
          : { position: { gt: current.position } },
      orderBy: { position: direction === "up" ? "desc" : "asc" },
    });
    if (!neighbour) done(LIST, "Already at the end.");

    await db.$transaction([
      db.menuCategory.update({ where: { id: current.id }, data: { position: neighbour.position } }),
      db.menuCategory.update({ where: { id: neighbour.id }, data: { position: current.position } }),
    ]);
    done(LIST, "Order updated.");
  });
}

// --------------------------------------------------------------------- items

export async function saveItem(formData: FormData) {
  return guard([TAGS.menu], async () => {
    const id = str(formData, "id");
    const categoryId = str(formData, "categoryId");
    const name = fieldFromForm(formData, "name");
    const description = fieldFromForm(formData, "description");

    if (!categoryId) fail(LIST, "Pick a category for the item.");
    if (!name.fr && !name.en && !name.ar) {
      fail(LIST, "An item needs a name in at least one language.");
    }

    const price = int(formData, "price");
    if (price !== null && (price < 0 || price > 1_000_000)) {
      fail(LIST, "That price does not look right.");
    }

    // "Classic, Hazelnut, Pistachio" -> ["Classic", "Hazelnut", "Pistachio"]
    const flavoursRaw = str(formData, "flavours", 400);
    const flavours = flavoursRaw
      ? flavoursRaw.split(",").map((f) => f.trim()).filter(Boolean)
      : null;

    const data = {
      categoryId,
      name,
      description: Object.keys(description).length ? description : undefined,
      flavours: flavours ?? undefined,
      price,
      imageId: optionalStr(formData, "imageId"),
      accent: optionalStr(formData, "accent", 60),
      available: bool(formData, "available"),
      featured: bool(formData, "featured"),
    };

    if (id) {
      await db.menuItem.update({ where: { id }, data });
      done(`${LIST}/category/${categoryId}`, `"${name.fr ?? name.en}" saved.`);
    }

    const last = await db.menuItem.findFirst({
      where: { categoryId },
      orderBy: { position: "desc" },
    });
    await db.menuItem.create({
      data: {
        ...data,
        slug: await uniqueSlug(
          slugify(name.fr ?? name.en ?? name.ar ?? "", "item"),
          async (slug) =>
            Boolean(await db.menuItem.findUnique({ where: { slug }, select: { id: true } })),
        ),
        position: (last?.position ?? -1) + 1,
      },
    });
    done(`${LIST}/category/${categoryId}`, "Item added.");
  });
}

export async function deleteItem(formData: FormData) {
  return guard([TAGS.menu], async () => {
    const id = str(formData, "id");
    const item = await db.menuItem.findUnique({ where: { id } });
    if (!item) fail(LIST, "That item no longer exists.");
    await db.menuItem.delete({ where: { id } });
    done(`${LIST}/category/${item.categoryId}`, "Item deleted.");
  });
}

/** The one-click toggle from the list — "we've run out of pistachio". */
export async function toggleItemAvailability(formData: FormData) {
  return guard([TAGS.menu], async () => {
    const id = str(formData, "id");
    const item = await db.menuItem.findUnique({ where: { id } });
    if (!item) fail(LIST, "That item no longer exists.");
    await db.menuItem.update({
      where: { id },
      data: { available: !item.available },
    });
    done(
      `${LIST}/category/${item.categoryId}`,
      item.available ? "Marked unavailable." : "Back on the menu.",
    );
  });
}

export async function moveItem(formData: FormData) {
  return guard([TAGS.menu], async () => {
    const id = str(formData, "id");
    const direction = str(formData, "direction") === "up" ? "up" : "down";
    const current = await db.menuItem.findUnique({ where: { id } });
    if (!current) fail(LIST, "That item no longer exists.");

    const neighbour = await db.menuItem.findFirst({
      where: {
        categoryId: current.categoryId,
        position:
          direction === "up" ? { lt: current.position } : { gt: current.position },
      },
      orderBy: { position: direction === "up" ? "desc" : "asc" },
    });
    const back = `${LIST}/category/${current.categoryId}`;
    if (!neighbour) done(back, "Already at the end.");

    await db.$transaction([
      db.menuItem.update({ where: { id: current.id }, data: { position: neighbour.position } }),
      db.menuItem.update({ where: { id: neighbour.id }, data: { position: current.position } }),
    ]);
    done(back, "Order updated.");
  });
}

// ------------------------------------------------------------------- options

export async function saveOption(formData: FormData) {
  return guard([TAGS.menu], async () => {
    const id = str(formData, "id");
    const name = fieldFromForm(formData, "name");
    const price = int(formData, "price");

    if (!name.fr && !name.en && !name.ar) fail(`${LIST}/options`, "An option needs a name.");
    if (price === null || price < 0) fail(`${LIST}/options`, "An option needs a price.");

    const data = { name, price, available: bool(formData, "available") };

    if (id) {
      await db.menuOption.update({ where: { id }, data });
      done(`${LIST}/options`, "Option saved.");
    }
    const last = await db.menuOption.findFirst({ orderBy: { position: "desc" } });
    await db.menuOption.create({ data: { ...data, position: (last?.position ?? -1) + 1 } });
    done(`${LIST}/options`, "Option added.");
  });
}

export async function deleteOption(formData: FormData) {
  return guard([TAGS.menu], async () => {
    await db.menuOption.delete({ where: { id: str(formData, "id") } });
    done(`${LIST}/options`, "Option deleted.");
  });
}
