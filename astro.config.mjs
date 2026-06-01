// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import remarkDirective from 'remark-directive';
import { remarkTabsPlugin } from './src/utils/remarkTabsPlugin.mjs';

/**
 * Dev-only middleware that serves /api/edit with raw access to the query string and
 * request body. This runs ONLY in `astro dev` (astro:server:setup is never invoked
 * during a build), so the production output stays a pure static site with no adapter.
 * All file work is delegated to src/server/draftStore.ts and confined to the drafts dir.
 */
function draftEditApi() {
  return {
    name: 'draft-edit-api',
    hooks: {
      'astro:server:setup': async ({ server }) => {
        const send = (res, status, body) => {
          res.statusCode = status;
          res.setHeader('content-type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(body));
        };
        const readBody = (req) =>
          new Promise((resolve) => {
            let data = '';
            req.on('data', (c) => (data += c));
            req.on('end', () => resolve(data));
            req.on('error', () => resolve(''));
          });

        server.middlewares.use('/api/edit', async (req, res, next) => {
          try {
            // Load through Vite so the .ts module is transpiled and HMR-aware.
            const store = await server.ssrLoadModule('/src/server/draftStore.ts');
            const { listDrafts, readDraft, saveDraft, deleteDraft, DraftError } = store;
            const url = new URL(req.url ?? '/', 'http://localhost');

            const handle = async () => {
              if (req.method === 'GET') {
                const action = url.searchParams.get('action');
                if (action === 'read') return send(res, 200, await readDraft(url.searchParams.get('filename')));
                if (action === 'list') return send(res, 200, { files: await listDrafts() });
                return send(res, 400, { error: 'Unknown action. Use ?action=list or ?action=read' });
              }
              if (req.method === 'POST' || req.method === 'DELETE') {
                const raw = await readBody(req);
                let body;
                try { body = JSON.parse(raw || '{}'); } catch { return send(res, 400, { error: 'Invalid JSON body' }); }
                if (req.method === 'POST') return send(res, 200, { ok: true, ...(await saveDraft(body.filename, body.content)) });
                await deleteDraft(body.filename);
                return send(res, 200, { ok: true });
              }
              return next();
            };

            try {
              await handle();
            } catch (err) {
              if (err instanceof DraftError) return send(res, err.status, { error: err.message });
              throw err;
            }
          } catch (err) {
            send(res, 500, { error: err instanceof Error ? err.message : 'Server error' });
          }
        });
      },
    },
  };
}

export default defineConfig({
  site: 'https://pawper.dev',
  integrations: [react(), draftEditApi()],
  markdown: {
    remarkPlugins: [remarkDirective, remarkTabsPlugin('site')],
    shikiConfig: {
      langs: [
        { name: "bash-prompt",     scopeName: "source.bash-prompt",     patterns: [], repository: {} },
        { name: "bash-prompt-key", scopeName: "source.bash-prompt-key", patterns: [], repository: {} },
        { name: "wrap",            scopeName: "source.wrap",            patterns: [], repository: {} },
      ],
    },
  },
  vite: {
    server: {
      // Leading dot = allow this domain and all subdomains, so every
      // `cloudflared tunnel --url` quick tunnel works without re-listing it.
      allowedHosts: [".trycloudflare.com"],
    },
  },
});
