import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import { ApiError } from "../lib/api";
import { BrandMark } from "../components/brand-logo";
import Icon from "../components/icon";

const DESTAQUES = [
  { icone: "verified_user", titulo: "Dados protegidos", texto: "Privacidade total nas suas despesas" },
  { icone: "bolt", titulo: "Ativação Imediata", texto: "Acesso instantâneo a todos os grupos" },
];

const DIGITOS = 6;
const ESPERA_REENVIO = 60;

function formatarTempo(segundos: number) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function VerificarEmail() {
  const navigate = useNavigate();
  const { user, sendEmailVerificationOtp, verifyEmailOtp } = useAuth();
  const [parametros] = useSearchParams();
  const estado = useLocation().state as {
    email?: unknown;
    from?: { pathname?: unknown };
  } | null;

  const emailInicial =
    (typeof estado?.email === "string" && estado.email) ||
    parametros.get("email") ||
    user?.email ||
    "";

  const [email, setEmail] = useState(emailInicial);
  const [editandoEmail, setEditandoEmail] = useState(!emailInicial);
  const [novoEmail, setNovoEmail] = useState(emailInicial);

  const [codigo, setCodigo] = useState<string[]>(() => Array(DIGITOS).fill(""));
  const campos = useRef<(HTMLInputElement | null)[]>([]);

  const [restante, setRestante] = useState(ESPERA_REENVIO);
  const [reenviado, setReenviado] = useState(false);
  const [status, setStatus] = useState<"inicial" | "validando" | "verificado">("inicial");
  const [erro, setErro] = useState("");

  // Contagem regressiva para liberar o reenvio
  useEffect(() => {
    if (restante <= 0) return;
    const id = window.setTimeout(() => setRestante((valor) => valor - 1), 1000);
    return () => window.clearTimeout(id);
  }, [restante]);

  // Esconde o aviso de reenvio depois de alguns segundos
  useEffect(() => {
    if (!reenviado) return;
    const id = window.setTimeout(() => setReenviado(false), 4000);
    return () => window.clearTimeout(id);
  }, [reenviado]);

  function focar(indice: number) {
    const campo = campos.current[Math.max(0, Math.min(DIGITOS - 1, indice))];
    campo?.focus();
    campo?.select();
  }

  function preencher(indice: number, valor: string) {
    const digito = valor.replace(/\D/g, "").slice(-1);
    setCodigo((anterior) => {
      const proximo = [...anterior];
      proximo[indice] = digito;
      return proximo;
    });
    setErro("");
    if (digito && indice < DIGITOS - 1) focar(indice + 1);
  }

  function aoTeclar(indice: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !codigo[indice] && indice > 0) {
      event.preventDefault();
      focar(indice - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focar(indice - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focar(indice + 1);
    }
  }

  function aoColar(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const colado = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGITOS);
    if (!colado) return;
    setCodigo(Array.from({ length: DIGITOS }, (_, i) => colado[i] ?? ""));
    setErro("");
    focar(Math.min(colado.length, DIGITOS - 1));
  }

  async function reenviar() {
    if (!email) return;
    setErro("");
    try {
      await sendEmailVerificationOtp(email);
      setRestante(ESPERA_REENVIO);
      setReenviado(true);
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível reenviar o código.",
      );
    }
  }

  function salvarEmail() {
    const valor = novoEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return;
    setEmail(valor);
    setEditandoEmail(false);
    setCodigo(Array(DIGITOS).fill(""));
    void reenviar();
  }

  async function confirmar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const vazio = codigo.findIndex((d) => !d);
    if (vazio !== -1) {
      setErro("Digite os 6 dígitos do código.");
      focar(vazio);
      return;
    }
    setErro("");
    setStatus("validando");
    try {
      await verifyEmailOtp(email, codigo.join(""));
      setStatus("verificado");
    } catch (error) {
      setStatus("inicial");
      setErro(
        error instanceof ApiError
          ? error.message
          : "Código inválido ou expirado.",
      );
    }
  }

  const verificado = status === "verificado";

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen w-full flex flex-col md:flex-row">
      {/* PAINEL ESQUERDO — laranja (mesma linguagem das telas de login/cadastro) */}
      <section className="hidden md:flex w-full md:w-1/2 lg:w-5/12 bg-gradient-to-br from-primary-container to-primary text-on-primary flex-col justify-between p-8 sm:p-12 lg:p-16 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />

        {/* Marca */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <Link to="/login" className="inline-flex items-center gap-3 min-h-11" aria-label="Racha+, voltar para o login">
            <BrandMark size={44} className="rounded-xl shadow-md" />
            <span className="flex flex-col">
              <span className="font-display text-headline-sm text-on-primary tracking-tight font-extrabold leading-none">
                Racha<span className="text-tertiary-fixed ml-0.5">+</span>
              </span>
              <span className="font-label-sm text-on-primary/80 uppercase tracking-wider text-[10px] mt-1">
                Finanças em Grupo
              </span>
            </span>
          </Link>
        </div>

        {/* Chamada principal */}
        <div className="relative z-10 my-auto py-10 flex flex-col gap-6 max-w-lg">
          <span className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white/20 text-on-primary text-label-sm font-label-sm font-semibold backdrop-blur-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-on-primary animate-pulse" />
            Etapa 2 de 2 • Verificação de Segurança
          </span>
          <h2 className="font-display text-display-mobile lg:text-display text-on-primary font-extrabold leading-tight tracking-tight">
            Falta pouco para começar a rachar.
          </h2>
          <p className="font-body-lg text-body-lg text-on-primary/90 leading-relaxed font-normal max-w-md">
            Confirme seu e-mail para proteger sua conta e liberar o acesso aos
            seus grupos, despesas e acertos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {DESTAQUES.map(({ icone, titulo, texto }) => (
              <div key={titulo} className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Icon name={icone} size={16} className="text-on-primary" />
                </span>
                <span>
                  <span className="block font-label-md text-on-primary text-xs font-semibold">{titulo}</span>
                  <span className="block font-body-sm text-on-primary/80 text-[11px]">{texto}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Selo */}
        <div className="relative z-10 pt-6 border-t border-on-primary/15 flex items-center gap-2.5">
          <Icon name="lock" size={20} className="text-on-primary" />
          <p className="font-label-md text-on-primary text-sm font-semibold tracking-wide">
            Código de uso único <span className="opacity-60 mx-1">•</span> Expira em poucos minutos
          </p>
        </div>
      </section>

      {/* PAINEL DIREITO — verificação */}
      <section className="w-full md:w-1/2 lg:w-7/12 bg-surface-container-lowest flex flex-col justify-between px-6 py-10 sm:px-12 lg:px-20">
        <main className="w-full max-w-[440px] mx-auto my-auto flex flex-col py-6">
          {/* Ícone */}
          <div className="relative mb-6 self-start">
            <div className="absolute inset-0 scale-125 rounded-2xl bg-primary-container/30 blur-xl" />
            <div className="relative w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center">
              <span className="w-12 h-12 rounded-xl bg-primary-container/15 text-primary flex items-center justify-center">
                <Icon name={verificado ? "check_circle" : "mark_email_read"} size={28} filled={verificado} />
              </span>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
                <Icon name="lock" size={12} filled />
              </span>
            </div>
          </div>

          {verificado ? (
            <>
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-xs font-bold w-fit">
                  <Icon name="verified" size={14} />
                  Verificação concluída
                </span>
                <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  E-mail verificado!
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  Tudo certo com <strong className="text-on-surface break-all">{email}</strong>. Você já
                  pode acessar suas divisões.
                </p>
              </div>
              <p className="mb-6 flex items-start gap-2 rounded-xl bg-primary-fixed/60 px-3 py-2 font-body-sm text-xs text-on-primary-fixed">
                <Icon name="science" size={16} className="shrink-0" />
                Prévia: a verificação por código ainda não está ativa no servidor.
              </p>
              <button
                type="button"
                onClick={() => {
                  const origem = estado?.from?.pathname;
                  const destino =
                    typeof origem === "string" && origem.startsWith("/") ? origem : null;
                  if (user) {
                    navigate(destino ?? "/meus-grupos", { replace: true });
                  } else {
                    navigate("/login", {
                      replace: true,
                      state: destino ? { from: { pathname: destino } } : undefined,
                    });
                  }
                }}
                className="w-full py-3.5 px-6 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg font-semibold shadow-sm hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                <span>{user ? "Ir para meus grupos" : "Ir para o login"}</span>
                <Icon name="arrow_forward" size={18} />
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  Verifique seu e-mail
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  Enviamos um código de 6 dígitos para o endereço informado.
                  Insira-o para validar sua identidade e acessar suas divisões.
                </p>
              </div>

              {editandoEmail ? (
                <div className="mb-6 w-full rounded-xl bg-surface-container-low p-3 text-left">
                  <label htmlFor="novo-email" className="mb-1.5 block font-label-md text-xs font-bold text-on-surface">
                    {email ? "Novo endereço de e-mail" : "Endereço de e-mail"}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex flex-1 min-w-0 items-center">
                      <Icon name="mail" size={18} className="absolute left-3 text-outline pointer-events-none" />
                      <input
                        id="novo-email"
                        type="email"
                        autoFocus
                        value={novoEmail}
                        onChange={(event) => setNovoEmail(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            salvarEmail();
                          }
                        }}
                        placeholder="seuemail@exemplo.com"
                        className="w-full min-w-0 rounded-lg bg-surface-container-lowest pl-10 pr-3 py-2.5 font-body-sm text-body-sm text-on-surface placeholder:text-outline outline-none focus:shadow-md focus:ring-2 focus:ring-primary-container/60 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={salvarEmail}
                      className="shrink-0 cursor-pointer rounded-lg bg-primary px-3 py-2.5 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container"
                    >
                      {email ? "Atualizar" : "Enviar código"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-8 inline-flex max-w-full items-center gap-2 self-start rounded-full bg-surface-container-low px-3.5 py-1.5">
                  <Icon name="alternate_email" size={16} className="shrink-0 text-on-surface-variant" />
                  <span className="truncate font-label-md text-label-md text-on-surface">{email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNovoEmail(email);
                      setEditandoEmail(true);
                    }}
                    className="ml-1 cursor-pointer font-label-sm text-xs font-semibold text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:text-on-surface"
                  >
                    Alterar
                  </button>
                </div>
              )}

              <form className="flex w-full flex-col gap-5" onSubmit={confirmar}>
                <fieldset className="w-full" disabled={status === "validando" || !email}>
                  <legend className="mb-2 font-label-md text-label-md text-on-surface font-semibold">
                    Código de verificação
                  </legend>
                  <div className="flex w-full items-center justify-between gap-2 sm:gap-3">
                    {codigo.map((digito, indice) => (
                      <input
                        key={indice}
                        ref={(elemento) => {
                          campos.current[indice] = elemento;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete={indice === 0 ? "one-time-code" : "off"}
                        maxLength={1}
                        aria-label={`Dígito ${indice + 1}`}
                        value={digito}
                        placeholder="•"
                        onChange={(event) => preencher(indice, event.target.value)}
                        onKeyDown={(event) => aoTeclar(indice, event)}
                        onPaste={aoColar}
                        onFocus={(event) => event.target.select()}
                        aria-invalid={!!erro && !digito}
                        className={`h-14 sm:h-16 w-full min-w-0 max-w-14 rounded-xl text-center font-numeric-stat text-numeric-stat text-on-surface outline-none transition-all duration-150 placeholder:text-outline-variant focus:bg-surface-container-lowest focus:shadow-md focus:ring-2 focus:ring-primary-container ${
                          digito
                            ? "bg-surface-container-lowest shadow-[0_4px_6px_-1px_rgba(255,140,66,0.15)] ring-1 ring-primary-container/40"
                            : "bg-surface-container-low"
                        } ${erro && !digito ? "ring-2 ring-error" : ""}`}
                      />
                    ))}
                  </div>
                </fieldset>

                {erro ? (
                  <p role="alert" className="flex items-center gap-1.5 font-label-sm text-xs font-semibold text-error">
                    <Icon name="error" size={16} />
                    {erro}
                  </p>
                ) : (
                  <p className="flex items-center gap-1.5 font-body-sm text-xs text-on-surface-variant">
                    <Icon name="content_paste" size={16} className="text-primary" />
                    Dica: você pode colar o código copiado diretamente aqui.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "validando" || !email}
                  className="group w-full mt-1 py-3.5 px-6 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg font-semibold shadow-sm hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {status === "validando" ? (
                    <>
                      <Icon name="progress_activity" size={18} className="animate-spin" />
                      <span>Validando código...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmar e Continuar</span>
                      <Icon name="arrow_forward" size={18} className="transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Divisor + reenvio */}
              <div className="relative flex items-center justify-center my-6">
                <div className="w-full h-px bg-surface-container-highest" />
                <span className="absolute bg-surface-container-lowest px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium">
                  não recebeu?
                </span>
              </div>
              <div className="flex w-full flex-col items-center gap-2">
                {restante > 0 ? (
                  <p className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
                    <Icon name="schedule" size={16} className="text-outline" />
                    Não recebeu o código? Reenviar em
                    <span className="font-semibold tabular-nums text-on-surface">
                      {formatarTempo(restante)}
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={reenviar}
                    disabled={!email}
                    className="flex cursor-pointer items-center gap-1.5 font-label-md text-label-md text-primary transition-colors hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Icon name="sync" size={18} />
                    Reenviar código agora
                  </button>
                )}
                {reenviado && (
                  <p
                    role="status"
                    className="mt-1 flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 font-label-sm text-xs text-emerald-800"
                  >
                    <Icon name="check_circle" size={16} />
                    Novo código solicitado!
                  </p>
                )}
              </div>

              {/* Spam */}
              <div className="mt-6 flex w-full items-start gap-3 rounded-xl bg-surface-container-low p-4 text-left">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant">
                  <Icon name="inbox" size={18} />
                </span>
                <span className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">Caixa de entrada vazia?</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Verifique a pasta de <strong>Spam</strong> ou{" "}
                    <strong>Lixo Eletrônico</strong>. Mensagens de verificação
                    podem levar até 2 minutos para serem entregues.
                  </span>
                </span>
              </div>
            </>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 font-label-md text-xs font-semibold text-primary hover:text-on-primary-fixed-variant transition-colors group"
            >
              <Icon name="arrow_back" size={14} className="transition-transform group-hover:-translate-x-1" />
              Voltar para o login
            </Link>
          </div>
        </main>

        {/* Rodapé */}
        <footer className="pt-6 flex flex-col sm:flex-row items-center justify-between text-on-surface-variant font-label-sm text-xs gap-3">
          <span className="flex items-center gap-2">
            <Icon name="support_agent" size={16} className="text-primary-container" />
            <span>
              Precisa de ajuda?{" "}
              <a className="font-semibold text-primary hover:underline" href="mailto:suporte@plusracha.com.br">
                Fale com o suporte
              </a>
            </span>
          </span>
          <span className="flex items-center gap-4">
            <Link className="hover:text-on-surface transition-colors" to="/faq">Termos de Uso</Link>
            <span aria-hidden="true">•</span>
            <Link className="hover:text-on-surface transition-colors" to="/faq">Privacidade</Link>
          </span>
        </footer>
      </section>
    </div>
  );
}
