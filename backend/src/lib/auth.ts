import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";

const resendApiKey = process.env.RESEND_API_KEY;
const resetPasswordSender = process.env.RESET_PASSWORD_EMAIL_FROM;

function escaparHtml(valor: string) {
  return valor.replace(/[&<>"']/g, (caractere) => {
    const entidades: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entidades[caractere]!;
  });
}

export const auth = betterAuth({
  trustedOrigins: (
    process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "http://localhost:5173"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 30 * 60,
    ...(resendApiKey && resetPasswordSender
      ? {
          sendResetPassword: async ({ user, url }) => {
            const response = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: resetPasswordSender,
                to: [user.email],
                subject: "Redefinição de senha do Racha+",
                html: `<p>Olá, ${escaparHtml(user.name)}.</p><p>Recebemos uma solicitação para redefinir sua senha do Racha+.</p><p><a href="${escaparHtml(url)}">Criar uma nova senha</a></p><p>Se você não solicitou esta alteração, ignore este e-mail.</p>`,
              }),
            });

            if (!response.ok) {
              console.error(
                "Falha ao enviar e-mail de redefinição:",
                response.status,
              );
              throw new Error("Não foi possível enviar o e-mail de redefinição");
            }
          },
        }
      : {}),
  },
});
