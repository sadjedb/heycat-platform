import { fixtures } from "@/data/floorplan";

/*
 * A read-only picture of the floor, for the admin.
 *
 * Four coordinate fields tell the owner nothing on their own; this shows what
 * they did. Deliberately not the public FloorPlan component — that one is a
 * client component carrying availability state and selection, none of which
 * applies here.
 */
export function PlanPreview({
  tables,
  highlightId,
}: {
  tables: {
    id: string;
    number: number;
    seats: number;
    shape: string;
    x: number;
    y: number;
    width: number;
    height: number;
    bookable: boolean;
  }[];
  highlightId?: string | null;
}) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-sand bg-cream"
      style={{ aspectRatio: "3 / 2" }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <rect x="1.5" y="1.5" width="97" height="97" rx="1.5" fill="var(--color-shell)" stroke="var(--color-espresso)" strokeWidth="1.2" />
        {fixtures.map((f, i) => {
          const x = f.x - f.width / 2;
          const y = f.y - f.height / 2;
          const fill =
            f.kind === "rug" ? "var(--color-sand)"
            : f.kind === "window" ? "#cfd8dc"
            : f.kind === "catzone" ? "var(--color-linen)"
            : f.kind === "entrance" ? "var(--color-espresso)"
            : "var(--color-walnut)";
          return <rect key={i} x={x} y={y} width={f.width} height={f.height} rx="1" fill={fill} opacity={f.kind === "rug" ? 0.55 : 1} />;
        })}
      </svg>

      {tables.map((x) => (
        <span
          key={x.id}
          title={`Table ${x.number} · ${x.seats} seats`}
          className={[
            "absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center",
            x.shape === "round" ? "rounded-full" : "rounded-[18%]",
          ].join(" ")}
          style={{
            left: `${x.x}%`,
            top: `${x.y}%`,
            width: `${x.width}%`,
            height: `${x.height}%`,
            background: x.bookable ? "var(--color-walnut)" : "var(--color-sand)",
            color: x.bookable ? "var(--color-cream)" : "var(--color-mist)",
            boxShadow: highlightId === x.id ? "0 0 0 0.2rem var(--color-cocoa)" : undefined,
          }}
        >
          <span className="font-display text-[clamp(0.55rem,1.4vw,0.95rem)] tabular-nums">
            {x.number}
          </span>
        </span>
      ))}
    </div>
  );
}
