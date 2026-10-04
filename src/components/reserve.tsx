import { Eyebrow, PawMark, PawRule } from "./brand";
import { Reveal } from "./reveal";
import { TrackedLink } from "./tracked-link";
import { ReserveForm } from "./reserve-form";
import { submitReservation } from "@/app/[lang]/reserve-action";
import type { Dictionary, Locale } from "@/i18n";
import { bookingWindow, reservationsOpen } from "@/lib/reservations";
import { whatsappLink, type Settings } from "@/lib/settings";
import type { TableView } from "@/lib/availability";

/*
 * The reservation form.
 *
 * A plain form posting to a Server Action, so it works with no JavaScript and
 * carries no client bundle. Every constraint shown here — which days, which
 * times, how many people, how far ahead — comes from admin settings, and the
 * same rules are re-checked on the server.
 *
 * When the café has not configured slots yet the form is not shown at all:
 * a booking form that cannot accept a booking is worse than none, so it points
 * at WhatsApp instead.
 */
export function Reserve({
  t,
  lang,
  settings,
  status,
  tables,
}: {
  t: Dictionary;
  lang: Locale;
  settings: Settings;
  status?: { ok?: boolean; error?: string };
  tables: TableView[];
}) {
  if (!settings.features.showReservations) return null;

  const open = reservationsOpen(settings);
  const { min, max } = bookingWindow(settings);
  const wa = whatsappLink(settings, settings.contact.whatsappGreeting || undefined);

  return (
    <section id="reserve" className="border-y border-sand/70 bg-shell/55">
      <div className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <header className="flex flex-col items-center text-center">
          <Eyebrow>{t.reserve.eyebrow}</Eyebrow>
          <h2 className="mt-6 max-w-3xl font-display text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.03]">
            {t.reserve.headA}
            <br />
            <em className="text-rust">{t.reserve.headB}</em>
          </h2>
          <PawRule className="mt-8" />
        </header>

        <Reveal className="mx-auto mt-12 max-w-2xl">
          {status?.ok ? (
            <div className="rounded-[1.25rem] border border-matcha/30 bg-white p-8 text-center">
              <PawMark className="mx-auto h-7 w-7 text-matcha" />
              <p className="mt-4 font-display text-[1.4rem]">{t.reserve.successTitle}</p>
              <p className="prose-measure mx-auto mt-3">{t.reserve.successBody}</p>
              {settings.reservations.confirmationNote ? (
                <p className="mx-auto mt-4 max-w-[46ch] text-[0.85rem] leading-relaxed text-taupe">
                  {settings.reservations.confirmationNote}
                </p>
              ) : null}
            </div>
          ) : !open ? (
            <div className="rounded-[1.25rem] border border-sand bg-white p-8 text-center">
              <p className="font-display text-[1.3rem]">{t.reserve.closedTitle}</p>
              <p className="prose-measure mx-auto mt-3">{t.reserve.closedBody}</p>
              {wa ? (
                <TrackedLink
                  href={wa}
                  event="whatsapp_click"
                  external
                  className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-espresso px-7 py-3.5 text-[0.78rem] font-medium tracking-[0.16em] text-cream uppercase"
                >
                  <PawMark className="h-4 w-4" />
                  {t.reserve.whatsapp}
                </TrackedLink>
              ) : null}
            </div>
          ) : (
            <form
              action={submitReservation}
              className="rounded-[1.25rem] border border-sand bg-white p-6 sm:p-8"
            >
              <input type="hidden" name="locale" value={lang} />
              <p className="prose-measure mx-auto mb-7 text-center">{t.reserve.intro}</p>

              {status?.error ? (
                <p
                  role="alert"
                  className="mb-6 rounded-lg border border-hibiscus/30 bg-hibiscus/8 px-4 py-3 text-[0.86rem] text-hibiscus"
                >
                  {status.error}
                </p>
              ) : null}

              <ReserveForm
                t={t}
                lang={lang}
                slots={settings.reservations.slots}
                min={min}
                max={max}
                minGuests={settings.reservations.minGuests}
                maxGuests={settings.reservations.maxGuests}
                openWeekdays={settings.reservations.openWeekdays}
                closedDates={settings.reservations.closedDates}
                allowTableChoice={settings.reservations.allowTableChoice}
                initialTables={tables}
              />

              <div className="mt-8 grid gap-5 border-t border-sand pt-7 sm:grid-cols-2">
                <Labelled label={t.reserve.name} required>
                  <input name="name" required maxLength={80} autoComplete="name" className={FIELD} />
                </Labelled>

                <Labelled label={t.reserve.phone} required>
                  <input name="phone" type="tel" required maxLength={40} autoComplete="tel" dir="ltr" className={FIELD} />
                </Labelled>

                <Labelled label={t.reserve.email} hint={t.reserve.emailHint}>
                  <input name="email" type="email" maxLength={160} autoComplete="email" dir="ltr" className={FIELD} />
                </Labelled>

                <div className="sm:col-span-2">
                  <Labelled label={t.reserve.message} hint={t.reserve.messageHint}>
                    <textarea name="message" rows={3} maxLength={600} className={FIELD} />
                  </Labelled>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-espresso px-7 py-3.5 text-[0.78rem] font-medium tracking-[0.16em] text-cream uppercase transition-colors hover:bg-cocoa"
                >
                  {t.reserve.submit}
                </button>
                {wa ? (
                  <TrackedLink
                    href={wa}
                    event="whatsapp_click"
                    external
                    className="inline-flex items-center gap-2.5 rounded-full border border-espresso/22 px-6 py-3.5 text-[0.78rem] font-medium tracking-[0.16em] uppercase hover:border-espresso/55"
                  >
                    {t.reserve.whatsapp}
                  </TrackedLink>
                ) : null}
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

const FIELD =
  "w-full rounded-lg border border-sand bg-cream/40 px-3.5 py-2.5 text-[0.95rem] text-espresso outline-none transition-colors focus:border-cocoa focus:bg-white";

function Labelled({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2">
        <span className="text-[0.78rem] font-semibold tracking-[0.04em] text-espresso">
          {label}
          {required ? <span className="text-hibiscus"> *</span> : null}
        </span>
        {hint ? <span className="text-[0.74rem] text-mist">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}
