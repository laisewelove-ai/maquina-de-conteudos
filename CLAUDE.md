# Máquina de Conteúdo V5 — We Love Chile

## O que é este projeto
Dashboard de planejamento de conteúdo para redes sociais da We Love Chile. App single-file HTML sem framework, sem build step — abre direto no browser.

## Estrutura de arquivos

```
maquina-netlify/
├── public/
│   └── index.html          ← O APP INTEIRO (HTML + CSS + JS em um só arquivo)
├── netlify/
│   └── functions/
│       └── notion-proxy.mjs ← Proxy serverless para a API do Notion (evita CORS)
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
- **Token:** embutido no HTML (`ntn_206675072017...`) — também lido do localStorage
- **Proxy:** `/api/notion/*` → `/.netlify/functions/notion-proxy/:splat`
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

## Geração automática da semana (`autoGenerateWeek`)

Gera **10 conteúdos por dia**, sempre:
- 1× YouTube (Santiago) — fallback: template
- 3× Reels (destino do dia) — fallback: template com destino
- 3× TikTok — sempre cria ideias "Pessoal" (reutiliza existentes antes de criar novas)
- 3× Ads (destino do dia) — fallback: template com destino

Destinos por dia da semana definidos em `WEEK_SCHEDULE[]`.

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
