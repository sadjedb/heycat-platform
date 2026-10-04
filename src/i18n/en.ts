/*
 * English copy.
 *
 * This file is the shape every other locale must match — `Dictionary` is derived
 * from it, so a missing key in `fr.ts` is a type error rather than a blank on the
 * page.
 *
 * WHAT IS NOT IN HERE, deliberately: anything HeyCat itself published. The wall
 * slogan, "Thanks for coming.", every menu category and item name, the "For cats"
 * and "Salted" notes, and all eleven cat cards stay exactly as the café wrote
 * them, in both locales. Translating a café's own words would be putting words in
 * its mouth. Only our editorial copy and the interface move.
 */

/*
 * No `as const` here on purpose: it would freeze every string as its own literal
 * type and no translation could ever satisfy `Dictionary`.
 */
export const en = {
  localeName: "English",
  switchTo: "Passer en français",

  nav: {
    cats: "The Cats",
    room: "The Café",
    menu: "Menu",
    visit: "Visit",
    instagram: "Instagram",
    home: "home",
    open: "Open menu",
    close: "Close menu",
    skip: "Skip to content",
  },

  meta: {
    title: "HEYCAT Coffee Shop — Come where #cats are",
    description:
      "A cat café and coffee shop in Algeria. Eleven cats in residence, brunch under the morning sun, desserts boxed with a paw, and cold drinks with ears on the lid.",
    menuTitle: "The full menu",
    menuDescription:
      "Every drink, dessert and brunch dish at HEYCAT Coffee Shop, with prices from the café's own menu.",
  },

  hero: {
    eyebrow: "Cat Café & Coffee Shop",
    body: "Eleven cats live here. They have names, opinions and favourite chairs. Around them: brunch under the morning sun, tiramisu in a box that asks to be unwrapped, and coffee poured paw-side out.",
    seeMenu: "See the menu",
    meetCats: "Meet the cats",
    dishCaption: "named after the ginger one, who insists",
    residentsAre: "The cats in residence:",
    heroAlt:
      "The Big Suny Breakfast: eggs, smoked salmon, avocado and salad, with two slices of rye toast stood up like a pair of cat ears.",
    sunyAlt: "Suny, a ginger Scottish Fold, sitting and looking into the room.",
  },

  statement: {
    eyebrow: "The idea",
    headA: "A coffee shop that",
    headB: "happens to be",
    headC: "theirs",
    p1: "Travertine and walnut, an oxidised copper counter with a line of warm light under it, arches cut into cream plaster. Wooden paw prints set into white pebbles lead you in. It reads like a proper café because it is one.",
    p2: "Then you notice the tunnels through the walls, the shelves that climb to the ceiling, the mirror shaped like an eye in a cat's face. The cats were here first. Everything else was built around them.",
    quoteSource: "framed by the door, on the way out",
    posterAlt:
      "A framed poster by the café door showing a black cat sitting at a table with coffee and cake, above the words Thanks for coming.",
  },

  residents: {
    eyebrow: "In residence",
    headA: "Eleven cats.",
    headB: "Each one a regular.",
    body: "A king, a princess, a little judge and a professional napper. Their descriptions are their own — we only moved them off Instagram.",
    breed: "Breed",
    choose: "Choose a cat",
    portraitAlt: "{name}, {breed}, sitting for a portrait.",
  },

  room: {
    eyebrow: "The café",
    headA: "Built for them.",
    headB: "Furnished for you.",
    frames: {
      counter: {
        caption: "Paw prints set into the pebbles, leading to the counter",
        alt: "The café counter, a curved oxidised-copper block with a strip of warm light glowing beneath it, set behind white pebbles inlaid with wooden paw prints.",
      },
      pod: {
        caption: "A tunnel through the wall, occupied",
        alt: "A long-haired grey cat asleep inside a round wooden pod mounted on the wall, its tail hanging over the rim.",
      },
      climb: {
        caption: "The climb, all the way up",
        alt: "A cream wall fitted with wooden perches, hammocks and a tall sisal scratching post, with two cats resting on the upper shelves.",
      },
      dining: {
        caption: "Mornings, before it fills",
        alt: "The dining room in daylight: round tables, curved wooden chairs and upholstered stools, with a glazed wall onto the street.",
      },
      washroom: {
        caption: "The mirror is the eye",
        alt: "A washroom wall painted with an oversized black-and-white cat's face, where one round mirror forms the cat's eye above a stone basin.",
      },
      wall: {
        caption: "The mark, in plaster",
        alt: "The HEYCAT paw logo rendered in relief on a textured plaster wall, lit from above, over a recessed niche stacked with ceramic cups.",
      },
      terrace: {
        caption: "Stools with a cat cut out of them",
        alt: "The terrace at night: black round tables, wooden stools cut with a cat-head silhouette, white pebbles and gold light curving along the walls.",
      },
    },
  },

  details: {
    lid: {
      title: "Ears on the lid",
      line: "Every cold drink arrives wearing them.",
      alt: "An iced bubble matcha in a clear cup, sealed with a domed lid moulded into two cat ears, the paw logo printed on the side.",
    },
    plates: {
      title: "Plates that say hello",
      line: "“Hello!” on one rim, “Who?” on another.",
      alt: "A pistachio cookie on a white plate shaped like a cat's head, with Hello! written along the rim and a small ceramic cat beside it.",
    },
    band: {
      title: "Meow, unwrap me",
      line: "Printed down the side of every dessert band.",
      alt: "A boxed tiramisu with a paper band reading Bon appétit, and sideways along the edge, Meow, unwrap me.",
    },
    shop: {
      title: "The boutique corner",
      line: "Spoons, mugs and totes, under the lettering.",
      alt: "A hand holding a yellow tote bag printed with a black cat sitting at a café table, in front of the café wall lettered COME WHERE #CATS ARE.",
    },
  },

  boutique: {
    eyebrow: "The boutique",
    headA: "Take one",
    headB: "home with you.",
    body: "Two arched niches by the counter hold the shop: cat-headed teaspoons, mugs that stare back, dishes, and the tote with the café's own cat printed on it.",
    askInside: "Stock changes — ask at the counter for what is in today.",
    items: {
      spoons: {
        caption: "Teaspoons, in three colourways",
        alt: "Three teaspoons with ceramic cat-head handles in cream, yellow and blue, laid on a grey rug.",
      },
      mug: {
        caption: "Mugs that stare back",
        alt: "A hand holding a small white mug moulded into the shape of a cat's head.",
      },
      bowl: {
        caption: "Cat-face bowls",
        alt: "A hand holding a yellow and white ceramic bowl shaped like a cat's face.",
      },
      cups: {
        caption: "Cups and saucers",
        alt: "A hand holding a brown cat-shaped cup above a matching cat-face dish.",
      },
      tote: {
        caption: "The tote, with the café's own cat",
        alt: "A hand holding a yellow tote bag printed with a black cat sitting at a café table.",
      },
      niches: {
        caption: "Both niches, by the counter",
        alt: "Two arched alcoves with wooden shelves displaying cat-shaped ceramics, boards and books.",
      },
    },
  },

  shop: {
    title: "The boutique",
    intro: "Things from the café's own shelves — the spoons, the mugs, the tote with its cat on it. Everything is sold at the counter; message the café to put one aside.",
    seeAll: "See the whole shop",
    backToShop: "Back to the boutique",
    askPrice: "Ask at the counter",
    enquire: "Ask about this on WhatsApp",
    enquireMessage: "Hello! Is {product} available?",
    details: "Details",
    alsoIn: "More in {category}",
    empty: "The shop is being restocked. Ask at the counter in the meantime.",
    stock: {
      "in-stock": "In stock",
      low: "Only a few left",
      out: "Out of stock",
      unlisted: "Not listed",
    },
    featured: "Favourite",
    viewProduct: "View {product}",
  },

  menu: {
    eyebrow: "The menu",
    headA: "Brunch, dessert and",
    headB: "something cold with ears.",
    options: "Options",
    notPricedNote:
      "These are not priced on the café's printed menu, so no price is shown rather than a guessed one.",
    showPhoto: "Show a photograph of {name}",
    categories: "Menu categories",
    notes: {
      hot: "Poured into the house cup, paw side out.",
      iced: "Cat-ear lids. No further explanation offered.",
      dessert:
        "Assorted flavors — boxed with a paw and a note: “Meow, unwrap me.”",
      brunch:
        "From the Brunch & Dessert card in the café — served on cat-eared plates.",
      "bubble-juice":
        "Posted by the café, not priced on the printed menu — ask for today's list.",
    },
    fullMenu: "The full menu",
    openFullMenu: "Open the full menu",
    backToSite: "Back to the café",
    printHint: "Printed from heycat — prices as shown on the café's own menu.",
    pricesIn: "Prices in {currency}.",
  },

  visit: {
    eyebrow: "Visit",
    headA: "The door is open.",
    headB: "Someone is watching it.",
    body: "HeyCat Coffee Shop is in Algeria. The quickest way to reach the café — and to see which cat has claimed which chair today — is Instagram, where they post daily.",
    address: "Address",
    phone: "Phone",
    email: "Email",
    hours: "Hours",
    pending: "To be confirmed",
    pendingNote:
      "The café confirms these before the page goes live — nothing here is guessed. Until then, Instagram is the fastest way to ask.",
    storefrontAlt:
      "The HEYCAT Coffee Shop storefront: a white fascia with a black paw above the name, a scalloped awning, black-framed windows and pale planters on the pavement.",
    storefrontCaption: "Look for the paw above the door.",
    rules: "House rules",
    rulesIntro: "A few things the cats would like you to know.",
    reservations: "Reservations",
    reservationsIntro: "For a table, or a bigger group.",
    adoption: "Adoption",
    adoptionIntro: "Some of the cats here are looking for somewhere permanent.",
    mapTitle: "Map showing where the café is",
    awaitingCafe:
      "The café is writing this — ask on Instagram in the meantime.",
  },

  reserve: {
    eyebrow: "Reserve",
    headA: "Keep a table.",
    headB: "The cats keep their chairs.",
    intro: "Tell us when, and for how many. The café confirms by phone or WhatsApp.",
    date: "Date",
    time: "Time",
    guests: "Guests",
    name: "Your name",
    phone: "Phone",
    email: "Email",
    emailHint: "Optional",
    message: "Anything we should know",
    messageHint: "A birthday, a high chair, an allergy",
    submit: "Request a table",
    pickTime: "Choose a time",
    successTitle: "Request received",
    successBody: "The café will confirm shortly. Nothing is booked until they do.",
    closedTitle: "Reservations are not open online",
    closedBody: "Message the café directly and they will sort you out.",
    whatsapp: "Ask on WhatsApp",
    errorGeneric: "That did not go through. Please check the form and try again.",
    errorPast: "Please choose a date and time in the future.",
    errorClosed: "The café is not open for bookings then.",
    errorGuests: "That party size is outside what the café takes online.",
    required: "Please fill in the required fields.",
    pickDateFirst: "Choose a date first.",
    pickTimeFirst: "Choose a time to see which tables are free.",
    calendar: {
      previousMonth: "Previous month",
      nextMonth: "Next month",
      closedNote: "Crossed-out days are when the café is closed.",
    },
    plan: {
      title: "Choose your table",
      table: "Table",
      seats: "seats",
      hint: "Picking a table is optional — leave it and the café will seat you.",
      freeCount: "{n} tables free at this time",
      noneFree: "No tables free at this time. Try another slot.",
      anyTable: "Any table — let the café choose",
      chosen: "Table {n} chosen",
      states: {
        free: "Free",
        taken: "Taken",
        "too-small": "Too small",
        closed: "Not bookable",
      },
      fixtures: { bar: "Coffee", catZone: "Cat zone", entrance: "Entrance" },
      zones: { window: "By the window", centre: "Main room", lounge: "Lounge", wall: "Along the wall", bar: "At the bar" },
      errorTaken: "That table has just been taken. Please choose another.",
      errorTooSmall: "That table is too small for your party.",
      errorClosed: "That table is not bookable.",
    },
  },

  today: {
    eyebrow: "Today at HEYCAT",
    noPrice: "Ask at the counter",
  },

  events: {
    eyebrow: "What's on",
    headA: "Coming up",
    headB: "at the café.",
    none: "Nothing scheduled right now — the café posts these as they come.",
    more: "Details",
  },

  adoption: {
    eyebrow: "Adoption",
    available: "Looking for a home",
    reserved: "Reserved",
    adopted: "Adopted",
    infoOnly: "Ask about adoption",
    cta: "Ask about adopting",
  },

  common: {
    askAtCounter: "Ask at the counter",
    soldOut: "Sold out",
    whatsapp: "WhatsApp",
    close: "Close",
  },

  footer: {
    backToTop: "Back to top",
    inResidence: "In residence",
  },

  notFound: {
    title: "This one wandered off",
    body: "The page you were looking for is not here. The cats deny everything.",
    cta: "Back to the café",
    alt: "A flat illustration of a black cat sitting upright with wide round eyes, from the café's own menu artwork.",
  },
};

export type Dictionary = typeof en;
