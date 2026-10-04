"use server";

import { db } from "@/lib/db";
import { fieldFromForm } from "@/lib/i18n-field";
import { TAGS } from "@/lib/content";
import { bool, done, fail, guard, int, optionalStr, str } from "@/lib/admin-action";

const PAGE = "/admin/today";

/*
 * "Today at HEYCAT".
 *
 * One feature per day. Saving the same date twice updates it rather than
 * stacking duplicates, which is what someone correcting a typo expects.
 */
export async function saveFeature(formData: FormData) {
  return guard([TAGS.feature], async () => {
    const title = fieldFromForm(formData, "title");
    const date = str(formData, "date", 10);

    if (!title.fr && !title.en && !title.ar) fail(PAGE, "Give today's feature a title.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(PAGE, "Pick a date.");

    const data = {
      title,
      description: fieldFromForm(formData, "description"),
      price: int(formData, "price"),
      imageId: optionalStr(formData, "imageId"),
      active: bool(formData, "active"),
    };

    const existing = await db.feature.findFirst({ where: { date } });
    if (existing) {
      await db.feature.update({ where: { id: existing.id }, data });
      done(PAGE, "Updated.");
    }
    await db.feature.create({ data: { ...data, date } });
    done(PAGE, "Set for " + date + ".");
  });
}

export async function deleteFeature(formData: FormData) {
  return guard([TAGS.feature], async () => {
    await db.feature.delete({ where: { id: str(formData, "id") } });
    done(PAGE, "Removed.");
  });
}
