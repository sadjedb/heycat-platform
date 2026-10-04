import Image from "next/image";
import Link from "next/link";
import { Badge, Card, Flash, LinkButton, PageHeader, Table, Td, TranslationBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n-field";
import { moveCat } from "./actions";

export const metadata = { title: "Cats" };

const ADOPTION_TONE = {
  "not-listed": "neutral",
  available: "good",
  reserved: "warn",
  adopted: "info",
  "info-only": "neutral",
} as const;

export default async function CatsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const { ok, error } = await searchParams;
  const cats = await db.cat.findMany({
    orderBy: { position: "asc" },
    include: { image: { select: { url: true } } },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cats"
        description="The café's residents. Their descriptions came from the cards HeyCat publishes — edit freely."
      >
        <LinkButton href="/admin/cats/new" variant="primary">Add cat</LinkButton>
      </PageHeader>

      <Flash ok={ok} error={error} />

      <Card>
        <Table head={["", "Name", "Title", "Adoption", "Translations", "Order", ""]}>
          {cats.map((cat, i) => (
            <tr key={cat.id}>
              <Td className="w-14">
                {cat.image ? (
                  <Image src={cat.image.url} alt="" width={44} height={44}
                    className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span className="block h-11 w-11 rounded-full bg-shell" />
                )}
              </Td>
              <Td>
                <Link href={`/admin/cats/${cat.id}`} className="font-display text-[1rem] hover:underline">
                  {t(cat.name, "fr") || "(unnamed)"}
                </Link>
                {!cat.published ? <span className="ms-2"><Badge tone="warn">hidden</Badge></span> : null}
              </Td>
              <Td className="text-taupe">{t(cat.title, "fr")}</Td>
              <Td>
                <Badge tone={ADOPTION_TONE[cat.adoption as keyof typeof ADOPTION_TONE] ?? "neutral"}>
                  {cat.adoption}
                </Badge>
              </Td>
              <Td><TranslationBadge value={cat.name} /></Td>
              <Td>
                <div className="flex gap-1">
                  {(["up", "down"] as const).map((dir) => (
                    <form action={moveCat} key={dir}>
                      <input type="hidden" name="id" value={cat.id} />
                      <input type="hidden" name="direction" value={dir} />
                      <button type="submit"
                        disabled={dir === "up" ? i === 0 : i === cats.length - 1}
                        aria-label={`Move ${t(cat.name, "fr")} ${dir}`}
                        className="rounded px-2 py-1 text-taupe hover:bg-shell disabled:opacity-30">
                        {dir === "up" ? "↑" : "↓"}
                      </button>
                    </form>
                  ))}
                </div>
              </Td>
              <Td>
                <Link href={`/admin/cats/${cat.id}`}
                  className="text-[0.8rem] tracking-[0.06em] text-cocoa uppercase hover:underline">Edit</Link>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
