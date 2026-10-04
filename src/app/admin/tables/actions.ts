"use server";

import { db } from "@/lib/db";
import { fieldFromForm } from "@/lib/i18n-field";
import { bool, done, fail, guard, int, str } from "@/lib/admin-action";

const LIST = "/admin/tables";

/*
 * The floor plan.
 *
 * Geometry is percentages of the plan box, which is why the numbers look small:
 * x/y are the table's centre, width/height its size. Storing it this way means
 * the map scales to any screen and the owner can move a table without anyone
 * touching code.
 */
function clamp(value: number | null, lo: number, hi: number, fallback: number) {
  if (value === null || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, lo), hi);
}

export async function saveTable(formData: FormData) {
  return guard([], async () => {
    const id = str(formData, "id");
    const number = int(formData, "number");
    if (number === null || number < 1 || number > 999) fail(LIST, "Give the table a number.");

    const seats = clamp(int(formData, "seats"), 1, 30, 2);
    const shape = str(formData, "shape") || "square";
    const zone = str(formData, "zone") || "centre";
    if (!["square", "round", "lounge", "bar"].includes(shape)) fail(LIST, "Unknown shape.");
    if (!["window", "centre", "lounge", "wall", "bar"].includes(zone)) fail(LIST, "Unknown zone.");

    const data = {
      number,
      seats,
      shape,
      zone,
      x: clamp(int(formData, "x"), 0, 100, 50),
      y: clamp(int(formData, "y"), 0, 100, 50),
      width: clamp(int(formData, "width"), 2, 40, 8),
      height: clamp(int(formData, "height"), 2, 40, 8),
      bookable: bool(formData, "bookable"),
      label: fieldFromForm(formData, "label"),
      note: fieldFromForm(formData, "note"),
    };

    const clash = await db.table.findFirst({
      where: { number, ...(id ? { NOT: { id } } : {}) },
      select: { id: true },
    });
    if (clash) fail(LIST, `Table ${number} already exists.`);

    if (id) {
      await db.table.update({ where: { id }, data });
      done(LIST, `Table ${number} saved.`);
    }
    const last = await db.table.findFirst({ orderBy: { position: "desc" } });
    await db.table.create({ data: { ...data, position: (last?.position ?? -1) + 1 } });
    done(LIST, `Table ${number} added.`);
  });
}

export async function deleteTable(formData: FormData) {
  return guard([], async () => {
    const id = str(formData, "id");
    const held = await db.reservation.count({
      where: { tableId: id, status: { in: ["pending", "confirmed"] } },
    });
    if (held > 0) {
      fail(LIST, `That table has ${held} live booking(s). Move or close them first.`);
    }
    await db.table.delete({ where: { id } });
    done(LIST, "Table removed.");
  });
}

/** The quick switch for "this one is out of service today". */
export async function toggleBookable(formData: FormData) {
  return guard([], async () => {
    const id = str(formData, "id");
    const table = await db.table.findUnique({ where: { id } });
    if (!table) fail(LIST, "That table no longer exists.");
    await db.table.update({ where: { id }, data: { bookable: !table.bookable } });
    done(LIST, table.bookable ? `Table ${table.number} closed.` : `Table ${table.number} open.`);
  });
}

/** Assign or clear the table on a booking, from the reservation screen. */
export async function assignTable(formData: FormData) {
  return guard([], async () => {
    const reservationId = str(formData, "reservationId");
    const tableId = str(formData, "tableId") || null;
    await db.reservation.update({ where: { id: reservationId }, data: { tableId } });
    done(`/admin/reservations/${reservationId}`, tableId ? "Table assigned." : "Table cleared.");
  });
}
