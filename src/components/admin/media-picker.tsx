import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";

/*
 * Pick an image for a record.
 *
 * A grid of radio buttons rather than a modal: it needs no client JavaScript,
 * it is keyboard-navigable for free, and the chosen value posts with the rest
 * of the form. "None" is always first, because an item without a photo is a
 * normal state here — eight menu items have never been photographed.
 */
export async function MediaPicker({
  name = "imageId",
  selectedId,
  label = "Image",
}: {
  name?: string;
  selectedId?: string | null;
  label?: string;
}) {
  const media = await db.media.findMany({
    orderBy: [{ generated: "asc" }, { createdAt: "desc" }],
    take: 120,
  });

  return (
    <fieldset>
      <legend className="mb-1.5 flex items-baseline gap-2">
        <span className="text-[0.78rem] font-semibold tracking-[0.04em] text-espresso">
          {label}
        </span>
        <Link href="/admin/media" className="text-[0.74rem] text-cocoa hover:underline">
          upload more ↗
        </Link>
      </legend>

      <div className="max-h-72 overflow-y-auto rounded-lg border border-sand bg-cream/40 p-3">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
          <label className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value=""
              defaultChecked={!selectedId}
              className="peer sr-only"
            />
            <span className="flex aspect-square items-center justify-center rounded-lg border-2 border-sand bg-white text-[0.68rem] text-mist peer-checked:border-cocoa peer-focus-visible:ring-2 peer-focus-visible:ring-espresso">
              None
            </span>
          </label>

          {media.map((m) => (
            <label key={m.id} className="cursor-pointer" title={m.filename}>
              <input
                type="radio"
                name={name}
                value={m.id}
                defaultChecked={selectedId === m.id}
                className="peer sr-only"
              />
              <span className="block aspect-square overflow-hidden rounded-lg border-2 border-transparent peer-checked:border-cocoa peer-focus-visible:ring-2 peer-focus-visible:ring-espresso">
                <Image
                  src={m.url}
                  alt={m.filename}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              </span>
            </label>
          ))}
        </div>

        {media.length === 0 ? (
          <p className="py-6 text-center text-[0.82rem] text-mist">
            No images yet. <Link href="/admin/media" className="text-cocoa hover:underline">Upload one</Link>.
          </p>
        ) : null}
      </div>
    </fieldset>
  );
}

/*
 * Pick several images, in order.
 *
 * Checkboxes rather than a drag-and-drop list, for the same reasons as above:
 * no client JavaScript, keyboard-navigable, posts with the form. Order comes
 * from document order, so the already-chosen images are rendered first in their
 * stored order — re-saving therefore preserves the sequence, and a newly ticked
 * image joins the end.
 */
export async function GalleryPicker({
  name = "gallery",
  selectedIds = [],
  label = "Extra photographs",
  hint,
}: {
  name?: string;
  selectedIds?: string[];
  label?: string;
  hint?: string;
}) {
  const media = await db.media.findMany({
    orderBy: [{ generated: "asc" }, { createdAt: "desc" }],
    take: 120,
  });

  const rank = new Map(selectedIds.map((id, i) => [id, i]));
  const ordered = [
    ...selectedIds.map((id) => media.find((m) => m.id === id)).filter(Boolean),
    ...media.filter((m) => !rank.has(m.id)),
  ] as typeof media;

  return (
    <fieldset>
      <legend className="mb-1.5 flex flex-wrap items-baseline gap-2">
        <span className="text-[0.78rem] font-semibold tracking-[0.04em] text-espresso">
          {label}
        </span>
        {hint ? <span className="text-[0.74rem] text-mist">{hint}</span> : null}
        <Link href="/admin/media" className="text-[0.74rem] text-cocoa hover:underline">
          upload more ↗
        </Link>
      </legend>

      <div className="max-h-72 overflow-y-auto rounded-lg border border-sand bg-cream/40 p-3">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
          {ordered.map((m) => {
            const position = rank.get(m.id);
            return (
              <label key={m.id} className="cursor-pointer" title={m.filename}>
                <input
                  type="checkbox"
                  name={name}
                  value={m.id}
                  defaultChecked={position !== undefined}
                  className="peer sr-only"
                />
                <span className="relative block aspect-square overflow-hidden rounded-lg border-2 border-transparent peer-checked:border-cocoa peer-focus-visible:ring-2 peer-focus-visible:ring-espresso">
                  <Image
                    src={m.url}
                    alt={m.filename}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                  {position !== undefined ? (
                    <span className="absolute bottom-0.5 end-0.5 rounded bg-espresso/85 px-1 text-[0.6rem] font-semibold text-cream tabular-nums">
                      {position + 1}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>

        {media.length === 0 ? (
          <p className="py-6 text-center text-[0.82rem] text-mist">
            No images yet.{" "}
            <Link href="/admin/media" className="text-cocoa hover:underline">
              Upload one
            </Link>
            .
          </p>
        ) : null}
      </div>
    </fieldset>
  );
}
