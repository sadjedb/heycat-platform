import {
  Badge, Button, Card, Field, Flash, I18nInput, Input, LinkButton,
  PageHeader, Select, Table, Td,
} from "@/components/admin/ui";
import { PlanPreview } from "@/components/admin/plan-preview";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n-field";
import { deleteTable, saveTable, toggleBookable } from "./actions";

export const metadata = { title: "Floor plan" };

const SHAPES = ["square", "round", "lounge", "bar"];
const ZONES = ["window", "centre", "lounge", "wall", "bar"];

/*
 * The floor plan.
 *
 * A live preview sits above the list so the owner can see what a coordinate
 * change actually did — four numbers in a form mean nothing on their own. Edit
 * a row, save, and the picture moves.
 */
export default async function TablesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; edit?: string; add?: string }>;
}) {
  await requireAdmin();
  const { ok, error, edit, add } = await searchParams;

  const tables = await db.table.findMany({ orderBy: [{ position: "asc" }, { number: "asc" }] });
  const editing = edit ? tables.find((x) => x.id === edit) : null;
  const showForm = Boolean(editing || add);

  const seats = tables.reduce((n, x) => n + x.seats, 0);
  const bookable = tables.filter((x) => x.bookable).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Floor plan"
        description={`${tables.length} tables · ${seats} seats · ${bookable} bookable online. Guests pick from this map when they reserve.`}
      >
        <LinkButton href="/admin/tables?add=1" variant="primary">
          Add table
        </LinkButton>
      </PageHeader>

      <Flash ok={ok} error={error} />

      <Card title="The room" description="How the plan looks to a guest. Numbers are table numbers.">
        <PlanPreview
          tables={tables.map((x) => ({
            id: x.id,
            number: x.number,
            seats: x.seats,
            shape: x.shape,
            x: x.x,
            y: x.y,
            width: x.width,
            height: x.height,
            bookable: x.bookable,
          }))}
          highlightId={editing?.id ?? null}
        />
      </Card>

      {showForm ? (
        <Card title={editing ? `Table ${editing.number}` : "New table"}>
          <form action={saveTable} className="space-y-5">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

            <div className="grid gap-4 sm:grid-cols-4">
              <Field label="Number" required>
                <Input type="number" name="number" min={1} max={999} defaultValue={editing?.number ?? ""} required />
              </Field>
              <Field label="Seats" required>
                <Input type="number" name="seats" min={1} max={30} defaultValue={editing?.seats ?? 2} required />
              </Field>
              <Field label="Shape">
                <Select name="shape" defaultValue={editing?.shape ?? "square"}>
                  {SHAPES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Zone">
                <Select name="zone" defaultValue={editing?.zone ?? "centre"}>
                  {ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <fieldset>
              <legend className="mb-1.5 text-[0.78rem] font-semibold text-espresso">
                Position{" "}
                <span className="font-normal text-mist">
                  — percentages of the room. x/y is the centre; 0,0 is the top-left corner.
                </span>
              </legend>
              <div className="grid gap-4 sm:grid-cols-4">
                {([
                  ["x", "From the left", editing?.x ?? 50],
                  ["y", "From the top", editing?.y ?? 50],
                  ["width", "Width", editing?.width ?? 8],
                  ["height", "Height", editing?.height ?? 8],
                ] as const).map(([name, label, value]) => (
                  <label key={name} className="block">
                    <span className="mb-1 block text-[0.72rem] text-mist">{label}</span>
                    <Input type="number" name={name} min={0} max={100} step={1} defaultValue={Math.round(Number(value))} />
                  </label>
                ))}
              </div>
            </fieldset>

            <I18nInput name="label" label="Name" value={editing?.label} hint="Optional — e.g. the window banquette" />
            <I18nInput name="note" label="Note" value={editing?.note} hint="Shown when a guest hovers the table" />

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="bookable"
                defaultChecked={editing?.bookable ?? true}
                className="h-4 w-4 accent-[var(--color-cocoa)]"
              />
              <span className="text-[0.88rem]">Guests can book this table online</span>
            </label>

            <div className="flex flex-wrap gap-2">
              <Button type="submit">{editing ? "Save table" : "Add table"}</Button>
              <LinkButton href="/admin/tables" variant="ghost">Cancel</LinkButton>
              {editing ? (
                <form action={deleteTable} className="ms-auto">
                  <input type="hidden" name="id" value={editing.id} />
                  <Button type="submit" variant="danger">Remove table</Button>
                </form>
              ) : null}
            </div>
          </form>
        </Card>
      ) : null}

      <Card>
        <Table head={["#", "Seats", "Shape", "Zone", "Position", "Online", ""]}>
          {tables.map((x) => (
            <tr key={x.id}>
              <Td className="font-display text-[1rem] tabular-nums">{x.number}</Td>
              <Td className="tabular-nums">{x.seats}</Td>
              <Td className="text-taupe">{x.shape}</Td>
              <Td className="text-taupe">{t(x.label, "fr") || x.zone}</Td>
              <Td className="text-mist tabular-nums">
                {Math.round(x.x)}, {Math.round(x.y)}
              </Td>
              <Td>
                <form action={toggleBookable}>
                  <input type="hidden" name="id" value={x.id} />
                  <button type="submit" className="cursor-pointer">
                    <Badge tone={x.bookable ? "good" : "neutral"}>
                      {x.bookable ? "bookable" : "closed"}
                    </Badge>
                  </button>
                </form>
              </Td>
              <Td>
                <a
                  href={`/admin/tables?edit=${x.id}`}
                  className="text-[0.8rem] tracking-[0.06em] text-cocoa uppercase hover:underline"
                >
                  Edit
                </a>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
