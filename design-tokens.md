# Design Tokens — Máquina de Conteúdos v5

Extraídos por Pix em 2026-04-18, via análise pixel-level da imagem de referência:
`PKA/01_Projetos/Máquina de Conteúdos/Identidade visual/Referência identidade visual — Laise — [18.04.2026].png`

---

## Paleta de Cores

| Token                  | Hex        | Uso                                               |
|------------------------|------------|---------------------------------------------------|
| `--color-bg`           | `#F2EDE4`  | Background global (bege/creme quente)             |
| `--color-sidebar`      | `#1A1A1A`  | Sidebar esquerda (preto quase puro)               |
| `--color-sidebar-text` | `#FFFFFF`  | Texto e ícones na sidebar                         |
| `--color-header-bg`    | `#EDBA18`  | Header/logo area (amarelo ouro)                   |
| `--color-header-text`  | `#1A1A1A`  | Texto no header amarelo                           |
| `--color-card-gravar`  | `#D93025`  | Card "Gravar / HOJE" (vermelho vibrante)          |
| `--color-card-ativas`  | `#6B2FA0`  | Card "Ativas / BANCO DE IDEIAS" (roxo escuro)     |
| `--color-card-agend`   | `#1AADA0`  | Card "Agendadas / SEMANA" (teal/verde-água)        |
| `--color-card-dark`    | `#1C1C1C`  | Cards escuros de checklist (preto grafite)        |
| `--color-card-light`   | `#FFFFFF`  | Cards claros / área de captura rápida             |
| `--color-accent-yellow`| `#EDBA18`  | Botão YT / progress bar / destaques               |
| `--color-accent-red`   | `#D93025`  | Botão IG-TK / badges vermelhos                    |
| `--color-accent-green` | `#2ABF6B`  | Botão "Salvar" / confirmações                     |
| `--color-text-primary` | `#1A1A1A`  | Texto principal sobre fundo claro                 |
| `--color-text-muted`   | `#6B6B6B`  | Labels secundários, rodapés                       |
| `--color-text-light`   | `#FFFFFF`  | Texto sobre fundos escuros/coloridos              |
| `--color-border`       | `#1A1A1A`  | Bordas neo-brutalist (preto sólido)               |
| `--color-chip-atacama` | `#EDBA18`  | Chip bandeira "Atacama"                           |
| `--color-chip-santiago`| `#6B2FA0`  | Chip bandeira "Santiago"                          |
| `--color-chip-vinhos`  | `#D93025`  | Chip bandeira "Vinhos"                            |

---

## Tipografia

| Token                   | Valor                                | Uso                                         |
|-------------------------|--------------------------------------|---------------------------------------------|
| `--font-primary`        | `'Lufga', 'Poppins', sans-serif`     | Fonte principal (Lufga já no index.html)    |
| `--font-display-size`   | `5rem–8rem`                          | Números grandes (16%, 6/10, 218, 23)        |
| `--font-display-weight` | `900`                                | Peso dos números display                    |
| `--font-label-size`     | `0.65rem–0.75rem`                    | Labels caixa-alta espaçados (META DO MÊS)   |
| `--font-label-spacing`  | `0.12em–0.18em`                      | Letter-spacing dos labels                   |
| `--font-label-weight`   | `700`                                | Peso dos labels                             |
| `--font-body-size`      | `0.875rem`                           | Texto corrido                               |

---

## Raio de Borda (Border Radius)

| Token              | Valor   | Uso                                              |
|--------------------|---------|--------------------------------------------------|
| `--radius-none`    | `0px`   | Cards neo-brutalist (sem arredondamento)          |
| `--radius-sm`      | `4px`   | Chips/badges pequenos                            |
| `--radius-md`      | `8px`   | Cards secundários                                |
| `--radius-pill`    | `50px`  | Pills de destino, botões pill                    |

---

## Sombras (Neo-Brutalist — sombra dura offset)

| Token              | Valor                           | Uso                              |
|--------------------|---------------------------------|----------------------------------|
| `--shadow-card`    | `4px 4px 0px #1A1A1A`           | Cards principais (sombra dura)   |
| `--shadow-btn`     | `3px 3px 0px #1A1A1A`           | Botões (sombra dura)             |
| `--shadow-hover`   | `6px 6px 0px #1A1A1A`           | Cards ao hover                   |

---

## Espaçamentos

| Token          | Valor  | Uso                     |
|----------------|--------|-------------------------|
| `--space-xs`   | `4px`  | Gap mínimo              |
| `--space-sm`   | `8px`  | Gap pequeno             |
| `--space-md`   | `16px` | Padding interno padrão  |
| `--space-lg`   | `24px` | Padding de seção        |
| `--space-xl`   | `40px` | Margem entre blocos     |

---

## Bordas

| Token              | Valor                  | Uso                              |
|--------------------|------------------------|----------------------------------|
| `--border-width`   | `2px`                  | Espessura padrão das bordas      |
| `--border-style`   | `solid`                | Estilo das bordas                |
| `--border-color`   | `#1A1A1A`              | Cor da borda neo-brutalist       |
| `--border`         | `2px solid #1A1A1A`    | Shorthand borda padrão           |

---

## Checkboxes

- Quadrados (sem border-radius)
- `20px × 20px` mínimo
- Borda `2px solid #1A1A1A`
- Fundo branco quando não marcado, preto quando marcado com check branco

---

## Botões (estilo chunky neo-brutalist)

- Background sólido (sem gradiente)
- Borda sólida `2px solid #1A1A1A`
- `box-shadow: 3px 3px 0px #1A1A1A`
- `border-radius: 0` ou `4px` máximo
- Ao hover: `transform: translate(1px, 1px)` + shadow reduz para `2px 2px`
- Texto: `font-weight: 700`, caixa-alta ou title case

---

## Badge "NEW"

- Estilo manuscrito/cursivo (fonte cursiva ou `transform: rotate(-5deg)`)
- Cor: `#D93025` (vermelho)
- Sem background (texto sobre o card diretamente)
- Inclinado ~-5° a -10°

---

## Chips Bandeira (destinos)

- Pill: `border-radius: 50px`
- Background: cor do destino (Atacama = amarelo, Santiago = roxo, Vinhos = vermelho)
- Texto branco `font-size: 0.7rem`, `font-weight: 700`
- Padding: `4px 12px`

---

## Notas de aplicação

**Decisão arquitetural (Pix, 2026-04-18):** criado `public/styles.css` compartilhado com CSS custom properties (variáveis). Os 3 HTMLs recebem `<link rel="stylesheet" href="styles.css">` no `<head>`. O CSS define overrides de identidade visual via variáveis que sobrescrevem os valores inline dos componentes React. O CSS dos HTMLs existentes NÃO foi deletado — as variáveis permitem override progressivo sem risco de quebrar comportamento.

**Justificativa:** `index.html` tem 9235 linhas com fonte Lufga embutida em base64, estrutura React complexa e CSS altamente específico. Reescrita completa quebraria o comportamento funcional (cálculos, filtros, roteiros). CSS compartilhado com override via variáveis é a abordagem mais segura e reversível.
