import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { renderMarkdown } from '../../../utils/renderMarkdown';

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function getStaticPaths() {
  const logs = await getCollection('logs');
  const kickers = [...new Set(logs.map((e) => e.data.kicker))];
  return kickers.map((kicker) => ({ params: { kicker: slugify(kicker) }, props: { kicker } }));
}

export async function GET(ctx: APIContext) {
  const { kicker } = ctx.props as { kicker: string };
  const logs = await getCollection('logs');
  const filtered = logs
    .filter((e) => e.data.kicker === kicker)
    .sort((a, b) => b.data.date.localeCompare(a.data.date));

  const items = await Promise.all(filtered.map(async (entry) => {
    const id = entry.id.replace(/\.md$/, '');
    return {
      title: entry.data.title,
      pubDate: new Date(entry.data.date.replace(/\./g, '-')),
      description: entry.data.kicker,
      content: await renderMarkdown(entry.body),
      link: `/?modal=log&id=${id}`,
    };
  }));

  return rss({
    title: `Phillip Wessels — ${kicker}`,
    description: `Logs filed under "${kicker}".`,
    site: ctx.site!,
    items,
  });
}
