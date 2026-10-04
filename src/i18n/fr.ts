/*
 * French copy — the default locale.
 *
 * HeyCat writes its own dish descriptions in French ("Bagel, fromage du chef,
 * salade de roquette, tomates cerises, saumon fumé"), so French is what the café
 * actually speaks to its customers in.
 *
 * As in `en.ts`, nothing the café itself published is translated: the wall
 * slogan, "Thanks for coming.", the menu's category and item names, and the cat
 * cards all stay in the café's own English.
 */
import type { Dictionary } from "./en";

export const fr: Dictionary = {
  localeName: "Français",
  switchTo: "Switch to English",

  nav: {
    cats: "Les chats",
    room: "Le café",
    menu: "Menu",
    visit: "Visiter",
    instagram: "Instagram",
    home: "accueil",
    open: "Ouvrir le menu",
    close: "Fermer le menu",
    skip: "Aller au contenu",
  },

  meta: {
    title: "HEYCAT Coffee Shop — Come where #cats are",
    description:
      "Un café à chats en Algérie. Onze chats à demeure, le brunch au soleil du matin, des desserts emballés d'une patte et des boissons froides à oreilles.",
    menuTitle: "Le menu complet",
    menuDescription:
      "Toutes les boissons, desserts et brunchs de HEYCAT Coffee Shop, aux prix du menu du café.",
  },

  hero: {
    eyebrow: "Café à chats & coffee shop",
    body: "Onze chats vivent ici. Ils ont un nom, un caractère et leur fauteuil préféré. Autour d'eux : le brunch au soleil du matin, le tiramisu dans une boîte qui demande à être ouverte, et le café servi patte en avant.",
    seeMenu: "Voir le menu",
    meetCats: "Rencontrer les chats",
    dishCaption: "nommé d'après le roux, qui insiste",
    residentsAre: "Les chats à demeure :",
    heroAlt:
      "Le Big Suny Breakfast : œufs, saumon fumé, avocat et salade, avec deux tranches de pain de seigle dressées comme une paire d'oreilles de chat.",
    sunyAlt: "Suny, un Scottish Fold roux, assis, le regard tourné vers la salle.",
  },

  statement: {
    eyebrow: "L'idée",
    headA: "Un coffee shop qui",
    headB: "se trouve être",
    headC: "le leur",
    p1: "Travertin et noyer, un comptoir de cuivre oxydé souligné d'une ligne de lumière chaude, des arches découpées dans l'enduit crème. Des empreintes de pattes en bois, posées dans les galets blancs, mènent à l'intérieur. On dirait un vrai café parce que c'en est un.",
    p2: "Puis on remarque les tunnels percés dans les murs, les étagères qui grimpent jusqu'au plafond, le miroir qui fait l'œil d'un chat. Les chats étaient là les premiers. Tout le reste a été construit autour d'eux.",
    quoteSource: "encadré près de la porte, en sortant",
    posterAlt:
      "Une affiche encadrée près de la porte du café : un chat noir attablé devant un café et une pâtisserie, au-dessus des mots Thanks for coming.",
  },

  residents: {
    eyebrow: "Les résidents",
    headA: "Onze chats.",
    headB: "Chacun un habitué.",
    body: "Un roi, une princesse, un petit juge et un dormeur professionnel. Les descriptions sont les leurs — nous les avons seulement sorties d'Instagram.",
    breed: "Race",
    choose: "Choisir un chat",
    portraitAlt: "{name}, {breed}, en portrait.",
  },

  room: {
    eyebrow: "Le café",
    headA: "Conçu pour eux.",
    headB: "Meublé pour vous.",
    frames: {
      counter: {
        caption: "Des empreintes dans les galets, jusqu'au comptoir",
        alt: "Le comptoir du café, un bloc courbe en cuivre oxydé souligné d'une bande de lumière chaude, derrière des galets blancs incrustés d'empreintes de pattes en bois.",
      },
      pod: {
        caption: "Un tunnel dans le mur, occupé",
        alt: "Un chat gris à poil long endormi dans une niche ronde en bois fixée au mur, la queue pendant par-dessus le bord.",
      },
      climb: {
        caption: "L'ascension, jusqu'en haut",
        alt: "Un mur crème équipé de perchoirs en bois, de hamacs et d'un grand griffoir en sisal, avec deux chats installés sur les étagères hautes.",
      },
      dining: {
        caption: "Le matin, avant l'affluence",
        alt: "La salle en plein jour : tables rondes, chaises en bois courbé et tabourets rembourrés, devant une paroi vitrée donnant sur la rue.",
      },
      washroom: {
        caption: "Le miroir fait l'œil",
        alt: "Un mur de toilettes peint d'une tête de chat noir et blanc surdimensionnée, dont un miroir rond forme l'œil, au-dessus d'une vasque en pierre.",
      },
      wall: {
        caption: "La patte, en relief",
        alt: "Le logo patte HEYCAT en relief sur un mur d'enduit texturé, éclairé par le haut, au-dessus d'une niche garnie de tasses en céramique.",
      },
      terrace: {
        caption: "Des tabourets à tête de chat découpée",
        alt: "La terrasse de nuit : tables rondes noires, tabourets en bois découpés d'une silhouette de tête de chat, galets blancs et lumière dorée courant le long des murs.",
      },
    },
  },

  details: {
    lid: {
      title: "Des oreilles sur le couvercle",
      line: "Toutes les boissons froides les portent.",
      alt: "Un bubble matcha glacé dans un gobelet transparent, fermé par un couvercle bombé moulé en deux oreilles de chat, le logo patte imprimé sur le côté.",
    },
    plates: {
      title: "Des assiettes qui disent bonjour",
      line: "« Hello! » sur l'une, « Who? » sur l'autre.",
      alt: "Un cookie à la pistache sur une assiette blanche en forme de tête de chat, avec Hello! écrit sur le bord et un petit chat en céramique à côté.",
    },
    band: {
      title: "Meow, unwrap me",
      line: "Imprimé sur le bandeau de chaque dessert.",
      alt: "Un tiramisu en boîte avec un bandeau papier indiquant Bon appétit, et sur la tranche, Meow, unwrap me.",
    },
    shop: {
      title: "Le coin boutique",
      line: "Cuillères, mugs et tote bags, sous le lettrage.",
      alt: "Une main tenant un tote bag jaune imprimé d'un chat noir attablé, devant le mur du café portant COME WHERE #CATS ARE.",
    },
  },

  boutique: {
    eyebrow: "La boutique",
    headA: "Repartez",
    headB: "avec l'un d'eux.",
    body: "Deux niches en arche, près du comptoir, tiennent lieu de boutique : cuillères à tête de chat, mugs qui vous fixent, coupelles, et le tote bag imprimé du chat du café.",
    askInside: "Le stock change — demandez au comptoir ce qu'il y a aujourd'hui.",
    items: {
      spoons: {
        caption: "Cuillères, en trois coloris",
        alt: "Trois cuillères à manche en céramique en forme de tête de chat, crème, jaune et bleue, posées sur un tapis gris.",
      },
      mug: {
        caption: "Des mugs qui vous fixent",
        alt: "Une main tenant un petit mug blanc moulé en forme de tête de chat.",
      },
      bowl: {
        caption: "Coupelles à tête de chat",
        alt: "Une main tenant une coupelle en céramique jaune et blanche en forme de tête de chat.",
      },
      cups: {
        caption: "Tasses et soucoupes",
        alt: "Une main tenant une tasse brune en forme de chat au-dessus d'une coupelle assortie.",
      },
      tote: {
        caption: "Le tote bag, au chat du café",
        alt: "Une main tenant un tote bag jaune imprimé d'un chat noir attablé.",
      },
      niches: {
        caption: "Les deux niches, près du comptoir",
        alt: "Deux alcôves en arche aux étagères de bois présentant des céramiques en forme de chat, des planches et des livres.",
      },
    },
  },

  shop: {
    title: "La boutique",
    intro: "Ce qui se trouve sur les étagères du café — les cuillères, les mugs, le tote bag au chat. Tout se vend au comptoir ; écrivez au café pour en faire mettre un de côté.",
    seeAll: "Voir toute la boutique",
    backToShop: "Retour à la boutique",
    askPrice: "Demandez au comptoir",
    enquire: "Se renseigner sur WhatsApp",
    enquireMessage: "Bonjour ! Est-ce que {product} est disponible ?",
    details: "Détails",
    alsoIn: "Encore dans {category}",
    empty: "La boutique est en réassort. Demandez au comptoir en attendant.",
    stock: {
      "in-stock": "En stock",
      low: "Il n'en reste que quelques-uns",
      out: "Épuisé",
      unlisted: "Non listé",
    },
    featured: "Coup de cœur",
    viewProduct: "Voir {product}",
  },

  menu: {
    eyebrow: "Le menu",
    headA: "Brunch, dessert et",
    headB: "quelque chose de froid, à oreilles.",
    options: "Options",
    notPricedNote:
      "Ces plats ne figurent pas au menu imprimé du café : aucun prix n'est affiché plutôt qu'un prix inventé.",
    showPhoto: "Voir une photo de {name}",
    categories: "Catégories du menu",
    notes: {
      hot: "Servi dans la tasse maison, patte vers vous.",
      iced: "Couvercles à oreilles. Aucune autre explication n'est fournie.",
      dessert: "Parfums variés — emballé d'une patte et d'un mot : « Meow, unwrap me. »",
      brunch: "Depuis la carte Brunch & Dessert du café — servi dans des assiettes à oreilles.",
      "bubble-juice":
        "Publié par le café, sans prix sur le menu imprimé — demandez la liste du jour.",
    },
    fullMenu: "Le menu complet",
    openFullMenu: "Ouvrir le menu complet",
    backToSite: "Retour au café",
    printHint: "Imprimé depuis heycat — prix tels qu'affichés sur le menu du café.",
    pricesIn: "Prix en {currency}.",
  },

  visit: {
    eyebrow: "Visiter",
    headA: "La porte est ouverte.",
    headB: "Quelqu'un la surveille.",
    body: "HeyCat Coffee Shop se trouve en Algérie. Le plus simple pour joindre le café — et pour voir quel chat a réquisitionné quel fauteuil aujourd'hui — reste Instagram, où il publie chaque jour.",
    address: "Adresse",
    phone: "Téléphone",
    email: "E-mail",
    hours: "Horaires",
    pending: "À confirmer",
    pendingNote:
      "Le café confirme ces informations avant la mise en ligne — rien n'est inventé ici. En attendant, Instagram reste le plus rapide pour demander.",
    storefrontAlt:
      "La devanture de HEYCAT Coffee Shop : un bandeau blanc avec une patte noire au-dessus du nom, un store festonné, des vitrines à cadres noirs et des bacs clairs sur le trottoir.",
    storefrontCaption: "Cherchez la patte au-dessus de la porte.",
    rules: "Les règles de la maison",
    rulesIntro: "Quelques points que les chats aimeraient vous voir respecter.",
    reservations: "Réservations",
    reservationsIntro: "Pour une table, ou pour un groupe.",
    adoption: "Adoption",
    adoptionIntro: "Certains chats d'ici cherchent un foyer définitif.",
    mapTitle: "Carte indiquant où se trouve le café",
    awaitingCafe: "Le café rédige ce point — demandez sur Instagram en attendant.",
  },

  reserve: {
    eyebrow: "Réserver",
    headA: "Gardez une table.",
    headB: "Les chats gardent leurs fauteuils.",
    intro: "Dites-nous quand, et pour combien. Le café confirme par téléphone ou WhatsApp.",
    date: "Date",
    time: "Heure",
    guests: "Personnes",
    name: "Votre nom",
    phone: "Téléphone",
    email: "E-mail",
    emailHint: "Facultatif",
    message: "Quelque chose à nous signaler",
    messageHint: "Un anniversaire, une chaise haute, une allergie",
    submit: "Demander une table",
    pickTime: "Choisir une heure",
    successTitle: "Demande reçue",
    successBody: "Le café confirmera sous peu. Rien n'est réservé tant qu'il ne l'a pas fait.",
    closedTitle: "Les réservations ne sont pas ouvertes en ligne",
    closedBody: "Écrivez directement au café, il s'occupera de vous.",
    whatsapp: "Demander sur WhatsApp",
    errorGeneric: "Cela n'a pas fonctionné. Vérifiez le formulaire et réessayez.",
    errorPast: "Choisissez une date et une heure à venir.",
    errorClosed: "Le café ne prend pas de réservation à ce moment-là.",
    errorGuests: "Ce nombre de personnes dépasse ce que le café accepte en ligne.",
    required: "Merci de remplir les champs obligatoires.",
    pickDateFirst: "Choisissez d'abord une date.",
    pickTimeFirst: "Choisissez une heure pour voir les tables libres.",
    calendar: {
      previousMonth: "Mois précédent",
      nextMonth: "Mois suivant",
      closedNote: "Les jours barrés sont ceux où le café est fermé.",
    },
    plan: {
      title: "Choisissez votre table",
      table: "Table",
      seats: "places",
      hint: "Le choix de la table est facultatif — sans sélection, le café vous placera.",
      freeCount: "{n} tables libres à cette heure",
      noneFree: "Aucune table libre à cette heure. Essayez un autre créneau.",
      anyTable: "N'importe quelle table — le café choisira",
      chosen: "Table {n} choisie",
      states: {
        free: "Libre",
        taken: "Occupée",
        "too-small": "Trop petite",
        closed: "Non réservable",
      },
      fixtures: { bar: "Café", catZone: "Espace chats", entrance: "Entrée" },
      zones: { window: "Près de la fenêtre", centre: "Salle principale", lounge: "Salon", wall: "Le long du mur", bar: "Au comptoir" },
      errorTaken: "Cette table vient d'être prise. Choisissez-en une autre.",
      errorTooSmall: "Cette table est trop petite pour votre groupe.",
      errorClosed: "Cette table n'est pas réservable.",
    },
  },

  today: {
    eyebrow: "Aujourd'hui chez HEYCAT",
    noPrice: "Demandez au comptoir",
  },

  events: {
    eyebrow: "À l'affiche",
    headA: "Bientôt",
    headB: "au café.",
    none: "Rien de prévu pour l'instant — le café publie ses événements au fil de l'eau.",
    more: "Détails",
  },

  adoption: {
    eyebrow: "Adoption",
    available: "Cherche un foyer",
    reserved: "Réservé",
    adopted: "Adopté",
    infoOnly: "Renseignez-vous",
    cta: "Se renseigner sur l'adoption",
  },

  common: {
    askAtCounter: "Demandez au comptoir",
    soldOut: "Épuisé",
    whatsapp: "WhatsApp",
    close: "Fermer",
  },

  footer: {
    backToTop: "Retour en haut",
    inResidence: "À demeure",
  },

  notFound: {
    title: "Celui-ci s'est éclipsé",
    body: "La page que vous cherchiez n'est pas ici. Les chats nient tout.",
    cta: "Retour au café",
    alt: "Illustration à plat d'un chat noir assis bien droit, les yeux ronds grands ouverts, tirée du menu du café.",
  },
};
