import { expect, test } from "@playwright/test";
import { mockSessaoAutenticada, USUARIO_PADRAO } from "./helpers/mock-api";

const GRUPO_MOCK = {
  id: "grupo-1",
  nome: "Viagem Litoral",
  descricao: "Casa e mercado",
  idDono: USUARIO_PADRAO.id,
  createdAt: "2026-01-10T00:00:00.000Z",
  membros: [
    {
      idUser: USUARIO_PADRAO.id,
      funcao: "dono",
      user: USUARIO_PADRAO,
    },
  ],
};

const TAREFA_MOCK = {
  id: "tarefa-1",
  idGrupo: "grupo-1",
  idUser: USUARIO_PADRAO.id,
  nome: "Aluguel da casa",
  valorTotal: 600,
  dataInicio: "2026-02-01T00:00:00.000Z",
  dataFinal: "2026-02-10T00:00:00.000Z",
  partes: [
    {
      id: "parte-1",
      idUser: USUARIO_PADRAO.id,
      valor: 300,
      status: "PENDENTE",
    },
  ],
};

test.describe("Fluxos de grupos e tarefas", () => {
  test("redireciona /grupo para /meus-grupos e lista grupos", async ({ page }) => {
    await mockSessaoAutenticada(page);

    await page.route("**/grupos", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([GRUPO_MOCK]),
      });
    });

    await page.goto("/grupo");

    await expect(page).toHaveURL(/\/meus-grupos$/);
    await expect(page.getByText("Viagem Litoral")).toBeVisible();
  });

  test("abre detalhes de um grupo e exibe tarefas", async ({ page }) => {
    await mockSessaoAutenticada(page);

    await page.route("**/grupos/grupo-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(GRUPO_MOCK),
      });
    });

    await page.route("**/grupos/grupo-1/membros", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            idUser: USUARIO_PADRAO.id,
            idGrupo: "grupo-1",
            user: USUARIO_PADRAO,
          },
        ]),
      });
    });

    await page.route("**/tarefas**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([TAREFA_MOCK]),
      });
    });

    await page.goto("/grupo/grupo-1");

    await expect(page.getByRole("heading", { name: "Viagem Litoral" })).toBeVisible();
    await expect(page.getByText("Aluguel da casa")).toBeVisible();
  });
});
