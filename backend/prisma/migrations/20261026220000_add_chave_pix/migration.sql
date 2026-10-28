CREATE TYPE "TipoChave" AS ENUM ('telefone', 'cpf', 'email', 'aleatoria');

CREATE TABLE "chave_pix" (
    "id" TEXT NOT NULL,
    "idUser" TEXT NOT NULL,
    "tipoChave" "TipoChave" NOT NULL,
    "chave" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chave_pix_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "chave_pix_chave_key" ON "chave_pix"("chave");
CREATE INDEX "chave_pix_idUser_idx" ON "chave_pix"("idUser");

ALTER TABLE "chave_pix"
ADD CONSTRAINT "chave_pix_idUser_fkey"
FOREIGN KEY ("idUser") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
