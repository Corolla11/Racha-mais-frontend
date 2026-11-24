# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Fluxos de autenticação e rotas públicas >> exibe páginas públicas de cadastro e recuperação de senha
- Location: e2e/auth.spec.ts:57:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /^criar conta$/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: /^criar conta$/i }) with timeout 5000ms
  - waiting for getByRole('button', { name: /^criar conta$/i })

```

```yaml
- main: Verificando sua sessão...
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | import { mockSessaoAnonima, USUARIO_PADRAO } from "./helpers/mock-api";
  3  | 
  4  | test.describe("Fluxos de autenticação e rotas públicas", () => {
  5  |   test("redireciona usuário não autenticado de /meus-grupos para /login", async ({ page }) => {
  6  |     await mockSessaoAnonima(page);
  7  | 
  8  |     await page.goto("/meus-grupos");
  9  | 
  10 |     await expect(page).toHaveURL(/\/(login)?$/);
  11 |     await expect(page.getByRole("button", { name: /^entrar$/i })).toBeVisible();
  12 |   });
  13 | 
  14 |   test("realiza login com sucesso e navega para /home", async ({ page }) => {
  15 |     let autenticado = false;
  16 | 
  17 |     await page.route("**/api/auth/get-session", async (route) => {
  18 |       await route.fulfill({
  19 |         status: 200,
  20 |         contentType: "application/json",
  21 |         body: JSON.stringify(
  22 |           autenticado
  23 |             ? { user: USUARIO_PADRAO, session: { id: "session-1", userId: USUARIO_PADRAO.id } }
  24 |             : null,
  25 |         ),
  26 |       });
  27 |     });
  28 | 
  29 |     await page.route("**/api/auth/sign-in/email", async (route) => {
  30 |       autenticado = true;
  31 |       await route.fulfill({
  32 |         status: 200,
  33 |         contentType: "application/json",
  34 |         body: JSON.stringify({
  35 |           user: USUARIO_PADRAO,
  36 |           token: "token-teste",
  37 |         }),
  38 |       });
  39 |     });
  40 | 
  41 |     await page.route("**/grupos**", async (route) => {
  42 |       await route.fulfill({
  43 |         status: 200,
  44 |         contentType: "application/json",
  45 |         body: JSON.stringify([]),
  46 |       });
  47 |     });
  48 | 
  49 |     await page.goto("/login");
  50 |     await page.getByLabel(/e-?mail/i).fill(USUARIO_PADRAO.email);
  51 |     await page.getByRole("textbox", { name: "Senha" }).fill("Senha123!");
  52 |     await page.getByRole("button", { name: /^entrar$/i }).click();
  53 | 
  54 |     await expect(page).toHaveURL(/\/(home|meus-grupos)/);
  55 |   });
  56 | 
  57 |   test("exibe páginas públicas de cadastro e recuperação de senha", async ({ page }) => {
  58 |     await mockSessaoAnonima(page);
  59 | 
  60 |     await page.goto("/cadastro");
> 61 |     await expect(page.getByRole("button", { name: /^criar conta$/i })).toBeVisible();
     |                                                                        ^ Error: expect(locator).toBeVisible() failed
  62 | 
  63 |     await page.goto("/esqueceu-senha");
  64 |     await expect(page.getByRole("button", { name: /enviar|recuperar/i })).toBeVisible();
  65 |   });
  66 | });
  67 | 
```