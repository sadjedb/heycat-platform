import {
  Badge, Button, Card, Checkbox, Field, Flash, Input, PageHeader, Textarea,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { getSettings, missingBusinessInfo } from "@/lib/settings";
import { localeNames, locales } from "@/i18n/locales";
import {
  saveContact, saveFeatures, saveHours, saveLocation, saveMenuNotes,
  savePolicies, saveReservationRules, saveSocial,
} from "./actions";

export const metadata = { title: "Settings" };

const WEEKDAYS = [
  { value: 1, label: "Mon" }, { value: 2, label: "Tue" }, { value: 3, label: "Wed" },
  { value: 4, label: "Thu" }, { value: 5, label: "Fri" }, { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

const BLANK_HOUR_ROWS = 2;

/*
 * Everything the café can tell the website about itself.
 *
 * Each card saves on its own. Nothing is pre-filled with a plausible guess: an
 * empty field here means the public site says "to be confirmed", which is the
 * whole point — the site never invents business information.
 */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const { ok, error } = await searchParams;
  const s = await getSettings();
  const missing = missingBusinessInfo(s);

  const hourRows = [...s.hours.regular, ...Array(BLANK_HOUR_ROWS).fill({ days: "", open: "" })];
  const notes = s.menuNotes.length
    ? s.menuNotes
    : [{ title: {}, body: {} }, { title: {}, body: {} }];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="The café's own details. Anything left blank shows on the site as unconfirmed rather than as a guess."
      />
      <Flash ok={ok} error={error} />

      {missing.length ? (
        <Card title="Still missing">
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {missing.map((m) => (
              <li key={m}>
                <Badge tone="warn">{m}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card title="Contact" description="Address, phone and the WhatsApp number every button on the site uses.">
        <form action={saveContact} className="space-y-5">
          <Field label="Street address">
            <Input name="address" defaultValue={s.contact.address} placeholder="12 rue …" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City">
              <Input name="city" defaultValue={s.contact.city} />
            </Field>
            <Field label="Country">
              <Input name="country" defaultValue={s.contact.country} />
            </Field>
            <Field label="Phone">
              <Input name="phone" defaultValue={s.contact.phone} dir="ltr" placeholder="+213 …" />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" defaultValue={s.contact.email} dir="ltr" />
            </Field>
            <Field label="WhatsApp number" hint="Digits with country code, no +">
              <Input name="whatsapp" defaultValue={s.contact.whatsapp} dir="ltr" placeholder="213xxxxxxxxx" inputMode="numeric" />
            </Field>
            <Field label="WhatsApp opening message" hint="Pre-filled for the visitor">
              <Input name="whatsappGreeting" defaultValue={s.contact.whatsappGreeting} />
            </Field>
          </div>
          <Button type="submit">Save contact</Button>
        </form>
      </Card>

      <Card title="Opening hours" description="One row per block. Leave a row empty to drop it.">
        <form action={saveHours} className="space-y-5">
          <div className="space-y-2">
            {hourRows.map((row, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <Input name="days" defaultValue={row.days} placeholder="Mon – Fri" aria-label={`Days ${i + 1}`} />
                <Input name="open" defaultValue={row.open} placeholder="09:00 – 22:00" aria-label={`Hours ${i + 1}`} />
              </div>
            ))}
          </div>
          <Field label="Note" hint="Shown under the hours">
            <Input name="note" defaultValue={s.hours.note} />
          </Field>
          <Button type="submit">Save hours</Button>
        </form>
      </Card>

      <Card title="Location" description="Paste a Google Maps share link. The embed is optional.">
        <form action={saveLocation} className="space-y-5">
          <Field label="Google Maps link">
            <Input name="mapsUrl" defaultValue={s.location.mapsUrl} dir="ltr" placeholder="https://maps.app.goo.gl/…" />
          </Field>
          <Field label="Map embed URL" hint="From Maps → Share → Embed a map → the src value">
            <Input name="mapsEmbedUrl" defaultValue={s.location.mapsEmbedUrl} dir="ltr" placeholder="https://www.google.com/maps/embed?pb=…" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Latitude"><Input name="latitude" defaultValue={s.location.latitude} dir="ltr" /></Field>
            <Field label="Longitude"><Input name="longitude" defaultValue={s.location.longitude} dir="ltr" /></Field>
          </div>
          <Field label="Directions note" hint="“Opposite the pharmacy”, that sort of thing">
            <Input name="directionsNote" defaultValue={s.location.directionsNote} />
          </Field>
          <Button type="submit">Save location</Button>
        </form>
      </Card>

      <Card title="Social" description="The Instagram handle was inferred from the project's reference material — confirm it.">
        <form action={saveSocial} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Instagram handle"><Input name="instagramHandle" defaultValue={s.social.instagramHandle} dir="ltr" /></Field>
            <Field label="Instagram URL"><Input name="instagramUrl" defaultValue={s.social.instagramUrl} dir="ltr" /></Field>
            <Field label="Facebook URL"><Input name="facebookUrl" defaultValue={s.social.facebookUrl} dir="ltr" /></Field>
            <Field label="TikTok URL"><Input name="tiktokUrl" defaultValue={s.social.tiktokUrl} dir="ltr" /></Field>
          </div>
          <Checkbox
            name="instagramVerified"
            label="I have checked this handle is correct"
            defaultChecked={s.social.instagramVerified}
            hint="Until this is ticked the dashboard keeps asking."
          />
          <Button type="submit">Save social</Button>
        </form>
      </Card>

      <Card
        title="Reservations"
        description="These rules are enforced on the server, not just in the form. With no time slots the website shows WhatsApp instead of a booking form."
      >
        <form action={saveReservationRules} className="space-y-5">
          <Checkbox name="enabled" label="Accept bookings through the website" defaultChecked={s.reservations.enabled} />

          <Field label="Open days">
            <div className="flex flex-wrap gap-3 pt-1">
              {WEEKDAYS.map((d) => (
                <label key={d.value} className="flex items-center gap-2 text-[0.86rem]">
                  <input
                    type="checkbox"
                    name="weekday"
                    value={d.value}
                    defaultChecked={s.reservations.openWeekdays.includes(d.value)}
                    className="h-4 w-4 accent-[var(--color-cocoa)]"
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </Field>

          <Field label="Time slots" hint="24h, comma or space separated">
            <Textarea name="slots" defaultValue={s.reservations.slots.join(", ")} dir="ltr" placeholder="11:00, 12:00, 13:00" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Min guests"><Input type="number" name="minGuests" min={1} max={50} defaultValue={s.reservations.minGuests} /></Field>
            <Field label="Max guests"><Input type="number" name="maxGuests" min={1} max={100} defaultValue={s.reservations.maxGuests} /></Field>
            <Field label="Days ahead"><Input type="number" name="maxDaysAhead" min={1} max={365} defaultValue={s.reservations.maxDaysAhead} /></Field>
            <Field label="Hours notice"><Input type="number" name="minHoursAhead" min={0} max={168} defaultValue={s.reservations.minHoursAhead} /></Field>
          </div>

          <Field label="Closed dates" hint="YYYY-MM-DD, comma separated">
            <Textarea name="closedDates" defaultValue={s.reservations.closedDates.join(", ")} dir="ltr" />
          </Field>
          <Field label="Confirmation note" hint="Shown after a request is sent">
            <Input name="confirmationNote" defaultValue={s.reservations.confirmationNote} />
          </Field>
          <Button type="submit">Save reservation rules</Button>
        </form>
      </Card>

      <Card title="Sections" description="Turn parts of the public site on and off.">
        <form action={saveFeatures} className="space-y-2">
          <Checkbox name="showReservations" label="Reservations" defaultChecked={s.features.showReservations} />
          <Checkbox name="showTodayAtHeycat" label="Today at HEYCAT" defaultChecked={s.features.showTodayAtHeycat} />
          <Checkbox name="showEvents" label="Events" defaultChecked={s.features.showEvents} />
          <Checkbox name="showBoutique" label="Boutique" defaultChecked={s.features.showBoutique} />
          <Checkbox name="showAdoption" label="Adoption notices on cat profiles" defaultChecked={s.features.showAdoption} />
          <div className="pt-3"><Button type="submit">Save sections</Button></div>
        </form>
      </Card>

      <Card
        title="House rules, reservations and adoption"
        description="One line each. These are the three things the café confirmed it does but has not written up — until there is text here the site says so."
      >
        <form action={savePolicies} className="space-y-6">
          {([
            ["houseRules", "House rules", s.policies.houseRules],
            ["reservationNotes", "How reservations work", s.policies.reservationNotes],
            ["adoptionNotes", "How adoption works", s.policies.adoptionNotes],
          ] as const).map(([key, label, value]) => (
            <fieldset key={key}>
              <legend className="mb-2 text-[0.78rem] font-semibold text-espresso">{label}</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {locales.map((locale) => (
                  <div key={locale}>
                    <span className="mb-1 block text-[0.7rem] tracking-[0.1em] text-mist uppercase">
                      {localeNames[locale]}
                    </span>
                    <Textarea
                      name={`${key}.${locale}`}
                      defaultValue={(value[locale] ?? []).join("\n")}
                      rows={4}
                      dir={locale === "ar" ? "rtl" : undefined}
                      lang={locale}
                      placeholder="One per line"
                    />
                  </div>
                ))}
              </div>
            </fieldset>
          ))}
          <Button type="submit">Save policies</Button>
        </form>
      </Card>

      <Card
        title="Menu notes"
        description="The two item-less sections on the printed menu — For cats and Salted."
      >
        <form action={saveMenuNotes} className="space-y-6">
          {notes.map((note, i) => (
            <fieldset key={i} className="rounded-lg border border-sand p-4">
              <legend className="px-1 text-[0.74rem] tracking-[0.08em] text-mist uppercase">
                Note {i + 1}
              </legend>
              <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  {locales.map((locale) => (
                    <Input
                      key={locale}
                      name={`noteTitle.${locale}`}
                      defaultValue={(note.title as Record<string, string>)[locale] ?? ""}
                      placeholder={`Title (${locale})`}
                      dir={locale === "ar" ? "rtl" : undefined}
                      aria-label={`Note ${i + 1} title (${locale})`}
                    />
                  ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {locales.map((locale) => (
                    <Input
                      key={locale}
                      name={`noteBody.${locale}`}
                      defaultValue={(note.body as Record<string, string>)[locale] ?? ""}
                      placeholder={`Body (${locale})`}
                      dir={locale === "ar" ? "rtl" : undefined}
                      aria-label={`Note ${i + 1} body (${locale})`}
                    />
                  ))}
                </div>
              </div>
            </fieldset>
          ))}
          <Button type="submit">Save menu notes</Button>
        </form>
      </Card>
    </div>
  );
}
