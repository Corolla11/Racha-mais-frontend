-- CreateEnum
CREATE TYPE "TipoChave" AS ENUM ('telefone', 'cpf', 'email', 'aleatoria');

-- AlterTable
ALTER TABLE "tarefa" ALTER COLUMN "valorTotal" SET DEFAULT 0.0;

-- AlterTable
ALTER TABLE "parte" ADD COLUMN "idGrupo" TEXT;

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

-- CreateIndex
CREATE UNIQUE INDEX "chave_pix_chave_key" ON "chave_pix"("chave");

-- CreateIndex
CREATE INDEX "chave_pix_idUser_idx" ON "chave_pix"("idUser");

-- CreateIndex
CREATE INDEX "tarefa_idUser_idGrupo_idx" ON "tarefa"("idUser", "idGrupo");

-- CreateIndex
CREATE INDEX "parte_idUser_idGrupo_idx" ON "parte"("idUser", "idGrupo");

-- AddForeignKey
ALTER TABLE "chave_pix" ADD CONSTRAINT "chave_pix_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa" ADD CONSTRAINT "tarefa_idUser_idGrupo_fkey" FOREIGN KEY ("idUser", "idGrupo") REFERENCES "membro"("idUser", "idGrupo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parte" ADD CONSTRAINT "parte_idUser_idGrupo_fkey" FOREIGN KEY ("idUser", "idGrupo") REFERENCES "membro"("idUser", "idGrupo") ON DELETE CASCADE ON UPDATE CASCADE;
