-- CreateEnum
CREATE TYPE "TipoTarefa" AS ENUM ('comum', 'contribuinte', 'meta', 'recorrente');

-- CreateEnum
CREATE TYPE "StatusAndamento" AS ENUM (
    'AGENDADA',
    'EM_ANDAMENTO',
    'FINALIZADA',
    'ATRASADA',
    'CANCELADA'
);

-- CreateTable
CREATE TABLE "tarefa" (
    "id" TEXT NOT NULL,
    "idGrupo" TEXT NOT NULL,
    "idUser" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "valorTotal" DECIMAL(12,2) NOT NULL,
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
    "idTarefa" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "valor" DECIMAL(12,2) NOT NULL,
    "status" "StatusAndamento" NOT NULL DEFAULT 'AGENDADA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tarefa_idGrupo_idx" ON "tarefa"("idGrupo");

-- CreateIndex
CREATE INDEX "tarefa_idUser_idx" ON "tarefa"("idUser");

-- CreateIndex
CREATE INDEX "parte_idUser_idx" ON "parte"("idUser");

-- CreateIndex
CREATE INDEX "parte_idTarefa_idx" ON "parte"("idTarefa");

-- AddForeignKey
ALTER TABLE "tarefa" ADD CONSTRAINT "tarefa_idGrupo_fkey" FOREIGN KEY ("idGrupo") REFERENCES "grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa" ADD CONSTRAINT "tarefa_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parte" ADD CONSTRAINT "parte_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parte" ADD CONSTRAINT "parte_idTarefa_fkey" FOREIGN KEY ("idTarefa") REFERENCES "tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
