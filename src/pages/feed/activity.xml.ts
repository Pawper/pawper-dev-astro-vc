import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { PROJECTS, getStackLabel } from '../../data/content';
import { renderMarkdown } from '../../utils/renderMarkdown';

export async function GET(ctx: APIContext) {
  const logs = await getCollection('logs');

  const logItems = await Promise.all(logs.map(async (entry) => ({
    sortKey: entry.data.date.replace(/\./g, '-'),
    title: entry.data.title,
    pubDate: new Date(entry.data.date.replace(/\./g, '-')),
    description: entry.data.kicker,
    content: await renderMarkdown(entry.body),
    link: `/?modal=log&id=${entry.id.replace(/\.md$/, '')}`,
  })));

  const projectItems = PROJECTS.map((p) => ({
    sortKey: p.pushedAt.slice(0, 10),
    title: p.description,
    pubDate: new Date(p.pushedAt),
    description: getStackLabel(p),
    content: p.readme,
    link: `/?modal=project&id=${p.id}`,
  }));

  const items = [...logItems, ...projectItems]
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
    .map(({ sortKey: _s, ...item }) => item);

  return rss({
    title: 'Phillip Wessels — Activity',
    description: 'All projects and log entries, sorted by most recent activity.',
    site: ctx.site!,
    items,
  });
}
