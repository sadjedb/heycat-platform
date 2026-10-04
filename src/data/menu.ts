/*
 * The menu.
 *
 * PRIMARY SOURCE: HeyCat's own printed menu (hey-cat-menu-1.pdf). Names, prices,
 * categories and the closing notes are transcribed from it exactly — including
 * their spellings ("Esspurresso", "Chesse Cake", "Syrop arom"). Each price was
 * paired to its item by coordinate, not by reading order, because the PDF's text
 * layer lists them out of sequence.
 *
 * SECONDARY SOURCE: the Instagram posters supply the photography, and the
 * flavour lines under Tiramisu and Cookies — the printed menu only says
 * "assorted flavors".
 *
 * Brunch and the bubble/juice drinks are NOT on the printed menu. They are real
 * — the café photographs them, and a "MENU / Brunch & Dessert" card is visible
 * on the tables — but this menu does not price them, so they carry no price and
 * say where they come from. See README.md: the café should confirm them.
 */

export type MenuItem = {
  slug: string;
  name: string;
  /* In DA, from the printed menu. null = not priced on that menu. */
  price: number | null;
  image?: string;
  /* HeyCat's own French description, where they published one. */
  description?: string;
  /* The menu says "assorted flavors"; these are the ones they have posted. */
  flavours?: string[];
  /* Ties the item to the colour HeyCat printed its poster in. */
  accent?: string;
};

export type MenuCategory = {
  slug: string;
  name: string;
  /* Shown under the category name — descriptive, not a factual claim. */
  note: string;
  /* Where this category's items and prices come from. */
  source: "printed-menu" | "instagram";
  items: MenuItem[];
};

export const menu: MenuCategory[] = [
  {
    slug: "hot",
    name: "Hot",
    note: "Poured into the house cup, paw side out.",
    source: "printed-menu",
    items: [
      {
        slug: "esspurresso",
        name: "Esspurresso",
        price: 400,
        image: "/img/menu/esspuresso.webp",
        accent: "var(--color-walnut)",
      },
      { slug: "fluffy-latte", name: "Fluffy Latte", price: 650, accent: "var(--color-rust)" },
      {
        slug: "catpuccino",
        name: "Catpuccino",
        price: 650,
        image: "/img/menu/catppuccino.webp",
        accent: "var(--color-cocoa)",
      },
      { slug: "meowchiato", name: "Meowchiato", price: 650, accent: "var(--color-walnut)" },
      { slug: "hey-chocolate", name: "Hey chocolate", price: 750, accent: "var(--color-cocoa)" },
      {
        slug: "cream-cheese-chocolate",
        name: "Cream cheese chocolate",
        price: 850,
        image: "/img/menu/cream-cheese-hot-chocolate.webp",
        accent: "var(--color-cocoa)",
      },
      {
        slug: "meowtcha-latte",
        name: "Meowtcha latte",
        price: 850,
        image: "/img/menu/matcha-latte-hot.webp",
        accent: "var(--color-matcha)",
      },
      {
        slug: "affogato",
        name: "Affogato",
        price: 850,
        image: "/img/menu/affogato.webp",
        accent: "var(--color-walnut)",
      },
      {
        slug: "americano",
        name: "Americano",
        price: 550,
        image: "/img/menu/americano-hot.webp",
        accent: "var(--color-walnut)",
      },
    ],
  },
  {
    slug: "iced",
    name: "Iced",
    note: "Cat-ear lids. No further explanation offered.",
    source: "printed-menu",
    items: [
      {
        slug: "iced-tiramisu-meowtcha",
        name: "Iced tiramisu meowtcha",
        price: 900,
        image: "/img/menu/iced-tiramisu-matcha.webp",
        accent: "var(--color-matcha)",
      },
      {
        slug: "iced-tiramisu-latte",
        name: "Iced tiramisu latte",
        price: 1200,
        image: "/img/menu/iced-tiramisu-latte.webp",
        accent: "var(--color-walnut)",
      },
      {
        slug: "iced-meowtcha",
        name: "Iced meowtcha",
        price: 1000,
        image: "/img/menu/iced-matcha.webp",
        accent: "var(--color-matcha)",
      },
      {
        slug: "iced-latte",
        name: "Iced latte",
        price: 700,
        image: "/img/menu/iced-latte.webp",
        accent: "var(--color-rust)",
      },
      { slug: "iced-coffee", name: "Iced coffee", price: 700, accent: "var(--color-walnut)" },
      {
        slug: "ice-cream-thai-tea",
        name: "Ice Cream Thai Tea",
        price: 850,
        accent: "var(--color-citrus)",
      },
      {
        slug: "strawberry-acai",
        name: "Strawberry acai",
        price: 600,
        image: "/img/menu/strawberry-acai.webp",
        accent: "var(--color-hibiscus)",
      },
      {
        slug: "cheese-boom-tea",
        name: "Cheese boom tea",
        price: 800,
        accent: "var(--color-gold)",
      },
    ],
  },
  {
    slug: "dessert",
    name: "Dessert",
    note: "Assorted flavors — boxed with a paw and a note: “Meow, unwrap me.”",
    source: "printed-menu",
    items: [
      {
        slug: "tiramisu",
        name: "Tiramisu",
        price: 850,
        flavours: ["Classic", "Hazelnut", "Pistachio"],
        image: "/img/menu/classic-tiramisu.webp",
        accent: "var(--color-walnut)",
      },
      {
        slug: "san-sebastian",
        name: "San Sebastian",
        price: 850,
        image: "/img/menu/san-sebastian-cheesecake.webp",
        accent: "var(--color-gold)",
      },
      { slug: "fluffy-flan", name: "Fluffy Flan", price: 750, accent: "var(--color-gold)" },
      { slug: "chesse-cake", name: "Chesse Cake", price: 750, accent: "var(--color-gold)" },
      { slug: "brownies", name: "Brownies", price: 800, accent: "var(--color-cocoa)" },
      {
        slug: "trio-mini-biscuits",
        name: "Trio Mini Biscuits",
        price: 650,
        accent: "var(--color-walnut)",
      },
      {
        slug: "cake-of-the-day",
        name: "Cake Of The Day",
        price: 700,
        image: "/img/menu/matilda-cake.webp",
        accent: "var(--color-cocoa)",
      },
      {
        slug: "cookies",
        name: "Cookies",
        price: 450,
        flavours: ["Chocolate", "Pistachio", "Hazelnut", "Raspberry"],
        image: "/img/menu/chocolate-cookie.webp",
        accent: "var(--color-walnut)",
      },
    ],
  },
  {
    slug: "brunch",
    name: "Brunch",
    note: "From the Brunch & Dessert card in the café — served on cat-eared plates.",
    source: "instagram",
    items: [
      {
        slug: "big-suny-breakfast",
        name: "Big Suny Breakfast",
        price: null,
        image: "/img/menu/big-suny-breakfast.webp",
      },
      {
        slug: "kitty-bliss-bowl",
        name: "Kitty Bliss Bowl",
        price: null,
        image: "/img/menu/kitty-bliss-bowl.webp",
        accent: "var(--color-matcha)",
      },
      {
        slug: "ocean-cat-toast",
        name: "Ocean Cat Toast",
        price: null,
        image: "/img/menu/ocean-cat-toast.webp",
      },
      {
        slug: "avocado-paw-toast",
        name: "Avocado Paw Toast",
        price: null,
        image: "/img/menu/avocado-paw-toast.webp",
        accent: "var(--color-matcha)",
      },
      {
        slug: "royal-cat-burrata",
        name: "Royal Cat Burrata",
        price: null,
        image: "/img/menu/royal-cat-burrata.webp",
      },
      {
        slug: "heycat-salad",
        name: "Heycat Salad",
        price: null,
        image: "/img/menu/heycat-salad.webp",
        accent: "var(--color-matcha)",
      },
      {
        slug: "happy-shadow-toast",
        name: "Happy Shadow Toast",
        price: null,
        image: "/img/menu/happy-shadow-toast.webp",
      },
      {
        slug: "velvet-shrimp-croissant",
        name: "Velvet Shrimp Croissant",
        price: null,
        image: "/img/menu/velvet-shrimp-croissant.webp",
        accent: "var(--color-rust)",
      },
      {
        slug: "meowmon-bagel",
        name: "Meowmon Bagel",
        description:
          "Bagel, fromage du chef, salade de roquette, tomates cerises, saumon fumé",
        price: null,
        image: "/img/menu/meowmon-bagel.webp",
      },
      {
        slug: "mischief-perla-toast",
        name: "Mischief Perla Toast",
        price: null,
        image: "/img/menu/mischief-perla-toast.webp",
      },
      {
        slug: "berry-meow-toast",
        name: "Berry Meow Toast",
        price: null,
        image: "/img/menu/berry-meow-toast.webp",
        accent: "var(--color-berry)",
      },
      {
        slug: "purrfect-cherry-brioche",
        name: "Purrfect Cherry Brioche",
        description:
          "Brioche, miel, crème mascarpone, cerises confites, coulis de cerise",
        price: null,
        image: "/img/menu/purrfect-cherry-brioche.webp",
        accent: "var(--color-hibiscus)",
      },
      {
        slug: "the-forbidden-paw",
        name: "The Forbidden Paw",
        price: null,
        image: "/img/menu/the-forbidden-paw.webp",
        accent: "var(--color-walnut)",
      },
    ],
  },
  {
    slug: "bubble-juice",
    name: "Bubble & Juice",
    note: "Posted by the café, not priced on the printed menu — ask for today's list.",
    source: "instagram",
    items: [
      {
        slug: "iced-bubble-tea",
        name: "Iced Bubble Tea",
        price: null,
        image: "/img/menu/iced-bubble-tea.webp",
        accent: "var(--color-walnut)",
      },
      {
        slug: "iced-bubble-matcha",
        name: "Iced Bubble Matcha",
        price: null,
        image: "/img/menu/iced-bubble-matcha.webp",
        accent: "var(--color-matcha)",
      },
      {
        slug: "iced-strawberry-bubble-matcha",
        name: "Iced Strawberry Bubble Matcha",
        price: null,
        image: "/img/menu/iced-strawberry-bubble-matcha.webp",
        accent: "var(--color-berry)",
      },
      {
        slug: "iced-blueberry-bubble-matcha",
        name: "Iced Blueberry Bubble Matcha",
        price: null,
        image: "/img/menu/iced-blueberry-bubble-matcha.webp",
        accent: "var(--color-ube)",
      },
      {
        slug: "iced-bubble-ube",
        name: "Iced Bubble Ube",
        price: null,
        image: "/img/menu/iced-bubble-ube.webp",
        accent: "var(--color-ube)",
      },
      {
        slug: "orange-juice",
        name: "Orange Juice",
        price: null,
        image: "/img/menu/orange-juice.webp",
        accent: "var(--color-citrus)",
      },
      {
        slug: "strawberry-juice",
        name: "Strawberry Juice",
        price: null,
        image: "/img/menu/strawberry-juice.webp",
        accent: "var(--color-hibiscus)",
      },
      {
        slug: "banana-juice",
        name: "Banana Juice",
        price: null,
        image: "/img/menu/banana-juice.webp",
        accent: "var(--color-banana)",
      },
      {
        slug: "cocktail-juice",
        name: "Cocktail Juice",
        price: null,
        image: "/img/menu/cocktail-juice.webp",
        accent: "var(--color-berry)",
      },
      {
        slug: "milkshake-strawberry",
        name: "Milkshake Strawberry",
        price: null,
        image: "/img/menu/milkshake-strawberry.webp",
        accent: "var(--color-berry)",
      },
      {
        slug: "milkshake-banane",
        name: "Milkshake Banane",
        price: null,
        image: "/img/menu/milkshake-banane.webp",
        accent: "var(--color-banana)",
      },
    ],
  },
];

/** Add-ons, straight off the printed menu's OPTIONS block. */
export const options: { name: string; price: number }[] = [
  { name: "Vegan milk", price: 400 },
  { name: "Syrop arom", price: 200 },
  { name: "Pate arom", price: 300 },
  { name: "Cream cheese", price: 250 },
  { name: "Ice cream", price: 450 },
];

/**
 * Two sections the printed menu lists with no items at all — both just say to
 * ask the staff. They are the most charming thing on the card, so they stay.
 */
export const askTheStaff: { title: string; body: string }[] = [
  { title: "For cats", body: "Please check with our staff the availability." },
  { title: "Salted", body: "Please check with our staff the availability." },
];

export const CURRENCY = "DA";
