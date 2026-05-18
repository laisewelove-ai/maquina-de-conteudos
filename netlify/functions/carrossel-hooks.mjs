/**
 * POST /api/carrossel-hooks
 * Body: { titulo, voiceContext? }
 * Returns: { hooks: string[] }
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

  const { titulo, voiceContext } = body;
  if (!titulo) return new Response(JSON.stringify({ error: 'titulo is required' }), { status: 400, headers: CORS });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), { status: 500, headers: CORS });

  const voiceBlock = voiceContext?.trim()
    ? `\n\nCONTEXTO DE TOM DE VOZ:\n${voiceContext.trim()}\n\nUse esse contexto para calibrar o estilo dos hooks.`
    : '';

  const prompt = `Você é um estrategista de conteúdo para Instagram. Gere 10 opções de hook para um carrossel (estilo tweet/X) sobre o tema: "${titulo}".${voiceBlock}

Regras: hooks curtos (1-3 linhas), primeira pessoa ou segunda pessoa, criam tensão ou curiosidade, não são genéricos.
Retorne APENAS um JSON válido: { "hooks": ["hook1", "hook2", "hook3", "hook4", "hook5", "hook6", "hook7", "hook8", "hook9", "hook10"] }`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) { const e = await res.text(); return new Response(JSON.stringify({ error: 'Claude API error', detail: e }), { status: 502, headers: CORS }); }
    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed.hooks)) throw new Error('Invalid hooks format');
    return new Response(JSON.stringify({ hooks: parsed.hooks.slice(0, 10) }), { status: 200, headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS });
  }
};

export const config = { path: '/api/carrossel-hooks' };
