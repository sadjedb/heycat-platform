"use server";

import { db } from "@/lib/db";
import { TAGS } from "@/lib/content";
import { done, fail, guard, str } from "@/lib/admin-action";
import { fieldFromForm } from "@/lib/i18n-field";
import { deleteMedia, saveUpload } from "@/lib/upload";

const LIST = "/admin/media";

export async function uploadAction(formData: FormData) {
  return guard([], async () => {
    const file = formData.get("file");
    if (!(file instanceof File)) fail(LIST, "No file was chosen.");
    const result = await saveUpload(file);
    if (!result.ok) fail(LIST, result.error);
    done(LIST, "Image uploaded.");
  });
}

export async function updateAltAction(formData: FormData) {
  return guard([TAGS.menu, TAGS.cats, TAGS.products, TAGS.events, TAGS.feature], async () => {
    const id = str(formData, "id");
    await db.media.update({ where: { id }, data: { alt: fieldFromForm(formData, "alt") } });
    done(LIST, "Alt text saved.");
  });
}

export async function deleteMediaAction(formData: FormData) {
  return guard([], async () => {
    const { error } = await deleteMedia(str(formData, "id"));
    if (error) fail(LIST, error);
    done(LIST, "Image deleted.");
  });
}
