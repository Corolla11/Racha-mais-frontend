import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { AppError } from "../../../errors/AppError.js";
import { Funcao } from "../../../generated/prisma/enums.js";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const { prisma } = await import("../../../lib/prisma.js");
const { parteService } = await import("../../partes/parte.service.js");
const { userService } = await import("../../users/user.service.js");
const { TAMANHO_MAX_UPLOAD_BYTES, uploadService } = await import(
  "../upload.service.js"
);

function mockProp(obj: object, prop: string, value: unknown) {
  Object.defineProperty(obj, prop, { value, configurable: true, writable: true });
}

const origParte = { ...prisma.parte };
const origGrupo = { ...prisma.grupo };
const origMembro = { ...prisma.membro };
const origTarefa = { ...prisma.tarefa };
const origUser = { ...prisma.user };

const ENV_S3_ORIGINAL = {
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_REGION: process.env.S3_REGION,
  S3_BUCKET: process.env.S3_BUCKET,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE,
};

beforeEach(() => {
  process.env.S3_ENDPOINT = "https://s3.exemplo.local";
  process.env.S3_REGION = "us-east-1";
  process.env.S3_BUCKET = "racha-bucket";
  process.env.S3_ACCESS_KEY_ID = "test-access-key";
  process.env.S3_SECRET_ACCESS_KEY = "test-secret-key";
  process.env.S3_FORCE_PATH_STYLE = "true";
});

afterEach(() => {
  Object.assign(prisma.parte, origParte);
  Object.assign(prisma.grupo, origGrupo);
  Object.assign(prisma.membro, origMembro);
  Object.assign(prisma.tarefa, origTarefa);
  Object.assign(prisma.user, origUser);
  for (const [k, v] of Object.entries(ENV_S3_ORIGINAL)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

describe("uploadService.solicitarPresign", () => {
  it("rejeita tipo MIME não permitido e arquivo acima de 5 MB", async () => {
    await assert.rejects(
      () =>
        uploadService.solicitarPresign("user-1", {
          tipo: "comprovante",
          idParte: "parte-1",
          contentType: "text/html",
          sizeBytes: 100,
        }),
      (err: unknown) => err instanceof AppError && err.statusCode === 400,
    );

    await assert.rejects(
      () =>
        uploadService.solicitarPresign("user-1", {
          tipo: "avatar",
          contentType: "image/png",
          sizeBytes: TAMANHO_MAX_UPLOAD_BYTES + 1,
        }),
      (err: unknown) => err instanceof AppError && err.statusCode === 400,
    );
  });

  it("exige idParte e permissão para comprovante", async () => {
    await assert.rejects(
      () =>
        uploadService.solicitarPresign("user-1", {
          tipo: "comprovante",
          contentType: "application/pdf",
          sizeBytes: 1024,
        }),
      (err: unknown) => err instanceof AppError && err.statusCode === 400,
    );

    mockProp(prisma.parte, "findUnique", async () => ({
      id: "parte-1",
      idUser: "outro-user",
      tarefa: { idGrupo: "grupo-1", idUser: "criador-tarefa" },
    }));
    mockProp(prisma.grupo, "findUnique", async () => ({
      encerradoEm: null,
    }));
    mockProp(prisma.membro, "findUnique", async () => ({
      funcao: Funcao.membro,
    }));

    await assert.rejects(
      () =>
        uploadService.solicitarPresign("user-1", {
          tipo: "comprovante",
          idParte: "parte-1",
          contentType: "application/pdf",
          sizeBytes: 1024,
        }),
      (err: unknown) => err instanceof AppError && err.statusCode === 403,
    );
  });

  it("gera URL assinada e objectKey segura para comprovante e avatar", async () => {
    mockProp(prisma.parte, "findUnique", async () => ({
      id: "parte-1",
      idUser: "user-1",
      tarefa: { idGrupo: "grupo-1", idUser: "criador-tarefa" },
    }));
    mockProp(prisma.grupo, "findUnique", async () => ({
      encerradoEm: null,
    }));

    const comp = await uploadService.solicitarPresign("user-1", {
      tipo: "comprovante",
      idParte: "parte-1",
      contentType: "image/jpeg",
      sizeBytes: 2048,
    });
    assert.match(comp.objectKey, /^comprovantes\/parte-1\/[0-9a-f-]+\.jpg$/);
    assert.match(
      comp.uploadUrl,
      /^https:\/\/s3\.exemplo\.local\/racha-bucket\/comprovantes\/parte-1\//,
    );

    const avatar = await uploadService.solicitarPresign("user-1", {
      tipo: "avatar",
      contentType: "image/webp",
      sizeBytes: 1024,
    });
    assert.match(avatar.objectKey, /^avatares\/user-1\/[0-9a-f-]+\.webp$/);
  });

  it("falha com 503 se S3 não estiver configurado", async () => {
    delete process.env.S3_BUCKET;
    await assert.rejects(
      () =>
        uploadService.solicitarPresign("user-1", {
          tipo: "avatar",
          contentType: "image/png",
          sizeBytes: 512,
        }),
      (err: unknown) => err instanceof AppError && err.statusCode === 503,
    );
  });
});

describe("parteService comprovante", () => {
  it("rejeita comprovanteKey de outra parte e gera URL de leitura para membro", async () => {
    mockProp(prisma.parte, "findUnique", async () => ({
      id: "parte-1",
      idUser: "user-1",
      idTarefa: "tarefa-1",
      descricao: "",
      valor: "10.00",
      status: "AGENDADA",
      comprovanteKey: "comprovantes/parte-1/abc.pdf",
      comprovanteNome: "pix.pdf",
      user: { id: "user-1", name: "Ana", image: null },
      tarefa: { id: "tarefa-1", idGrupo: "grupo-1" },
    }));
    mockProp(prisma.tarefa, "findUnique", async () => ({
      id: "tarefa-1",
      idGrupo: "grupo-1",
      idUser: "criador-1",
      nome: "Conta",
      dataFinal: new Date(),
      valorTotal: "10.00",
    }));
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "user-1",
      idGrupo: "grupo-1",
      funcao: Funcao.membro,
    }));

    await assert.rejects(
      () =>
        parteService.atualizar("user-1", "parte-1", {
          comprovanteKey: "comprovantes/outra-parte/abc.pdf",
        }),
      (err: unknown) => err instanceof AppError && err.statusCode === 400,
    );

    const leitura = await parteService.obterComprovante("user-1", "parte-1");
    assert.equal(leitura.nome, "pix.pdf");
    assert.match(
      leitura.url,
      /^https:\/\/s3\.exemplo\.local\/racha-bucket\/comprovantes\/parte-1\/abc\.pdf/,
    );

    await assert.rejects(
      () =>
        parteService.atualizar("user-1", "parte-1", {
          motivoContestacao: "Não pode contestar própria parte",
        }),
      (err: unknown) => err instanceof AppError && err.statusCode === 403,
    );
  });
});

describe("userService avatar", () => {
  it("valida prefixo do avatar ao atualizar perfil e gera URL assinada de leitura", async () => {
    await assert.rejects(
      () =>
        userService.atualizarPerfil("user-1", {
          image: "avatares/outro-user/foto.png",
        }),
      (err: unknown) => err instanceof AppError && err.statusCode === 400,
    );

    mockProp(prisma.user, "findFirstOrThrow", async () => ({
      image: "avatares/user-1/foto.webp",
    }));
    const avatar = await userService.obterAvatar("user-1", "user-1");
    assert.match(
      avatar.url,
      /^https:\/\/s3\.exemplo\.local\/racha-bucket\/avatares\/user-1\/foto\.webp/,
    );
  });
});
