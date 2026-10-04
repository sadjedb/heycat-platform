import { notFound } from "next/navigation";
import { Badge, Button, Card, Flash, LinkButton, PageHeader, Textarea } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSettings, whatsappLink } from "@/lib/settings";
import { deleteReservation, saveNote, setStatus } from "../actions";
import { assignTable } from "../../tables/actions";
import { tableAvailability } from "@/lib/availability";
import { Select } from "@/components/admin/ui";
import { t as tr } from "@/lib/i18n-field";

export const metadata = { title: "Reservation" };

const TONE = {
  pending: "warn", confirmed: "good", rejected: "bad",
  cancelled: "neutral", completed: "info",
} as const;

/** Which moves make sense from where. Keeps the café out of odd states. */
const NEXT: Record<string, { status: string; label: string; variant?: "primary" | "secondary" | "danger" }[]> = {
  pending: [
    { status: "confirmed", label: "Confirm", variant: "primary" },
    { status: "rejected", label: "Decline", variant: "danger" },
  ],
  confirmed: [
    { status: "completed", label: "Mark completed", variant: "primary" },
    { status: "cancelled", label: "Cancel", variant: "danger" },
  ],
  rejected: [{ status: "pending", label: "Reopen" }],
  cancelled: [{ status: "pending", label: "Reopen" }],
  completed: [],
};

export default async function ReservationDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { ok, error } = await searchParams;

  const [reservation, settings] = await Promise.all([
    db.reservation.findUnique({ where: { id }, include: { table: true } }),
    getSettings(),
  ]);
  if (!reservation) notFound();

  /*
   * Which tables could take this booking, excluding the booking itself so its
   * own table is not reported as taken.
   */
  const seating = await tableAvailability(
    {
      date: reservation.date,
      time: reservation.time,
      guests: reservation.guests,
      locale: "fr",
      excludeReservationId: reservation.id,
    },
    settings,
  );

  const greeting = `${reservation.name} — ${reservation.date} ${reservation.time}, ${reservation.guests}`;
  const wa = whatsappLink({ ...settings, contact: { ...settings.contact, whatsapp: reservation.phone } }, greeting);

  return (
    <div className="space-y-8">
      <PageHeader title={reservation.name} description={`${reservation.date} at ${reservation.time} · ${reservation.guests} guest(s)`}>
        <LinkButton href="/admin/reservations" variant="ghost">← All reservations</LinkButton>
      </PageHeader>

      <Flash ok={ok} error={error} />

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={TONE[reservation.status as keyof typeof TONE] ?? "neutral"}>
            {reservation.status}
          </Badge>
          <span className="text-[0.8rem] text-mist">
            Requested {reservation.createdAt.toISOString().slice(0, 16).replace("T", " ")} · in {reservation.locale}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {NEXT[reservation.status]?.map((move) => (
            <form action={setStatus} key={move.status}>
              <input type="hidden" name="id" value={reservation.id} />
              <input type="hidden" name="status" value={move.status} />
              <Button type="submit" variant={move.variant ?? "secondary"}>{move.label}</Button>
            </form>
          ))}
          {NEXT[reservation.status]?.length === 0 ? (
            <p className="text-[0.86rem] text-taupe">This reservation is closed.</p>
          ) : null}
        </div>
      </Card>

      <Card title="Guest">
        <dl className="grid gap-3 sm:grid-cols-2">
          {[
            ["Name", reservation.name],
            ["Phone", reservation.phone],
            ["Email", reservation.email ?? "—"],
            ["Guests", String(reservation.guests)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[0.72rem] tracking-[0.1em] text-mist uppercase">{label}</dt>
              <dd className="mt-0.5 text-[0.95rem]"><span dir="ltr">{value}</span></dd>
            </div>
          ))}
        </dl>

        {reservation.message ? (
          <div className="mt-5 rounded-lg bg-shell/70 p-4">
            <p className="text-[0.72rem] tracking-[0.1em] text-mist uppercase">From the guest</p>
            <p className="mt-1.5 text-[0.9rem] leading-relaxed">{reservation.message}</p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <a href={`tel:${reservation.phone.replace(/\s/g, "")}`}
            className="rounded-full border border-espresso/25 px-5 py-2.5 text-[0.76rem] tracking-[0.1em] uppercase hover:border-espresso">
            Call
          </a>
          {wa ? (
            <a href={wa} target="_blank" rel="noreferrer"
              className="rounded-full border border-espresso/25 px-5 py-2.5 text-[0.76rem] tracking-[0.1em] uppercase hover:border-espresso">
              WhatsApp the guest
            </a>
          ) : null}
        </div>
      </Card>

      <Card
        title="Table"
        description="What the guest picked, or leave it to the café. Tables already held at this time are not offered."
      >
        <form action={assignTable} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="reservationId" value={reservation.id} />
          <label className="block min-w-48 flex-1">
            <span className="mb-1.5 block text-[0.78rem] font-semibold text-espresso">
              Assigned table
            </span>
            <Select name="tableId" defaultValue={reservation.tableId ?? ""}>
              <option value="">No table — the café will seat them</option>
              {seating.map((x) => (
                <option key={x.id} value={x.id} disabled={x.state !== "free"}>
                  Table {x.number} · {x.seats} seats
                  {x.label ? ` · ${x.label}` : ""}
                  {x.state === "taken" ? " — taken" : x.state === "too-small" ? " — too small" : x.state === "closed" ? " — closed" : ""}
                </option>
              ))}
            </Select>
          </label>
          <Button type="submit" variant="secondary">Save table</Button>
        </form>
        {reservation.table ? (
          <p className="mt-3 text-[0.84rem] text-taupe">
            Currently table {reservation.table.number}
            {reservation.table.label ? ` — ${tr(reservation.table.label, "fr")}` : ""} ·{" "}
            {reservation.table.seats} seats
          </p>
        ) : null}
      </Card>

      <Card title="Internal note" description="Only the café sees this.">
        <form action={saveNote} className="space-y-4">
          <input type="hidden" name="id" value={reservation.id} />
          <Textarea name="adminNote" defaultValue={reservation.adminNote ?? ""} rows={4}
            placeholder="Called, confirmed for the window table." />
          <Button type="submit">Save note</Button>
        </form>
      </Card>

      <Card title="Delete" description="Prefer cancelling — deleting loses the record.">
        <form action={deleteReservation}>
          <input type="hidden" name="id" value={reservation.id} />
          <Button type="submit" variant="danger">Delete reservation</Button>
        </form>
      </Card>
    </div>
  );
}
