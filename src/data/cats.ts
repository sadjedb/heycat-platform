/*
 * The residents.
 *
 * Every field below is transcribed verbatim from HeyCat's own published cat
 * cards — name, title, breed and each trait line. Nothing is embellished. Where
 * a card omits a field (Suny has no "Loves" row, Shadow has no "Vibes") the
 * field is simply absent here too.
 */

export type Trait = { label: string; value: string };

export type Cat = {
  slug: string;
  name: string;
  /* The banner HeyCat prints under each name. */
  title: string;
  breed: string;
  traits: Trait[];
  /* Their "Fun fact" line, where the card carries one. Shadow's and Choco's
     cards do not, so theirs is absent rather than padded out. */
  funFact?: string;
  image: string;
};

export const cats: Cat[] = [
  {
    slug: "shadow",
    name: "Shadow",
    title: "The king of HeyCat",
    breed: "Scottish Fold",
    traits: [
      { label: "Son of", value: "Yulia" },
      { label: "Personality", value: "Playful, calm & food lover" },
      { label: "Loves", value: "Snacks, naps & Nala" },
      { label: "Best friend", value: "Choco" },
    ],
    image: "/img/cats/shadow.webp",
  },
  {
    slug: "amira",
    name: "Amira",
    title: "The princess of HeyCat",
    breed: "Red Point Persian",
    traits: [
      { label: "Personality", value: "Acts like a princess" },
      { label: "Vibes", value: "So cute and classy" },
      { label: "Special trait", value: "Graceful, elegant & always the queen" },
      { label: "Loves", value: "Attention, comfy spots & gentle pets" },
    ],
    funFact: "She knows she's the star of the place.",
    image: "/img/cats/amira.webp",
  },
  {
    slug: "choco",
    name: "Choco",
    title: "The chocolate charm of HeyCat",
    breed: "Scottish Straight",
    traits: [
      { label: "Color", value: "Rich chocolate" },
      { label: "Personality", value: "Tender, calm & loves attention" },
      { label: "Loves", value: "Love treats, cozy naps & warm spots" },
      { label: "Vibes", value: "Cool, chill & a little mysterious" },
      { label: "Best friend", value: "Shadow" },
    ],
    image: "/img/cats/choco.webp",
  },
  {
    slug: "bouboule",
    name: "Bouboule",
    title: "The cuddle ball of HeyCat",
    breed: "Persian (Peki Face) — Brown Tabby",
    traits: [
      { label: "Personality", value: "Kind, gentle & full of love" },
      { label: "Vibes", value: "Sleepy king & professional napper" },
      { label: "Loves", value: "Chicken more than anything!" },
      { label: "Best at", value: "Melting hearts & getting all the cuddles" },
    ],
    funFact: "Will choose a cozy spot and sleep like a little queen.",
    image: "/img/cats/bouboule.webp",
  },
  {
    slug: "suny",
    name: "Suny",
    title: "The sunshine of HeyCat",
    breed: "Scottish Fold",
    traits: [
      { label: "Known for", value: "Defined eyes" },
      { label: "Personality", value: "Playful, calm & food lover" },
      { label: "Vibes", value: "Cool, confident & a little bossy" },
    ],
    funFact: "Loves high places & sunny spots.",
    image: "/img/cats/suny.webp",
  },
  {
    slug: "violetta",
    name: "Violetta",
    title: "The calm soul of HeyCat",
    breed: "British Shorthair (Lilac)",
    traits: [
      { label: "Personality", value: "So calm, gentle & peaceful" },
      { label: "Vibes", value: "Quiet soul & master of relaxation" },
      { label: "Loves", value: "Sleeping & being alone" },
      { label: "Favorite treat", value: "Treats make her heart melt" },
      { label: "Best at", value: "Enjoying peaceful moments" },
    ],
    funFact: "She doesn't need a crowd, her own little world is enough.",
    image: "/img/cats/violetta.webp",
  },
  {
    slug: "zola",
    name: "Zola",
    title: "The little judge of HeyCat",
    breed: "Scottish Straight",
    traits: [
      { label: "Color", value: "Black Smoke" },
      { label: "Personality", value: "So judge but so lovely" },
      { label: "Loves", value: "Sunlight and food" },
      { label: "Social", value: "Friendly and loves people" },
      { label: "Vibes", value: "Elegant, independent & full of charm" },
    ],
    funFact: "Expert in judging and napping in the sun.",
    image: "/img/cats/zola.webp",
  },
  {
    slug: "honey",
    name: "Honey",
    title: "The sleepy sweetheart of HeyCat",
    breed: "Persian",
    traits: [
      { label: "Personality", value: "Calm, sleepy & a little nosey" },
      { label: "Vibes", value: "Cutie and lovely" },
      { label: "Loves", value: "Petting, naps & cozy spots" },
    ],
    funFact: "Will quietly investigate everything.",
    image: "/img/cats/honey.webp",
  },
  {
    slug: "dior",
    name: "Dior",
    title: "The gentle soul of HeyCat",
    /* Dior's card reads "Persion"; the other Persian cards spell it correctly. */
    breed: "Persian",
    traits: [
      { label: "Gender", value: "A gentle male" },
      { label: "Personality", value: "Calm, sweet & easygoing" },
      { label: "Favorite spot", value: "Love to sleep on people's bags" },
      { label: "Looks", value: "Adorable and furry" },
    ],
    funFact: "He prefers your bag over his bed.",
    image: "/img/cats/dior.webp",
  },
  {
    slug: "mishka",
    name: "Mishka",
    title: "The little star of HeyCat",
    breed: "Persian",
    traits: [
      { label: "Personality", value: "Cutie, lovely & full of charm" },
      { label: "Loves", value: "Food and people" },
      { label: "Enjoys", value: "Playing & having fun all day long" },
      { label: "Favorite spot", value: "High places with the best view" },
    ],
    funFact: "Always finds the highest place in the room!",
    image: "/img/cats/mishka.webp",
  },
  {
    slug: "stella",
    name: "Stella",
    title: "The little star of HeyCat",
    breed: "Persian Half Peeky",
    traits: [
      { label: "Color", value: "Silver face" },
      { label: "Personality", value: "So cute, so small & so playful" },
      { label: "Loves", value: "People & kids" },
      { label: "Special talent", value: "Loves to steal your food" },
    ],
    funFact: "Tiny but acts like the boss.",
    image: "/img/cats/stella.webp",
  },
];
