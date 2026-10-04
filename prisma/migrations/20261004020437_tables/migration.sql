-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "label" JSONB,
    "seats" INTEGER NOT NULL DEFAULT 2,
    "shape" TEXT NOT NULL DEFAULT 'square',
    "zone" TEXT NOT NULL DEFAULT 'centre',
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "width" REAL NOT NULL DEFAULT 8,
    "height" REAL NOT NULL DEFAULT 8,
    "bookable" BOOLEAN NOT NULL DEFAULT true,
    "note" JSONB,
    "position" INTEGER NOT NULL DEFAULT 0
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "guests" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNote" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "tableId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reservation_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("adminNote", "createdAt", "date", "email", "guests", "id", "locale", "message", "name", "phone", "status", "time", "updatedAt") SELECT "adminNote", "createdAt", "date", "email", "guests", "id", "locale", "message", "name", "phone", "status", "time", "updatedAt" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
CREATE INDEX "Reservation_date_status_idx" ON "Reservation"("date", "status");
CREATE INDEX "Reservation_status_createdAt_idx" ON "Reservation"("status", "createdAt");
CREATE INDEX "Reservation_tableId_date_idx" ON "Reservation"("tableId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Table_number_key" ON "Table"("number");

-- CreateIndex
CREATE INDEX "Table_bookable_idx" ON "Table"("bookable");
