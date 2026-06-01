import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { PROJECTS, getStackLabel } from '../../../data/content';
import { renderMarkdown } from '../../../utils/renderMarkdown';

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function getStaticPaths() {
  const logs = await getCollection('logs');

  const logTags = logs.flatMap((e) => e.data.tags ?? []);
  const projectLangs = PROJECTS.flatMap((p) => Object.keys(p.languages));
  const projectTopics = PROJECTS.flatMap((p) => p.topics);

  const seen = new Map<string, string>();
  for (const tag of [...logTags, ...projectLangs, ...projectTopics]) {
    const slug = slugify(tag);
    if (!seen.has(slug)) seen.set(slug, tag);
  }

  return [...seen.entries()].map(([slug, tag]) => ({
    params: { skill: slug },
    props: { tag },
  }));
}

export async function GET(ctx: APIContext) {
  const { tag } = ctx.props as { tag: string };
  const logs = await getCollection('logs');
  const tagSlug = slugify(tag);

  const filteredLogs = logs
    .filter((e) => e.data.tags?.some((t) => slugify(t) === tagSlug))
    .sort((a, b) => b.data.date.localeCompare(a.data.date));

  const filteredProjects = PROJECTS
    .filter((p) =>
      Object.keys(p.languages).some((l) => slugify(l) === tagSlug) ||
      p.topics.some((t) => slugify(t) === tagSlug)
    )
    .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt));

  const logItems = await Promise.all(filteredLogs.map(async (entry) => {
    const id = entry.id.replace(/\.md$/, '');
    const heroImg = entry.data.image
      ? `<img src="${entry.data.image}" alt="${entry.data.title}" style="max-width:100%;height:auto;display:block;margin-bottom:1.5em" />`
      : '';
    return {
      sortKey: entry.data.date.replace(/\./g, '-'),
      title: entry.data.title,
      pubDate: new Date(entry.data.date.replace(/\./g, '-')),
      description: entry.data.hook ?? entry.data.kicker,
      content: `${heroImg}${await renderMarkdown(entry.body ?? '', 'rss')}`,
      link: `/l/${id}`,
      customData: entry.data.image ? `<media:content url="${entry.data.image}" medium="image" />` : '',
    };
  }));

  const projectItems = filteredProjects.map((p) => ({
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
    title: `Phillip Wessels — ${tag}`,
    description: `Projects and logs related to "${tag}".`,
    site: ctx.site!,
    xmlns: { media: 'http://search.yahoo.com/mrss/' },
    items,
  });
}
