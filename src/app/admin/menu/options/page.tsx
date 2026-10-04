import { Button, Card, Flash, I18nInput, Input, LinkButton, PageHeader, Price, Table, Td } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n-field";
import { deleteOption, saveOption } from "../actions";

export const metadata = { title: "Menu options" };

export default async function OptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; edit?: string }>;
}) {
  await requireAdmin();
  const { ok, error, edit } = await searchParams;
  const options = await db.menuOption.findMany({ orderBy: { position: "asc" } });
  const editing = edit ? options.find((o) => o.id === edit) : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Options"
        description="Add-ons that apply across drinks — the OPTIONS block on the printed menu."
      >
        <LinkButton href="/admin/menu" variant="ghost">← Menu</LinkButton>
      </PageHeader>

      <Flash ok={ok} error={error} />

      <Card>
        <Table head={["Option", "Price", "Available", ""]}>
          {options.map((o) => (
            <tr key={o.id}>
              <Td>{t(o.name, "fr")}</Td>
              <Td><Price value={o.price} /></Td>
              <Td className="text-taupe">{o.available ? "Yes" : "No"}</Td>
              <Td>
                <div className="flex gap-3 text-[0.78rem] tracking-[0.06em] uppercase">
                  <a href={`/admin/menu/options?edit=${o.id}`} className="text-cocoa hover:underline">Edit</a>
                  <form action={deleteOption}>
                    <input type="hidden" name="id" value={o.id} />
                    <button type="submit" className="text-taupe hover:text-hibiscus">Delete</button>
                  </form>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card title={editing ? "Edit option" : "Add an option"}>
        <form action={saveOption} className="space-y-5">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <I18nInput name="name" label="Name" value={editing?.name} required placeholder="Vegan milk" />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[0.78rem] font-semibold text-espresso">Price in DA</span>
              <Input type="number" name="price" min={0} step={10} defaultValue={editing?.price ?? ""} required inputMode="numeric" />
            </label>
            <label className="flex items-end gap-3 pb-2.5">
              <input type="checkbox" name="available" defaultChecked={editing?.available ?? true} className="h-4 w-4 accent-[var(--color-cocoa)]" />
              <span className="text-[0.88rem]">Available</span>
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editing ? "Save option" : "Add option"}</Button>
            {editing ? <LinkButton href="/admin/menu/options" variant="ghost">Cancel</LinkButton> : null}
          </div>
        </form>
      </Card>
    </div>
  );
}
