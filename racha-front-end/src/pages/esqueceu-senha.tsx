import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  KeyRound,
  Mail,
  MailCheck,
  RefreshCw,
} from "lucide-react";
import RecuperacaoLayout from "../components/recuperacao-layout";
import { ApiError, apiRequest } from "../lib/api";
import { CR } from "../lib/recuperacao-tokens";

export default function EsqueceuSenha() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [reenviado, setReenviado] = useState(false);
  const [error, setError] = useState("");

  async function solicitarRedefinicao(emailAlvo: string) {
    await apiRequest("/api/auth/request-password-reset", {
      method: "POST",
      body: {
        email: emailAlvo,
        redirectTo: `${window.location.origin}/redefinir-senha`,
      },
    });
  }

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await solicitarRedefinicao(email.trim());
      setEnviado(true);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Não foi possível solicitar a recuperação agora.",
      );
    } finally {
      setEnviando(false);
    }
  }

  async function reenviar() {
    setError("");
    try {
      await solicitarRedefinicao(email.trim());
      setReenviado(true);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Não foi possível reenviar o link agora.",
      );
    }
  }

  return (
    <RecuperacaoLayout etapa={enviado ? 2 : 1}>
      {enviado ? (
        <div className="flex flex-col gap-6">
          <div
            className="flex flex-col items-center gap-4 rounded-2xl p-6 text-center"
            style={{ backgroundColor: CR.surfaceLow }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
              <MailCheck className="h-8 w-8" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <h2 className="text-2xl font-bold">Confira seu e-mail</h2>
              <p className="text-sm" style={{ color: CR.onSurfaceVariant }}>
                Se houver uma conta associada a este endereço, as orientações
                de redefinição serão enviadas para:
              </p>
              <span
                className="inline-block break-all rounded-lg px-3 py-1 text-xs font-bold"
                style={{ backgroundColor: CR.surfaceContainer }}
              >
                {email}
              </span>
            </div>
            <div className="w-full space-y-2 rounded-xl bg-white p-4 text-left">
              <p className="flex items-center gap-2 text-xs font-semibold">
                <Info className="h-4 w-4" style={{ color: CR.primaryContainer }} />
                O que fazer agora?
              </p>
              <ul className="list-inside list-disc space-y-1.5 text-xs" style={{ color: CR.onSurfaceVariant }}>
                <li>Abra sua caixa de entrada e clique no link de validação.</li>
                <li>
                  Caso não encontre em 1 minuto, cheque a pasta de{" "}
                  <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>.
                </li>
                <li>
                  O link expira automaticamente em <strong>30 minutos</strong> por segurança.
                </li>
              </ul>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700" role="alert">
              {error}
            </p>
          )}

          <div className="space-y-3">
            <Link
              to="/redefinir-senha"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff8c42] px-6 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#9b4500] hover:shadow-lg active:scale-[0.98]"
            >
              Já recebi o link (Ir para Nova Senha)
              <CheckCircle2 className="h-5 w-5" />
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => void reenviar()}
                disabled={reenviado}
                className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold hover:underline disabled:cursor-default disabled:no-underline"
                style={{ color: CR.primary }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {reenviado ? "Novo link solicitado" : "Não recebeu? Reenviar link"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEnviado(false);
                  setReenviado(false);
                  setError("");
                }}
                className="cursor-pointer text-xs underline hover:text-[#121c2a]"
                style={{ color: CR.onSurfaceVariant }}
              >
                Alterar e-mail informado
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <span
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
              style={{ backgroundColor: `${CR.primaryFixed}99`, color: CR.onPrimaryFixed }}
            >
              <KeyRound className="h-3.5 w-3.5" />
              Passo 1 de 2
            </span>
            <h2 className="text-2xl font-bold tracking-tight">Esqueceu sua senha?</h2>
            <p className="text-sm" style={{ color: CR.onSurfaceVariant }}>
              Sem problemas! Digite seu e-mail cadastrado e enviaremos um link
              seguro para você redefinir sua senha.
            </p>
          </div>

          <form className="space-y-5" onSubmit={enviar}>
            <div className="space-y-1.5">
              <label htmlFor="email-recuperacao" className="block text-xs font-bold">
                E-mail cadastrado
              </label>
              <div className="relative flex items-center">
                <Mail
                  className="pointer-events-none absolute left-3.5 h-5 w-5"
                  style={{ color: `${CR.onSurfaceVariant}99` }}
                />
                <input
                  id="email-recuperacao"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full rounded-xl bg-[#eff4ff] py-3 pl-11 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-[#56433866] focus:bg-white focus:shadow-md focus:ring-2 focus:ring-[#ff8c42]"
                />
              </div>
              <p className="pl-1 text-[11px]" style={{ color: `${CR.onSurfaceVariant}b3` }}>
                Use o mesmo e-mail com que você entra no Racha+.
              </p>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#ff8c42] px-6 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#9b4500] hover:shadow-lg active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
            >
              {enviando ? "Enviando..." : "Enviar link de recuperação"}
              <ArrowRight className="h-[18px] w-[18px]" />
            </button>
          </form>

          <div className="flex items-center justify-center pt-4">
            <Link
              to="/login"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-[#763300]"
              style={{ color: CR.primary }}
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              Voltar para o Login
            </Link>
          </div>
        </div>
      )}
    </RecuperacaoLayout>
  );
}