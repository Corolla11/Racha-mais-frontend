import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { ApiError, apiRequest } from "../src/lib/api.ts";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("apiRequest envia JSON com credentials include e retorna payload", async () => {
  let chamada = null;
  globalThis.fetch = async (url, init) => {
    chamada = { url, init };
    return new Response(JSON.stringify({ id: "g1", nome: "Viagem" }), {
      status: 201,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  };

  const resultado = await apiRequest("/grupos", {
    method: "POST",
    body: { nome: "Viagem" },
  });

  assert.deepEqual(resultado, { id: "g1", nome: "Viagem" });
  assert.equal(chamada.url, "/grupos");
  assert.equal(chamada.init.credentials, "include");
  assert.equal(chamada.init.headers.get("Content-Type"), "application/json");
  assert.equal(chamada.init.body, JSON.stringify({ nome: "Viagem" }));
});

test("apiRequest retorna undefined em resposta 204 No Content", async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 });
  const resultado = await apiRequest("/grupos/g1", { method: "DELETE" });
  assert.equal(resultado, undefined);
});

test("apiRequest lança ApiError com status 0 em falha de rede", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("fetch failed");
  };

  await assert.rejects(
    () => apiRequest("/grupos"),
    (erro) => erro instanceof ApiError && erro.status === 0,
  );
});

test("apiRequest extrai campo error ou message em respostas HTTP de erro", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: "Grupo não encontrado" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });

  await assert.rejects(
    () => apiRequest("/grupos/inexistente"),
    (erro) =>
      erro instanceof ApiError &&
      erro.status === 404 &&
      erro.message === "Grupo não encontrado",
  );
});

test("apiRequest rejeita resposta sem content-type JSON", async () => {
  globalThis.fetch = async () =>
    new Response("<html>502 Bad Gateway</html>", {
      status: 502,
      headers: { "content-type": "text/html" },
    });

  await assert.rejects(
    () => apiRequest("/grupos"),
    (erro) => erro instanceof ApiError && erro.status === 502,
  );
});
