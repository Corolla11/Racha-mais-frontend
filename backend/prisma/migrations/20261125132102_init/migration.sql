-- CreateEnum
CREATE TYPE "Funcao" AS ENUM ('dono', 'membro');

-- CreateEnum
CREATE TYPE "TipoTarefa" AS ENUM ('comum', 'contribuinte', 'meta', 'recorrente');

-- CreateEnum
CREATE TYPE "StatusAndamento" AS ENUM ('AGENDADA', 'EM_ANDAMENTO', 'FINALIZADA', 'ATRASADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoChave" AS ENUM ('telefone', 'cpf', 'email', 'aleatoria');

-- CreateEnum
CREATE TYPE "CicloPlano" AS ENUM ('mensal', 'anual');

-- CreateEnum
CREATE TYPE "StatusAssinaturaPro" AS ENUM ('PENDENTE', 'ATIVA', 'CANCELADA', 'FALHOU');

-- CreateEnum
CREATE TYPE "TipoNotificacao" AS ENUM ('MEMBRO_ADICIONADO', 'TAREFA_CRIADA', 'COBRANCA_CRIADA', 'PRAZO_PROXIMO', 'PRAZO_VENCIDO');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "bio" TEXT NOT NULL DEFAULT '',
    "cidade" TEXT NOT NULL DEFAULT '',
    "telefone" TEXT NOT NULL DEFAULT '',
    "notificarDespesas" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "encerradoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membro" (
    "idUser" TEXT NOT NULL,
    "idGrupo" TEXT NOT NULL,
    "funcao" "Funcao" NOT NULL DEFAULT 'membro',

    CONSTRAINT "membro_pkey" PRIMARY KEY ("idUser","idGrupo")
);

-- CreateTable
CREATE TABLE "tarefa" (
    "id" TEXT NOT NULL,
    "idGrupo" TEXT NOT NULL,
    "idUser" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "valorTotal" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFinal" TIMESTAMP(3) NOT NULL,
    "tipoTarefa" "TipoTarefa" NOT NULL,
    "statusAndamento" "StatusAndamento" NOT NULL DEFAULT 'AGENDADA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parte" (
    "id" TEXT NOT NULL,
    "idUser" TEXT NOT NULL,
    "idGrupo" TEXT,
    "idTarefa" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "valor" DECIMAL(12,2) NOT NULL,
    "status" "StatusAndamento" NOT NULL DEFAULT 'AGENDADA',
    "comprovanteKey" TEXT,
    "comprovanteNome" TEXT,
    "motivoContestacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chave_pix" (
    "id" TEXT NOT NULL,
    "idUser" TEXT NOT NULL,
    "tipoChave" "TipoChave" NOT NULL,
    "chave" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chave_pix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assinatura_pro" (
    "id" TEXT NOT NULL,
    "idGrupo" TEXT NOT NULL,
    "idUser" TEXT,
    "ciclo" "CicloPlano" NOT NULL,
    "status" "StatusAssinaturaPro" NOT NULL DEFAULT 'PENDENTE',
    "valorCentavos" INTEGER NOT NULL,
    "providerCheckoutId" TEXT,
    "providerSubscriptionId" TEXT,
    "checkoutUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assinatura_pro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evento_abacate_pay" (
    "id" TEXT NOT NULL,
    "evento" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evento_abacate_pay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "convite_grupo" (
    "id" TEXT NOT NULL,
    "idGrupo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "convidadoPorId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "aceitoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "convite_grupo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "membro_idGrupo_idx" ON "membro"("idGrupo");

-- CreateIndex
CREATE INDEX "tarefa_idGrupo_idx" ON "tarefa"("idGrupo");

-- CreateIndex
CREATE INDEX "tarefa_idUser_idx" ON "tarefa"("idUser");

-- CreateIndex
CREATE INDEX "tarefa_idUser_idGrupo_idx" ON "tarefa"("idUser", "idGrupo");

-- CreateIndex
CREATE INDEX "parte_idUser_idx" ON "parte"("idUser");

-- CreateIndex
CREATE INDEX "parte_idTarefa_idx" ON "parte"("idTarefa");

-- CreateIndex
CREATE INDEX "parte_idUser_idGrupo_idx" ON "parte"("idUser", "idGrupo");

-- CreateIndex
CREATE UNIQUE INDEX "chave_pix_chave_key" ON "chave_pix"("chave");

-- CreateIndex
CREATE INDEX "chave_pix_idUser_idx" ON "chave_pix"("idUser");

-- CreateIndex
CREATE UNIQUE INDEX "assinatura_pro_idGrupo_key" ON "assinatura_pro"("idGrupo");

-- CreateIndex
CREATE UNIQUE INDEX "assinatura_pro_providerCheckoutId_key" ON "assinatura_pro"("providerCheckoutId");

-- CreateIndex
CREATE UNIQUE INDEX "assinatura_pro_providerSubscriptionId_key" ON "assinatura_pro"("providerSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "notificacao_chaveEvento_key" ON "notificacao"("chaveEvento");

-- CreateIndex
CREATE INDEX "notificacao_idUser_createdAt_idx" ON "notificacao"("idUser", "createdAt");

-- CreateIndex
CREATE INDEX "notificacao_idUser_lidaEm_createdAt_idx" ON "notificacao"("idUser", "lidaEm", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "convite_grupo_tokenHash_key" ON "convite_grupo"("tokenHash");

-- CreateIndex
CREATE INDEX "convite_grupo_idGrupo_idx" ON "convite_grupo"("idGrupo");

-- CreateIndex
CREATE UNIQUE INDEX "convite_grupo_idGrupo_email_key" ON "convite_grupo"("idGrupo", "email");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membro" ADD CONSTRAINT "membro_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membro" ADD CONSTRAINT "membro_idGrupo_fkey" FOREIGN KEY ("idGrupo") REFERENCES "grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa" ADD CONSTRAINT "tarefa_idGrupo_fkey" FOREIGN KEY ("idGrupo") REFERENCES "grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa" ADD CONSTRAINT "tarefa_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa" ADD CONSTRAINT "tarefa_idUser_idGrupo_fkey" FOREIGN KEY ("idUser", "idGrupo") REFERENCES "membro"("idUser", "idGrupo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parte" ADD CONSTRAINT "parte_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parte" ADD CONSTRAINT "parte_idUser_idGrupo_fkey" FOREIGN KEY ("idUser", "idGrupo") REFERENCES "membro"("idUser", "idGrupo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parte" ADD CONSTRAINT "parte_idTarefa_fkey" FOREIGN KEY ("idTarefa") REFERENCES "tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chave_pix" ADD CONSTRAINT "chave_pix_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinatura_pro" ADD CONSTRAINT "assinatura_pro_idGrupo_fkey" FOREIGN KEY ("idGrupo") REFERENCES "grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinatura_pro" ADD CONSTRAINT "assinatura_pro_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacao" ADD CONSTRAINT "notificacao_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convite_grupo" ADD CONSTRAINT "convite_grupo_idGrupo_fkey" FOREIGN KEY ("idGrupo") REFERENCES "grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convite_grupo" ADD CONSTRAINT "convite_grupo_convidadoPorId_fkey" FOREIGN KEY ("convidadoPorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
