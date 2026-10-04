import Link from "next/link";
import { Badge, Card, EmptyState, Flash, LinkButton, PageHeader, Stat, Table, Td } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSettings, missingBusinessInfo } from "@/lib/settings";
import { todayISO } from "@/lib/content";
import { t } from "@/lib/i18n-field";

export const metadata = { title: "Dashboard" };

/*
 * The dashboard answers one question: what needs me today?
 *
 * Pending reservations first, because they are the only thing here where a slow
 * reply costs the café a customer. Then today's bookings, then whatever the
 * café still has not told us about itself.
 */
export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const admin = await requireAdmin();
  const { ok, error } = await searchParams;
  const today = todayISO();

  const [pending, todays, upcoming, settings, counts, feature] = await Promise.all([
    db.reservation.findMany({
      where: { status: "pending" },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 8,
    }),
    db.reservation.count({ where: { date: today, status: { in: ["pending", "confirmed"] } } }),
    db.reservation.count({ where: { date: { gt: today }, status: "confirmed" } }),
    getSettings(),
    Promise.all([
      db.menuItem.count(),
      db.menuItem.count({ where: { available: false } }),
      db.cat.count({ where: { published: true } }),
      db.event.count({ where: { published: true, date: { gte: today } } }),
      db.product.count({ where: { published: true, price: null, NOT: { stock: "unlisted" } } }),
    ]),
    db.feature.findFirst({ where: { date: today, active: true } }),
  ]);

  const [menuItems, unavailable, cats, events, unpricedProducts] = counts;
  const missing = missingBusinessInfo(settings);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Good day, ${admin.name}`}
        description="Everything the café needs to keep an eye on, in one place."
      >
        <LinkButton href="/admin/today" variant="primary">
          Set today&rsquo;s feature
        </LinkButton>
      </PageHeader>

      <Flash ok={ok} error={error} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Pending"
          value={pending.length}
          hint={pending.length ? "Waiting on you" : "Nothing to answer"}
          href="/admin/reservations?status=pending"
        />
        <Stat label="Today" value={todays} hint="Bookings today" href="/admin/reservations" />
        <Stat label="Upcoming" value={upcoming} hint="Confirmed, later" href="/admin/reservations" />
        <Stat
          label="Menu"
          value={menuItems}
          hint={unavailable ? `${unavailable} marked unavailable` : "All available"}
          href="/admin/menu"
        />
      </div>

      <Card
        title="Reservations waiting for a reply"
        description="Confirm or decline so the guest knows where they stand."
      >
        {pending.length === 0 ? (
          <EmptyState
            title="Nothing pending"
            description="Every reservation has been answered. New ones appear here as they arrive."
          />
        ) : (
          <Table head={["When", "Guest", "People", "Contact", ""]}>
            {pending.map((r) => (
              <tr key={r.id}>
                <Td>
                  <span className="tabular-nums">{r.date}</span>{" "}
                  <span className="text-taupe tabular-nums">{r.time}</span>
                </Td>
                <Td>{r.name}</Td>
                <Td className="tabular-nums">{r.guests}</Td>
                <Td className="text-taupe">{r.phone}</Td>
                <Td>
                  <Link
                    href={`/admin/reservations/${r.id}`}
                    className="text-[0.8rem] tracking-[0.06em] text-cocoa uppercase hover:underline"
                  >
                    Open
                  </Link>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Today at HEYCAT">
          {feature ? (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-[1.1rem]">{t(feature.title, "fr")}</p>
                <p className="mt-1 text-[0.82rem] text-taupe">Showing on the homepage.</p>
              </div>
              <Badge tone="good">Live</Badge>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <p className="text-[0.88rem] leading-relaxed text-taupe">
                Nothing set for today. The homepage simply hides the section — it never
                shows a stale one.
              </p>
              <LinkButton href="/admin/today">Set</LinkButton>
            </div>
          )}
        </Card>

        <Card title="At a glance">
          <dl className="space-y-2.5 text-[0.88rem]">
            <div className="flex justify-between gap-4">
              <dt className="text-taupe">Cats published</dt>
              <dd className="tabular-nums">{cats}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-taupe">Upcoming events</dt>
              <dd className="tabular-nums">{events}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-taupe">Reservations</dt>
              <dd>
                {settings.features.showReservations && settings.reservations.enabled ? (
                  <Badge tone="good">Open</Badge>
                ) : (
                  <Badge tone="warn">Off</Badge>
                )}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {missing.length > 0 ? (
        <Card
          title="Still needed from the café"
          description="Nothing here is invented. Until these are filled in, the public site says so plainly rather than guessing."
        >
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {missing.map((item) => (
              <li key={item}>
                <Badge tone="warn">{item}</Badge>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <LinkButton href="/admin/settings" variant="primary">
              Fill these in
            </LinkButton>
          </div>
        </Card>
      ) : null}

      {/*
        Boutique prices are content rather than a setting, so they are not part
        of `missingBusinessInfo` — but they are the same kind of gap, and the
        shop says "ask at the counter" until they are filled in.
      */}
      {unpricedProducts > 0 ? (
        <Card title="Boutique prices">
          <p className="text-[0.88rem] leading-relaxed text-taupe">
            {unpricedProducts === 1
              ? "One product has no price, so the shop invites customers to ask at the counter."
              : `${unpricedProducts} products have no price, so the shop invites customers to ask at the counter.`}{" "}
            That is deliberate — nothing the café has published prices the shop —
            and it stays that way until someone types the numbers in.
          </p>
          <div className="mt-5">
            <LinkButton href="/admin/products" variant="secondary">
              Open the boutique
            </LinkButton>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
