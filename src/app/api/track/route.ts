import { NextResponse } from "next/server";
import { isEventType, record } from "@/lib/analytics";

/*
 * The only public write endpoint besides the reservation form.
 *
 * It accepts a fixed set of event names and stores nothing that identifies
 * anyone. Unknown event types are dropped rather than stored, so a flood of
 * junk cannot fill the table with arbitrary strings.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { type, path, locale, slug } = (body ?? {}) as Record<string, unknown>;
  if (typeof type !== "string" || !isEventType(type)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await record(type, {
    path: typeof path === "string" ? path : undefined,
    locale: typeof locale === "string" ? locale : undefined,
    meta: typeof slug === "string" ? { slug } : undefined,
  });

  return NextResponse.json({ ok: true });
}
