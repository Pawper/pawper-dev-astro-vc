import type { APIRoute } from 'astro';
import { listDrafts, readDraft, saveDraft, deleteDraft, DraftError } from '../../server/draftStore';

// Dev-only draft API. In `astro dev` the real traffic is served by the dev middleware
// in astro.config.mjs (draftEditApi integration), which has raw access to the query
// string and request body — a static Astro endpoint cannot, and going `prerender:false`
// here would force an adapter into the otherwise-static production build.
//
// This route stays prerender:true so the production build remains adapter-free. It backs
// `/api/edit` with a hard 403 in production (the editor must never run off the dev box),
// and mirrors the same handlers so the endpoint is self-documenting and testable.
export const prerender = true;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

const devOnly = () => json({ error: 'Not available outside dev mode' }, 403);

function fail(err: unknown): Response {
  if (err instanceof DraftError) return json({ error: err.message }, err.status);
  throw err;
}

export const GET: APIRoute = async ({ url }) => {
  if (!import.meta.env.DEV) return devOnly();
  try {
    const action = url.searchParams.get('action');
    if (action === 'read') return json(await readDraft(url.searchParams.get('filename')));
    if (action === 'list') return json({ files: await listDrafts() });
    return json({ error: 'Unknown action. Use ?action=list or ?action=read' }, 400);
  } catch (err) {
    return fail(err);
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) return devOnly();
  try {
    const body = await request.json();
    return json({ ok: true, ...(await saveDraft(body.filename, body.content)) });
  } catch (err) {
    if (err instanceof SyntaxError) return json({ error: 'Invalid JSON body' }, 400);
    return fail(err);
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) return devOnly();
  try {
    const body = await request.json();
    await deleteDraft(body.filename);
    return json({ ok: true });
  } catch (err) {
    if (err instanceof SyntaxError) return json({ error: 'Invalid JSON body' }, 400);
    return fail(err);
  }
};
