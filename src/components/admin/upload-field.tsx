"use client";

import { useState } from "react";

/*
 * The file picker on the media screen.
 *
 * The size check is here as well as on the server because the server's answer
 * costs an upload: a 20 MB photograph has to travel all the way to the VPS
 * before anything can tell the café it was too big. The browser knows the size
 * the moment the file is chosen.
 *
 * Without JavaScript this is a plain `<input type="file">` and the server
 * check still catches it — the limit is enforced in `saveUpload`, not here.
 */
export function UploadField({ maxBytes, name = "file" }: { maxBytes: number; name?: string }) {
  const [tooBig, setTooBig] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <input
          type="file"
          name={name}
          accept="image/jpeg,image/png,image/webp,image/gif"
          required
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file && file.size > maxBytes) {
              setTooBig(
                `${file.name} is ${(file.size / 1e6).toFixed(1)} MB. The limit is ${Math.round(
                  maxBytes / 1e6,
                )} MB — try exporting it smaller.`,
              );
              e.currentTarget.value = "";
            } else {
              setTooBig(null);
            }
          }}
          className="text-[0.86rem] file:mr-3 file:rounded-full file:border-0 file:bg-espresso file:px-4 file:py-2 file:text-[0.78rem] file:tracking-[0.1em] file:text-cream file:uppercase"
        />
        {tooBig ? (
          <p role="alert" className="mt-2 text-[0.8rem] text-hibiscus">
            {tooBig}
          </p>
        ) : null}
      </div>
    </div>
  );
}
