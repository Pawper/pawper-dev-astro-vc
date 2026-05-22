import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import projectsData from '../../../data/projects.json';

const projects = projectsData as Array<{ id: string; name: string; description: string; year: string; categories?: string[] }>;

export function getStaticPaths() {
  const categories = [...new Set(projects.flatMap((p) => p.categories ?? []))];
  return categories.map((category) => ({ params: { category } }));
}

export function GET(ctx: APIContext) {
  const { category } = ctx.params as { category: string };
  const filtered = projects.filter((p) => p.categories?.includes(category));

  return rss({
    title: `Phillip Wessels — Projects: ${category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`,
    description: `Projects filed under "${category}".`,
    site: ctx.site!,
    items: filtered.map((p) => ({
      title: p.name,
      pubDate: new Date(`${p.year}-01-01`),
      description: p.description,
      link: `/?modal=project&id=${p.id}`,
    })),
  });
}
