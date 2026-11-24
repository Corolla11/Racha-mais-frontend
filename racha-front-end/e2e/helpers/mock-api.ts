import type { Page } from "@playwright/test";

export type MockUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export const USUARIO_PADRAO: MockUser = {
  id: "user-1",
  name: "Ana Silva",
  email: "ana@racha.test",
  image: null,
};

export async function mockSessaoAnonima(page: Page) {
  await page.route("**/api/auth/get-session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(null),
    });
  });
}

export async function mockSessaoAutenticada(page: Page, user: MockUser = USUARIO_PADRAO) {
  await page.route("**/api/auth/get-session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user,
        session: { id: "session-1", userId: user.id },
      }),
    });
  });

  await page.route("**/users/me", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...user,
          createdAt: "2026-01-01T00:00:00.000Z",
          chavesPix: [],
        }),
      });
      return;
    }
    await route.continue();
  });
}
