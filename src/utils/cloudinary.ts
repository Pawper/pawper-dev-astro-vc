// ── Cloudinary URL helpers ────────────────────────────────────────────────
// Build art-directed / responsive variants of a Cloudinary delivery URL by
// injecting a transformation segment right after `/image/upload/`.
//
// Source URLs in this project are stored without transforms, e.g.
//   https://res.cloudinary.com/dr1sonbsi/image/upload/v1780170567/pawper.dev/photo.jpg
// cldUrl() inserts a transform group so the CDN crops/encodes on the fly:
//   …/image/upload/c_fill,g_face,ar_1:1,f_auto,q_auto,w_560/v1780170567/pawper.dev/photo.jpg

const UPLOAD = "/image/upload/";

/** Insert a Cloudinary transformation string after `/image/upload/`.
 *  Returns the URL unchanged if it isn't a Cloudinary image-upload URL. */
export function cldUrl(src: string, transform: string): string {
  const i = src.indexOf(UPLOAD);
  if (i === -1) return src;
  const cut = i + UPLOAD.length;
  return src.slice(0, cut) + transform + "/" + src.slice(cut);
}

/** Build a `srcset` value across the given widths.
 *  Use `{w}` inside `transform` as the width placeholder. */
export function cldSrcSet(src: string, transform: string, widths: number[]): string {
  if (src.indexOf(UPLOAD) === -1) return ""; // non-Cloudinary → let the bare src handle it
  return widths
    .map((w) => `${cldUrl(src, transform.replace(/\{w\}/g, String(w)))} ${w}w`)
    .join(", ");
}
