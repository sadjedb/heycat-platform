import { notFound } from "next/navigation";
import { Button, Card, Checkbox, Field, Flash, I18nInput, Input, LinkButton, PageHeader } from "@/components/admin/ui";
import { MediaPicker } from "@/components/admin/media-picker";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n-field";
import { deleteEvent, saveEvent } from "../actions";

export const metadata = { title: "Event" };

export default async function EventEditor({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { ok, error } = await searchParams;
  const isNew = id === "new";
  const event = isNew ? null : await db.event.findUnique({ where: { id } });
  if (!isNew && !event) notFound();

  return (
    <div className="space-y-8">
      <PageHeader title={isNew ? "New event" : t(event!.title, "fr") || "Event"}
        description="Nothing is shown publicly until you tick publish.">
        <LinkButton href="/admin/events" variant="ghost">← All events</LinkButton>
      </PageHeader>
      <Flash ok={ok} error={error} />

      <form action={saveEvent} className="space-y-6">
        {event ? <input type="hidden" name="id" value={event.id} /> : null}

        <Card title="The event">
          <div className="space-y-5">
            <I18nInput name="title" label="Title" value={event?.title} required />
            <I18nInput name="description" label="Description" value={event?.description} multiline />
            <I18nInput name="location" label="Where" value={event?.location} placeholder="On the terrace" />
          </div>
        </Card>

        <Card title="When">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Date" required>
              <Input type="date" name="date" defaultValue={event?.date ?? ""} required />
            </Field>
            <Field label="Time" hint="Optional">
              <Input type="time" name="time" defaultValue={event?.time ?? ""} />
            </Field>
          </div>
        </Card>

        <Card title="Call to action" description="Optional — a link to tickets, a form, or a post.">
          <div className="space-y-5">
            <I18nInput name="ctaLabel" label="Button label" value={event?.ctaLabel} placeholder="Book a place" />
            <Field label="Link" hint="Must start with https://">
              <Input name="ctaUrl" type="url" defaultValue={event?.ctaUrl ?? ""} placeholder="https://" dir="ltr" />
            </Field>
          </div>
        </Card>

        <Card title="Image"><MediaPicker selectedId={event?.imageId} /></Card>

        <Card title="Visibility">
          <Checkbox name="published" label="Publish on the website" defaultChecked={event?.published ?? false} />
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit">{isNew ? "Add event" : "Save event"}</Button>
          <LinkButton href="/admin/events" variant="ghost">Cancel</LinkButton>
        </div>
      </form>

      {event ? (
        <Card title="Delete">
          <form action={deleteEvent}>
            <input type="hidden" name="id" value={event.id} />
            <Button type="submit" variant="danger">Delete event</Button>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
