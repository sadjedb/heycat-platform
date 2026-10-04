"use server";

import { db } from "@/lib/db";
import { fieldFromForm } from "@/lib/i18n-field";
import { TAGS } from "@/lib/content";
import { bool, done, fail, guard, optionalStr, slugify, str, uniqueSlug } from "@/lib/admin-action";

const LIST = "/admin/cats";

/*
 * Cat management.
 *
 * Traits are the spec list the café prints on each cat's card ("Personality:
 * Acts like a princess"). They arrive as two parallel arrays of inputs and are
 * stored per locale, so the owner can write the list once in French and
 * translate later without losing the order.
 */
function traitsFromForm(formData: FormData) {
  const out: Record<string, { label: string; value: string }[]> = {};
  for (const locale of ["fr", "en", "ar"]) {
    const labels = formData.getAll(`traitLabel.${locale}`).map(String);
    const values = formData.getAll(`traitValue.${locale}`).map(String);
    const rows = labels
      .map((label, i) => ({ label: label.trim(), value: (values[i] ?? "").trim() }))
      .filter((r) => r.label && r.value);
    if (rows.length) out[locale] = rows;
  }
  return out;
}

export async function saveCat(formData: FormData) {
  return guard([TAGS.cats], async () => {
    const id = str(formData, "id");
    const name = fieldFromForm(formData, "name");
    if (!name.fr && !name.en && !name.ar) fail(LIST, "A cat needs a name.");

    const traits = traitsFromForm(formData);
    const adoption = str(formData, "adoption") || "not-listed";
    const valid = ["not-listed", "available", "reserved", "adopted", "info-only"];
    if (!valid.includes(adoption)) fail(LIST, "Unknown adoption status.");

    const data = {
      name,
      title: fieldFromForm(formData, "title"),
      breed: fieldFromForm(formData, "breed"),
      funFact: fieldFromForm(formData, "funFact"),
      adoptionNote: fieldFromForm(formData, "adoptionNote"),
      traits: Object.keys(traits).length ? traits : undefined,
      imageId: optionalStr(formData, "imageId"),
      status: str(formData, "status") || "resident",
      adoption,
      featured: bool(formData, "featured"),
      published: bool(formData, "published"),
    };

    if (id) {
      await db.cat.update({ where: { id }, data });
      done(LIST, `${name.fr ?? name.en} saved.`);
    }
    const last = await db.cat.findFirst({ orderBy: { position: "desc" } });
    await db.cat.create({
      data: {
        ...data,
        slug: await uniqueSlug(slugify(name.en ?? name.fr ?? "", "cat"), async (slug) =>
          Boolean(await db.cat.findUnique({ where: { slug }, select: { id: true } })),
        ),
        position: (last?.position ?? -1) + 1,
      },
    });
    done(LIST, "Cat added.");
  });
}

export async function deleteCat(formData: FormData) {
  return guard([TAGS.cats], async () => {
    await db.cat.delete({ where: { id: str(formData, "id") } });
    done(LIST, "Cat removed.");
  });
}

export async function moveCat(formData: FormData) {
  return guard([TAGS.cats], async () => {
    const id = str(formData, "id");
    const direction = str(formData, "direction") === "up" ? "up" : "down";
    const current = await db.cat.findUnique({ where: { id } });
    if (!current) fail(LIST, "That cat no longer exists.");

    const neighbour = await db.cat.findFirst({
      where: { position: direction === "up" ? { lt: current.position } : { gt: current.position } },
      orderBy: { position: direction === "up" ? "desc" : "asc" },
    });
    if (!neighbour) done(LIST, "Already at the end.");

    await db.$transaction([
      db.cat.update({ where: { id: current.id }, data: { position: neighbour.position } }),
      db.cat.update({ where: { id: neighbour.id }, data: { position: current.position } }),
    ]);
    done(LIST, "Order updated.");
  });
}
