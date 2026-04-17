// Netlify Function — proxy para API do Notion (evita problemas de CORS)
export default async (req) => {
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

  // Forward headers from the client
  const headers = {
    'Content-Type': 'application/json',
    'Notion-Version': req.headers.get('Notion-Version') || '2022-06-28',
  };

  const auth = req.headers.get('Authorization');
  if (auth) headers['Authorization'] = auth;

  // Handle CORS preflight
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
