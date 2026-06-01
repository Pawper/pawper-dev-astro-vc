import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
// @ts-ignore — .mjs shared with astro.config.mjs
import { remarkTabsPlugin } from './remarkTabsPlugin.mjs';

const siteProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkTabsPlugin('site'))
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true });

const rssProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkTabsPlugin('rss'))
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true });

export async function renderMarkdown(markdown: string, mode: 'site' | 'rss' = 'site'): Promise<string> {
  const result = await (mode === 'rss' ? rssProcessor : siteProcessor).process(markdown);
  return String(result);
}
