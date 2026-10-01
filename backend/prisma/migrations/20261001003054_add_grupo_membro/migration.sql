-- CreateEnum
CREATE TYPE "Funcao" AS ENUM ('dono', 'membro');

-- CreateTable
CREATE TABLE "grupo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
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

-- CreateIndex
CREATE INDEX "membro_idGrupo_idx" ON "membro"("idGrupo");

-- AddForeignKey
ALTER TABLE "membro" ADD CONSTRAINT "membro_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membro" ADD CONSTRAINT "membro_idGrupo_fkey" FOREIGN KEY ("idGrupo") REFERENCES "grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
