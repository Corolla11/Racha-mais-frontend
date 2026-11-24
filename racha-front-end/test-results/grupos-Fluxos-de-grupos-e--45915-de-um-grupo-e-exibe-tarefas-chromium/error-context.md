# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: grupos.spec.ts >> Fluxos de grupos e tarefas >> abre detalhes de um grupo e exibe tarefas
- Location: e2e/grupos.spec.ts:48:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Viagem Litoral' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Viagem Litoral' }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Viagem Litoral' })

```

```yaml
- banner:
  - link "Racha+, meus grupos":
    - /url: /meus-grupos
    - text: Racha+
  - navigation "Navegação principal":
    - link "Meus Grupos":
      - /url: /meus-grupos
    - link "Configurações":
      - /url: /perfil
  - search:
    - text: Buscar
    - searchbox "Buscar"
  - link "Notificações":
    - /url: /notificacoes
  - link "Novo Grupo":
    - /url: /criar-grupo
  - button "Menu do perfil": Ana S.
- main:
  - navigation "Trilha de navegação":
    - link "Meus Grupos":
      - /url: /meus-grupos
    - text: Grupo
  - text: Grupo Ativo
  - heading "Grupo" [level=1]
  - text: 0 membros confirmados
  - button "Nova Tarefa"
  - text: "Total do Grupo R$ 0,00 0 despesas catalogadas Sua Cota Pessoal R$ 0,00 Quitado: R$ 0,00 Pendente: R$ 0,00 Liquidação Geral 0% do valor total quitado"
  - progressbar "Liquidação do grupo"
  - text: R$ 0,00 transferidos Faltam R$ 0,00
  - group "Seções do grupo":
    - button "Visão geral" [pressed]
    - button "Histórico"
  - button "Pagamentos e comprovantes"
  - button "Membros"
  - button "Editar grupo"
  - button "Encerrar grupo"
  - button "Sair do grupo"
  - text: Ambiente de demonstração · sem movimentações financeiras reais.
  - region "Tarefas & Despesas":
    - heading "Tarefas & Despesas" [level=2]
    - text: "0"
    - paragraph: Progresso das Tarefas
    - paragraph: 0 de 0 tarefas concluídas
    - text: 0/0
    - group "Filtrar tarefas":
      - button "Todas (0)" [pressed]
      - button "Planejadas (0)"
      - button "Em andamento (0)"
      - button "Concluídas (0)"
    - text: Filtrar por nome ou pagador
    - searchbox "Filtrar por nome ou pagador"
    - heading "Nenhum item adicionado ainda" [level=2]
    - paragraph: Organize a viagem adicionando a primeira despesa compartilhada ou designando uma tarefa para os amigos.
    - button "Criar o primeiro item"
  - heading "Você não possui pendências neste grupo" [level=3]
  - paragraph: A taxa de quitação do grupo está em 0%.
  - button "Pagar via PIX"
- contentinfo:
  - text: Racha+ © 2026 • Gestão colaborativa simplificada
  - link "Termos":
    - /url: /faq
  - link "Privacidade":
    - /url: /faq
  - link "Ajuda":
    - /url: /faq
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | import { mockSessaoAutenticada, USUARIO_PADRAO } from "./helpers/mock-api";
  3  | 
  4  | const GRUPO_MOCK = {
  5  |   id: "grupo-1",
  6  |   nome: "Viagem Litoral",
  7  |   descricao: "Casa e mercado",
  8  |   idDono: USUARIO_PADRAO.id,
  9  |   createdAt: "2026-01-10T00:00:00.000Z",
  10 | };
  11 | 
  12 | const TAREFA_MOCK = {
  13 |   id: "tarefa-1",
  14 |   idGrupo: "grupo-1",
  15 |   idUser: USUARIO_PADRAO.id,
  16 |   titulo: "Aluguel da casa",
  17 |   valorTotal: 600,
  18 |   dataInicio: "2026-02-01T00:00:00.000Z",
  19 |   dataFinal: "2026-02-10T00:00:00.000Z",
  20 |   partes: [
  21 |     {
  22 |       id: "parte-1",
  23 |       idUser: USUARIO_PADRAO.id,
  24 |       valor: 300,
  25 |       status: "PENDENTE",
  26 |     },
  27 |   ],
  28 | };
  29 | 
  30 | test.describe("Fluxos de grupos e tarefas", () => {
  31 |   test("redireciona /grupo para /meus-grupos e lista grupos", async ({ page }) => {
  32 |     await mockSessaoAutenticada(page);
  33 | 
  34 |     await page.route("**/grupos", async (route) => {
  35 |       await route.fulfill({
  36 |         status: 200,
  37 |         contentType: "application/json",
  38 |         body: JSON.stringify([GRUPO_MOCK]),
  39 |       });
  40 |     });
  41 | 
  42 |     await page.goto("/grupo");
  43 | 
  44 |     await expect(page).toHaveURL(/\/meus-grupos$/);
  45 |     await expect(page.getByText("Viagem Litoral")).toBeVisible();
  46 |   });
  47 | 
  48 |   test("abre detalhes de um grupo e exibe tarefas", async ({ page }) => {
  49 |     await mockSessaoAutenticada(page);
  50 | 
  51 |     await page.route("**/grupos/grupo-1", async (route) => {
  52 |       await route.fulfill({
  53 |         status: 200,
  54 |         contentType: "application/json",
  55 |         body: JSON.stringify(GRUPO_MOCK),
  56 |       });
  57 |     });
  58 | 
  59 |     await page.route("**/grupos/grupo-1/membros", async (route) => {
  60 |       await route.fulfill({
  61 |         status: 200,
  62 |         contentType: "application/json",
  63 |         body: JSON.stringify([
  64 |           {
  65 |             idUser: USUARIO_PADRAO.id,
  66 |             idGrupo: "grupo-1",
  67 |             user: USUARIO_PADRAO,
  68 |           },
  69 |         ]),
  70 |       });
  71 |     });
  72 | 
  73 |     await page.route("**/tarefas**", async (route) => {
  74 |       await route.fulfill({
  75 |         status: 200,
  76 |         contentType: "application/json",
  77 |         body: JSON.stringify([TAREFA_MOCK]),
  78 |       });
  79 |     });
  80 | 
  81 |     await page.goto("/grupo/grupo-1");
  82 | 
> 83 |     await expect(page.getByRole("heading", { name: "Viagem Litoral" })).toBeVisible();
     |                                                                         ^ Error: expect(locator).toBeVisible() failed
  84 |     await expect(page.getByText("Aluguel da casa")).toBeVisible();
  85 |   });
  86 | });
  87 | 
```