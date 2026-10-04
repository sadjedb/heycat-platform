import { notFound } from "next/navigation";
import {
  Button, Card, Checkbox, Flash, I18nInput, Input, LinkButton, PageHeader, Select,
} from "@/components/admin/ui";
import { MediaPicker } from "@/components/admin/media-picker";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n-field";
import { locales, localeNames } from "@/i18n/locales";
import { deleteCat, saveCat } from "../actions";

export const metadata = { title: "Cat" };

/** Blank rows so there is always somewhere to add another trait. */
const BLANK_ROWS = 3;

export default async function CatEditor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { ok, error } = await searchParams;

  const isNew = id === "new";
  const cat = isNew ? null : await db.cat.findUnique({ where: { id } });
  if (!isNew && !cat) notFound();

  const traits = (cat?.traits ?? {}) as Record<string, { label: string; value: string }[]>;
  const rowCount = Math.max(
    ...locales.map((l) => traits[l]?.length ?? 0),
    0,
  ) + BLANK_ROWS;

  return (
    <div className="space-y-8">
      <PageHeader
        title={isNew ? "New cat" : t(cat!.name, "fr") || "Cat"}
        description="Everything a visitor sees on this cat's profile."
      >
        <LinkButton href="/admin/cats" variant="ghost">← All cats</LinkButton>
      </PageHeader>

      <Flash ok={ok} error={error} />

      <form action={saveCat} className="space-y-6">
        {cat ? <input type="hidden" name="id" value={cat.id} /> : null}

        <Card title="Who they are">
          <div className="space-y-5">
            <I18nInput name="name" label="Name" value={cat?.name} required placeholder="Shadow" />
            <I18nInput
              name="title"
              label="Title"
              value={cat?.title}
              hint="The ribbon on the café's own card"
              placeholder="The king of HeyCat"
            />
            <I18nInput name="breed" label="Breed" value={cat?.breed} placeholder="Scottish Fold" />
            <I18nInput
              name="funFact"
              label="Fun fact"
              value={cat?.funFact}
              multiline
              hint="Optional — two of the café's cards have none"
            />
          </div>
        </Card>

        <Card
          title="Traits"
          description="The spec list on the profile. Leave a row blank to drop it."
        >
          <div className="space-y-6">
            {locales.map((locale) => (
              <div key={locale}>
                <p className="mb-2 text-[0.7rem] tracking-[0.1em] text-mist uppercase">
                  {localeNames[locale]}
                </p>
                <div className="space-y-2">
                  {Array.from({ length: rowCount }, (_, i) => {
                    const row = traits[locale]?.[i];
                    return (
                      <div key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr]">
                        <Input
                          name={`traitLabel.${locale}`}
                          defaultValue={row?.label ?? ""}
                          placeholder="Personality"
                          dir={locale === "ar" ? "rtl" : undefined}
                          aria-label={`Trait ${i + 1} label (${locale})`}
                        />
                        <Input
                          name={`traitValue.${locale}`}
                          defaultValue={row?.value ?? ""}
                          placeholder="Playful, calm & food lover"
                          dir={locale === "ar" ? "rtl" : undefined}
                          aria-label={`Trait ${i + 1} value (${locale})`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Adoption"
          description="The café confirmed it runs adoptions but has published no policy. Nothing shows on the site until a status other than “not listed” is chosen."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[0.78rem] font-semibold text-espresso">Status</span>
              <Select name="adoption" defaultValue={cat?.adoption ?? "not-listed"}>
                <option value="not-listed">Not listed — nothing shown</option>
                <option value="available">Looking for a home</option>
                <option value="reserved">Reserved</option>
                <option value="adopted">Adopted</option>
                <option value="info-only">Information only</option>
              </Select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[0.78rem] font-semibold text-espresso">
                Residency
              </span>
              <Select name="status" defaultValue={cat?.status ?? "resident"}>
                <option value="resident">Resident</option>
                <option value="fostered">Fostered</option>
                <option value="former">No longer at the café</option>
              </Select>
            </label>
            <div className="sm:col-span-2">
              <I18nInput
                name="adoptionNote"
                label="Adoption note"
                value={cat?.adoptionNote}
                multiline
                hint="Shown only when a status above is set"
              />
            </div>
          </div>
        </Card>

        <Card title="Photograph">
          <MediaPicker selectedId={cat?.imageId} />
        </Card>

        <Card title="Visibility">
          <Checkbox
            name="published"
            label="Show on the site"
            defaultChecked={cat?.published ?? true}
          />
          <Checkbox
            name="featured"
            label="Featured"
            defaultChecked={cat?.featured ?? false}
            hint="Highlights this cat among the residents."
          />
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit">{isNew ? "Add cat" : "Save cat"}</Button>
          <LinkButton href="/admin/cats" variant="ghost">Cancel</LinkButton>
        </div>
      </form>

      {cat ? (
        <Card title="Remove" description="This cannot be undone.">
          <form action={deleteCat}>
            <input type="hidden" name="id" value={cat.id} />
            <Button type="submit" variant="danger">Remove cat</Button>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
