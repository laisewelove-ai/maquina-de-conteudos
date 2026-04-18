// Netlify Function — POST /api/ideas
// Permite que agentes Ops (WeAgency) criem ou atualizem ideias na Máquina de Conteúdos v6.
//
// Auth: header X-WeAgent-Token deve ser igual à env var WEAGENT_TOKEN.
//
// Request body (JSON):
// {
//   "title":         string  (obrigatório),
//   "platform":      "yt"|"ig"|"tk"|"ad"  (obrigatório),
//   "destination":   string  (opcional — slug do destino, ex: "santiago"),
//   "scripts":       { "A": string, "B": string, "C": string }  (opcional),
//   "recordingDate": "YYYY-MM-DD"  (opcional — coloca no kanban desse dia),
//   "status":        string  (opcional — default "novo"),
//   "desc":          string  (opcional),
//   "tags":          string[]  (opcional)
// }
//
// Response 200:
// { "ok": true, "idea": { ...campos }, "dashId": "wlc_...", "action": "created"|"updated" }
//
// Response 401: { "error": "Unauthorized" }
// Response 400: { "error": "<mensagem>" }
//
// Sync: cria/atualiza no Notion via notion-proxy, além de retornar o objeto completo.
// O dashboard local lê do Notion no próximo sync (syncFromNotion).

const NOTION_DB_IDEAS = '086760ce782547ff995468b038b97b69';
// ideas.mjs chama o proxy interno — o proxy injeta o Authorization com NOTION_API_KEY
// server-side, então não precisamos passar o token daqui.
const NOTION_PROXY    = 'https://maquinadeconteudos47.netlify.app/api/notion';
const NOTION_VERSION  = '2022-06-28';

function genDashId() {
  return 'wlc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

function normalizePlatform(p) {
  if (!p) return 'ig';
  const m = { instagram:'ig', ig:'ig', tiktok:'tk', tk:'tk', youtube:'yt', yt:'yt', ads:'ad', ad:'ad', anuncios:'ad' };
  return m[String(p).toLowerCase()] || 'ig';
}

// Notion select values for Plataforma field match the slugs directly
const PLATFORM_NOTION = { yt: 'yt', ig: 'ig', tk: 'tk', ad: 'ad' };

async function notionRequest(method, path, body) {
  const res = await fetch(`${NOTION_PROXY}/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

export default async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-WeAgent-Token',
    'Content-Type': 'application/json',
  };

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed — use POST' }), {
      status: 405, headers: corsHeaders
    });
  }

  // ── Auth ──
  const envToken = process.env.WEAGENT_TOKEN;
  const reqToken = req.headers.get('X-WeAgent-Token');
  if (!envToken || !reqToken || reqToken !== envToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: corsHeaders
    });
  }

  // ── Parse body ──
  let body;
  try {
    body = await req.json();
  } catch(e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: corsHeaders
    });
  }

  const { title, platform, destination, scripts, recordingDate, status, desc, tags } = body;

  if (!title || !title.trim()) {
    return new Response(JSON.stringify({ error: 'Campo obrigatório: title' }), {
      status: 400, headers: corsHeaders
    });
  }
  if (!platform) {
    return new Response(JSON.stringify({ error: 'Campo obrigatório: platform (yt|ig|tk|ad)' }), {
      status: 400, headers: corsHeaders
    });
  }

  const platSlug = normalizePlatform(platform);
  const platNotion = PLATFORM_NOTION[platSlug] || 'Instagram';
  const dashId = genDashId();
  const today = new Date().toISOString().slice(0, 10);

  // ── Build Notion page ──
  const notionProps = {
    'Título': { title: [{ text: { content: title.trim() } }] },
    'Plataforma': { select: { name: platNotion } },
    'Status': { select: { name: status || 'novo' } },
    'Dashboard ID': { rich_text: [{ text: { content: dashId } }] },
    'Adicionado por': { rich_text: [{ text: { content: 'Ops (API)' } }] },
    'Data de adição': { date: { start: today } },
  };

  if (destination) {
    notionProps['Destino'] = { select: { name: destination } };
  }

  if (desc) {
    notionProps['Descrição'] = { rich_text: [{ text: { content: desc } }] };
  }

  if (Array.isArray(tags) && tags.length > 0) {
    notionProps['Categoria'] = { select: { name: tags[0] } };
  }

  if (recordingDate) {
    notionProps['Data da gravação'] = { date: { start: recordingDate } };
  }

  // Scripts are stored in the Description field as JSON block (Notion doesn't have a scripts field)
  if (scripts && (scripts.A || scripts.B || scripts.C)) {
    const scriptText = [
      scripts.A ? `=== Script A ===\n${scripts.A}` : '',
      scripts.B ? `=== Script B ===\n${scripts.B}` : '',
      scripts.C ? `=== Script C ===\n${scripts.C}` : '',
    ].filter(Boolean).join('\n\n');

    // Append to description
    const existing = desc || '';
    notionProps['Descrição'] = {
      rich_text: [{
        text: { content: (existing ? existing + '\n\n' : '') + scriptText }
      }]
    };
  }

  // ── Push to Notion (upsert by title) ──
  let notionPageId = null;
  let action = 'created';
  let finalDashId = dashId; // may be overridden if page already exists

  try {
<<<<<<< HEAD
    const createRes = await notionRequest('POST', 'pages', {
      parent: { database_id: NOTION_DB_IDEAS },
      properties: notionProps,
    });
=======
    const notionToken = process.env.NOTION_TOKEN || NOTION_TOKEN;

    // 1. Query database for existing page with same title
    const queryRes = await notionRequest('POST', `databases/${NOTION_DB_IDEAS}/query`, {
      filter: {
        property: 'Título',
        title: { equals: title.trim() },
      },
      page_size: 1,
    }, notionToken);
>>>>>>> 90029c4 (fix: endpoint /api/ideas — URL proxy Notion correta + upsert por título)

    let existingPage = null;
    if (queryRes.ok) {
      const queryData = await queryRes.json();
      if (queryData.results && queryData.results.length > 0) {
        existingPage = queryData.results[0];
      }
    }

    if (existingPage) {
      // 2a. UPDATE — preserve existing Dashboard ID, merge scripts
      const existingPageId = existingPage.id;
      const existingDashIdProp = existingPage.properties?.['Dashboard ID']?.rich_text?.[0]?.plain_text;
      if (existingDashIdProp) {
        finalDashId = existingDashIdProp; // preserve original dashId
        // Remove Dashboard ID from update props so we don't overwrite it
        delete notionProps['Dashboard ID'];
      }

      // If no new scripts provided, preserve existing scripts from Notion description
      if (!scripts || (!scripts.A && !scripts.B && !scripts.C)) {
        delete notionProps['Descrição'];
      }

      const updateRes = await notionRequest('PATCH', `pages/${existingPageId}`, {
        properties: notionProps,
      }, notionToken);

      if (updateRes.ok) {
        notionPageId = existingPageId;
        action = 'updated';
      }
    } else {
      // 2b. CREATE — new page
      const createRes = await notionRequest('POST', 'pages', {
        parent: { database_id: NOTION_DB_IDEAS },
        properties: notionProps,
      }, notionToken);

      if (createRes.ok) {
        const page = await createRes.json();
        notionPageId = page.id;
        action = 'created';
      }
    }
  } catch(e) {
    // Notion push failed — not critical, return the idea object anyway
    console.error('Notion push failed:', e.message);
  }

  // ── Build response idea object ──
  const idea = {
    _dashId: finalDashId,
    platform: platSlug,
    title: title.trim(),
    tags: Array.isArray(tags) ? tags : [],
    source: 'Ops (API)',
    status: status || 'novo',
    impact: null,
    destination: destination || null,
    desc: desc || '',
    scripts: {
      A: (scripts && scripts.A) || '',
      B: (scripts && scripts.B) || '',
      C: (scripts && scripts.C) || '',
    },
    addedBy: 'Ops (API)',
    addedAt: today,
    recordingDate: recordingDate || null,
    _notionPageId: notionPageId,
  };

  return new Response(JSON.stringify({ ok: true, idea, dashId: finalDashId, action }), {
    status: 200,
    headers: corsHeaders,
  });
};

export const config = {
  path: ['/api/ideas', '/.netlify/functions/ideas'],
};
