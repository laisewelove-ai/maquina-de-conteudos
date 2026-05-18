/**
 * POST /api/carrossel-title
 * Body: { input?, voiceContext? }
 * Returns: { titulos: string[] }
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS });

  let body;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: CORS }); }

  const { input, voiceContext } = body;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), { status: 500, headers: CORS });

  const voiceBlock = voiceContext?.trim()
    ? `\n\nCONTEXTO DE TOM DE VOZ:\n${voiceContext.trim()}\n\nUse esse contexto de voz para calibrar o estilo dos títulos.`
    : '';

  const contexto = input?.trim()
    ? `O usuário já começou a escrever: "${input.trim()}". Gere 5 variações melhores desse título.`
    : `Gere 5 sugestões de título para um carrossel de Instagram.`;

  const prompt = `Você é um estrategista de conteúdo para Instagram. ${contexto}${voiceBlock}
Regras: títulos claros, específicos, com tensão ou promessa concreta. Não genéricos. Máximo 80 caracteres cada.
Retorne APENAS um JSON válido: { "titulos": ["titulo1", "titulo2", "titulo3", "titulo4", "titulo5"] }`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 512, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) { const e = await res.text(); return new Response(JSON.stringify({ error: 'Claude API error', detail: e }), { status: 502, headers: CORS }); }
    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed.titulos)) throw new Error('Invalid titulos format');
    return new Response(JSON.stringify({ titulos: parsed.titulos.slice(0, 5) }), { status: 200, headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS });
  }
};

export const config = { path: '/api/carrossel-title' };
