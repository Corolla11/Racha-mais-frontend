import { expect, test } from "@playwright/test";
import { mockSessaoAutenticada } from "./helpers/mock-api";

test.describe("Fluxos de notificações e perfil", () => {
  test("lista notificações e marca como lida", async ({ page }) => {
    await mockSessaoAutenticada(page);

    let lida = false;

    await page.route("**/notificacoes", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            notificacoes: [
              {
                id: "notif-1",
                tipo: "TAREFA_CRIADA",
                titulo: "Nova tarefa no grupo",
                mensagem: "Aluguel da casa foi adicionada.",
                idGrupo: "grupo-1",
                idTarefa: "tarefa-1",
                idParte: null,
                lidaEm: lida ? "2026-02-01T12:00:00.000Z" : null,
                createdAt: "2026-02-01T10:00:00.000Z",
              },
            ],
            naoLidas: lida ? 0 : 1,
            pagina: 1,
            limite: 20,
            temMais: false,
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.route("**/notificacoes/notif-1/lida", async (route) => {
      lida = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto("/notificacoes");

    await expect(page.getByText("Nova tarefa no grupo")).toBeVisible();
    await expect(page.getByText("Aluguel da casa foi adicionada.")).toBeVisible();
  });

  test("exibe perfil do usuário autenticado", async ({ page }) => {
    await mockSessaoAutenticada(page);

    await page.route("**/chaves-pix", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/perfil");

    await expect(page.getByText("Ana Silva")).toBeVisible();
    await expect(
      page.getByDisplayValue("ana@racha.test").or(page.getByText("ana@racha.test")),
    ).toBeVisible();
  });
});
