import { Colors } from "@/constants/theme";

/**
 * Builds a complete HTML document that renders article content with
 * theme-aware styling. Loads Newsreader (body) and Manrope (headings)
 * from Google Fonts CDN, falling back to system serif/sans-serif when
 * offline.
 */
export function buildArticleHtml(
  content: string | undefined,
  colorScheme: "light" | "dark",
  hasCoverImage?: boolean,
): string {
  if (!content) return "";

  const c = Colors[colorScheme];

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background-color: ${c.surface};
      color: ${c.onSurface};
      font-family: 'Newsreader', Georgia, 'Times New Roman', serif;
      font-size: 112.5%;
      line-height: 1.7;
      word-wrap: break-word;
      overflow-wrap: break-word;
      overflow: hidden;
      -webkit-text-size-adjust: 100%;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: 'Manrope', system-ui, -apple-system, sans-serif;
      color: ${c.onSurface};
      line-height: 1.3;
      margin-top: 1.4em;
      margin-bottom: 0.6em;
    }

    h1 { font-size: 1.6em; font-weight: 700; }
    h2 { font-size: 1.35em; font-weight: 700; }
    h3 { font-size: 1.15em; font-weight: 600; }
    h4 { font-size: 1.05em; font-weight: 600; }
    h5 { font-size: 1em; font-weight: 500; }
    h6 { font-size: 0.95em; font-weight: 500; color: ${c.onSurfaceVariant}; }

    p {
      margin: 0 0 1em;
    }

    a {
      color: ${c.primary};
      text-decoration: underline;
      text-decoration-color: ${c.outlineVariant};
      text-underline-offset: 2px;
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      margin: 0.5em 0;
    }

    figure {
      margin: 1em 0;
      padding: 0;
    }

    figcaption {
      font-family: 'Manrope', system-ui, -apple-system, sans-serif;
      font-size: 0.8em;
      color: ${c.onSurfaceVariant};
      margin-top: 0.4em;
      text-align: center;
    }

    blockquote {
      border-left: 3px solid ${c.outlineVariant};
      margin: 1em 0;
      padding: 0.2em 0 0.2em 16px;
      color: ${c.onSurfaceVariant};
      font-style: italic;
    }

    blockquote p:last-child {
      margin-bottom: 0;
    }

    pre {
      background: ${c.surfaceContainerHigh};
      border-radius: 6px;
      padding: 12px;
      overflow-x: auto;
      font-size: 0.85em;
      line-height: 1.5;
    }

    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9em;
      background: ${c.surfaceContainerHigh};
      border-radius: 3px;
      padding: 2px 5px;
    }

    pre code {
      background: none;
      padding: 0;
      border-radius: 0;
      font-size: inherit;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      font-size: 0.9em;
    }

    th, td {
      border: 1px solid ${c.outlineVariant};
      padding: 8px 10px;
      text-align: left;
    }

    th {
      background: ${c.surfaceContainer};
      font-family: 'Manrope', system-ui, -apple-system, sans-serif;
      font-weight: 600;
    }

    hr {
      border: none;
      border-top: 1px solid ${c.outlineVariant};
      margin: 1.5em 0;
    }

    ul, ol {
      padding-left: 1.4em;
      margin: 0 0 1em;
    }

    li {
      margin-bottom: 0.3em;
    }

    video, iframe {
      max-width: 100%;
      border-radius: 6px;
    }

    iframe {
      border: none;
    }
  </style>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      var h = document.querySelector('h1, h2');
      if (h) {
        var parent = h.parentElement;
        h.remove();
        if (parent && parent.tagName === 'HEADER' && parent.children.length === 0 && !parent.textContent.trim()) {
          parent.remove();
        }
      }
${
  hasCoverImage
    ? `
      var paragraphCount = 0;
      var nodes = Array.from(document.body.children);
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var tag = node.tagName;
        if (tag === 'P' && node.textContent.trim().length > 0) {
          paragraphCount++;
          if (paragraphCount >= 3) break;
        }
        if (tag === 'IMG' || (tag === 'FIGURE' && node.querySelector('img'))) {
          node.remove();
          break;
        }
      }
`
    : ""
}
    });
  </script>
</head>
<body>${content}</body>
</html>`;
}
