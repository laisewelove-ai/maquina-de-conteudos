/**
 * POST /api/carrossel-tweets
 * Body: { titulo, hook, tipo, marca, voiceContext? }
 * Returns: { tweets: string[] } — slides 2-7
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const BASE_VOICE = `REGRAS ABSOLUTAS DE VOZ:
- Primeira pessoa sempre: "Eu fiz", "Eu aprendi", "A gente..."
- Coloquialismos BR: "pra", "tô", "cê", "tu", "a gente" (nunca "nós")
- Token "rs" em tom autodepreciativo — use em ~80% dos slides densos
- Cifras em dígito: "R$112", "3 posts", "10 semanas" — nunca por extenso
- Parentéticos íntimos: "(eu também fazia isso)", "(sem surtar rs)", "(spoiler: deu certo)"
- Analogia do mundo real ANTES de qualquer conceito técnico

ANTI-PADRÕES (proibidos):
- "transformar", "destravar", "revolucionar", "potencializar", "alavancar"
- Abertura "Olha:", "Veja:", "Atenção:", "Ei,", "Hey"
- Emoji decorativo (✨🔥💡) no corpo do tweet
- Listas corporativas com bullets frios

ESTRUTURA (slides 2-7):
- Slide 2: âncora confessional — "Eu também [erro/dor]" → diagnóstico
- Slide 3: mapa/analogia — apresenta conceitos com analogia real ANTES da técnica
- Slides 4-6: detalhe (1 ideia + caso prático por slide)
- Slide 7: resumo prático OU pergunta retórica de engajamento`;

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS });

  let body;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: CORS }); }

  const { titulo, hook, tipo, marca, voiceContext } = body;
  if (!titulo || !hook) return new Response(JSON.stringify({ error: 'titulo e hook são obrigatórios' }), { status: 400, headers: CORS });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), { status: 500, headers: CORS });

  const voiceSection = voiceContext?.trim()
    ? `TOM DE VOZ PERSONALIZADO (prioridade máxima):\n${voiceContext.trim()}\n\n`
    : BASE_VOICE + '\n\n';

  const systemPrompt = `Você é um copywriter especialista em carrosséis para Instagram.
${voiceSection}SLIDE FINAL (slide 8) já é CTA fixo — não escreva o slide 8.`;

  const userPrompt = `Tema: "${titulo}"
Hook (slide 1, já definido): "${hook}"
Tipo: ${tipo || 'carrossel-opiniao'}
Marca: ${marca || 'genérico'}

Escreva os 6 tweets para os slides 2-7.
Regras técnicas:
- Use \\n\\n para parágrafos
- Listas com → (ex: "→ Ponto\\n→ Ponto dois")
- Máximo ~280 caracteres por tweet
- Cada tweet autocontido mas fluindo para o próximo

Retorne APENAS um JSON válido (sem markdown):
{ "tweets": ["texto slide 2", "texto slide 3", "texto slide 4", "texto slide 5", "texto slide 6", "texto slide 7"] }`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    if (!res.ok) { const e = await res.text(); return new Response(JSON.stringify({ error: 'Claude API error', detail: e }), { status: 502, headers: CORS }); }
    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed.tweets)) throw new Error('Invalid tweets format');
    return new Response(JSON.stringify({ tweets: parsed.tweets.slice(0, 6) }), { status: 200, headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS });
  }
};

export const config = { path: '/api/carrossel-tweets' };
