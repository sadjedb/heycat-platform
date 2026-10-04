"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  clearRateLimit,
  createSession,
  destroySession,
  hasAnyAdmin,
  hashPassword,
  rateLimit,
  verifyPassword,
} from "@/lib/auth";

/*
 * Login, first-run setup and logout.
 *
 * Kept apart from the feature actions because these are the only ones that run
 * without an authenticated admin.
 */

const credentials = z.object({
  email: z.string().email().max(160),
  password: z.string().min(1).max(200),
});

/*
 * `redirect` throws, so this never returns — saying so lets the type checker
 * narrow everything after a `back(...)` call instead of needing early returns.
 */
function back(path: string, params: Record<string, string>): never {
  const q = new URLSearchParams(params).toString();
  redirect(`${path}?${q}`);
}

export async function loginAction(formData: FormData) {
  const parsed = credentials.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) back("/admin/login", { error: "Enter an email and a password." });

  const { email, password } = parsed.data;

  // Keyed on the email as well as the IP so one noisy network cannot lock
  // everyone out, and one account cannot be ground down from many addresses.
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limit = rateLimit(`${ip}:${email}`);
  if (!limit.ok) {
    back("/admin/login", {
      error: `Too many attempts. Try again in ${limit.retryInMinutes} minute(s).`,
    });
  }

  const admin = await db.admin.findUnique({ where: { email } });

  // Always run a verification, even with no such user, so the response time
  // does not reveal whether the address exists.
  const stored = admin?.passwordHash ?? hashPassword("no-such-user");
  const ok = verifyPassword(password, stored);

  if (!admin || !ok) back("/admin/login", { error: "Wrong email or password." });

  clearRateLimit(`${ip}:${email}`);
  const userAgent = (await headers()).get("user-agent") ?? undefined;
  await createSession(admin.id, userAgent?.slice(0, 200));
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/**
 * First-run only: create the first owner when the table is empty.
 *
 * Re-checks `hasAnyAdmin` inside the action — the form being rendered is not
 * authorisation, and without this check anyone could create an owner by
 * replaying the POST after setup.
 */
export async function setupAction(formData: FormData) {
  if (await hasAnyAdmin()) back("/admin/login", { error: "Setup has already been completed." });

  const name = String(formData.get("name") ?? "").trim();
  const parsed = credentials.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success || !name) {
    back("/admin/login", { error: "Enter a name, an email and a password." });
  }
  if (parsed.data.password.length < 10) {
    back("/admin/login", { error: "Use a password of at least 10 characters." });
  }

  const admin = await db.admin.create({
    data: {
      email: parsed.data.email,
      name,
      passwordHash: hashPassword(parsed.data.password),
      role: "owner",
    },
  });
  await createSession(admin.id);
  redirect("/admin");
}
