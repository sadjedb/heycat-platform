import fs from "node:fs/promises";
import path from "node:path";
import { uploadRoot } from "@/lib/upload";

/*
 * Serve an uploaded image.
 *
 * `public/` is not enough on its own: Next decides what lives there when the
 * project is built, so a photograph uploaded afterwards is written to disk and
 * then 404s. Locally that never shows, because `next dev` reads the folder on
 * every request — it only appears once the site is built and running on a
 * server, which is precisely where the café noticed it.
 *
 * So uploads are served by this route instead of by the static handler. It
 * also means `UPLOAD_DIR` can point outside the project, at a folder that
 * survives a redeploy, with nothing else to configure.
 */

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(_request: Request, context: RouteContext<"/uploads/[...path]">) {
  const { path: segments } = await context.params;

  const root = uploadRoot();
  const file = path.resolve(/*turbopackIgnore: true*/ root, ...segments);

  // Stored names are generated, never user input — but this route takes its
  // path from the URL, so a request climbing out of the upload folder must not
  // be able to read anything else on the server.
  if (file !== root && !file.startsWith(root + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const bytes = await fs.readFile(file);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(bytes.length),
        // The filename is 16 random hex characters, so a given URL always
        // means the same bytes and can be cached for as long as a browser likes.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
