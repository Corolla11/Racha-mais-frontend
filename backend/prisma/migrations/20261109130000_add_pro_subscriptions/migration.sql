CREATE TYPE "CicloPlano" AS ENUM ('mensal', 'anual');

CREATE TYPE "StatusAssinaturaPro" AS ENUM (
    'PENDENTE',
    'ATIVA',
    'CANCELADA',
    'FALHOU'
);

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

CREATE TABLE "evento_abacate_pay" (
    "id" TEXT NOT NULL,
    "evento" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evento_abacate_pay_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "assinatura_pro_idGrupo_key" ON "assinatura_pro"("idGrupo");
CREATE UNIQUE INDEX "assinatura_pro_providerCheckoutId_key" ON "assinatura_pro"("providerCheckoutId");
CREATE UNIQUE INDEX "assinatura_pro_providerSubscriptionId_key" ON "assinatura_pro"("providerSubscriptionId");

ALTER TABLE "assinatura_pro"
    ADD CONSTRAINT "assinatura_pro_idGrupo_fkey"
    FOREIGN KEY ("idGrupo") REFERENCES "grupo"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "assinatura_pro"
    ADD CONSTRAINT "assinatura_pro_idUser_fkey"
    FOREIGN KEY ("idUser") REFERENCES "user"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
