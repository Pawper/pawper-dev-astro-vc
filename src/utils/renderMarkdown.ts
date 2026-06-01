import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';

function getLabel(node: any): string {
  return (node.children ?? []).map((c: any) => c.value ?? '').join('').trim();
}

// Transforms :::tabs / ::tab[Label] directives.
// site mode  → pw-tabs-raw wrapper + pw-tab-sep markers (JS activates into real tabs)
// rss mode   → plain div wrapper + h3 headings (flat, readable in any reader)
function remarkTabs(mode: 'site' | 'rss') {
  return () => (tree: any) => {
    visit(tree, 'leafDirective', (node: any) => {
      if (node.name !== 'tab') return;
      const label = getLabel(node);
      if (mode === 'rss') {
        node.data = { hName: 'h3' };
        node.children = [{ type: 'text', value: label }];
      } else {
        node.data = { hName: 'div', hProperties: { className: 'pw-tab-sep', 'data-label': label } };
        node.children = [];
      }
    });

    visit(tree, 'containerDirective', (node: any) => {
      if (node.name !== 'tabs') return;
      node.data = {
        hName: 'div',
        hProperties: mode === 'site' ? { className: 'pw-tabs-raw' } : {},
      };
    });
  };
}

const siteProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkTabs('site'))
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true });

const rssProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkTabs('rss'))
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true });

export async function renderMarkdown(markdown: string, mode: 'site' | 'rss' = 'site'): Promise<string> {
  const result = await (mode === 'rss' ? rssProcessor : siteProcessor).process(markdown);
  return String(result);
}
