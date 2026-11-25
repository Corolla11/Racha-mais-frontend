import { Resend } from "resend";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
  context: string;
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type LayoutParams = {
  preheader: string;
  eyebrow: string;
  title: string;
  paragraphs: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  code?: string;
  footerNote: string;
};

export function renderEmailLayout({
  preheader,
  eyebrow,
  title,
  paragraphs,
  ctaLabel,
  ctaUrl,
  code,
  footerNote,
}: LayoutParams): string {
  const safeUrl = ctaUrl ? escapeHtml(ctaUrl) : "";
  const bodyParagraphs = paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:24px;color:#564338;">${p}</p>`,
    )
    .join("");

  const codeBlock = code
    ? `<div style="margin:24px 0;padding:18px 20px;background:#eff4ff;border-radius:12px;text-align:center;">
        <span style="display:inline-block;font-size:32px;font-weight:800;letter-spacing:8px;color:#121c2a;font-variant-numeric:tabular-nums;">${escapeHtml(code)}</span>
      </div>`
    : "";

  const ctaBlock =
    ctaLabel && safeUrl
      ? `<div style="margin:24px 0 20px;">
          <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#c2410c;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;line-height:20px;padding:14px 24px;border-radius:8px;">${escapeHtml(ctaLabel)}</a>
        </div>
        <p style="margin:0 0 16px;font-size:12px;line-height:18px;color:#6f5b50;word-break:break-all;">
          Se o botão não funcionar, copie e cole este link no navegador:<br />
          <a href="${safeUrl}" style="color:#9b4500;text-decoration:underline;">${safeUrl}</a>
        </p>`
      : "";

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f8f9ff;font-family:'Plus Jakarta Sans','Segoe UI',Arial,sans-serif;color:#121c2a;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f9ff;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:540px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(18,28,42,0.06);">
          <tr>
            <td style="background:#c2410c;padding:24px 32px;">
              <span style="font-size:20px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;">Racha+</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <span style="display:inline-block;margin:0 0 12px;padding:4px 12px;background:#ffdbc9;color:#331200;border-radius:9999px;font-size:12px;font-weight:600;">${escapeHtml(eyebrow)}</span>
              <h1 style="margin:0 0 16px;font-size:22px;line-height:30px;font-weight:700;letter-spacing:-0.015em;color:#121c2a;">${escapeHtml(title)}</h1>
              ${bodyParagraphs}
              ${codeBlock}
              ${ctaBlock}
              <hr style="border:none;border-top:1px solid #eff4ff;margin:24px 0 16px;" />
              <p style="margin:0;font-size:12px;line-height:18px;color:#6f5b50;">${escapeHtml(footerNote)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function enviarEmail({ to, subject, text, html, context }: EmailPayload): Promise<void> {
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
    html,
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

export function renderPasswordResetEmailHtml(url: string): string {
  return renderEmailLayout({
    preheader: "Redefina sua senha de acesso ao Racha+.",
    eyebrow: "Segurança da conta",
    title: "Redefinição de senha",
    paragraphs: [
      "Recebemos uma solicitação para redefinir a senha da sua conta <strong style=\"color:#121c2a;\">Racha+</strong>.",
      "Clique no botão abaixo para escolher uma nova senha com segurança:",
    ],
    ctaLabel: "Criar nova senha",
    ctaUrl: url,
    footerNote: "Se você não solicitou essa alteração, ignore este e-mail com segurança.",
  });
}

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
    html: renderPasswordResetEmailHtml(url),
    context: "password reset email",
  });
}

type VerificationOtpEmail = {
  to: string;
  otp: string;
};

export function renderVerificationOtpEmailHtml(otp: string): string {
  return renderEmailLayout({
    preheader: `Seu código de verificação Racha+ é ${otp}.`,
    eyebrow: "Confirmação de e-mail",
    title: "Confirme seu e-mail",
    paragraphs: [
      "Use o código de 6 dígitos abaixo para validar seu endereço de e-mail no <strong style=\"color:#121c2a;\">Racha+</strong>:",
    ],
    code: otp,
    footerNote: "Esse código expira em 5 minutos. Se você não solicitou, ignore este e-mail.",
  });
}

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
    html: renderVerificationOtpEmailHtml(otp),
    context: "verification OTP email",
  });
}

type GroupInviteEmail = {
  to: string;
  groupName: string;
  inviterName: string;
  url: string;
};

export function renderGroupInviteEmailHtml({
  groupName,
  inviterName,
  url,
}: Omit<GroupInviteEmail, "to">): string {
  return renderEmailLayout({
    preheader: `${inviterName} convidou você para o grupo ${groupName}.`,
    eyebrow: "Convite de grupo",
    title: `Você foi convidado para "${groupName}"`,
    paragraphs: [
      `<strong style="color:#121c2a;">${escapeHtml(inviterName)}</strong> convidou você para organizar despesas e tarefas em conjunto no grupo <strong style="color:#121c2a;">${escapeHtml(groupName)}</strong>.`,
      "Aceite o convite abaixo para acessar o grupo no Racha+:",
    ],
    ctaLabel: "Aceitar convite",
    ctaUrl: url,
    footerNote: "Esse convite expira em 7 dias. Se você não esperava este e-mail, ignore.",
  });
}

export async function sendGroupInviteEmail({
  to,
  groupName,
  inviterName,
  url,
}: GroupInviteEmail): Promise<void> {
  await enviarEmail({
    to,
    subject: `Convite para o grupo "${groupName}" no Racha+`,
    text: [
      `${inviterName} convidou você para participar do grupo "${groupName}" no Racha+.`,
      "",
      `Para aceitar o convite, acesse: ${url}`,
      "",
      "Esse convite expira em 7 dias. Se você não esperava este e-mail, ignore.",
    ].join("\n"),
    html: renderGroupInviteEmailHtml({ groupName, inviterName, url }),
    context: "group invite email",
  });
}
