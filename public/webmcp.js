/**
 * WebMCP — expose pawper.dev's read-only surfaces as in-page agent tools.
 * Spec: https://webmachinelearning.github.io/webmcp/
 *
 * No-ops in browsers without `navigator.modelContext`. Every tool is a thin
 * fetch over content that is already public (llms.txt, feed.xml, sitemap.xml,
 * markdown content negotiation) — no auth, no writes, no private data.
 */
(function () {
  if (typeof navigator === 'undefined' || !navigator.modelContext) return;

  const text = (s) => ({ content: [{ type: 'text', text: s }] });

  const tools = [
    {
      name: 'get_site_overview',
      description:
        'Get the llms.txt overview of pawper.dev: who Phillip Wessels is, site structure, and machine-readable surfaces.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      async execute() {
        const r = await fetch('/llms.txt');
        return text(await r.text());
      },
    },
    {
      name: 'list_pages',
      description: 'List all indexable pages on pawper.dev (from sitemap.xml).',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      async execute() {
        const r = await fetch('/sitemap.xml');
        const xml = await r.text();
        const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
        return text(urls.join('\n'));
      },
    },
    {
      name: 'get_latest_logs',
      description: 'Get the most recent dev-log entries (title, link, date) from the RSS feed.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 20, description: 'Max entries to return (default 5).' },
        },
        additionalProperties: false,
      },
      async execute(args) {
        const limit = (args && args.limit) || 5;
        const r = await fetch('/feed.xml');
        const xml = await r.text();
        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, limit).map((m) => {
          const pick = (tag) => {
            const mm = m[1].match(new RegExp('<' + tag + '>([\\s\\S]*?)</' + tag + '>'));
            return mm ? mm[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').trim() : '';
          };
          return pick('title') + ' — ' + pick('link') + ' (' + pick('pubDate') + ')';
        });
        return text(items.join('\n') || 'No entries found.');
      },
    },
    {
      name: 'get_page_markdown',
      description:
        'Fetch any pawper.dev page as Markdown via content negotiation (Accept: text/markdown). Pass a site-relative path like "/projects/" or "/about/".',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Site-relative path beginning with "/".' },
        },
        required: ['path'],
        additionalProperties: false,
      },
      async execute(args) {
        const path = args && args.path;
        if (!path || path[0] !== '/' || path.startsWith('//')) {
          return text('Error: path must be site-relative and begin with "/".');
        }
        const r = await fetch(path, { headers: { Accept: 'text/markdown' } });
        return text(await r.text());
      },
    },
  ];

  try {
    if (typeof navigator.modelContext.provideContext === 'function') {
      navigator.modelContext.provideContext({ tools });
    } else if (typeof navigator.modelContext.registerTool === 'function') {
      tools.forEach((t) => navigator.modelContext.registerTool(t));
    }
  } catch (e) {
    // Tool registration is progressive enhancement; never break the page.
    console.warn('WebMCP registration failed:', e);
  }
})();
