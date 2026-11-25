import type { Request, Response } from "express";
import { z } from "zod";
import { TAMANHO_MAX_UPLOAD_BYTES, uploadService } from "./upload.service.js";

const presignSchema = z
  .object({
    tipo: z.enum(["comprovante", "avatar"]),
    idParte: z.string().trim().min(1).optional(),
    contentType: z.string().trim().min(1),
    sizeBytes: z
      .number()
      .int()
      .positive("O tamanho deve ser maior que zero")
      .max(TAMANHO_MAX_UPLOAD_BYTES, "O arquivo deve ter no máximo 5 MB"),
  })
  .strict();

export const uploadController = {
  async presign(req: Request, res: Response) {
    const dados = presignSchema.parse(req.body);
    res.json(await uploadService.solicitarPresign(res.locals.user.id, dados));
  },
};
