import { Resend } from "resend";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  context: string;
};

async function enviarEmail({ to, subject, text, context }: EmailPayload): Promise<void> {
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
    subject,
    text,
  });

  if (error) {
    throw new Error(`Resend failed to send the ${context}: ${error.message}`);
  }
  if (!data?.id) {
    throw new Error(`Resend did not confirm the ${context}`);
  }
}

type PasswordResetEmail = {
  to: string;
  url: string;
};

export async function sendPasswordResetEmail({
  to,
  url,
}: PasswordResetEmail): Promise<void> {
  await enviarEmail({
    to,
    subject: "Redefinição de senha do Racha+",
    text: [
      "Recebemos uma solicitação para redefinir a senha da sua conta Racha+.",
      "",
      `Para escolher uma nova senha, acesse: ${url}`,
      "",
      "Se você não solicitou essa alteração, ignore este e-mail.",
    ].join("\n"),
    context: "password reset email",
  });
}

type VerificationOtpEmail = {
  to: string;
  otp: string;
};

export async function sendVerificationOtpEmail({
  to,
  otp,
}: VerificationOtpEmail): Promise<void> {
  await enviarEmail({
    to,
    subject: "Código de verificação do Racha+",
    text: [
      "Use o código abaixo para confirmar seu e-mail no Racha+:",
      "",
      otp,
      "",
      "Esse código expira em 5 minutos. Se você não solicitou, ignore este e-mail.",
    ].join("\n"),
    context: "verification OTP email",
  });
}
