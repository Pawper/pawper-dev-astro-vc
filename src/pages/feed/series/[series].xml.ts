import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { renderMarkdown } from '../../../utils/renderMarkdown';

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function getStaticPaths() {
  const logs = await getCollection('logs');
  const seriesNames = [...new Set(logs.filter((e) => e.data.series).map((e) => e.data.series!.name))];
  return seriesNames.map((name) => ({ params: { series: slugify(name) }, props: { name } }));
}

export async function GET(ctx: APIContext) {
  const { name } = ctx.props as { name: string };
  const logs = await getCollection('logs');
  const filtered = logs
    .filter((e) => e.data.series?.name === name)
    .sort((a, b) => (a.data.series?.part ?? 0) - (b.data.series?.part ?? 0));

  const items = await Promise.all(filtered.map(async (entry) => {
    const id = entry.id.replace(/\.md$/, '');
    return {
      title: `${entry.data.series!.name} pt. ${entry.data.series!.part} — ${entry.data.title}`,
      pubDate: new Date(entry.data.date.replace(/\./g, '-')),
      description: entry.data.title,
      content: await renderMarkdown(entry.body),
      link: `/?modal=log&id=${id}`,
    };
  }));

  return rss({
    title: `Phillip Wessels — ${name}`,
    description: `All entries in the "${name}" series.`,
    site: ctx.site!,
    items,
  });
}
