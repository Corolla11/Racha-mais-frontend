import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";
import { Prisma } from "../generated/prisma/client.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    const message = err.issues.map((i) => i.message).join("; ");
    return res.status(400).json({ error: message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Recurso não encontrado" });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Conflito com o estado atual do recurso" });
    }
  }

  console.error(err);
  return res.status(500).json({ error: "Erro interno do servidor" });
}
