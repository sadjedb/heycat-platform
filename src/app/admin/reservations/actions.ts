"use server";

import { db } from "@/lib/db";
import { done, fail, guard, optionalStr, str } from "@/lib/admin-action";

const LIST = "/admin/reservations";

/*
 * Reservation workflow.
 *
 * pending -> confirmed | rejected, and either of those -> cancelled. Completed
 * is the end state once the guest has actually been. The statuses are checked
 * server-side rather than trusted from the form, so a tampered POST cannot put a
 * booking into a state the café never defined.
 */
const STATUSES = ["pending", "confirmed", "rejected", "cancelled", "completed"] as const;

export async function setStatus(formData: FormData) {
  return guard([], async () => {
    const id = str(formData, "id");
    const status = str(formData, "status");
    if (!(STATUSES as readonly string[]).includes(status)) {
      fail(LIST, "Unknown status.");
    }
    const reservation = await db.reservation.findUnique({ where: { id } });
    if (!reservation) fail(LIST, "That reservation no longer exists.");

    await db.reservation.update({ where: { id }, data: { status } });
    done(`${LIST}/${id}`, `Marked ${status}.`);
  });
}

export async function saveNote(formData: FormData) {
  return guard([], async () => {
    const id = str(formData, "id");
    await db.reservation.update({
      where: { id },
      data: { adminNote: optionalStr(formData, "adminNote", 1000) },
    });
    done(`${LIST}/${id}`, "Note saved.");
  });
}

export async function deleteReservation(formData: FormData) {
  return guard([], async () => {
    await db.reservation.delete({ where: { id: str(formData, "id") } });
    done(LIST, "Reservation deleted.");
  });
}
