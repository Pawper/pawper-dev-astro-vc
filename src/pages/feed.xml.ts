import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { renderMarkdown } from '../utils/renderMarkdown';

export async function GET(ctx: APIContext) {
  const logs = await getCollection('logs');
  const sorted = logs.sort((a, b) => b.data.date.localeCompare(a.data.date));

  const items = await Promise.all(sorted.map(async (entry) => {
    const id = entry.id.replace(/\.md$/, '');
    const heroImg = entry.data.image
      ? `<img src="${entry.data.image}" alt="${entry.data.title}" style="max-width:100%;height:auto;display:block;margin-bottom:1.5em" />`
      : '';
    return {
      title: entry.data.title,
      pubDate: new Date(entry.data.date.replace(/\./g, '-')),
      description: entry.data.hook ?? `${entry.data.kicker}${entry.data.series ? ` · ${entry.data.series.name} pt. ${entry.data.series.part}` : ''}`,
      content: `${heroImg}${await renderMarkdown(entry.body ?? '')}`,
      link: `/l/${id}`,
      customData: entry.data.image
        ? `<media:content url="${entry.data.image}" medium="image" />`
        : '',
    };
  }));

  return rss({
    title: 'Phillip Wessels — Logs',
    description: 'Short writings on craft, process, and engineering.',
    site: ctx.site!,
    xmlns: { media: 'http://search.yahoo.com/mrss/' },
    items,
  });
}
