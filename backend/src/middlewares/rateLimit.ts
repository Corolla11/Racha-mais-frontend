import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

// shortcut: in-memory rate limit per process; move to Redis when running multiple instances
export function criarLimitadorPorUsuario(
  limite = 10,
  janelaMs = 60_000,
  mensagem = "Muitas solicitações. Aguarde um minuto e tente novamente.",
) {
  const historico = new Map<string, number[]>();
  return (req: Request, res: Response, next: NextFunction) => {
    const idUser = String(res.locals.user?.id ?? req.ip ?? "anon");
    const agora = Date.now();
    const corte = agora - janelaMs;

    for (const [chave, timestamps] of historico) {
      const ativos = timestamps.filter((t) => t > corte);
      if (ativos.length === 0) historico.delete(chave);
      else historico.set(chave, ativos);
    }

    const recentes = historico.get(idUser) ?? [];
    if (recentes.length >= limite) {
      return next(new AppError(429, mensagem));
    }
    historico.set(idUser, [...recentes, agora]);
    next();
  };
}
