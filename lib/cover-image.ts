import type { Enclosure } from "@/api/types";

const IMAGE_MIME_PREFIX = "image/";

/**
 * Regex to extract the `src` attribute from the first `<img>` tag in an HTML
 * string. Handles both single- and double-quoted attribute values.
 */
const FIRST_IMG_SRC_RE = /<img\s[^>]*?src=["']([^"']+)["']/i;

/** Decode the five predefined XML/HTML character entities and numeric refs. */
function decodeHtmlEntities(raw: string): string {
  return raw
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );
}

/**
 * Extract a cover image URL from an entry.
 *
 * Resolution order:
 * 1. First enclosure with an `image/*` MIME type.
 * 2. First `<img src="...">` found in the entry's HTML content.
 *
 * Returns `null` when neither source yields an image.
 */
export function getCoverImage(
  enclosures: Enclosure[] | null | undefined,
  content?: string | null,
): string | null {
  // 1. Prefer an explicit image enclosure.
  if (enclosures) {
    const img = enclosures.find((e) =>
      e.mime_type.startsWith(IMAGE_MIME_PREFIX),
    );
    if (img) return img.url;
  }

  // 2. Fall back to the first <img> in the HTML content.
  if (content) {
    const match = FIRST_IMG_SRC_RE.exec(content);
    if (match?.[1]) return decodeHtmlEntities(match[1]);
  }

  return null;
}
