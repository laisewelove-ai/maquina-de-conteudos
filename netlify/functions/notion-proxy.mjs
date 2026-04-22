// Netlify Function — proxy para API do Notion (evita CORS + injeta token server-side)
export default async (req) => {
  // CORS preflight primeiro (não precisa de token)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Notion-Version',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  // Token injetado server-side a partir da env var NOTION_API_KEY do Netlify.
  // Cliente NUNCA vê o token — esse é o ponto da correção de segurança.
  const serverToken = process.env.NOTION_API_KEY;
  if (!serverToken) {
    return new Response(JSON.stringify({ error: 'NOTION_API_KEY não configurada no servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Parse the path — handles both direct and redirect routes:
  //   /.netlify/functions/notion-proxy/databases/xxx → databases/xxx
  //   /api/notion/databases/xxx                      → databases/xxx
  const url = new URL(req.url);
  let notionPath = url.pathname
    .replace(/^\/?\.netlify\/functions\/notion-proxy\/?/, '')
    .replace(/^\/?api\/notion\/?/, '');

  if (!notionPath) {
    return new Response(JSON.stringify({ error: 'Path is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const notionUrl = 'https://api.notion.com/v1/' + notionPath + url.search;

  const headers = {
    'Content-Type': 'application/json',
    'Notion-Version': req.headers.get('Notion-Version') || '2022-06-28',
    'Authorization': 'Bearer ' + serverToken,
  };

  try {
    const fetchOpts = { method: req.method, headers };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOpts.body = await req.text();
    }

    const response = await fetch(notionUrl, fetchOpts);
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};

export const config = {
  path: ["/api/notion/*", "/.netlify/functions/notion-proxy/*"]
};
