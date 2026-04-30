/**
 * OG-preview proxy — fetches a URL server-side, parses Open Graph tags,
 * returns title / description / image / siteName for inline link previews (IP2).
 *
 * Cache at the edge for 24h to keep it fast and stay cheap.
 * Refuse non-http(s) and any URL that resolves to private IPs (defense-in-depth).
 */

const ALLOWED_HOSTS_BLOCK = [
  "localhost",
  "127.",
  "10.",
  "192.168.",
  "169.254.",
  "::1",
];

function safeHost(host: string): boolean {
  const lower = host.toLowerCase();
  return !ALLOWED_HOSTS_BLOCK.some((bad) => lower.startsWith(bad));
}

function pickMeta(html: string, prop: string): string | null {
  // og:* and twitter:* (matches whether attr is `name=` or `property=`)
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const m = html.match(re);
  if (m) return decodeEntities(m[1]);
  // try reverse attr order
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
    "i",
  );
  const m2 = html.match(re2);
  return m2 ? decodeEntities(m2[1]) : null;
}

function pickTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? decodeEntities(m[1]) : null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u");
  if (!u) return new Response("missing url", { status: 400 });
  let target: URL;
  try {
    target = new URL(u);
  } catch {
    return new Response("bad url", { status: 400 });
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return new Response("bad protocol", { status: 400 });
  }
  if (!safeHost(target.hostname)) {
    return new Response("blocked host", { status: 400 });
  }

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(target.toString(), {
      signal: ctrl.signal,
      headers: {
        "user-agent": "ChatterLinkPreview/1.0 (+https://chatter.today)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    clearTimeout(t);
    if (!res.ok) {
      return Response.json(
        {
          title: null,
          description: null,
          image: null,
          siteName: null,
          host: target.host,
        },
        {
          headers: { "cache-control": "public, max-age=300" },
        },
      );
    }
    const html = (await res.text()).slice(0, 200_000); // first ~200KB is plenty
    const title =
      pickMeta(html, "og:title") ||
      pickMeta(html, "twitter:title") ||
      pickTitle(html);
    const description =
      pickMeta(html, "og:description") ||
      pickMeta(html, "twitter:description") ||
      pickMeta(html, "description");
    let image =
      pickMeta(html, "og:image") ||
      pickMeta(html, "og:image:url") ||
      pickMeta(html, "twitter:image");
    if (image && image.startsWith("//")) image = "https:" + image;
    if (image && image.startsWith("/")) image = target.origin + image;
    const siteName = pickMeta(html, "og:site_name") || null;
    return Response.json(
      {
        title,
        description,
        image,
        siteName,
        host: target.host,
      },
      {
        headers: { "cache-control": "public, max-age=86400, s-maxage=86400" },
      },
    );
  } catch {
    return Response.json(
      {
        title: null,
        description: null,
        image: null,
        siteName: null,
        host: target.host,
      },
      {
        headers: { "cache-control": "public, max-age=300" },
      },
    );
  }
}
