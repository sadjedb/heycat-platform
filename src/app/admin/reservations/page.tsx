import Link from "next/link";
import { Badge, Card, EmptyState, Flash, PageHeader, Table, Td } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { todayISO } from "@/lib/content";

export const metadata = { title: "Reservations" };

const TONE = {
  pending: "warn", confirmed: "good", rejected: "bad",
  cancelled: "neutral", completed: "info",
} as const;

const FILTERS = ["all", "pending", "confirmed", "today", "upcoming", "past"] as const;

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; status?: string; q?: string }>;
}) {
  await requireAdmin();
  const { ok, error, status = "all", q = "" } = await searchParams;
  const today = todayISO();

  const where: Record<string, unknown> = {};
  if (status === "pending" || status === "confirmed") where.status = status;
  if (status === "today") where.date = today;
  if (status === "upcoming") where.date = { gt: today };
  if (status === "past") where.date = { lt: today };
  if (q.trim()) {
    where.OR = [
      { name: { contains: q.trim() } },
      { phone: { contains: q.trim() } },
      { email: { contains: q.trim() } },
    ];
  }

  const reservations = await db.reservation.findMany({
    where,
    orderBy: [{ date: "desc" }, { time: "desc" }],
    take: 200,
    include: { table: { select: { number: true } } },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reservations"
        description="Requests arrive as pending. Confirming does not send anything automatically — the café calls or messages the guest."
      />
      <Flash ok={ok} error={error} />

      <Card>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <Link
                key={f}
                href={`/admin/reservations?status=${f}`}
                className={[
                  "rounded-full px-3.5 py-1.5 text-[0.74rem] tracking-[0.08em] uppercase transition-colors",
                  status === f ? "bg-espresso text-cream" : "border border-sand text-taupe hover:border-espresso/40",
                ].join(" ")}
              >
                {f}
              </Link>
            ))}
          </div>
          <form className="ms-auto flex gap-2">
            <input type="hidden" name="status" value={status} />
            <input
              name="q"
              defaultValue={q}
              placeholder="Name or phone"
              className="rounded-lg border border-sand bg-cream/40 px-3 py-2 text-[0.86rem] outline-none focus:border-cocoa"
            />
            <button type="submit" className="rounded-full border border-espresso/25 px-4 py-2 text-[0.74rem] tracking-[0.1em] uppercase">
              Search
            </button>
          </form>
        </div>

        {reservations.length === 0 ? (
          <EmptyState
            title="Nothing here"
            description="No reservations match this filter yet. New requests from the website land here straight away."
          />
        ) : (
          <Table head={["Date", "Time", "Guest", "People", "Table", "Phone", "Status", ""]}>
            {reservations.map((r) => (
              <tr key={r.id}>
                <Td className="tabular-nums">{r.date}</Td>
                <Td className="tabular-nums">{r.time}</Td>
                <Td>{r.name}</Td>
                <Td className="tabular-nums">{r.guests}</Td>
                <Td className="tabular-nums">{r.table ? r.table.number : <span className="text-mist">—</span>}</Td>
                <Td className="text-taupe"><span dir="ltr">{r.phone}</span></Td>
                <Td><Badge tone={TONE[r.status as keyof typeof TONE] ?? "neutral"}>{r.status}</Badge></Td>
                <Td>
                  <Link href={`/admin/reservations/${r.id}`}
                    className="text-[0.8rem] tracking-[0.06em] text-cocoa uppercase hover:underline">Open</Link>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
