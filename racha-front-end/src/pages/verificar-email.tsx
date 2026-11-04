import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  CheckCircle2,
  Clock,
  Hand,
  Inbox,
  Lock,
  Mail,
  MailCheck,
  PieChart,
  RotateCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useAuth } from "../auth/auth-context";

/* =====================================================
   TOKENS DO DESIGN

   Ficam aqui dentro (e não no tema do Tailwind) para que
   esta tela não interfira nas demais páginas do projeto.
====================================================== */

const C = {
  primary: "#9b4500",
  primaryContainer: "#ff8c42",
  primaryFixed: "#ffdbc9",
  secondary: "#ab3425",
  secondaryContainer: "#fc6f5a",
  outline: "#897266",
  outlineVariant: "#ddc1b3",

  surface: "#f8f9ff",
  surfaceLowest: "#ffffff",
  surfaceLow: "#eff4ff",
  surfaceContainer: "#e6eeff",
  surfaceHigh: "#dee9fc",

  onSurface: "#121c2a",
  onSurfaceVariant: "#564338",
};

const DIGITOS = 6;
const ESPERA_REENVIO = 60;

function formatarTempo(segundos: number) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function VerificarEmail() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [parametros] = useSearchParams();
  const estado = useLocation().state as { email?: unknown } | null;

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

  function reenviar() {
    setRestante(ESPERA_REENVIO);
    setReenviado(true);
  }

  function salvarEmail() {
    const valor = novoEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return;
    setEmail(valor);
    setEditandoEmail(false);
    setCodigo(Array(DIGITOS).fill(""));
    reenviar();
  }

  // Prévia: o backend ainda não emite nem valida códigos por e-mail
  function confirmar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const vazio = codigo.findIndex((d) => !d);
    if (vazio !== -1) {
      setErro("Digite os 6 dígitos do código.");
      focar(vazio);
      return;
    }
    setStatus("validando");
    window.setTimeout(() => setStatus("verificado"), 1200);
  }

  const verificado = status === "verificado";

  return (
    <div
      className="relative isolate flex min-h-screen w-full flex-col items-center justify-between overflow-hidden px-4 py-10 font-jakarta sm:px-6 lg:px-8"
      style={{ backgroundColor: C.surface, color: C.onSurface }}
    >
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[360px] w-[680px] max-w-[160vw] -translate-x-1/2 rounded-full blur-3xl"
        style={{ backgroundColor: `${C.primaryFixed}59` }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-16 -z-10 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ backgroundColor: `${C.surfaceHigh}66` }}
      />

      {/* Cabeçalho */}
      <header className="flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 py-2">
        <Link to="/login" className="flex items-center gap-2.5">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md"
            style={{ backgroundColor: C.primaryContainer }}
          >
            <PieChart className="h-5 w-5" fill="currentColor" />
          </span>
          <span className="flex flex-col">
            <span className="text-xl font-semibold tracking-tight">
              Racha<span className="font-extrabold" style={{ color: C.primaryContainer }}>+</span>
            </span>
            <span className="-mt-1 text-xs uppercase tracking-wider" style={{ color: C.onSurfaceVariant }}>
              Finanças em Grupo
            </span>
          </span>
        </Link>
        <span
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
          style={{ backgroundColor: C.surfaceLow, color: C.onSurfaceVariant }}
        >
          <span className="inline-block h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: C.secondaryContainer }} />
          Etapa 2 de 2 • Verificação de Segurança
        </span>
      </header>

      {/* Cartão central */}
      <main className="my-auto w-full max-w-lg py-6">
        <div className="relative flex flex-col items-center rounded-xl bg-white p-8 text-center shadow-xl shadow-[#121c2a0d] sm:p-10">
          <div className="relative mb-6">
            <div
              className="absolute inset-0 scale-125 rounded-2xl blur-xl"
              style={{ backgroundColor: `${C.primaryContainer}4d` }}
            />
            <div
              className="relative flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{ backgroundColor: C.surfaceLow }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${C.primaryContainer}26`, color: C.primary }}
              >
                {verificado ? <CheckCircle2 className="h-8 w-8" /> : <MailCheck className="h-8 w-8" />}
              </div>
              <span
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-md"
                style={{ backgroundColor: C.primary }}
              >
                <Lock className="h-3 w-3" />
              </span>
            </div>
          </div>

          {verificado ? (
            <>
              <h1 className="mb-2 text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[2rem]">
                E-mail verificado!
              </h1>
              <p className="mx-auto mb-3 max-w-sm text-base" style={{ color: C.onSurfaceVariant }}>
                Tudo certo com <strong style={{ color: C.onSurface }}>{email}</strong>. Você já
                pode acessar suas divisões.
              </p>
              <p
                className="mb-6 w-full rounded-lg px-3 py-2 text-xs"
                style={{ backgroundColor: C.primaryFixed, color: "#331200" }}
              >
                Prévia: a verificação por código ainda não está ativa no servidor.
              </p>
              <button
                type="button"
                onClick={() => navigate(user ? "/meus-grupos" : "/login", { replace: true })}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#9b4500] px-6 py-4 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl"
              >
                {user ? "Ir para meus grupos" : "Ir para o login"}
                <ArrowRight className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <h1 className="mb-2 text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[2rem]">
                Verifique seu e-mail
              </h1>
              <p className="mx-auto mb-3 max-w-sm text-base" style={{ color: C.onSurfaceVariant }}>
                Enviamos um código de 6 dígitos para o endereço informado.
                Insira-o para validar sua identidade e acessar suas divisões.
              </p>

              {editandoEmail ? (
                <div className="mb-6 w-full rounded-lg p-3 text-left" style={{ backgroundColor: C.surfaceLow }}>
                  <label htmlFor="novo-email" className="mb-1 block text-xs" style={{ color: C.onSurfaceVariant }}>
                    {email ? "Novo endereço de e-mail" : "Endereço de e-mail"}
                  </label>
                  <div className="flex items-center gap-2">
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
                      className="min-w-0 flex-1 rounded-lg bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#ff8c42]"
                    />
                    <button
                      type="button"
                      onClick={salvarEmail}
                      className="cursor-pointer rounded-lg bg-[#9b4500] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6a2d00]"
                    >
                      {email ? "Atualizar" : "Enviar código"}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="mb-8 inline-flex max-w-full items-center gap-2 rounded-full px-3.5 py-1.5"
                  style={{ backgroundColor: C.surfaceLow }}
                >
                  <AtSign className="h-4 w-4 shrink-0" style={{ color: C.onSurfaceVariant }} />
                  <span className="truncate text-sm font-semibold">{email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNovoEmail(email);
                      setEditandoEmail(true);
                    }}
                    className="ml-1 cursor-pointer text-xs font-semibold underline underline-offset-2 transition-colors hover:text-[#6a2d00]"
                    style={{ color: C.primary, textDecorationColor: `${C.primary}66` }}
                  >
                    Alterar
                  </button>
                </div>
              )}

              <form className="flex w-full flex-col items-center gap-6" onSubmit={confirmar}>
                <fieldset className="w-full max-w-sm" disabled={status === "validando" || !email}>
                  <legend className="sr-only">Código de verificação de 6 dígitos</legend>
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
                        className="h-14 w-full min-w-0 max-w-14 rounded-xl text-center text-[1.75rem] font-bold outline-none transition-all duration-150 placeholder:text-[#ddc1b3] focus:bg-white focus:shadow-md focus:shadow-[#ff8c4233] focus:ring-2 focus:ring-[#ff8c42] sm:h-16"
                        style={{ backgroundColor: digito ? C.surfaceLowest : C.surfaceLow, boxShadow: digito ? "0 4px 6px -1px rgba(255,140,66,0.15)" : undefined }}
                      />
                    ))}
                  </div>
                </fieldset>

                {erro ? (
                  <p role="alert" className="text-xs font-semibold" style={{ color: C.secondary }}>
                    {erro}
                  </p>
                ) : (
                  <p className="flex items-center gap-1.5 text-xs" style={{ color: C.onSurfaceVariant }}>
                    <Hand className="h-4 w-4" style={{ color: C.primary }} />
                    Dica: você pode colar o código copiado diretamente aqui.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "validando" || !email}
                  className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#ff8c42] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#ff8c4240] transition-all hover:shadow-xl hover:shadow-[#ff8c4259] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {status === "validando" ? (
                    <>
                      <RotateCcw className="h-5 w-5 animate-spin" />
                      Validando código...
                    </>
                  ) : (
                    <>
                      Confirmar e Continuar
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Reenvio */}
              <div className="mt-6 flex w-full flex-col items-center gap-2 pt-6">
                {restante > 0 ? (
                  <p className="flex items-center gap-2 text-sm" style={{ color: C.onSurfaceVariant }}>
                    <Clock className="h-4 w-4" style={{ color: C.outline }} />
                    Não recebeu o código? Reenviar em
                    <span className="font-semibold tabular-nums" style={{ color: C.onSurface }}>
                      {formatarTempo(restante)}
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={reenviar}
                    disabled={!email}
                    className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold transition-colors hover:text-[#6a2d00] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ color: C.primary }}
                  >
                    <RotateCcw className="h-5 w-5" />
                    Reenviar código agora
                  </button>
                )}
                {reenviado && (
                  <p
                    role="status"
                    className="mt-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs"
                    style={{ backgroundColor: C.surfaceContainer, color: C.secondary }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Novo código solicitado!
                  </p>
                )}
              </div>

              {/* Spam */}
              <div className="mt-6 flex w-full items-start gap-3 rounded-xl p-4 text-left" style={{ backgroundColor: C.surfaceLow }}>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: C.surfaceContainer, color: C.onSurfaceVariant }}
                >
                  <Inbox className="h-5 w-5" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">Caixa de entrada vazia?</span>
                  <span className="text-sm" style={{ color: C.onSurfaceVariant }}>
                    Verifique a pasta de <strong>Spam</strong> ou{" "}
                    <strong>Lixo Eletrônico</strong>. Mensagens de verificação
                    podem levar até 2 minutos para serem entregues.
                  </span>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Selos e links */}
        <div className="mt-8 flex flex-col items-center gap-4 text-center">
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { icone: ShieldCheck, titulo: "Dados protegidos", texto: "Privacidade total nas suas despesas" },
              { icone: Zap, titulo: "Ativação Imediata", texto: "Acesso instantâneo a todos os grupos" },
            ].map(({ icone: Icone, titulo, texto }) => (
              <div
                key={titulo}
                className="flex items-center gap-2.5 rounded-xl bg-white/80 px-4 py-2.5 text-left shadow-sm backdrop-blur-sm"
              >
                <Icone className="h-5 w-5 shrink-0" style={{ color: C.primary }} />
                <span className="flex flex-col">
                  <span className="text-xs font-semibold">{titulo}</span>
                  <span className="text-xs leading-tight" style={{ color: C.onSurfaceVariant }}>
                    {texto}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm" style={{ color: C.onSurfaceVariant }}>
            <a
              href="mailto:suporte@plusracha.com.br"
              className="flex items-center gap-1.5 font-medium transition-colors hover:text-[#9b4500]"
            >
              <Mail className="h-4 w-4" />
              Precisa de ajuda? Fale com o suporte
            </a>
            <span style={{ color: C.outlineVariant }}>•</span>
            <Link to="/login" className="flex items-center gap-1 font-medium transition-colors hover:text-[#121c2a]">
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <footer
        className="flex w-full max-w-4xl flex-col items-center justify-between gap-2 py-4 text-xs sm:flex-row"
        style={{ color: C.onSurfaceVariant }}
      >
        <span>© {new Date().getFullYear()} Racha+. Todos os direitos reservados.</span>
        <span className="flex items-center gap-4">
          <span>Termos de Uso</span>
          <span>Política de Privacidade</span>
        </span>
      </footer>
    </div>
  );
}
