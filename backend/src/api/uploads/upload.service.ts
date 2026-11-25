import { randomUUID } from "node:crypto";
import { AppError } from "../../errors/AppError.js";
import { Funcao } from "../../generated/prisma/enums.js";
import { exigirGrupoAberto } from "../../lib/grupo-helpers.js";
import { prisma } from "../../lib/prisma.js";
import { criarUrlUploadAssinada } from "../../lib/s3.js";

export const TAMANHO_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const EXTENSAO_POR_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

const MIMES_POR_TIPO = {
  comprovante: new Set(["image/jpeg", "image/png", "application/pdf"]),
  avatar: new Set(["image/jpeg", "image/png", "image/webp"]),
} as const;

export type TipoUpload = keyof typeof MIMES_POR_TIPO;

export interface SolicitarPresignInput {
  tipo: TipoUpload;
  idParte?: string;
  contentType: string;
  sizeBytes: number;
}

export const uploadService = {
  async solicitarPresign(idSolicitante: string, dados: SolicitarPresignInput) {
    const mimesPermitidos = MIMES_POR_TIPO[dados.tipo];
    if (!mimesPermitidos.has(dados.contentType)) {
      throw new AppError(400, "Tipo de arquivo não permitido");
    }
    if (dados.sizeBytes <= 0 || dados.sizeBytes > TAMANHO_MAX_UPLOAD_BYTES) {
      throw new AppError(400, "O arquivo deve ter entre 1 byte e 5 MB");
    }

    const ext = EXTENSAO_POR_MIME[dados.contentType];
    let objectKey: string;

    if (dados.tipo === "comprovante") {
      if (!dados.idParte) {
        throw new AppError(400, "idParte é obrigatório para comprovante");
      }
      const parte = await prisma.parte.findUnique({
        where: { id: dados.idParte },
        select: {
          id: true,
          idUser: true,
          tarefa: { select: { idGrupo: true, idUser: true } },
        },
      });
      if (!parte) {
        throw new AppError(404, "Parte não encontrada");
      }
      if (parte.tarefa.idGrupo) {
        await exigirGrupoAberto(prisma, parte.tarefa.idGrupo);
      }

      let autorizado =
        parte.idUser === idSolicitante || parte.tarefa.idUser === idSolicitante;
      if (!autorizado && parte.tarefa.idGrupo) {
        const membro = await prisma.membro.findUnique({
          where: {
            idUser_idGrupo: {
              idUser: idSolicitante,
              idGrupo: parte.tarefa.idGrupo,
            },
          },
          select: { funcao: true },
        });
        autorizado = membro?.funcao === Funcao.dono;
      }
      if (!autorizado) {
        throw new AppError(
          403,
          "Você não tem permissão para enviar comprovante desta parte",
        );
      }

      objectKey = `comprovantes/${parte.id}/${randomUUID()}.${ext}`;
    } else {
      objectKey = `avatares/${idSolicitante}/${randomUUID()}.${ext}`;
    }

    const uploadUrl = await criarUrlUploadAssinada({
      key: objectKey,
      contentType: dados.contentType,
      contentLength: dados.sizeBytes,
    });

    return { uploadUrl, objectKey };
  },
};
