/*
 * The mark.
 *
 * HeyCat's logo is a paw whose four toes are coffee beans — the single best
 * idea in the whole identity, and it only exists as flat artwork printed on
 * cups and painted on a wall. Redrawn here as vector so it stays crisp at any
 * size and can take the page's own colour.
 */

type SvgProps = React.SVGProps<SVGSVGElement>;

/*
 * Geometry measured off the vector logo on HeyCat's printed menu: the bean
 * centres, their two sizes (the inner pair is taller than the outer pair), their
 * tilts, and the pad's outline profile. The original is drawn slightly
 * asymmetric by hand; this is symmetrised, which reads as the same mark.
 */
const BEANS = [
  { cx: 33.5, cy: 22.8, rx: 11.3, ry: 16.2, rot: -14 },
  { cx: 66.5, cy: 22.8, rx: 11.3, ry: 16.2, rot: 14 },
  { cx: 13.2, cy: 53.8, rx: 8.7, ry: 12.4, rot: -22 },
  { cx: 86.8, cy: 53.8, rx: 8.7, ry: 12.4, rot: 22 },
];

/** The trefoil pad: a domed apex, shoulders that flare low, two rounded feet. */
const PAD =
  "M50 48.6C54.6 48.6 57.6 50.6 58.9 53.2C60.4 56.2 61.4 59.8 63.2 62.8" +
  "C66 67.2 71.2 70.4 75.2 73.6C78.4 76.2 81 79.2 81 83.2" +
  "C81 87.6 78.8 91.6 75.2 93.9C71.6 96.1 66.6 96.3 63.1 94" +
  "C59.2 91.4 54.8 88.6 50 86.9C45.2 88.6 40.8 91.4 36.9 94" +
  "C33.4 96.3 28.4 96.1 24.8 93.9C21.2 91.6 19 87.6 19 83.2" +
  "C19 79.2 21.6 76.2 24.8 73.6C28.8 70.4 34 67.2 36.8 62.8" +
  "C38.6 59.8 39.6 56.2 41.1 53.2C42.4 50.6 45.4 48.6 50 48.6Z";

export function PawMark({
  title,
  detail = false,
  ...props
}: SvgProps & {
  title?: string;
  /**
   * Draw the crease inside each bean. Worth it at logo size; below roughly 24px
   * it turns to mud, so the silhouette alone is the default.
   */
  detail?: boolean;
}) {
  return (
    <svg viewBox="0 2 100 100" fill="currentColor" aria-hidden={!title} {...props}>
      {title ? <title>{title}</title> : null}
      {BEANS.map((b) => {
        const c = b.rx * 1.27;
        const k = b.ry * 0.62;
        const e = b.ry - 3;
        const q = b.ry * 0.42;
        return (
          <g key={`${b.cx}-${b.cy}`} transform={`translate(${b.cx} ${b.cy}) rotate(${b.rot})`}>
            <path
              d={`M0 -${b.ry}C${c} -${k} ${c} ${k} 0 ${b.ry}C-${c} ${k} -${c} -${k} 0 -${b.ry}Z`}
            />
            {detail ? (
              <path
                d={`M1.3 -${e}C-2.7 -${q} 2.3 ${q} -1.1 ${e}`}
                fill="none"
                stroke="var(--bean-crease, var(--color-cream))"
                strokeWidth={b.rx * 0.17}
                strokeLinecap="round"
              />
            ) : null}
          </g>
        );
      })}
      <path d={PAD} />
    </svg>
  );
}

/**
 * The full storefront lockup: paw over HEYCAT over COFFEE SHOP, exactly as it
 * reads on the fascia and on every cup.
 */
export function Logo({
  className = "",
  showSub = true,
}: {
  className?: string;
  showSub?: boolean;
}) {
  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <PawMark detail className="mb-[0.22em] h-[1.05em] w-[1.05em]" />
      <span className="font-brand text-[1em] font-semibold tracking-[0.01em]">
        HEYCAT
      </span>
      {showSub ? (
        <span className="mt-[0.22em] text-[0.235em] font-medium tracking-[0.42em] opacity-80">
          COFFEE SHOP
        </span>
      ) : null}
    </span>
  );
}

/**
 * HeyCat's own section divider: a hairline broken by a small paw. It sits under
 * the headline of every brunch and dessert poster they publish, so it does the
 * same job here.
 */
export function PawRule({
  className = "",
  width = "clamp(9rem, 22vw, 15rem)",
}: {
  className?: string;
  width?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-taupe/55 ${className}`}
      style={{ width }}
      aria-hidden="true"
    >
      <span className="h-px flex-1 bg-current" />
      <PawMark className="h-3.5 w-3.5 shrink-0 opacity-90" />
      <span className="h-px flex-1 bg-current" />
    </div>
  );
}

/**
 * The section eyebrow, set the way HeyCat sets "ICED" or "100% NATURAL" above a
 * poster headline: small, letterspaced, flanked by short rules.
 */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="eyebrow inline-flex items-center gap-3">
      <span aria-hidden="true" className="h-px w-6 bg-current opacity-50" />
      {children}
      <span aria-hidden="true" className="h-px w-6 bg-current opacity-50" />
    </span>
  );
}
