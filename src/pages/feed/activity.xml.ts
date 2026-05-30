import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { PROJECTS, getStackLabel } from '../../data/content';
import { renderMarkdown } from '../../utils/renderMarkdown';

export async function GET(ctx: APIContext) {
  const logs = await getCollection('logs');

  const logItems = await Promise.all(logs.map(async (entry) => {
    const id = entry.id.replace(/\.md$/, '');
    const heroImg = entry.data.image
      ? `<img src="${entry.data.image}" alt="${entry.data.title}" style="max-width:100%;height:auto;display:block;margin-bottom:1.5em" />`
      : '';
    return {
      sortKey: entry.data.date.replace(/\./g, '-'),
      title: entry.data.title,
      pubDate: new Date(entry.data.date.replace(/\./g, '-')),
      description: entry.data.hook ?? entry.data.kicker,
      content: `${heroImg}${await renderMarkdown(entry.body ?? '')}`,
      link: `/l/${id}`,
      customData: entry.data.image ? `<media:content url="${entry.data.image}" medium="image" />` : '',
    };
  }));

  const projectItems = PROJECTS.map((p) => ({
    sortKey: p.pushedAt.slice(0, 10),
    title: p.description,
    pubDate: new Date(p.pushedAt),
    description: getStackLabel(p),
    content: p.readme,
    link: `/?modal=project&id=${p.id}`,
    customData: '',
  }));

  const items = [...logItems, ...projectItems]
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
    .map(({ sortKey: _s, ...item }) => item);

  return rss({
    title: 'Phillip Wessels — Activity',
    description: 'All projects and log entries, sorted by most recent activity.',
    site: ctx.site!,
    xmlns: { media: 'http://search.yahoo.com/mrss/' },
    items,
  });
}
