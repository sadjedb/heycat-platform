/*
 * Business facts.
 *
 * Everything marked TODO is NOT known from the reference material and has been
 * left blank on purpose — nothing here is invented. Fill a value in and the
 * matching row appears on the site automatically; leave it null and the site
 * renders an honest "to be confirmed" state instead of a made-up one.
 */

export const site = {
  name: "HEYCAT",
  legalName: "HeyCat Coffee Shop",
  tagline: "Coffee Shop",
  /* Painted across the café's own wall, in black slab letters. */
  wallSlogan: ["Come", "where", "#cats are"],
  /* Framed by the door, above a black cat at a café table. */
  farewell: "Thanks for coming.",

  instagram: {
    handle: "@heycat.dz",
    url: "https://www.instagram.com/heycat.dz/",
  },

  /* TODO — confirm with the owner. */
  address: null as string | null,
  city: "Algeria",
  mapsUrl: null as string | null,
  phone: null as string | null,
  email: null as string | null,

  /* TODO — confirm opening times. Shape kept so the table renders once filled. */
  hours: null as { days: string; open: string }[] | null,

  /*
   * The café has confirmed it does all three of these. None of the wording has
   * been supplied yet, so each is null and the page says the café is writing it.
   * Drop in an array of lines and the block fills itself in.
   *
   * TODO — get the actual wording from the café.
   */
  houseRules: null as string[] | null,
  reservations: null as string[] | null,
  adoption: null as string[] | null,
} as const;

/* The public origin. Set NEXT_PUBLIC_SITE_URL to the real domain before launch. */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://heycat.example";
