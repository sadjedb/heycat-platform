import Link from "next/link";
import { Badge, Card, EmptyState, Flash, LinkButton, PageHeader, Table, Td } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n-field";
import { todayISO } from "@/lib/content";

export const metadata = { title: "Events" };

export default async function EventsPage({
  searchParams,
}: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireAdmin();
  const { ok, error } = await searchParams;
  const events = await db.event.findMany({ orderBy: [{ date: "desc" }] });
  const today = todayISO();

  return (
    <div className="space-y-8">
      <PageHeader title="Events"
        description="Birthdays, special evenings, workshops. Past events drop off the public site on their own.">
        <LinkButton href="/admin/events/new" variant="primary">Add event</LinkButton>
      </PageHeader>
      <Flash ok={ok} error={error} />

      <Card>
        {events.length === 0 ? (
          <EmptyState title="No events yet"
            description="Nothing is published until you add one — the website simply hides the section."
            action={<LinkButton href="/admin/events/new" variant="primary">Add event</LinkButton>} />
        ) : (
          <Table head={["Date", "Event", "Status", ""]}>
            {events.map((e) => (
              <tr key={e.id}>
                <Td className="tabular-nums">{e.date}{e.time ? ` · ${e.time}` : ""}</Td>
                <Td>
                  <Link href={`/admin/events/${e.id}`} className="font-display text-[1rem] hover:underline">
                    {t(e.title, "fr") || "(untitled)"}
                  </Link>
                </Td>
                <Td>
                  {!e.published ? <Badge tone="neutral">draft</Badge>
                    : e.date < today ? <Badge tone="neutral">past</Badge>
                    : <Badge tone="good">live</Badge>}
                </Td>
                <Td>
                  <Link href={`/admin/events/${e.id}`}
                    className="text-[0.8rem] tracking-[0.06em] text-cocoa uppercase hover:underline">Edit</Link>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
