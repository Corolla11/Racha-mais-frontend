---
name: Racha+
description: Sistema de design colaborativo de divisão de despesas e tarefas, ancorado na identidade visual da tela de login.
colors:
  primary: "#9b4500"
  on-primary: "#ffffff"
  primary-container: "#c2410c"
  on-primary-container: "#ffffff"
  primary-fixed: "#ffdbc9"
  primary-fixed-dim: "#ffb68d"
  on-primary-fixed: "#331200"
  on-primary-fixed-variant: "#763300"
  secondary: "#ab3425"
  on-secondary: "#ffffff"
  secondary-container: "#fc6f5a"
  secondary-fixed: "#ffdad4"
  on-secondary-fixed: "#410100"
  tertiary: "#855300"
  tertiary-container: "#ed9800"
  tertiary-fixed: "#ffddb8"
  on-tertiary-fixed: "#2a1700"
  error: "#ba1a1a"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  surface: "#f8f9ff"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#eff4ff"
  surface-container: "#e6eeff"
  surface-container-high: "#dee9fc"
  surface-container-highest: "#d9e3f6"
  on-surface: "#121c2a"
  on-surface-variant: "#564338"
  inverse-surface: "#27313f"
  inverse-on-surface: "#eaf1ff"
  outline: "#6f5b50"
  outline-variant: "#ddc1b3"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, Segoe UI, sans-serif"
    fontSize: "48px"
    fontWeight: 800
    lineHeight: "56px"
    letterSpacing: "-0.03em"
  display-mobile:
    fontFamily: "Plus Jakarta Sans, Segoe UI, sans-serif"
    fontSize: "36px"
    fontWeight: 800
    lineHeight: "44px"
    letterSpacing: "-0.02em"
  headline-lg:
    fontFamily: "Plus Jakarta Sans, Segoe UI, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: "40px"
    letterSpacing: "-0.02em"
  headline-md:
    fontFamily: "Plus Jakarta Sans, Segoe UI, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "32px"
    letterSpacing: "-0.015em"
  headline-sm:
    fontFamily: "Plus Jakarta Sans, Segoe UI, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "28px"
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: "Plus Jakarta Sans, Segoe UI, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "28px"
  body-md:
    fontFamily: "Plus Jakarta Sans, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  body-sm:
    fontFamily: "Plus Jakarta Sans, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label-lg:
    fontFamily: "Plus Jakarta Sans, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "24px"
  label-md:
    fontFamily: "Plus Jakarta Sans, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "20px"
    letterSpacing: "0.005em"
  label-sm:
    fontFamily: "Plus Jakarta Sans, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0.01em"
  numeric-stat:
    fontFamily: "Plus Jakarta Sans, Segoe UI, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: "36px"
    letterSpacing: "-0.02em"
rounded:
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "24px"
  full: "9999px"
spacing:
  space-xs: "4px"
  space-sm: "8px"
  space-md: "16px"
  space-lg: "24px"
  space-xl: "40px"
  gutter-mobile: "16px"
  gutter: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  input-field:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "14px 16px"
  card-surface:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

## Overview

O Racha+ adota uma linguagem visual quente, clara e direta, ancorada na tela de login: um painel de marca em laranja queimado (`#c2410c` -> `#9b4500`) contraposto a superfícies neutras frias de altíssima legibilidade (`#ffffff`, `#f8f9ff`, `#eff4ff`). O contraste prioriza clareza financeira (valores tabulares, status explícitos com ícone + texto) e acessibilidade WCAG AA (mínimo `4.5:1` para texto normal e `3:1` para elementos de UI).

### Ativos de Marca (Entrada Única)

- **Logo animada/provisória:** `/logo.webm` (com pôster/fallback `/logo.png`), renderizada pelo componente único [brand-logo.tsx](src/components/brand-logo.tsx) (`BrandMark` e `BrandLogo`) em todas as telas públicas e autenticadas. Para trocar a logo definitiva no futuro, basta substituir `public/logo.webm` e `public/logo.png`.
- **Favicon:** `public/favicon.webm` (com fallback `public/favicon.png` para navegadores sem suporte a favicon em vídeo) declarado em [index.html](index.html).

## Colors

| Papel | Token CSS | Valor | Contraste / Uso |
|---|---|---|---|
| Ação primária / Painel hero | `--color-primary-container` | `#c2410c` | **5.18:1** com `#ffffff` (`--color-on-primary`); CTAs, painel de marca do login/cadastro |
| Hover / Ênfase sobre claro | `--color-primary` | `#9b4500` | **6.50:1** com `#ffffff`; **6.18:1** sobre `#f8f9ff`; links, textos de destaque e hover primário |
| Superfície base | `--color-surface` | `#f8f9ff` | Fundo geral das telas operacionais |
| Cartões elevados | `--color-surface-container-lowest` | `#ffffff` | Formulário de login, cartões de grupos/tarefas e painéis |
| Campos de entrada | `--color-surface-container-low` | `#eff4ff` | Inputs, chips inativos e blocos internos |
| Texto principal | `--color-on-surface` | `#121c2a` | Títulos, rótulos e valores |
| Texto secundário | `--color-on-surface-variant` | `#564338` | Subtítulos, descrições e metadados |
| Placeholder / Ícones neutros | `--color-outline` | `#6f5b50` | >= 4.5:1 sobre `#eff4ff` e `#ffffff` |
| Erro / Pendência crítica | `--color-error` / `--color-secondary` | `#ba1a1a` / `#ab3425` | Alertas, validações e pendências (sempre acompanhados de ícone/texto) |
| Superfície escura (CTA) | `--color-inverse-surface` | `#27313f` | Contraste > 11:1 com `--color-inverse-on-surface` (`#eaf1ff`) |

## Typography

- **Família única:** `Plus Jakarta Sans` (pesos `400`, `500`, `600`, `700`, `800`) com fallback `"Segoe UI", sans-serif`.
- **Hierarquia semântica obrigatória:** toda página possui exatamente um `<h1>`, seguido sem saltos por `<h2>` e `<h3>`.
- **Números financeiros:** todo valor em reais (`R$`) e percentual usa `tabular-nums whitespace-nowrap` para evitar quebra entre símbolo e dígito ou desalinhamento vertical.

## Layout

- **Telas de autenticação (`/`, `/login`, `/cadastro`, `/verificar-email`):**
  - **Desktop (`>= md`):** grade 50/50 com painel institucional em laranja queimado à esquerda e `<main>` branco centralizado (`max-w-[440px]`) à direita.
  - **Mobile (`< md`):** o `<main>` do formulário vem **primeiro acima da dobra**, acompanhado de marca compacta no topo; o painel institucional permanece oculto ou condensado abaixo para eliminar rolagem antes da ação principal.
- **Telas operacionais (`AppShell`):** header fixo de `64px` (`h-16`), conteúdo centralizado em `max-w-6xl`, padding lateral de `16px` no mobile (`px-gutter-mobile`) e `24px` em telas maiores (`px-gutter`).
- **Área de toque:** elementos interativos mobile respeitam altura/largura mínima de `44px` (`min-h-11 min-w-11`).

## Elevation & Depth

- A hierarquia de camadas nasce primariamente da **separação tonal** (`surface` `#f8f9ff` -> `surface-container-low` `#eff4ff` -> `surface-container-lowest` `#ffffff`) com sombras suaves e deslocadas (`shadow-sm`, `shadow-md`).
- Evitar bordas laterais coloridas espessas ou sombras secas sem desfoque.

## Shapes

- **Inputs e botões padrão:** `rounded-lg` (`8px`).
- **Cards, painéis e CTAs de destaque:** `rounded-xl` (`12px`) a `rounded-2xl` (`16px`).
- **Badges, avatares e indicadores:** `rounded-full`.

## Components

- **`BrandMark` / `BrandLogo`** ([brand-logo.tsx](src/components/brand-logo.tsx)): exibe `/logo.webm` (`autoPlay loop muted playsInline`, `poster="/logo.png"`) dentro de caixa quadrada `rounded-lg`/`rounded-xl` com `overflow-hidden`.
- **Ícones (`Icon`):** caixa fixa `1em × 1em` (`inline-flex items-center justify-center overflow-hidden shrink-0`) para impedir vazamento de ligaduras ou deslocamento de layout (CLS) caso a fonte de ícones atrase ou fique indisponível.
- **Botões primários:** fundo `bg-primary-container` (`#c2410c`), texto `text-on-primary` (`#ffffff`), hover `bg-primary` (`#9b4500`), `min-h-11`, foco visível (`focus-visible:ring-2`).
- **Navegação horizontal (abas e filtros):** `flex-wrap` no desktop e rolagem horizontal com indicador visual progressivo por máscara CSS (`.scroll-fade-x` com `@property --fade-start` / `--fade-end` e `scroll-padding-inline`) no mobile, preservando acessibilidade de rolagem.
- **Sino de notificações (`AppShell`):** exibe indicador de não lidas apenas quando a contagem real da API for `> 0`.

## Do's and Don'ts

- **Faça:** use `text-primary` (`#9b4500`) para texto laranja sobre fundos claros e `bg-primary-container text-on-primary` (`#c2410c` / `#ffffff`) para botões e faixas de destaque.
- **Faça:** mantenha `BrandMark` como único ponto de entrada da logo em todas as telas.
- **Faça:** valide contraste mínimo `4.5:1` em textos e `3:1` em ícones/contornos, além de respeitar `@media (forced-colors: active)`.
- **Não faça:** usar texto branco sobre laranja claro (`#ff8c42`, contraste `2.31:1`).
- **Não faça:** deixar controles desabilitados permanentes (ex.: login social inativo) visíveis sem feature flag, nem avisos residuais de "Ambiente de demonstração" em produção.
- **Não faça:** esconder scrollbars de áreas roláveis sem oferecer fallback de navegação ou indicador visual de continuidade.
