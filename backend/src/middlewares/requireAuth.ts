import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  const usuario = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { deletedAt: true },
  });
  if (!usuario || usuario.deletedAt !== null) {
    return res.status(401).json({ error: "Conta desativada" });
  }

  res.locals.user = session.user;
  res.locals.session = session.session;
  next();
}
