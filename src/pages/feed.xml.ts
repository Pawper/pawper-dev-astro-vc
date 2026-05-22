import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { renderMarkdown } from '../utils/renderMarkdown';

export async function GET(ctx: APIContext) {
  const logs = await getCollection('logs');
  const sorted = logs.sort((a, b) => b.data.date.localeCompare(a.data.date));

  const items = await Promise.all(sorted.map(async (entry) => {
    const id = entry.id.replace(/\.md$/, '');
    return {
      title: entry.data.title,
      pubDate: new Date(entry.data.date.replace(/\./g, '-')),
      description: `${entry.data.kicker}${entry.data.series ? ` · ${entry.data.series.name} pt. ${entry.data.series.part}` : ''}`,
      content: await renderMarkdown(entry.body),
      link: `/?modal=log&id=${id}`,
    };
  }));

  return rss({
    title: 'Phillip Wessels — Logs',
    description: 'Short writings on craft, process, and engineering.',
    site: ctx.site!,
    items,
  });
}
