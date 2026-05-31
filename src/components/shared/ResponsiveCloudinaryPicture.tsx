import React from "react";
import { cldUrl, cldSrcSet } from "../../utils/cloudinary";

// ── ResponsiveCloudinaryPicture ───────────────────────────────────────────
// Wraps a bare Cloudinary delivery URL in an art-directed <picture>. Each
// breakpoint variant carries its own crop/transform, candidate widths, and
// `sizes`, so the CDN serves a differently-cropped image per viewport instead
// of one crop scaled everywhere.
//
//   <ResponsiveCloudinaryPicture
//     src={PROFILE.photo}
//     alt={PROFILE.name}
//     transforms={{
//       mobile:  { media: "(max-width: 768px)", transform: "c_fill,g_auto,ar_1:1,f_auto,q_auto,w_{w}", widths: [400, 560, 750], sizes: "calc(100vw - 76px)" },
//       desktop: { transform: "c_fill,g_face,ar_1:1,f_auto,q_auto,w_{w}", widths: [280, 420, 560], sizes: "280px" },
//     }}
//   />

export interface CldVariant {
  /** Cloudinary transform string; `{w}` is substituted per srcset width. */
  transform: string;
  /** Candidate widths (px) for the srcset descriptors. */
  widths: number[];
  /** `sizes` attribute hinting the rendered width at this breakpoint. */
  sizes?: string;
  /** Media query gating this <source>. Required on mobile/tablet; the
   *  desktop variant is the fallback <img> and ignores it. */
  media?: string;
}

interface Props {
  /** Bare Cloudinary delivery URL, stored without transforms. */
  src: string;
  alt: string;
  /** Art-direction variants, narrowest first. `desktop` is the fallback. */
  transforms: {
    mobile?: CldVariant;
    tablet?: CldVariant;
    desktop: CldVariant;
  };
  className?: string;
  style?: React.CSSProperties;
  /** `loading`/`decoding` hints forwarded to the <img>. */
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
}

export default function ResponsiveCloudinaryPicture({
  src,
  alt,
  transforms,
  className,
  style,
  loading = "lazy",
  decoding = "async",
}: Props) {
  const { mobile, tablet, desktop } = transforms;

  // <source> elements are evaluated top-to-bottom; list narrowest first so
  // the most specific media query wins before the desktop <img> fallback.
  const sources = [mobile, tablet].filter(
    (v): v is CldVariant => Boolean(v?.media),
  );

  // Fallback src for browsers without <picture>/srcset support: the widest
  // desktop candidate so it stays crisp on large displays.
  const fallbackWidth = desktop.widths[desktop.widths.length - 1];

  return (
    <picture>
      {sources.map((v) => (
        <source
          key={v.media}
          media={v.media}
          srcSet={cldSrcSet(src, v.transform, v.widths)}
          sizes={v.sizes}
        />
      ))}
      <img
        src={cldUrl(src, desktop.transform.replace(/\{w\}/g, String(fallbackWidth)))}
        srcSet={cldSrcSet(src, desktop.transform, desktop.widths)}
        sizes={desktop.sizes}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        decoding={decoding}
      />
    </picture>
  );
}
