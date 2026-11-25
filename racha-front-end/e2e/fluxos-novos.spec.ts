import { expect, test } from "@playwright/test";
import { mockSessaoAutenticada, USUARIO_PADRAO } from "./helpers/mock-api";

const MEMBRO_2 = {
  id: "user-2",
  name: "Bruno Costa",
  email: "bruno@racha.test",
  image: null,
};

const GRUPO_MOCK = {
  id: "grupo-1",
  nome: "Churrasco S3",
  descricao: "Teste E2E",
  idDono: USUARIO_PADRAO.id,
  createdAt: "2026-01-10T00:00:00.000Z",
  membros: [
    {
      idUser: USUARIO_PADRAO.id,
      funcao: "dono",
      user: USUARIO_PADRAO,
    },
    {
      idUser: MEMBRO_2.id,
      funcao: "membro",
      user: MEMBRO_2,
    },
  ],
};

test.describe("Fluxos novos (comprovante S3, BR Code, sync de partes, convite e avatar)", () => {
  test("envia comprovante via presign S3, exibe BR Code e visualiza comprovante", async ({ page }) => {
    await mockSessaoAutenticada(page);

    let putChamado = false;
    let patchBody: Record<string, unknown> | null = null;

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
          { idUser: USUARIO_PADRAO.id, idGrupo: "grupo-1", funcao: "dono", user: USUARIO_PADRAO },
          { idUser: MEMBRO_2.id, idGrupo: "grupo-1", funcao: "membro", user: MEMBRO_2 },
        ]),
      });
    });

    await page.route("**/tarefas**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "tarefa-1",
            idGrupo: "grupo-1",
            idUser: MEMBRO_2.id,
            nome: "Carvão",
            valorTotal: 100,
            dataInicio: "2026-02-01T12:00:00.000Z",
            dataFinal: "2026-02-10T22:00:00.000Z",
            statusAndamento: "EM_ANDAMENTO",
            partes: [
              { id: "parte-1", idUser: USUARIO_PADRAO.id, valor: "50.00", status: "AGENDADA" },
              { id: "parte-2", idUser: MEMBRO_2.id, valor: "50.00", status: "FINALIZADA" },
            ],
          },
        ]),
      });
    });

    await page.route("**/chaves-pix**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: "pix-1", idUser: MEMBRO_2.id, tipoChave: "telefone", chave: "+5511999998888" },
        ]),
      });
    });

    await page.route("**/uploads/presign", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          uploadUrl: "http://localhost:4173/__mock-s3/comprovante.png",
          objectKey: "comprovantes/parte-1/mock.png",
        }),
      });
    });

    await page.route("**/__mock-s3/**", async (route) => {
      putChamado = route.request().method() === "PUT";
      await route.fulfill({ status: 200, body: "" });
    });

    await page.route("**/partes/parte-1", async (route) => {
      if (route.request().method() === "PATCH") {
        patchBody = route.request().postDataJSON() as Record<string, unknown>;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: "parte-1", status: "EM_ANDAMENTO" }),
        });
        return;
      }
      await route.continue();
    });

    await page.route("**/partes/parte-1/comprovante", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
          nome: "comprovante.png",
        }),
      });
    });

    await page.goto("/grupo/grupo-1");
    await page.getByRole("button", { name: "Pagamentos e comprovantes" }).click();
    await page.getByRole("button", { name: "Ver Detalhes" }).first().click();

    await expect(page.getByText("QR Code Pix (BR Code)")).toBeVisible();

    await page.locator('input[type="file"][accept="image/png,image/jpeg,application/pdf"]').setInputFiles({
      name: "comprovante.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake-png"),
    });

    await page.getByRole("button", { name: "Informar que realizei o Pagamento" }).click();

    await expect(page.getByRole("button", { name: "Visualizar comprovante" })).toBeVisible();
    expect(putChamado).toBe(true);
    expect(patchBody).toMatchObject({
      status: "EM_ANDAMENTO",
      comprovanteKey: "comprovantes/parte-1/mock.png",
      comprovanteNome: "comprovante.png",
      motivoContestacao: null,
    });

    await page.getByRole("button", { name: "Visualizar comprovante" }).click();
    await expect(page.getByText("comprovante.png").first()).toBeVisible();
  });

  test("aceita convite em /convite/:token e envia avatar em /perfil", async ({ page }) => {
    await mockSessaoAutenticada(page);

    await page.route("**/convites/tok-123", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          idGrupo: "grupo-1",
          nomeGrupo: "Viagem Sul",
          nomeConvidante: "Carlos",
          emailMascarado: "an***@racha.test",
          expiresAt: "2026-12-31T00:00:00.000Z",
        }),
      });
    });

    await page.route("**/convites/tok-123/aceitar", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ idGrupo: "grupo-1", nomeGrupo: "Viagem Sul" }),
      });
    });

    await page.route("**/grupos/grupo-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(GRUPO_MOCK),
      });
    });
    await page.route("**/grupos/grupo-1/membros", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
    await page.route("**/tarefas**", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });

    await page.goto("/convite/tok-123");
    await expect(page.getByRole("heading", { name: "Viagem Sul" })).toBeVisible();
    await page.getByRole("button", { name: "Aceitar convite" }).click();
    await expect(page).toHaveURL(/\/grupo\/grupo-1$/);

    let avatarPatchBody: Record<string, unknown> | null = null;
    await page.route("**/uploads/presign", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          uploadUrl: "http://localhost:4173/__mock-s3/avatar.webp",
          objectKey: "avatares/user-1/avatar.webp",
        }),
      });
    });
    await page.route("**/__mock-s3/**", async (route) => {
      await route.fulfill({ status: 200, body: "" });
    });
    await page.route("**/users/me", async (route) => {
      if (route.request().method() === "PATCH") {
        avatarPatchBody = route.request().postDataJSON() as Record<string, unknown>;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ...USUARIO_PADRAO,
            image: "avatares/user-1/avatar.webp",
            createdAt: "2026-01-01T00:00:00.000Z",
            chavesPix: [],
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...USUARIO_PADRAO,
          createdAt: "2026-01-01T00:00:00.000Z",
          chavesPix: [],
        }),
      });
    });
    await page.route("**/users/user-1/avatar", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        }),
      });
    });

    await page.goto("/perfil");
    await expect(page.getByText("@ana")).toBeVisible();
    await page.locator('input[type="file"][accept="image/jpeg,image/png,image/webp"]').setInputFiles({
      name: "avatar.webp",
      mimeType: "image/webp",
      buffer: Buffer.from("fake-webp"),
    });

    await expect(page.getByText("Foto de perfil atualizada.")).toBeVisible();
    expect(avatarPatchBody).toEqual({ image: "avatares/user-1/avatar.webp" });
  });
});
