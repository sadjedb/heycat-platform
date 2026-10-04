"use server";

import { db } from "@/lib/db";
import { fieldFromForm } from "@/lib/i18n-field";
import { TAGS } from "@/lib/content";
import { bool, done, fail, guard, optionalStr, slugify, str, uniqueSlug } from "@/lib/admin-action";

const LIST = "/admin/events";

export async function saveEvent(formData: FormData) {
  return guard([TAGS.events], async () => {
    const id = str(formData, "id");
    const title = fieldFromForm(formData, "title");
    const date = str(formData, "date", 10);

    if (!title.fr && !title.en && !title.ar) fail(LIST, "An event needs a title.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(LIST, "An event needs a date.");

    const time = str(formData, "time", 5);
    if (time && !/^\d{2}:\d{2}$/.test(time)) fail(LIST, "That time does not look right.");

    const ctaUrl = optionalStr(formData, "ctaUrl", 300);
    if (ctaUrl && !/^https?:\/\//i.test(ctaUrl)) {
      fail(LIST, "The link must start with http:// or https://");
    }

    const data = {
      title,
      description: fieldFromForm(formData, "description"),
      location: fieldFromForm(formData, "location"),
      ctaLabel: fieldFromForm(formData, "ctaLabel"),
      ctaUrl,
      date,
      time: time || null,
      imageId: optionalStr(formData, "imageId"),
      published: bool(formData, "published"),
    };

    if (id) {
      await db.event.update({ where: { id }, data });
      done(LIST, "Event saved.");
    }
    await db.event.create({
      data: {
        ...data,
        slug: await uniqueSlug(slugify(title.fr ?? title.en ?? "", "event"), async (slug) =>
          Boolean(await db.event.findUnique({ where: { slug }, select: { id: true } })),
        ),
      },
    });
    done(LIST, "Event added.");
  });
}

export async function deleteEvent(formData: FormData) {
  return guard([TAGS.events], async () => {
    await db.event.delete({ where: { id: str(formData, "id") } });
    done(LIST, "Event deleted.");
  });
}
