import "server-only";

import { redirect } from "next/navigation";
import { requireAdmin } from "./auth";
import { invalidate, type ContentTag } from "./content";

/*
 * The shape every admin mutation shares.
 *
 * `guard` does three things that are easy to forget one of: it checks the
 * session *inside the action* (a layout cannot protect a POST), it runs the
 * work, and it expires the public site's caches so an edit is visible at once.
 */

export type ActionResult = { ok?: string; error?: string };

export async function guard<T>(
  tags: ContentTag[],
  work: () => Promise<T>,
): Promise<T> {
  await requireAdmin();
  try {
    return await work();
  } finally {
    /*
     * `finally`, not a line after `work()`.
     *
     * Every action ends by calling `done()`/`fail()`, which call `redirect()`,
     * which signals by throwing. Invalidating after the await therefore never
     * ran: saves were written to the database and the public site kept serving
     * the old prerender. Caught by changing a price and watching the menu page
     * refuse to budge.
     */
    if (tags.length) invalidate(...tags);
  }
}

/** Redirect back to a list with a message. Throws, so it never returns. */
export function done(path: string, message: string): never {
  redirect(`${path}?ok=${encodeURIComponent(message)}`);
}

export function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

// ------------------------------------------------------------------- parsing

export function str(form: FormData, key: string, max = 500): string {
  const raw = form.get(key);
  return typeof raw === "string" ? raw.trim().slice(0, max) : "";
}

export function optionalStr(form: FormData, key: string, max = 500): string | null {
  const value = str(form, key, max);
  return value === "" ? null : value;
}

export function bool(form: FormData, key: string): boolean {
  return form.get(key) === "on" || form.get(key) === "true";
}

export function int(form: FormData, key: string): number | null {
  const raw = str(form, key, 20);
  if (raw === "") return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * URL-safe slug. Falls back to a timestamp so a name written only in Arabic —
 * which strips to nothing here — still produces a usable, unique key.
 */
/**
 * A slug nothing else is using.
 *
 * Slugs are URLs, so they are unique in the database — and two things with the
 * same name is an ordinary day in a café ("Latte" on the printed menu and on
 * the seasonal board), as is re-adding something that was deleted. Without
 * this, the second one hit a unique-constraint violation and the owner got a
 * 500 instead of a saved record.
 */
export async function uniqueSlug(
  desired: string,
  taken: (slug: string) => Promise<boolean>,
): Promise<string> {
  let candidate = desired;
  for (let n = 2; await taken(candidate); n++) candidate = `${desired}-${n}`;
  return candidate;
}

export function slugify(input: string, fallback = "item"): string {
  const base = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || `${fallback}-${Date.now().toString(36)}`;
}
