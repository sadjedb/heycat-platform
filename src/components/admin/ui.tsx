import Link from "next/link";
import { locales, localeNames, type Locale } from "@/i18n/locales";
import { asField } from "@/lib/i18n-field";

/*
 * Admin UI kit.
 *
 * The dashboard is a working tool, not a showpiece, so it is denser and plainer
 * than the public site — but it is built from the same tokens (cream, espresso,
 * cocoa, the paw mark) so it still reads as HEYCAT rather than as a generic
 * admin template.
 *
 * Everything here is a Server Component. Interactivity in the admin comes from
 * plain forms posting to Server Actions, which means the dashboard works before
 * JavaScript loads and there is almost no client bundle.
 */

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-sand pb-6">
      <div>
        <h1 className="font-display text-[1.8rem] leading-tight">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-[60ch] text-[0.88rem] leading-relaxed text-taupe">
            {description}
          </p>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </header>
  );
}

export function Card({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  /** A link or button sitting opposite the title — "edit shelf", "view all". */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-sand bg-white p-5 sm:p-6 ${className}`}>
      {title ? (
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div>
            <h2 className="font-display text-[1.15rem]">{title}</h2>
            {description ? (
              <p className="mt-1 text-[0.82rem] leading-relaxed text-taupe">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[0.78rem] font-medium tracking-[0.1em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS = {
  primary: "bg-espresso text-cream hover:bg-cocoa",
  secondary: "border border-espresso/25 text-espresso hover:border-espresso",
  danger: "border border-hibiscus/40 text-hibiscus hover:bg-hibiscus hover:text-white",
  ghost: "text-taupe hover:text-espresso",
} as const;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof VARIANTS }) {
  return <button className={`${BUTTON_BASE} ${VARIANTS[variant]} ${className}`} {...props} />;
}

export function LinkButton({
  href,
  variant = "secondary",
  className = "",
  children,
}: {
  href: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${BUTTON_BASE} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}

// ------------------------------------------------------------------- fields

const INPUT =
  "w-full rounded-lg border border-sand bg-cream/40 px-3.5 py-2.5 text-[0.92rem] text-espresso outline-none transition-colors placeholder:text-mist focus:border-cocoa focus:bg-white";

export function Field({
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

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${INPUT} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`${INPUT} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${INPUT} ${props.className ?? ""}`} />;
}

export function Checkbox({
  label,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-1.5">
      <input
        type="checkbox"
        {...props}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-cocoa)]"
      />
      <span>
        <span className="block text-[0.88rem] text-espresso">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-[0.76rem] leading-relaxed text-mist">{hint}</span>
        ) : null}
      </span>
    </label>
  );
}

/**
 * One input per locale for a translated column.
 *
 * All three languages sit side by side rather than behind tabs: the owner is
 * most likely to fill French and forget the others, and a tab hides that. A
 * locale with nothing in it falls back to French on the public site, which the
 * hint says out loud.
 */
export function I18nInput({
  name,
  label,
  value,
  hint,
  multiline,
  required,
  placeholder,
}: {
  name: string;
  label: string;
  value?: unknown;
  hint?: string;
  multiline?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  const field = asField(value);
  const Control = multiline ? Textarea : Input;

  return (
    <fieldset className="block">
      <legend className="mb-1.5 flex items-baseline gap-2">
        <span className="text-[0.78rem] font-semibold tracking-[0.04em] text-espresso">
          {label}
          {required ? <span className="text-hibiscus"> *</span> : null}
        </span>
        {hint ? <span className="text-[0.74rem] text-mist">{hint}</span> : null}
      </legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {locales.map((locale) => (
          <div key={locale}>
            <span className="mb-1 block text-[0.7rem] tracking-[0.1em] text-mist uppercase">
              {localeNames[locale]}
            </span>
            <Control
              name={`${name}.${locale}`}
              defaultValue={field[locale] ?? ""}
              placeholder={placeholder}
              dir={locale === "ar" ? "rtl" : undefined}
              lang={locale}
              required={required && locale === "fr"}
            />
          </div>
        ))}
      </div>
    </fieldset>
  );
}

// ------------------------------------------------------------------ feedback

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "good" | "warn" | "bad" | "info";
  children: React.ReactNode;
}) {
  const tones = {
    neutral: "bg-shell text-taupe",
    good: "bg-matcha/12 text-matcha",
    warn: "bg-gold/15 text-[#8a6410]",
    bad: "bg-hibiscus/12 text-hibiscus",
    info: "bg-cocoa/10 text-cocoa",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-medium tracking-[0.06em] uppercase ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Which locales a translated field is still missing. */
export function TranslationBadge({ value }: { value: unknown }) {
  const field = asField(value);
  const missing = locales.filter((l) => !field[l]);
  if (!missing.length) return <Badge tone="good">3/3</Badge>;
  if (missing.length === locales.length) return <Badge tone="bad">none</Badge>;
  return <Badge tone="warn">missing {missing.join(", ")}</Badge>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-sand px-6 py-14 text-center">
      <p className="font-display text-[1.1rem]">{title}</p>
      <p className="mx-auto mt-2 max-w-[46ch] text-[0.85rem] leading-relaxed text-taupe">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

/**
 * Result banner.
 *
 * Server Actions redirect back with `?ok=` or `?error=`, so the message survives
 * the navigation without any client state.
 */
export function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <div
      role="status"
      className={[
        "rounded-lg border px-4 py-3 text-[0.86rem]",
        error
          ? "border-hibiscus/30 bg-hibiscus/8 text-hibiscus"
          : "border-matcha/30 bg-matcha/8 text-matcha",
      ].join(" ")}
    >
      {error ?? ok}
    </div>
  );
}

/** A row of plain numbers. The dashboard's job is answering "what needs me?". */
export function Stat({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const body = (
    <>
      <span className="block text-[0.74rem] tracking-[0.12em] text-taupe uppercase">
        {label}
      </span>
      <span className="mt-2 block font-display text-[2rem] leading-none tabular-nums">
        {value}
      </span>
      {hint ? <span className="mt-1.5 block text-[0.76rem] text-mist">{hint}</span> : null}
    </>
  );
  const className =
    "block rounded-xl border border-sand bg-white p-5 transition-colors hover:border-cocoa/40";
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-sand">
            {head.map((h) => (
              <th
                key={h}
                scope="col"
                className="py-3 pr-4 text-[0.72rem] font-semibold tracking-[0.1em] text-taupe uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`border-b border-sand/60 py-3 pr-4 align-middle text-[0.88rem] ${className}`}>
      {children}
    </td>
  );
}

/** Money, in the café's currency. Prices are whole dinars. */
export function Price({ value }: { value: number | null }) {
  if (value === null) return <span className="text-mist">—</span>;
  return <span className="tabular-nums">{value} DA</span>;
}

export const localeList: readonly Locale[] = locales;
