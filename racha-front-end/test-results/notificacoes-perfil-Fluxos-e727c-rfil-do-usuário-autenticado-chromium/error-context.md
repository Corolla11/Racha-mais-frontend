# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: notificacoes-perfil.spec.ts >> Fluxos de notificações e perfil >> exibe perfil do usuário autenticado
- Location: e2e/notificacoes-perfil.spec.ts:55:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Ana Silva')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Ana Silva') with timeout 5000ms
  - waiting for getByText('Ana Silva')

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
  - navigation "Navegação estrutural":
    - link "Início":
      - /url: /meus-grupos
    - link "Configurações":
      - /url: /perfil
    - text: Meu Perfil
  - heading "Configurações" [level=1]
  - paragraph: Gerencie seus dados pessoais, chave Pix para rateios e preferências de conta com transparência e controle total.
  - button "Perfil"
  - button "Pagamentos & Pix"
  - button "Segurança & Conta"
  - button "Notificações"
  - link "Planos & Assinaturas":
    - /url: /gerenciar-assinatura
  - heading "Ana Silva" [level=2]
  - text: Perfil Verificado
  - paragraph: "@ana"
  - button "Alterar Foto"
  - button "Remover"
  - heading "Dados Pessoais & Exibição" [level=3]
  - paragraph: Como os participantes veem você nos grupos e rateios.
  - text: Nome de Exibição Visível a todos
  - textbox "Nome de Exibição Visível a todos": Ana Silva
  - text: Nome de Usuário (@handle)
  - textbox "Nome de Usuário (@handle)": ana
  - text: Recado / Bio nos rachas 0/120 caracteres
  - textbox "Recado / Bio nos rachas 0/120 caracteres":
    - /placeholder: "Ex.: Organizador dos churrascos da galera"
  - paragraph: Uma frase descontraída para seus amigos te reconhecerem rapidamente.
  - text: Cidade Base
  - textbox "Cidade Base":
    - /placeholder: "Ex.: São Paulo, SP"
  - heading "Contato & Dados Oficiais" [level=3]
  - paragraph: Informações confidenciais usadas para segurança e reconciliação bancária.
  - text: E-mail Cadastrado
  - textbox "E-mail Cadastrado": ana@racha.test
  - text: Verificado WhatsApp / Celular
  - textbox "WhatsApp / Celular":
    - /placeholder: (00) 00000-0000
  - paragraph: Usado para receber lembretes de rateios e comprovantes de Pix.
  - text: CPF
  - textbox "CPF" [disabled]:
    - /placeholder: Não informado
  - text: Protegido
  - paragraph: Para alterar dados fiscais cadastrados, solicite ao suporte.
  - text: Recebimentos
  - heading "Chave Pix Padrão" [level=3]
  - paragraph: Esta chave é exibida automaticamente quando amigos quitam despesas com você.
  - text: Tipo da Chave Não cadastrada Cadastre uma chave para receber os rateios.
  - button "Gerenciar Chaves"
  - paragraph: Seus dados nunca são compartilhados externamente ou com agências financeiras sem autorização expressa.
  - text: Nenhuma alteração pendente. Suas alterações valem para todos os seus grupos.
  - button "Descartar" [disabled]
  - button "Salvar Alterações" [disabled]
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
  2  | import { mockSessaoAutenticada } from "./helpers/mock-api";
  3  | 
  4  | test.describe("Fluxos de notificações e perfil", () => {
  5  |   test("lista notificações e marca como lida", async ({ page }) => {
  6  |     await mockSessaoAutenticada(page);
  7  | 
  8  |     let lida = false;
  9  | 
  10 |     await page.route("**/notificacoes", async (route) => {
  11 |       if (route.request().method() === "GET") {
  12 |         await route.fulfill({
  13 |           status: 200,
  14 |           contentType: "application/json",
  15 |           body: JSON.stringify({
  16 |             notificacoes: [
  17 |               {
  18 |                 id: "notif-1",
  19 |                 tipo: "TAREFA_CRIADA",
  20 |                 titulo: "Nova tarefa no grupo",
  21 |                 mensagem: "Aluguel da casa foi adicionada.",
  22 |                 idGrupo: "grupo-1",
  23 |                 idTarefa: "tarefa-1",
  24 |                 idParte: null,
  25 |                 lidaEm: lida ? "2026-02-01T12:00:00.000Z" : null,
  26 |                 createdAt: "2026-02-01T10:00:00.000Z",
  27 |               },
  28 |             ],
  29 |             naoLidas: lida ? 0 : 1,
  30 |             pagina: 1,
  31 |             limite: 20,
  32 |             temMais: false,
  33 |           }),
  34 |         });
  35 |         return;
  36 |       }
  37 |       await route.continue();
  38 |     });
  39 | 
  40 |     await page.route("**/notificacoes/notif-1/lida", async (route) => {
  41 |       lida = true;
  42 |       await route.fulfill({
  43 |         status: 200,
  44 |         contentType: "application/json",
  45 |         body: JSON.stringify({ ok: true }),
  46 |       });
  47 |     });
  48 | 
  49 |     await page.goto("/notificacoes");
  50 | 
  51 |     await expect(page.getByText("Nova tarefa no grupo")).toBeVisible();
  52 |     await expect(page.getByText("Aluguel da casa foi adicionada.")).toBeVisible();
  53 |   });
  54 | 
  55 |   test("exibe perfil do usuário autenticado", async ({ page }) => {
  56 |     await mockSessaoAutenticada(page);
  57 | 
  58 |     await page.route("**/chaves-pix", async (route) => {
  59 |       await route.fulfill({
  60 |         status: 200,
  61 |         contentType: "application/json",
  62 |         body: JSON.stringify([]),
  63 |       });
  64 |     });
  65 | 
  66 |     await page.goto("/perfil");
  67 | 
> 68 |     await expect(page.getByText("Ana Silva")).toBeVisible();
     |                                               ^ Error: expect(locator).toBeVisible() failed
  69 |     await expect(
  70 |       page.getByDisplayValue("ana@racha.test").or(page.getByText("ana@racha.test")),
  71 |     ).toBeVisible();
  72 |   });
  73 | });
  74 | 
```