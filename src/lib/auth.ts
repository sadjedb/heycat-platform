import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

/*
 * Authentication.
 *
 * Deliberately built on node:crypto rather than an auth library. The whole
 * requirement is "one or two café staff log in with a password": there is no
 * OAuth, no magic links, no multi-tenancy. scrypt for hashing and a random
 * opaque token in an HttpOnly cookie covers it, with no dependency to keep
 * patched and nothing a reader has to take on trust.
 *
 * Sessions live in the database rather than in a signed/stateless cookie, so
 * that revoking one actually revokes it — "log out everywhere" has to work if
 * a phone goes missing.
 */

const COOKIE = "heycat_session";
const SESSION_DAYS = 14;
const SCRYPT_KEYLEN = 64;

export type SessionAdmin = {
  id: string;
  email: string;
  name: string;
  role: string;
};

// ------------------------------------------------------------------ passwords

export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(plain.normalize("NFKC"), salt, SCRYPT_KEYLEN);
  return `scrypt:${salt.toString("base64")}:${hash.toString("base64")}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [scheme, saltB64, hashB64] = stored.split(":");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;

  const expected = Buffer.from(hashB64, "base64");
  let actual: Buffer;
  try {
    actual = crypto.scryptSync(
      plain.normalize("NFKC"),
      Buffer.from(saltB64, "base64"),
      expected.length,
    );
  } catch {
    return false;
  }
  // Lengths are equal by construction, but timingSafeEqual throws if they ever
  // are not, which would turn a bad password into a 500.
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

// ------------------------------------------------------------------- sessions

/** Only the hash is stored, so a leaked database does not hand over live sessions. */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(adminId: string, userAgent?: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  await db.session.create({
    data: { tokenHash: hashToken(token), adminId, expiresAt, userAgent },
  });

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  await db.admin.update({ where: { id: adminId }, data: { lastLoginAt: new Date() } });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  jar.delete(COOKIE);
}

/** Drop every session for an admin — "sign out on all devices". */
export async function destroyAllSessions(adminId: string) {
  await db.session.deleteMany({ where: { adminId } });
}

/** The signed-in admin, or null. Never throws; safe to call anywhere. */
export async function getSessionAdmin(): Promise<SessionAdmin | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { admin: true },
  });
  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  const { id, email, name, role } = session.admin;
  return { id, email, name, role };
}

/**
 * Guard for every admin page and every mutating action.
 *
 * Call this inside the action, not only in the layout: a layout check protects
 * what is rendered, never what a POST can reach.
 */
export async function requireAdmin(): Promise<SessionAdmin> {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** Has anyone been created yet? Drives the first-run setup screen. */
export async function hasAnyAdmin(): Promise<boolean> {
  return (await db.admin.count()) > 0;
}

// --------------------------------------------------------------- rate limiting

/*
 * In-memory sliding window, enough to stop password guessing against a café's
 * single login form. It resets on deploy and is per-instance — documented as a
 * limitation; a second instance would want this in the database or a cache.
 */
const attempts = new Map<string, number[]>();
const WINDOW_MS = 10 * 60_000;
const MAX_ATTEMPTS = 8;

export function rateLimit(key: string): { ok: boolean; retryInMinutes: number } {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(key, recent);

  if (attempts.size > 500) {
    for (const [k, times] of attempts) {
      if (times.every((t) => now - t >= WINDOW_MS)) attempts.delete(k);
    }
  }

  if (recent.length > MAX_ATTEMPTS) {
    const oldest = recent[0];
    return { ok: false, retryInMinutes: Math.ceil((WINDOW_MS - (now - oldest)) / 60_000) };
  }
  return { ok: true, retryInMinutes: 0 };
}

/** Forget a key's attempts after a successful login. */
export function clearRateLimit(key: string) {
  attempts.delete(key);
}
