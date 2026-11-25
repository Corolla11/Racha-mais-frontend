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
CREATE UNIQUE INDEX "convite_grupo_tokenHash_key" ON "convite_grupo"("tokenHash");

-- CreateIndex
CREATE INDEX "convite_grupo_idGrupo_idx" ON "convite_grupo"("idGrupo");

-- CreateIndex
CREATE UNIQUE INDEX "convite_grupo_idGrupo_email_key" ON "convite_grupo"("idGrupo", "email");

-- AddForeignKey
ALTER TABLE "convite_grupo" ADD CONSTRAINT "convite_grupo_idGrupo_fkey" FOREIGN KEY ("idGrupo") REFERENCES "grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convite_grupo" ADD CONSTRAINT "convite_grupo_convidadoPorId_fkey" FOREIGN KEY ("convidadoPorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
