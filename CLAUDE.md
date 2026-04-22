# Máquina de Conteúdos v6 — We Love Chile

## O que é este projeto
Dashboard de planejamento de conteúdo para redes sociais da We Love Chile. App single-file HTML sem framework, sem build step — abre direto no browser.

## Estrutura de arquivos

```
maquina-netlify/
├── public/
│   └── index.html          ← O APP INTEIRO (HTML + CSS + JS em um só arquivo)
├── netlify/
│   └── functions/
│       ├── notion-proxy.mjs ← Proxy serverless para a API do Notion (evita CORS)
│       └── ideas.mjs        ← v6: endpoint POST /api/ideas para Ops empurrar ideias
└── netlify.toml             ← Config Netlify: publish=public, functions=netlify/functions
```

O arquivo fonte editável está em:
```
~/Library/Mobile Documents/com~apple~CloudDocs/Máquina de Conteúdo V5 - We Love Chile.html
```

**Fluxo de deploy:**
1. Editar o arquivo fonte `.html`
2. Copiar para `public/index.html`
3. Zipar a pasta `maquina-netlify/` e fazer upload no Netlify (arrastar o ZIP na aba Deploys)

## Arquitetura do HTML (~8800 linhas)

| Seção | Linhas aprox. | O que é |
|---|---|---|
| CSS + fontes (base64) | 1–3600 | Estilos, fontes Lufga embutidas |
| HTML estrutural | 2800–3900 | Markup de todas as páginas/modais |
| Dados hardcoded | 3942–4300 | `ideasData[]` (ideias iniciais), `templateIdeas[]` (120 templates com [destino]) |
| Estado e init JS | 4300–5400 | Variáveis globais, navegação, wizard steps |
| Renderização home | 4500–4800 | `renderHomeChecklist()`, `renderHomeZone1()` |
| Banco de ideias | 5900–7000 | `renderIdeasGrid()`, `openIdeaDrawer()`, filtros |
| Planejamento semanal | 7000–7900 | `autoGenerateWeek()`, `renderKanban()`, `weekKanban` |
| Persistência | 8250–8480 | IndexedDB, localStorage, `saveExtraIdeas()`, `saveWeekKanban()` |
| Notion sync engine | 8480–8790 | `syncFromNotion()`, `pushIdeaToNotion()`, `notionAPI()` |

## Notion

- **Database ID:** `086760ce782547ff995468b038b97b69`
- **Integração:** `WLB Claude API` (Internal Integration do Notion)
- **Token:** **server-side** via env var `NOTION_API_KEY` no Netlify — injetado pelo proxy. Nunca exposto no HTML público nem em nenhuma function.
- **Proxy:** `/api/notion/*` → `/.netlify/functions/notion-proxy/:splat`. O proxy lê `process.env.NOTION_API_KEY` e injeta o header `Authorization` server-side. Cliente usa placeholder `'server-managed'` pra manter os guards `if (notionToken)` funcionando.
- **ideas.mjs** também chama o proxy interno — não precisa token próprio.
- **Para rotacionar o token:** gerar novo token no Notion → `netlify env:set NOTION_API_KEY "ntn_..."` (ou UI do dashboard) → trigger redeploy. Não precisa mexer em código.
- **Campos sincronizados:** Título, Plataforma, Categoria, Subcategoria, Fonte, Status, Impacto, Destino, Descrição, Adicionado por, Data de adição, Dashboard ID, Data da gravação

## Status das ideias

| Key | Label |
|---|---|
| `novo` | Novo |
| `gravado` | Gravado |
| `em_edicao` | Em edição |
| `fazer_correcoes` | Fazer correções |
| `aprovado` | Aprovado |
| `programado` | Programado |
| `publicado` | Publicado |
| `analisado` | Analisado |

Ideias com status `gravado` em diante são **excluídas do banco de ideias** para planejamento.

## Lógica de sync com Notion

- `syncFromNotion()` — roda 800ms após carregar. **Substitui todo `ideasData`** com os dados do Notion (Notion é fonte da verdade). Sem sync = dados hardcoded temporários.
- `pushIdeaToNotion(idea)` — chamado ao criar/editar ideia. Tem fila de retry em localStorage.
- `saveWeekKanban()` — salva `weekKanban` em localStorage/IDB e dispara `_syncRecordingDatesToNotion()` com debounce de 1500ms.

## Geração de slots semanais (`autoGenerateWeek`) — v6

Substituída a auto-geração de 10 peças genéricas por **slots placeholder**:
- 1× YT + 3× IG + 3× TK + 3× AD = 10 slots por dia
- Slots têm flag `_isSlot: true` e aparecem no kanban como cards tracejados "aguardando pauta"
- Ops preenche manualmente ou via endpoint `/api/ideas`
- Botão renomeado de "Gerar Semana" para "Criar Slots"

Destinos por dia da semana ainda definidos em `WEEK_SCHEDULE[]` (usado para filtros futuros).

## API Ops — POST /api/ideas (v6)

Endpoint serverless para agentes Ops criarem/atualizarem ideias na Máquina.

**URL:** `POST https://maquina-de-conteudos.netlify.app/api/ideas`

**Auth:** header `X-WeAgent-Token: <valor da env WEAGENT_TOKEN no Netlify>`

**Payload JSON:**
```json
{
  "title":         "string (obrigatório)",
  "platform":      "yt | ig | tk | ad  (obrigatório)",
  "destination":   "santiago | atacama | cusco | ...",
  "scripts":       { "A": "texto", "B": "texto", "C": "texto" },
  "recordingDate": "YYYY-MM-DD",
  "status":        "novo (default) | gravado | ...",
  "desc":          "texto",
  "tags":          ["Categoria"]
}
```

**Response 200:**
```json
{ "ok": true, "idea": { ...campos completos }, "dashId": "wlc_...", "action": "created" }
```

**Erros:** 401 (sem token / token errado), 400 (campo obrigatório faltando), 405 (método errado).

**Config:** adicionar `WEAGENT_TOKEN` nas env vars do Netlify antes do deploy. O endpoint também faz push automático ao Notion.

## Persistência local

- **IndexedDB** (`wlc_dashboard`) — primário, funciona em `file://`
- **localStorage** — fallback
- **`wlc-user-data` script tag** no HTML — dados embutidos pelo botão "Salvar" (File System Access API)

Chaves relevantes: `wlc_ideas`, `wlc_weekKanban`, `wlc_notion_token`, `wlc_notion_pagemap`, `wlc_weekKanban`.

## Comportamentos importantes

- Clicar num card do kanban ou na home → abre `openIdeaDrawer(ideaIdx)`
- Botão "○ Gravar" no card → muda `idea.status = 'gravado'` + push para Notion
- Botão "Produzir" num card → vai direto para etapa 5 do wizard (pula etapas 1 e 4)
- "Data da gravação" no Notion é atualizada automaticamente quando ideia é colocada num dia do planejamento

## Novas features v6

### 1. Scripts persistidos (`idea.scripts`)
- `idea.scripts = { A: '', B: '', C: '' }` — campo adicionado ao schema
- Auto-save via `saveCurrentScriptVersion()`: blur + 1.5s debounce após input + ao trocar aba + ao copiar/exportar/avançar
- Ao abrir o wizard com ideia pré-selecionada, carrega o script salvo (prioridade sobre template)

### 2. Status "pronto-pra-gravar"
- Função `calcReadyToRecord(idea)` calcula os 5 checks:
  - pauta (título preenchido)
  - packaging (título preenchido — mesmo campo por ora)
  - script (scripts.A não vazio)
  - destino (campo destination preenchido)
  - SEO (apenas para platform === 'yt' — tags + description preenchidos)
- Badge verde "● PRONTO" aparece no card do kanban quando todos os checks passam

### 3. Filtro por plataforma no kanban
- Barra de filtro acima do kanban (All / YT / IG / TK / AD)
- Filtra os cards nas colunas de dias (não afeta a coluna Organizar — que tem seu próprio filtro)
- Estado em `kanbanDayPlatFilter`

### 4. Slots placeholder
- Slots têm `_isSlot: true` e são renderizados como cards tracejados semitransparentes
- Não abrem drawer ao clicar, têm apenas botão de remover
