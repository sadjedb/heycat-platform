import {
  Badge, Button, Card, Field, Flash, I18nInput, Input, PageHeader, Price, Table, Td,
} from "@/components/admin/ui";
import { MediaPicker } from "@/components/admin/media-picker";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n-field";
import { todayISO } from "@/lib/content";
import { deleteFeature, saveFeature } from "./actions";

export const metadata = { title: "Today at HEYCAT" };

/*
 * One feature per day.
 *
 * The date is part of the record rather than a flag, so tomorrow's can be set
 * tonight and it appears on its own day. The homepage reads only today's, which
 * means the café can never accidentally leave last week's cake up.
 */
export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; date?: string }>;
}) {
  await requireAdmin();
  const { ok, error, date } = await searchParams;
  const today = todayISO();
  const target = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : today;

  const [current, recent] = await Promise.all([
    db.feature.findFirst({ where: { date: target } }),
    db.feature.findMany({ orderBy: { date: "desc" }, take: 14 }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Today at HEYCAT"
        description="The printed menu lists a Cake Of The Day. Set one here and it appears on the homepage for that date only."
      />
      <Flash ok={ok} error={error} />

      <Card title={target === today ? "Today" : `For ${target}`}>
        <form action={saveFeature} className="space-y-5">
          <input type="hidden" name="date" value={target} />
          <I18nInput
            name="title"
            label="What it is"
            value={current?.title}
            required
            placeholder="Matilda Cake"
          />
          <I18nInput name="description" label="Description" value={current?.description} multiline />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Price in DA" hint="Leave empty for ask at the counter">
              <Input
                type="number"
                name="price"
                min={0}
                step={10}
                defaultValue={current?.price ?? ""}
                inputMode="numeric"
              />
            </Field>
            <label className="flex items-end gap-3 pb-2.5">
              <input
                type="checkbox"
                name="active"
                defaultChecked={current?.active ?? true}
                className="h-4 w-4 accent-[var(--color-cocoa)]"
              />
              <span className="text-[0.88rem]">Show on the homepage</span>
            </label>
          </div>
          <MediaPicker selectedId={current?.imageId} />
          <Button type="submit">{current ? "Update" : `Set for ${target}`}</Button>
        </form>
      </Card>

      <Card title="Another date" description="Set tomorrow in advance; it appears on its own day.">
        <form className="flex flex-wrap items-end gap-3">
          <Field label="Date">
            <Input type="date" name="date" defaultValue={target} />
          </Field>
          <Button type="submit" variant="secondary">
            Go
          </Button>
        </form>
      </Card>

      {recent.length ? (
        <Card title="Recent">
          <Table head={["Date", "Feature", "Price", "Status", ""]}>
            {recent.map((f) => (
              <tr key={f.id}>
                <Td className="tabular-nums">{f.date}</Td>
                <Td>{t(f.title, "fr")}</Td>
                <Td>
                  <Price value={f.price} />
                </Td>
                <Td>
                  {f.date === today && f.active ? (
                    <Badge tone="good">live now</Badge>
                  ) : f.active ? (
                    <Badge tone="neutral">scheduled</Badge>
                  ) : (
                    <Badge tone="warn">off</Badge>
                  )}
                </Td>
                <Td>
                  <div className="flex gap-3 text-[0.78rem] tracking-[0.06em] uppercase">
                    <a href={`/admin/today?date=${f.date}`} className="text-cocoa hover:underline">
                      Edit
                    </a>
                    <form action={deleteFeature}>
                      <input type="hidden" name="id" value={f.id} />
                      <button type="submit" className="text-taupe hover:text-hibiscus">
                        Delete
                      </button>
                    </form>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
      ) : null}
    </div>
  );
}
