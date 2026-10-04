/*
 * The café's floor, as data.
 *
 * Transcribed from the owner's 2D plan: sixteen tables, the coffee bar, the cat
 * zone and the entrance. Every coordinate is a percentage of the plan box, so
 * the map scales to any screen and nothing is baked into an image that would go
 * stale the moment the café moves a table.
 *
 * This is seed data. Once seeded, the owner edits tables in the dashboard and
 * this file is only a reference for rebuilding from scratch.
 */

export type SeedTable = {
  number: number;
  seats: number;
  shape: "square" | "round" | "lounge" | "bar";
  zone: "window" | "centre" | "lounge" | "wall" | "bar";
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
};

export const seedTables: SeedTable[] = [
  // Window side, on the banquette.
  { number: 1, seats: 2, shape: "round", zone: "window", x: 16, y: 15, width: 7, height: 9, label: "Window banquette" },
  { number: 2, seats: 2, shape: "round", zone: "window", x: 16, y: 29, width: 7, height: 9, label: "Window banquette" },

  // The two central rows.
  { number: 3, seats: 4, shape: "square", zone: "centre", x: 35, y: 36, width: 9, height: 11 },
  { number: 4, seats: 4, shape: "square", zone: "centre", x: 47, y: 36, width: 9, height: 11 },
  { number: 5, seats: 4, shape: "square", zone: "centre", x: 59, y: 36, width: 9, height: 11 },
  { number: 6, seats: 4, shape: "square", zone: "centre", x: 35, y: 54, width: 9, height: 11 },
  { number: 7, seats: 4, shape: "square", zone: "centre", x: 47, y: 54, width: 9, height: 11 },
  { number: 8, seats: 4, shape: "square", zone: "centre", x: 59, y: 54, width: 9, height: 11 },

  // The sofa corner.
  { number: 9, seats: 4, shape: "lounge", zone: "lounge", x: 78, y: 36, width: 15, height: 15, label: "Sofa corner" },

  // Along the right-hand wall.
  { number: 10, seats: 2, shape: "square", zone: "wall", x: 93, y: 34, width: 5, height: 12 },
  { number: 11, seats: 2, shape: "square", zone: "wall", x: 89, y: 51, width: 7, height: 8 },
  { number: 12, seats: 2, shape: "square", zone: "wall", x: 89, y: 61, width: 7, height: 8 },

  // The round table on the rug.
  { number: 13, seats: 4, shape: "round", zone: "lounge", x: 78, y: 76, width: 11, height: 13 },

  // The long lounge table by the window.
  { number: 14, seats: 4, shape: "lounge", zone: "lounge", x: 16, y: 76, width: 13, height: 15, label: "Long table" },

  // Either side of the entrance.
  { number: 15, seats: 2, shape: "square", zone: "centre", x: 35, y: 75, width: 8, height: 9 },
  { number: 16, seats: 2, shape: "square", zone: "centre", x: 60, y: 75, width: 8, height: 9 },
];

/*
 * Fixed features. Not bookable, drawn so the plan reads as the actual room —
 * without the bar and the entrance, a grid of rectangles tells a guest nothing
 * about where they would be sitting.
 */
export type Fixture = {
  kind: "bar" | "catzone" | "entrance" | "rug" | "counter" | "window";
  x: number;
  y: number;
  width: number;
  height: number;
  /** Dictionary key under `reserve.plan`, where the fixture is labelled. */
  labelKey?: "bar" | "catZone" | "entrance";
};

export const fixtures: Fixture[] = [
  // Rugs sit under their furniture, so they are drawn first.
  { kind: "rug", x: 78, y: 36, width: 20, height: 20 },
  { kind: "rug", x: 78, y: 76, width: 16, height: 19 },
  { kind: "rug", x: 17, y: 76, width: 19, height: 21 },

  { kind: "window", x: 3, y: 20, width: 2, height: 30 },
  { kind: "window", x: 3, y: 70, width: 2, height: 24 },

  { kind: "bar", x: 47, y: 18, width: 40, height: 7, labelKey: "bar" },
  { kind: "counter", x: 83, y: 8, width: 18, height: 5 },
  { kind: "catzone", x: 15, y: 51, width: 18, height: 21, labelKey: "catZone" },
  { kind: "entrance", x: 47, y: 96, width: 13, height: 5, labelKey: "entrance" },
];
