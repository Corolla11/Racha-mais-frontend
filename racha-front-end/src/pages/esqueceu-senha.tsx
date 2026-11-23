import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import RecuperacaoLayout, { BannerErro } from "../components/recuperacao-layout";
import Icon from "../components/icon";
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

  const bannerErro = error ? (
    <BannerErro
      titulo="Não foi possível enviar o link"
      descricao={error}
      onFechar={() => setError("")}
    />
  ) : null;

  return (
    <RecuperacaoLayout etapa={enviado ? 2 : 1}>
      {enviado ? (
        /* ESTADO 2 — confirmação de envio */
        <div className="flex flex-col space-y-6">
          <div className="p-6 rounded-2xl bg-surface-container-low flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
              <Icon name="mark_email_read" size={30} filled />
            </div>
            <div className="space-y-1.5">
              <h2 className={CR.titulo}>Confira seu e-mail</h2>
              <p className={CR.descricao}>
                Se houver uma conta associada a este endereço, as orientações
                de redefinição serão enviadas para:
              </p>
              <span className="inline-block break-all px-3 py-1 rounded-lg bg-surface-container font-label-md text-xs font-bold text-on-surface">
                {email}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-lowest w-full text-left space-y-2">
              <p className="flex items-center gap-2 text-on-surface font-label-md text-xs font-semibold">
                <Icon name="info" size={16} className="text-primary-container" />
                O que fazer agora?
              </p>
              <ul className="font-body-sm text-xs text-on-surface-variant space-y-1.5 list-disc list-inside">
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

          {bannerErro}

          <div className="space-y-3">
            <Link to="/redefinir-senha" className={CR.botaoPrimario}>
              <span>Já recebi o link (Ir para Nova Senha)</span>
              <Icon name="check_circle" size={18} />
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => void reenviar()}
                disabled={reenviado}
                className="inline-flex items-center gap-1 font-label-sm text-xs font-semibold text-primary hover:underline cursor-pointer disabled:cursor-default disabled:no-underline"
              >
                <Icon name="sync" size={14} />
                {reenviado ? "Novo link solicitado" : "Não recebeu? Reenviar link"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEnviado(false);
                  setReenviado(false);
                  setError("");
                }}
                className="font-label-sm text-xs text-on-surface-variant hover:text-on-surface underline cursor-pointer"
              >
                Alterar e-mail informado
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ESTADO 1 — solicitar link */
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/60 text-on-primary-fixed font-label-sm text-xs font-bold w-fit">
              <Icon name="key" size={14} />
              Passo 1 de 2
            </span>
            <h2 className={CR.titulo}>Esqueceu sua senha?</h2>
            <p className={CR.descricao}>
              Sem problemas! Digite seu e-mail cadastrado e enviaremos um link
              seguro para você redefinir sua senha.
            </p>
          </div>

          <form className="space-y-5" onSubmit={enviar}>
            <div className="space-y-1.5">
              <label htmlFor="email-recuperacao" className={CR.rotulo}>
                E-mail cadastrado
              </label>
              <div className="relative flex items-center">
                <Icon name="mail" size={20} className={CR.iconeCampo} />
                <input
                  id="email-recuperacao"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className={`${CR.campo} pl-11 pr-4 focus:ring-primary-container/60`}
                />
              </div>
              <p className="font-body-sm text-[11px] text-on-surface-variant/70 pl-1">
                Certifique-se de usar o mesmo e-mail associado às suas faturas e rachas.
              </p>
            </div>
            {bannerErro}
            <button type="submit" disabled={enviando} className={CR.botaoPrimario}>
              <span>{enviando ? "Enviando..." : "Enviar link de recuperação"}</span>
              <Icon name="arrow_forward" size={18} />
            </button>
          </form>

          <div className="pt-4 flex items-center justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 font-label-md text-xs font-semibold text-primary hover:text-on-primary-fixed-variant transition-colors group"
            >
              <Icon name="arrow_back" size={14} className="transition-transform group-hover:-translate-x-1" />
              Voltar para o Login
            </Link>
          </div>
        </div>
      )}
    </RecuperacaoLayout>
  );
}
