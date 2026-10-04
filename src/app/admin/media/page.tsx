import Image from "next/image";
import { Badge, Button, Card, Flash, I18nInput, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteMediaAction, updateAltAction, uploadAction } from "./actions";

export const metadata = { title: "Media" };

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; edit?: string }>;
}) {
  await requireAdmin();
  const { ok, error, edit } = await searchParams;
  const media = await db.media.findMany({ orderBy: [{ generated: "asc" }, { createdAt: "desc" }] });
  const editing = edit ? media.find((m) => m.id === edit) : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Media"
        description="Images used across the site. JPEG, PNG, WebP or GIF, up to 8 MB."
      />
      <Flash ok={ok} error={error} />

      <Card title="Upload an image">
        <form action={uploadAction} className="flex flex-wrap items-end gap-3">
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required
            className="text-[0.86rem] file:mr-3 file:rounded-full file:border-0 file:bg-espresso file:px-4 file:py-2 file:text-[0.78rem] file:tracking-[0.1em] file:text-cream file:uppercase"
          />
          <Button type="submit">Upload</Button>
        </form>
      </Card>

      {editing ? (
        <Card title={`Alt text — ${editing.filename}`}
          description="What a screen reader announces. Leave blank only when the image is purely decorative.">
          <form action={updateAltAction} className="space-y-5">
            <input type="hidden" name="id" value={editing.id} />
            <I18nInput name="alt" label="Alt text" value={editing.alt} multiline />
            <Button type="submit">Save alt text</Button>
          </form>
        </Card>
      ) : null}

      <Card title={`${media.length} image(s)`}>
        <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((m) => (
            <li key={m.id} className="rounded-lg border border-sand bg-white p-2">
              <Image
                src={m.url}
                alt={m.filename}
                width={240}
                height={240}
                className="aspect-square w-full rounded object-cover"
              />
              <p className="mt-2 truncate text-[0.76rem] text-taupe" title={m.filename}>
                {m.filename}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {m.generated ? <Badge>from pipeline</Badge> : null}
                {m.width ? (
                  <span className="text-[0.7rem] text-mist tabular-nums">
                    {m.width}×{m.height}
                  </span>
                ) : null}
              </div>
              <div className="mt-2 flex gap-3 text-[0.74rem] tracking-[0.06em] uppercase">
                <a href={`/admin/media?edit=${m.id}`} className="text-cocoa hover:underline">
                  Alt
                </a>
                <form action={deleteMediaAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit" className="text-taupe hover:text-hibiscus">
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
