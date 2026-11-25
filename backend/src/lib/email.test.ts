import assert from "node:assert/strict";
import test from "node:test";
import {
  escapeHtml,
  renderGroupInviteEmailHtml,
  renderPasswordResetEmailHtml,
  renderVerificationOtpEmailHtml,
} from "./email.js";

test("templates HTML de e-mail renderizam conteúdo e escapam entrada do usuário", () => {
  assert.equal(escapeHtml('<script>"x"</script>'), "&lt;script&gt;&quot;x&quot;&lt;/script&gt;");

  const resetHtml = renderPasswordResetEmailHtml("https://racha.app/redefinir-senha?token=abc");
  assert.match(resetHtml, /Redefinição de senha/);
  assert.match(resetHtml, /Criar nova senha/);
  assert.match(resetHtml, /https:\/\/racha\.app\/redefinir-senha\?token=abc/);

  const otpHtml = renderVerificationOtpEmailHtml("482910");
  assert.match(otpHtml, /Confirme seu e-mail/);
  assert.match(otpHtml, /482910/);

  const inviteHtml = renderGroupInviteEmailHtml({
    groupName: 'Viagem <script>alert(1)</script>',
    inviterName: "Ana & Bruno",
    url: "https://racha.app/convite/tok123",
  });
  assert.match(inviteHtml, /Aceitar convite/);
  assert.match(inviteHtml, /Ana &amp; Bruno/);
  assert.doesNotMatch(inviteHtml, /<script>/);
});
