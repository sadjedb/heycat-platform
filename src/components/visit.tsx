import Image from "next/image";
import { Eyebrow, PawMark } from "./brand";
import { Reveal } from "./reveal";
import { TrackedLink } from "./tracked-link";
import type { Dictionary } from "@/i18n";
import type { Settings } from "@/lib/settings";

/*
 * Visit.
 *
 * Every value here comes from admin settings. Nothing is hardcoded and nothing
 * is invented: a field the café has not filled in renders "to be confirmed"
 * rather than a plausible-looking address.
 *
 * The three blocks at the bottom — house rules, reservations, adoption — are
 * things the café confirmed it does but has not written up. Each shows its
 * heading and says the café is writing it, so the structure is visibly waiting
 * for content rather than quietly missing.
 */

function Pending({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-cream/40">
      <span aria-hidden="true" className="h-px w-5 bg-cream/30" />
      {label}
    </span>
  );
}

export function Visit({
  t,
  settings,
  policies,
}: {
  t: Dictionary;
  settings: Settings;
  policies: { houseRules: string[]; reservationNotes: string[]; adoptionNotes: string[] };
}) {
  const { contact, hours, location, social } = settings;

  const rows: { label: string; value: string | null; href?: string; track?: string }[] = [
    {
      label: t.visit.address,
      value: contact.address || null,
      href: location.mapsUrl || undefined,
      track: "maps_click",
    },
    {
      label: t.visit.phone,
      value: contact.phone || null,
      href: contact.phone ? `tel:${contact.phone.replace(/\s/g, "")}` : undefined,
    },
    {
      label: t.visit.email,
      value: contact.email || null,
      href: contact.email ? `mailto:${contact.email}` : undefined,
    },
  ];

  return (
    <section id="visit" className="border-t border-sand/70 bg-cocoa text-cream">
      <div className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <Reveal>
            <div className="[&_.eyebrow]:text-cream/55">
              <Eyebrow>{t.visit.eyebrow}</Eyebrow>
            </div>
            <h2 className="mt-6 max-w-[16ch] font-display text-[clamp(2.2rem,5vw,3.9rem)] leading-[1.04]">
              <span className="block">{t.visit.headA}</span>
              <em className="block text-[#e4a94f]">{t.visit.headB}</em>
            </h2>
            <p className="mt-7 max-w-[42ch] leading-relaxed text-cream/70">{t.visit.body}</p>

            <div className="mt-9 flex flex-wrap gap-3">
              <TrackedLink
                href={social.instagramUrl}
                event="instagram_click"
                external
                className="inline-flex items-center gap-3 rounded-full bg-cream px-7 py-3.5 text-[0.78rem] font-medium tracking-[0.16em] text-espresso uppercase transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
              >
                <PawMark className="h-4 w-4" />
                {social.instagramHandle}
              </TrackedLink>
            </div>

            <dl className="mt-12 border-t border-cream/15">
              {rows.map((row) => (
                <div key={row.label} className="flex gap-6 border-b border-cream/15 py-4">
                  <dt className="w-24 shrink-0 text-[0.75rem] tracking-[0.14em] text-cream/50 uppercase sm:w-28">
                    {row.label}
                  </dt>
                  <dd>
                    {row.value === null ? (
                      <Pending label={t.visit.pending} />
                    ) : row.href ? (
                      <TrackedLink
                        href={row.href}
                        event={row.track}
                        external={row.track === "maps_click"}
                        className="underline underline-offset-4"
                      >
                        {row.value}
                      </TrackedLink>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}

              <div className="flex gap-6 border-b border-cream/15 py-4">
                <dt className="w-24 shrink-0 text-[0.75rem] tracking-[0.14em] text-cream/50 uppercase sm:w-28">
                  {t.visit.hours}
                </dt>
                <dd className="space-y-1">
                  {hours.regular.length ? (
                    hours.regular.map((h) => (
                      <div key={`${h.days}-${h.open}`} className="flex flex-wrap gap-4">
                        <span className="w-28 text-cream/70">{h.days}</span>
                        <span className="tabular-nums">{h.open}</span>
                      </div>
                    ))
                  ) : (
                    <Pending label={t.visit.pending} />
                  )}
                  {hours.note ? (
                    <p className="pt-1 text-[0.82rem] text-cream/50">{hours.note}</p>
                  ) : null}
                </dd>
              </div>
            </dl>

            {rows.some((r) => r.value === null) || !hours.regular.length ? (
              <p className="mt-6 max-w-[46ch] text-[0.82rem] leading-relaxed text-cream/45">
                {t.visit.pendingNote}
              </p>
            ) : null}
          </Reveal>

          <Reveal delay={90} className="lg:pt-4">
            <figure>
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.5rem] bg-espresso/40">
                <Image
                  src="/img/place/storefront.webp"
                  alt={t.visit.storefrontAlt}
                  fill
                  sizes="(min-width: 1024px) 38vw, 88vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-4 text-[0.82rem] text-cream/55">
                {t.visit.storefrontCaption}
              </figcaption>

              {/* A map only when the café has given us one. */}
              {location.mapsEmbedUrl ? (
                <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-cream/15">
                  <iframe
                    src={location.mapsEmbedUrl}
                    title={t.visit.mapTitle}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-56 w-full border-0"
                  />
                </div>
              ) : null}

              {location.directionsNote ? (
                <p className="mt-4 text-[0.82rem] leading-relaxed text-cream/55">
                  {location.directionsNote}
                </p>
              ) : null}
            </figure>
          </Reveal>
        </div>

        <Reveal delay={60}>
          <div className="mt-20 grid gap-10 border-t border-cream/15 pt-12 sm:gap-12 lg:grid-cols-3">
            {[
              { title: t.visit.rules, intro: t.visit.rulesIntro, items: policies.houseRules },
              {
                title: t.visit.reservations,
                intro: t.visit.reservationsIntro,
                items: policies.reservationNotes,
              },
              {
                title: t.visit.adoption,
                intro: t.visit.adoptionIntro,
                items: policies.adoptionNotes,
              },
            ].map((block) => (
              <div key={block.title}>
                <h3 className="flex items-center gap-2.5 font-display text-[1.3rem]">
                  <PawMark className="h-4 w-4 shrink-0 text-cream/45" />
                  {block.title}
                </h3>
                <p className="mt-2.5 text-[0.88rem] leading-relaxed text-cream/60">
                  {block.intro}
                </p>
                {block.items.length ? (
                  <ul className="mt-4 m-0 list-none space-y-2.5 p-0">
                    {block.items.map((line) => (
                      <li
                        key={line}
                        className="flex gap-3 text-[0.9rem] leading-relaxed text-cream/85"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#e4a94f]"
                        />
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-[0.82rem] leading-relaxed text-cream/40">
                    {t.visit.awaitingCafe}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
