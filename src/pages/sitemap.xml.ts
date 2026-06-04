import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { PROJECTS, SKILLS, SERVICES, EXPERIENCES, AGENDA_EVENTS } from '../data/content';

const STATIC_ROUTES = [
  '/',
  '/about/',
  '/contact/',
  '/agenda/',
  '/logs/',
  '/projects/',
  '/projects/featured/',
  '/services/',
  '/resume.html',
];

const ABOUT_ENTRIES = ['bio', 'skills', 'activity', 'training', 'resume'];

export async function GET(ctx: APIContext) {
  const site = ctx.site?.toString().replace(/\/$/, '') ?? 'https://pawper.dev';

  const logs = await getCollection('logs');
  const logPaths = logs.map((l) => `/l/${l.id.replace(/\.md$/, '')}/`);

  const projectPaths = PROJECTS.map((p) => `/p/${p.id}/`);

  const skillItems = SKILLS.flatMap((g) => g.items);
  const skillPaths = skillItems.map((s) => `/skill/${s.replace(/\//g, '-')}/`);

  const servicePaths = ['/services/overview/', ...SERVICES.map((s) => `/services/${s.id}/`)];

  const aboutPaths = ABOUT_ENTRIES.map((e) => `/about/${e}/`);

  const xpIds = new Set<string>([
    ...EXPERIENCES.map((e) => e.id),
    ...AGENDA_EVENTS.map((e) => e.id),
  ]);
  const xpPaths = Array.from(xpIds).map((id) => `/xp/${id}/`);

  const allPaths = Array.from(new Set([
    ...STATIC_ROUTES,
    ...aboutPaths,
    ...servicePaths,
    ...skillPaths,
    ...projectPaths,
    ...xpPaths,
    ...logPaths,
  ]));

  const urls = allPaths.map((p) => `  <url><loc>${site}${p}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
