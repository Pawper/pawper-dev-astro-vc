import { visit } from 'unist-util-visit';

/**
 * Remark plugin for :::tabs / ::tab[Label] directive syntax.
 *
 * mode 'site' → pw-tabs-raw wrapper + pw-tab-sep markers (JS activates into tabs)
 * mode 'rss'  → plain div wrapper + h3 headings (flat, readable everywhere)
 */
export function remarkTabsPlugin(mode = 'site') {
  return () => (tree) => {
    visit(tree, 'leafDirective', (node) => {
      if (node.name !== 'tab') return;
      const label = (node.children ?? []).map(c => c.value ?? '').join('').trim();
      if (mode === 'rss') {
        node.data = { hName: 'h3' };
        node.children = [{ type: 'text', value: label }];
      } else {
        node.data = { hName: 'div', hProperties: { className: 'pw-tab-sep', 'data-label': label } };
        node.children = [];
      }
    });

    visit(tree, 'containerDirective', (node) => {
      if (node.name !== 'tabs') return;
      node.data = {
        hName: 'div',
        hProperties: mode === 'site' ? { className: 'pw-tabs-raw' } : {},
      };
    });
  };
}
