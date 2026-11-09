import { Resend } from "resend";

type PasswordResetEmail = {
  to: string;
  url: string;
};

export async function sendPasswordResetEmail({
  to,
  url,
}: PasswordResetEmail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  if (!from) {
    throw new Error("RESEND_FROM_EMAIL is not configured");
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "Redefinição de senha do Racha+",
    text: [
      "Recebemos uma solicitação para redefinir a senha da sua conta Racha+.",
      "",
      `Para escolher uma nova senha, acesse: ${url}`,
      "",
      "Se você não solicitou essa alteração, ignore este e-mail.",
    ].join("\n"),
  });

  if (error) {
    throw new Error(
      `Resend failed to send the password reset email: ${error.message}`,
    );
  }
  if (!data?.id) {
    throw new Error("Resend did not confirm the password reset email");
  }
}
