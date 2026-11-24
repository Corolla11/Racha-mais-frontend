import { expect, test } from "@playwright/test";
import { mockSessaoAnonima, USUARIO_PADRAO } from "./helpers/mock-api";

test.describe("Fluxos de autenticação e rotas públicas", () => {
  test("redireciona usuário não autenticado de /meus-grupos para /login", async ({ page }) => {
    await mockSessaoAnonima(page);

    await page.goto("/meus-grupos");

    await expect(page).toHaveURL(/\/(login)?$/);
    await expect(page.getByRole("button", { name: /^entrar$/i })).toBeVisible();
  });

  test("realiza login com sucesso e navega para /home", async ({ page }) => {
    let autenticado = false;

    await page.route("**/api/auth/get-session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          autenticado
            ? { user: USUARIO_PADRAO, session: { id: "session-1", userId: USUARIO_PADRAO.id } }
            : null,
        ),
      });
    });

    await page.route("**/api/auth/sign-in/email", async (route) => {
      autenticado = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: USUARIO_PADRAO,
          token: "token-teste",
        }),
      });
    });

    await page.route("**/grupos**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/login");
    await page.getByLabel(/e-?mail/i).fill(USUARIO_PADRAO.email);
    await page.getByRole("textbox", { name: "Senha" }).fill("Senha123!");
    await page.getByRole("button", { name: /^entrar$/i }).click();

    await expect(page).toHaveURL(/\/(home|meus-grupos)/);
  });

  test("exibe páginas públicas de cadastro e recuperação de senha", async ({ page }) => {
    await mockSessaoAnonima(page);

    await page.goto("/cadastro");
    await expect(page.getByRole("button", { name: /^criar conta$/i })).toBeVisible();

    await page.goto("/esqueceu-senha");
    await expect(page.getByRole("button", { name: /enviar|recuperar/i })).toBeVisible();
  });

  test("valida código OTP de 6 dígitos em /verificar-email", async ({ page }) => {
    await mockSessaoAnonima(page);

    await page.route("**/api/auth/email-otp/verify-email", async (route) => {
      const body = route.request().postDataJSON() as { email?: string; otp?: string };
      if (body.email === USUARIO_PADRAO.email && body.otp === "123456") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: true, user: USUARIO_PADRAO }),
        });
        return;
      }
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ message: "Código inválido" }),
      });
    });

    await page.goto(`/verificar-email?email=${encodeURIComponent(USUARIO_PADRAO.email)}`);

    for (let i = 0; i < 6; i++) {
      await page.getByLabel(`Dígito ${i + 1}`).fill(String(i + 1));
    }

    await page.getByRole("button", { name: /confirmar e continuar/i }).click();

    await expect(page.getByRole("heading", { name: /e-mail confirmado|verificado/i })).toBeVisible();
  });
});
