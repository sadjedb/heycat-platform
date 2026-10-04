import Link from "next/link";
import { Card, EmptyState, PageHeader, Stat, Table, Td } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { summary, topMenuItems, type Range } from "@/lib/analytics";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n-field";

export const metadata = { title: "Analytics" };

const RANGES: Range[] = [7, 30, 90];

/*
 * Analytics.
 *
 * Measured first-party, with no cookie and no third-party script: a type, a
 * path, a locale and a day. That means no consent banner, and it also means
 * "views" are page views rather than unique people — which the page says rather
 * than letting the owner assume otherwise.
 *
 * Nothing here is simulated. An empty café shows zeroes.
 */
export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireAdmin();
  const { range: rangeParam } = await searchParams;
  const range = (RANGES.find((r) => String(r) === rangeParam) ?? 30) as Range;

  const [data, items] = await Promise.all([summary(range), topMenuItems(range)]);
  const peak = Math.max(1, ...data.series.map((d) => d.views));
  const totalViews = data.counts.page_view ?? 0;

  const slugs = items.map((i) => i.slug);
  const named = slugs.length
    ? await db.menuItem.findMany({ where: { slug: { in: slugs } }, select: { slug: true, name: true } })
    : [];
  const nameOf = new Map(named.map((n) => [n.slug, t(n.name, "fr")]));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Measured on this server with no cookies and no third-party scripts. Views are page views, not unique visitors."
      >
        <div className="flex gap-1.5">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin/analytics?range=${r}`}
              className={[
                "rounded-full px-4 py-2 text-[0.74rem] tracking-[0.08em] uppercase transition-colors",
                r === range ? "bg-espresso text-cream" : "border border-sand text-taupe hover:border-espresso/40",
              ].join(" ")}
            >
              {r}d
            </Link>
          ))}
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Page views" value={totalViews} hint={`Last ${range} days`} />
        <Stat label="Menu opened" value={data.counts.menu_view ?? 0} hint="Full menu page" />
        <Stat label="Reservations" value={data.totalReservations} hint="Submitted" />
        <Stat label="WhatsApp" value={data.counts.whatsapp_click ?? 0} hint="Clicks" />
      </div>

      <Card title="Views per day">
        {totalViews === 0 ? (
          <EmptyState
            title="Nothing recorded yet"
            description="Views appear here once the site is live and people visit. Numbers are never simulated."
          />
        ) : (
          <div className="flex h-44 items-end gap-[2px]" role="img" aria-label={`Page views over the last ${range} days`}>
            {data.series.map((d) => (
              <div key={d.day} className="group relative flex-1" title={`${d.day}: ${d.views}`}>
                <div
                  className="w-full rounded-t bg-cocoa/75 transition-colors group-hover:bg-cocoa"
                  style={{ height: `${Math.max(2, (d.views / peak) * 100)}%` }}
                />
              </div>
            ))}
          </div>
        )}
        {totalViews > 0 ? (
          <p className="mt-3 flex justify-between text-[0.72rem] text-mist tabular-nums">
            <span>{data.series[0]?.day}</span>
            <span>peak {peak}</span>
            <span>{data.series.at(-1)?.day}</span>
          </p>
        ) : null}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Most visited pages">
          {data.topPaths.length === 0 ? (
            <p className="text-[0.86rem] text-taupe">No page views in this period.</p>
          ) : (
            <Table head={["Path", "Views"]}>
              {data.topPaths.map((p) => (
                <tr key={p.path}>
                  <Td><span dir="ltr">{p.path}</span></Td>
                  <Td className="tabular-nums">{p.views}</Td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <Card title="Language used">
          {data.byLocale.length === 0 ? (
            <p className="text-[0.86rem] text-taupe">No page views in this period.</p>
          ) : (
            <Table head={["Locale", "Views", "Share"]}>
              {data.byLocale.map((l) => (
                <tr key={l.locale}>
                  <Td className="uppercase">{l.locale}</Td>
                  <Td className="tabular-nums">{l.views}</Td>
                  <Td className="tabular-nums">
                    {totalViews ? `${Math.round((l.views / totalViews) * 100)}%` : "—"}
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <Card
        title="Most opened menu items"
        description="Counted when someone opens an item's photograph on the menu."
      >
        {items.length === 0 ? (
          <p className="text-[0.86rem] text-taupe">
            Nothing yet. This fills in once the menu is being browsed.
          </p>
        ) : (
          <Table head={["Item", "Opens"]}>
            {items.map((i) => (
              <tr key={i.slug}>
                <Td>{nameOf.get(i.slug) ?? i.slug}</Td>
                <Td className="tabular-nums">{i.views}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card title="Other actions">
        <Table head={["Action", "Count"]}>
          {[
            ["Instagram clicks", data.counts.instagram_click ?? 0],
            ["Maps clicks", data.counts.maps_click ?? 0],
            ["Reservation form opened", data.counts.reservation_start ?? 0],
            ["Menu item opened", data.counts.menu_item_view ?? 0],
          ].map(([label, count]) => (
            <tr key={String(label)}>
              <Td>{label}</Td>
              <Td className="tabular-nums">{count}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
