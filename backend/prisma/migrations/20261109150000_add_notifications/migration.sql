CREATE TYPE "TipoNotificacao" AS ENUM (
    'MEMBRO_ADICIONADO',
    'TAREFA_CRIADA',
    'COBRANCA_CRIADA',
    'PRAZO_PROXIMO',
    'PRAZO_VENCIDO'
);

CREATE TABLE "notificacao" (
    "id" TEXT NOT NULL,
    "idUser" TEXT NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "idGrupo" TEXT,
    "idTarefa" TEXT,
    "idParte" TEXT,
    "chaveEvento" TEXT NOT NULL,
    "lidaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacao_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notificacao_chaveEvento_key" ON "notificacao"("chaveEvento");
CREATE INDEX "notificacao_idUser_createdAt_idx" ON "notificacao"("idUser", "createdAt");
CREATE INDEX "notificacao_idUser_lidaEm_createdAt_idx" ON "notificacao"("idUser", "lidaEm", "createdAt");

ALTER TABLE "notificacao"
    ADD CONSTRAINT "notificacao_idUser_fkey"
    FOREIGN KEY ("idUser") REFERENCES "user"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
