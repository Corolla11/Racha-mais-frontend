import test from "node:test";
import assert from "node:assert/strict";
import { ENDPOINTS } from "../src/lib/endpoints.ts";

test("ENDPOINTS aplica encodeURIComponent em identificadores dinâmicos", () => {
  assert.equal(ENDPOINTS.users.byId("u/1?x=1"), "/users/u%2F1%3Fx%3D1");
  assert.equal(ENDPOINTS.users.avatar("u/1?x=1"), "/users/u%2F1%3Fx%3D1/avatar");
  assert.equal(ENDPOINTS.grupos.byId("g #1"), "/grupos/g%20%231");
  assert.equal(
    ENDPOINTS.grupos.membroById("g/1", "u/2"),
    "/grupos/g%2F1/membros/u%2F2",
  );
  assert.equal(ENDPOINTS.tarefas.partes("t/9"), "/tarefas/t%2F9/partes");
  assert.equal(ENDPOINTS.partes.byId("p?2"), "/partes/p%3F2");
  assert.equal(ENDPOINTS.partes.comprovante("p?2"), "/partes/p%3F2/comprovante");
  assert.equal(ENDPOINTS.uploads.presign, "/uploads/presign");
  assert.equal(ENDPOINTS.chavesPix.byId("c#3"), "/chaves-pix/c%233");
  assert.equal(ENDPOINTS.assinaturas.doGrupo("g/1"), "/assinaturas/grupos/g%2F1");
  assert.equal(
    ENDPOINTS.assinaturas.checkoutPro("g?2"),
    "/assinaturas/grupos/g%3F2/pro/checkout",
  );
  assert.equal(
    ENDPOINTS.assinaturas.cancelar("g#3"),
    "/assinaturas/grupos/g%233/cancel",
  );
  assert.equal(
    ENDPOINTS.grupos.convites("g/1"),
    "/grupos/g%2F1/convites",
  );
  assert.equal(
    ENDPOINTS.convites.aceitar("t/1?x"),
    "/convites/t%2F1%3Fx/aceitar",
  );
});
