import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Clock,
  ExternalLink,
  Lock,
  LockKeyhole,
  Mail,
  MailCheck,
  PieChart,
  RefreshCw,
  Shield,
  ShieldCheck,
} from "lucide-react";

function EsqueceuSenha() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState<string | null>(null);

  function enviarLink(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (enviando || !email.trim()) return;

    setEnviando(true);

    setTimeout(() => {
      setEnviando(false);
      setEmailEnviado(email.trim());
      setEmail("");
    }, 900);
  }

  function tentarOutroEmail() {
    setEmailEnviado(null);
    document.getElementById("recovery-email")?.focus();
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-background text-text-primary selection:bg-primary selection:text-text-primary">
      {/* HEADER */}
      <header className="w-full bg-surface/80 shadow-[0_1px_8px_rgba(11,61,98,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 transition-transform active:scale-95"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-text-primary shadow-sm">
              <PieChart size={20} />
            </div>

            <span className="text-lg font-semibold tracking-tight text-secondary">
              Racha<span className="text-primary">+</span>
            </span>
          </button>

          <div className="flex items-center gap-2 rounded-full bg-input px-3 py-1.5 text-secondary">
            <Lock size={14} />
            <span className="text-[11px] font-semibold">
              Ambiente Seguro SSL
            </span>
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="flex w-full flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="relative mx-auto w-full max-w-xl">
          <div className="pointer-events-none absolute -left-12 -top-16 -z-10 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-8 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

          <div className="rounded-2xl bg-surface p-8 shadow-[0_12px_40px_-8px_rgba(11,61,98,0.08)] sm:p-10">
            {/* Cabeçalho */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-input text-primary shadow-inner">
                  <LockKeyhole size={32} />
                </div>

                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-text-primary shadow-sm">
                  <Shield size={13} />
                </div>
              </div>

              <span className="mb-2 rounded-full bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-secondary">
                Acesso • Proteção de Contas
              </span>

              <h1 className="mt-1 text-[28px] font-semibold tracking-tight">
                Esqueceu sua senha?
              </h1>

              <p className="mt-2 max-w-md text-sm text-text-secondary">
                Não se preocupe! Informe o e-mail associado à sua conta do{" "}
                <strong className="font-semibold text-text-primary">
                  Racha+
                </strong>{" "}
                e enviaremos um link seguro com instruções para você criar uma
                nova senha.
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={enviarLink} className="mt-8 flex flex-col gap-5">
              <div>
                <label
                  htmlFor="recovery-email"
                  className="mb-2 block text-xs font-semibold"
                >
                  E-mail cadastrado
                </label>

                <div className="relative flex items-center">
                  <Mail
                    size={20}
                    className="pointer-events-none absolute left-3.5 text-secondary"
                  />

                  <input
                    id="recovery-email"
                    type="email"
                    required
                    value={email}
                    onChange={(evento) => setEmail(evento.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="h-11 w-full rounded-xl bg-input pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:ring-4 focus:ring-primary/20"
                  />
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-text-secondary">
                  <Clock size={14} className="shrink-0 text-secondary" />

                  <span className="text-[13px]">
                    Enviaremos um link temporário criptografado com validade de
                    30 minutos.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className={`mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold tracking-tight text-text-primary shadow-[0_4px_12px_rgba(242,165,65,0.25)] transition duration-200 hover:bg-tertiary hover:text-white active:scale-[0.99] ${
                  enviando ? "cursor-not-allowed opacity-80" : ""
                }`}
              >
                {enviando ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="text-xs font-semibold">
                      Autenticando requisição...
                    </span>
                  </>
                ) : (
                  <>
                    Enviar link de recuperação
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Sucesso */}
            {emailEnviado && (
              <div
                role="status"
                className="mt-6 rounded-xl bg-input p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-tertiary shadow-sm">
                    <MailCheck size={19} />
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold">
                      E-mail de recuperação despachado!
                    </h4>

                    <p className="mt-0.5 text-[13px] text-text-secondary">
                      Caso haja uma conta associada a{" "}
                      <span className="break-all font-semibold text-secondary">
                        {emailEnviado}
                      </span>
                      , você receberá um token único em instantes. Verifique
                      também a pasta de spam.
                    </p>

                    <button
                      type="button"
                      onClick={tentarOutroEmail}
                      className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-tertiary hover:underline"
                    >
                      Tentar outro e-mail
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Compromisso de segurança */}
            <div className="mt-8 flex items-start gap-3 rounded-xl bg-background/70 p-4">
              <ShieldCheck size={22} className="mt-0.5 shrink-0 text-secondary" />

              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Compromisso de Segurança Racha+
                </span>

                <p className="mt-0.5 text-[13px] leading-relaxed text-text-secondary">
                  Seus saldos, extratos coletivos e chaves Pix continuam{" "}
                  <strong>100% protegidos</strong>. A equipe do Racha+{" "}
                  <strong>nunca</strong> solicita suas senhas bancárias, senhas
                  de acesso ou códigos de confirmação por WhatsApp ou ligação.
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="mt-8 flex flex-col items-center gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-semibold text-secondary transition hover:bg-input hover:text-text-primary"
              >
                <ArrowLeft size={18} />
                Lembrou da senha? Voltar para o Login
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2 text-[13px] text-text-secondary">
                <span>Perdeu o acesso a esta caixa postal?</span>

                <button
                  type="button"
                  onClick={() => navigate("/faq")}
                  className="flex items-center gap-0.5 text-[11px] font-semibold text-tertiary transition hover:text-primary"
                >
                  Fale com o suporte humanizado
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between px-4 text-[13px] text-text-secondary">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              <span>Autenticação em 2 Etapas (2FA) ativa</span>
            </div>

            <div className="flex items-center gap-1.5 text-secondary">
              <Lock size={15} />
              <span className="text-[11px] font-semibold">
                Criptografia RSA 2048-bit
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* RODAPÉ */}
      <footer className="w-full bg-surface py-6 shadow-[0_-1px_8px_rgba(11,61,98,0.03)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-12">
          <p className="text-[13px] text-text-secondary">
            © 2025 Racha+. Gestão inteligente de contas compartilhadas.
          </p>

          <nav className="flex items-center gap-6 text-[13px] text-text-secondary">
            <button type="button" className="transition hover:text-text-primary">
              Privacidade
            </button>

            <button type="button" className="transition hover:text-text-primary">
              Termos de Uso
            </button>

            <button type="button" className="transition hover:text-text-primary">
              Segurança
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default EsqueceuSenha;
