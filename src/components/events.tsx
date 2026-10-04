import Image from "next/image";
import { Eyebrow, PawRule } from "./brand";
import { Reveal } from "./reveal";
import type { Dictionary } from "@/i18n";
import type { PublicEvent } from "@/lib/content";

/*
 * What's on.
 *
 * Only ever shows events the owner has published and dated today or later —
 * nothing here is invented, and a past event disappears on its own rather than
 * needing to be tidied away.
 */
export function Events({ t, events }: { t: Dictionary; events: PublicEvent[] }) {
  if (events.length === 0) return null;

  return (
    <section id="events" className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
      <header className="flex flex-col items-center text-center">
        <Eyebrow>{t.events.eyebrow}</Eyebrow>
        <h2 className="mt-6 max-w-3xl font-display text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.03]">
          {t.events.headA} <em className="text-rust">{t.events.headB}</em>
        </h2>
        <PawRule className="mt-8" />
      </header>

      <ul className="mt-14 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event, i) => (
          <Reveal as="li" key={event.slug} delay={(i % 3) * 70}>
            <article className="flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-sand bg-white">
              {event.image ? (
                <div className="relative aspect-[16/10] w-full bg-shell">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="(min-width: 1024px) 30vw, 92vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="text-[0.76rem] tracking-[0.12em] text-taupe uppercase tabular-nums">
                  {event.date}
                  {event.time ? ` · ${event.time}` : ""}
                </p>
                <h3 className="mt-2 font-display text-[1.25rem] leading-snug">{event.title}</h3>
                {event.description ? (
                  <p className="mt-2.5 text-[0.88rem] leading-relaxed text-taupe">
                    {event.description}
                  </p>
                ) : null}
                {event.location ? (
                  <p className="mt-2 text-[0.82rem] text-mist">{event.location}</p>
                ) : null}
                {event.ctaUrl ? (
                  <a
                    href={event.ctaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto pt-5 text-[0.78rem] tracking-[0.1em] text-cocoa uppercase hover:underline"
                  >
                    {event.ctaLabel ?? t.events.more} ↗
                  </a>
                ) : null}
              </div>
            </article>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
