import "server-only";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { db } from "./db";

/*
 * Image uploads.
 *
 * Written to disk and served straight off it. That suits the deployment this
 * is built for — one café, one small server — and is the limitation to know
 * about: on a serverless host the filesystem is ephemeral, so `saveUpload` is
 * the single function to swap for S3 or similar.
 *
 * `public/uploads` by default, which `next start` serves at `/uploads/...`
 * without any further configuration. `UPLOAD_DIR` moves it somewhere that
 * survives a redeploy into a fresh directory — see the deployment notes in
 * README-PLATFORM.md, which include the nginx block that then serves it.
 *
 * The extension on the uploaded filename is never trusted. The type is decided
 * by sniffing magic bytes, and the stored name is random, so nothing a visitor
 * sends can choose where it lands or what it is served as.
 */

export const MAX_BYTES = 8 * 1024 * 1024;

/*
 * The `turbopackIgnore` comments below tell the bundler not to trace these
 * paths. It flags a dynamic `path.join` because it usually means "bundle the
 * whole project"; here the path is a runtime location on the server's disk
 * (`UPLOAD_DIR`, or `public/uploads`), which is nothing the build needs to see.
 */

/** Public URL prefix for anything uploaded through the dashboard. */
const URL_PREFIX = "/uploads";

/*
 * Where uploads live on disk.
 *
 * Resolved per call rather than at module load so that it follows the process
 * that is actually running, not whatever the build saw. Relative values are
 * read against the working directory, which is how `public/uploads` keeps
 * working with no configuration at all.
 */
export function uploadRoot(): string {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (configured) return path.resolve(/*turbopackIgnore: true*/ process.cwd(), configured);
  return path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads");
}

/** The on-disk path for a stored URL, or null if it is not one of ours. */
function fileFor(url: string): string | null {
  if (!url.startsWith(`${URL_PREFIX}/`)) return null;
  const relative = url.slice(URL_PREFIX.length + 1);
  // The stored names are generated, never user input, but a path that escapes
  // the upload root is not something to unlink on trust.
  const resolved = path.resolve(/*turbopackIgnore: true*/ uploadRoot(), relative);
  const root = uploadRoot();
  return resolved.startsWith(root + path.sep) ? resolved : null;
}

const SIGNATURES: { mime: string; ext: string; test: (b: Buffer) => boolean }[] = [
  {
    mime: "image/jpeg",
    ext: "jpg",
    test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: "image/png",
    ext: "png",
    test: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    mime: "image/webp",
    ext: "webp",
    test: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
  },
  {
    mime: "image/gif",
    ext: "gif",
    test: (b) => b.subarray(0, 3).toString("ascii") === "GIF",
  },
];

export type UploadResult =
  | { ok: true; id: string; url: string }
  | { ok: false; error: string };

export async function saveUpload(file: File): Promise<UploadResult> {
  if (!file || file.size === 0) return { ok: false, error: "No file was chosen." };
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `That image is ${(file.size / 1e6).toFixed(1)} MB. The limit is 8 MB.` };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const match = SIGNATURES.find((s) => s.test(bytes));
  if (!match) {
    return {
      ok: false,
      error: "That file is not a JPEG, PNG, WebP or GIF image.",
    };
  }

  const year = String(new Date().getFullYear());
  const name = `${crypto.randomBytes(8).toString("hex")}.${match.ext}`;
  const dir = path.join(/*turbopackIgnore: true*/ uploadRoot(), year);

  /*
   * A server that cannot write where it was told is the most likely way this
   * fails once it leaves a laptop — a missing folder, or one owned by another
   * user. Saying which directory and why beats a 500 the owner cannot read.
   */
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(/*turbopackIgnore: true*/ dir, name), bytes);
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    return {
      ok: false,
      error: `The image could not be written to ${dir}. The server needs write access to that folder. (${reason})`,
    };
  }

  const url = `${URL_PREFIX}/${year}/${name}`;
  const row = await db.media.create({
    data: {
      url,
      filename: file.name.slice(0, 120) || name,
      mime: match.mime,
      bytes: bytes.length,
      ...readDimensions(bytes, match.mime),
    },
  });

  return { ok: true, id: row.id, url };
}

/**
 * Width and height straight out of the file header.
 *
 * Enough for `next/image` to reserve space and avoid layout shift, without
 * pulling in an image library for four header reads.
 */
function readDimensions(b: Buffer, mime: string): { width?: number; height?: number } {
  try {
    if (mime === "image/png") {
      return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    }
    if (mime === "image/gif") {
      return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
    }
    if (mime === "image/webp") {
      const chunk = b.subarray(12, 16).toString("ascii");
      if (chunk === "VP8X") {
        return {
          width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)),
          height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)),
        };
      }
      if (chunk === "VP8L") {
        const bits = b.readUInt32LE(21);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
      if (chunk === "VP8 ") {
        return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
      }
      return {};
    }
    if (mime === "image/jpeg") {
      let i = 2;
      while (i < b.length - 9) {
        if (b[i] !== 0xff) {
          i += 1;
          continue;
        }
        const marker = b[i + 1];
        // SOF0..SOF15, skipping the four that are not frame headers.
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
        }
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
  } catch {
    // A header we cannot parse is not worth failing an upload over.
  }
  return {};
}

/**
 * Delete a media row, and the file if we put it there.
 *
 * Files produced by scripts/prepare-assets.py are left on disk: the pipeline
 * owns them and would simply put them back.
 */
export async function deleteMedia(id: string): Promise<{ error?: string }> {
  const media = await db.media.findUnique({ where: { id } });
  if (!media) return { error: "That image no longer exists." };

  const [items, cats, events, features, products] = await Promise.all([
    db.menuItem.count({ where: { imageId: id } }),
    db.cat.count({ where: { imageId: id } }),
    db.event.count({ where: { imageId: id } }),
    db.feature.count({ where: { imageId: id } }),
    db.product.count({ where: { imageId: id } }),
  ]);
  const used = items + cats + events + features + products;
  if (used > 0) {
    return { error: `That image is still used in ${used} place(s). Remove it there first.` };
  }

  if (!media.generated) {
    const file = fileFor(media.url);
    if (file) await fs.unlink(file).catch(() => {});
  }
  await db.media.delete({ where: { id } });
  return {};
}
