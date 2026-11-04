import { typography as T } from "../lib/typography";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  PieChart,
  Quote,
} from "lucide-react";
import { useAuth } from "../auth/auth-context";
import { ApiError } from "../lib/api";

/* =====================================================
   TOKENS DO DESIGN

   Ficam aqui dentro (e não no tema do Tailwind) para que
   esta tela não interfira nas demais páginas do projeto.
====================================================== */

const C = {
  primary: "#9b4500",
  primaryContainer: "#ff8c42",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#6a2d00",

  secondaryContainer: "#fc6f5a",

  surfaceLowest: "#ffffff",
  surfaceLow: "#eff4ff",
  surfaceContainer: "#e6eeff",
  surfaceHighest: "#d9e3f6",

  onSurface: "#121c2a",
  onSurfaceVariant: "#564338",
  outline: "#897266",
};

// Logo do Google usado no botão de login social
function IconeGoogle() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Membros exibidos no cartão ilustrativo do painel laranja
const MEMBROS = [
  { iniciais: "RM", opacidade: 1 },
  { iniciais: "LP", opacidade: 0.9 },
  { iniciais: "CS", opacidade: 0.8 },
  { iniciais: "FA", opacidade: 0.7 },
];

// Partes da barra de divisão (intensidade de cada fatia)
const FATIAS = [1, 0.8, 0.6, 0.3];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [campoFocado, setCampoFocado] = useState<string | null>(null);

  const [formulario, setFormulario] = useState({
    email: "",
    senha: "",
    lembrar: false,
  });

  function handleChange(
    campo: keyof typeof formulario,
    valor: string | boolean
  ) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await signIn(formulario.email.trim(), formulario.senha, formulario.lembrar);
      const origem = (location.state as { from?: { pathname?: unknown } } | null)
        ?.from?.pathname;
      navigate(
        typeof origem === "string" && origem.startsWith("/")
          ? origem
          : "/home",
        { replace: true },
      );
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setEnviando(false);
    }
  }

  // Estilo compartilhado pelos campos de texto
  function estiloCampo(campo: string) {
    const focado = campoFocado === campo;
    return {
      backgroundColor: focado ? C.surfaceLowest : C.surfaceLow,
      color: C.onSurface,
      boxShadow: focado
        ? `0 0 0 2px ${C.primaryContainer}, 0 4px 6px -1px rgba(0,0,0,0.08)`
        : undefined,
    };
  }

  return (
    <div
      className="flex min-h-screen w-full flex-col font-jakarta md:flex-row"
      style={{ color: C.onSurface }}
    >
      {/* =====================================================
          PAINEL ESQUERDO — LARANJA
      ====================================================== */}

      <section
        className="relative flex w-full flex-col justify-between overflow-hidden p-8 text-white sm:p-12 md:w-1/2 lg:p-16"
        style={{ backgroundColor: C.primaryContainer }}
      >
        {/* Brilhos decorativos */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-2xl" />
        <div
          className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: `${C.secondaryContainer}33` }}
        />

        {/* Marca */}
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shadow-md"
            style={{ backgroundColor: C.surfaceLowest }}
          >
            <PieChart
              className="h-6 w-6"
              style={{ color: C.primaryContainer }}
              fill="currentColor"
            />
          </div>
          <span className={`${T.headlineMd} font-extrabold tracking-tight`}>
            Racha<span className="opacity-90">+</span>
          </span>
        </Link>

        {/* Chamada principal */}
        <div className="relative z-10 my-auto max-w-lg py-10">
          <span
            className={`${T.labelSm} mb-6 inline-flex items-center rounded-full bg-white/20 px-3 py-1 uppercase tracking-wider backdrop-blur-sm`}
          >
            Divisão inteligente de despesas
          </span>
          <h1 className="mb-6 text-[2.25rem] font-extrabold leading-tight tracking-tight lg:text-[3rem]">
            Organize qualquer grupo em minutos.
          </h1>
          <p className="mb-10 max-w-md text-lg leading-relaxed text-white/90">
            O jeito mais fácil e transparente de dividir contas e organizar
            tarefas coletivas sem atritos ou planilhas confusas.
          </p>

          {/* Cartão ilustrativo */}
          <div className="w-full rounded-2xl bg-white/10 p-6 shadow-sm backdrop-blur-md">
            <div
              className={`${T.labelSm} mb-3 flex items-center justify-between text-white/90`}
            >
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white" />
                Aluguel da República
              </span>
              <span className={`${T.labelMd} text-white`}>R$ 3.450 / 4</span>
            </div>

            <div className="mb-5 flex h-2.5 w-full gap-1 overflow-hidden rounded-full bg-white/20">
              {FATIAS.map((opacidade, indice) => (
                <div
                  key={indice}
                  className="h-full w-1/4 rounded-full bg-white"
                  style={{ opacity: opacidade }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex -space-x-2">
                {MEMBROS.map((membro) => (
                  <div
                    key={membro.iniciais}
                    className={`${T.labelSm} flex h-8 w-8 items-center justify-center rounded-full font-bold shadow-sm`}
                    style={{
                      backgroundColor: `rgba(255,255,255,${membro.opacidade})`,
                      color: C.primaryContainer,
                    }}
                  >
                    {membro.iniciais}
                  </div>
                ))}
              </div>
              <div className={`${T.labelSm} flex items-center gap-1.5`}>
                <CheckCircle2 className="h-4 w-4" />
                Tudo equilibrado
              </div>
            </div>
          </div>
        </div>

        {/* Depoimento */}
        <div className="relative z-10 flex items-start gap-3 pt-6">
          <Quote className="mt-0.5 h-5 w-5 shrink-0 text-white/70" />
          <p className={`${T.bodyMd} italic text-white/95`}>
            “Nunca mais tivemos discussão sobre dinheiro na nossa república.”
            <span
              className={`${T.labelSm} mt-1 block not-italic text-white/80`}
            >
              — Rodrigo M., Morador • República Vila Madalena
            </span>
          </p>
        </div>
      </section>

      {/* =====================================================
          PAINEL DIREITO — FORMULÁRIO
      ====================================================== */}

      <section
        className="flex w-full items-center justify-center px-6 py-12 sm:px-12 md:w-1/2 lg:px-20"
        style={{ backgroundColor: C.surfaceLowest }}
      >
        <div className="flex w-full max-w-[440px] flex-col">
          {/* Cabeçalho */}
          <div className="mb-8">
            <h2 className={`${T.headlineLg} font-bold`}>Acesse sua conta</h2>
            <p className={`${T.bodyMd} mt-2`} style={{ color: C.onSurfaceVariant }}>
              Bem-vindo de volta! Insira seus dados para continuar.
            </p>
          </div>

          {erro && (
            <p
              role="alert"
              className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {erro}
            </p>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* E-mail */}
            <div className="flex flex-col gap-2">
              <label htmlFor="login-email" className={T.labelMd}>
                E-mail
              </label>
              <div className="relative flex items-center">
                <Mail
                  className="pointer-events-none absolute left-4 h-5 w-5"
                  style={{ color: C.outline }}
                />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formulario.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  onFocus={() => setCampoFocado("email")}
                  onBlur={() => setCampoFocado(null)}
                  placeholder="seu.email@exemplo.com"
                  className={`${T.bodyMd} w-full rounded-lg py-3.5 pl-12 pr-4 outline-none transition-all duration-200 placeholder:text-[#897266]`}
                  style={estiloCampo("email")}
                />
              </div>
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-2">
              <label htmlFor="login-password" className={T.labelMd}>
                Senha
              </label>
              <div className="relative flex items-center">
                <Lock
                  className="pointer-events-none absolute left-4 h-5 w-5"
                  style={{ color: C.outline }}
                />
                <input
                  id="login-password"
                  type={mostrarSenha ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="current-password"
                  value={formulario.senha}
                  onChange={(event) => handleChange("senha", event.target.value)}
                  onFocus={() => setCampoFocado("senha")}
                  onBlur={() => setCampoFocado(null)}
                  placeholder="••••••••••••"
                  className={`${T.bodyMd} w-full rounded-lg py-3.5 pl-12 pr-12 outline-none transition-all duration-200 placeholder:text-[#897266]`}
                  style={estiloCampo("senha")}
                />
                <button
                  type="button"
                  aria-label="Alternar visibilidade da senha"
                  onClick={() => setMostrarSenha((atual) => !atual)}
                  className="absolute right-3.5 flex cursor-pointer items-center justify-center rounded p-1 transition-colors hover:text-[#121c2a]"
                  style={{ color: C.outline }}
                >
                  {mostrarSenha ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Lembrar de mim / Esqueci minha senha */}
            <div className="flex items-center justify-between pt-1">
              <label className="group flex cursor-pointer select-none items-center gap-2.5">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={formulario.lembrar}
                  onChange={(event) =>
                    handleChange("lembrar", event.target.checked)
                  }
                  className="h-4 w-4 cursor-pointer rounded"
                  style={{ accentColor: C.primaryContainer }}
                />
                <span className={`${T.bodySm} transition-colors group-hover:text-[#9b4500]`}>
                  Lembrar de mim
                </span>
              </label>
              <Link
                to="/esqueceu-senha"
                className={`${T.labelSm} transition-colors hover:text-[#6a2d00] focus:underline`}
                style={{ color: C.primary }}
              >
                Esqueci minha senha
              </Link>
            </div>

            {/* Botão principal */}
            <button
              type="submit"
              disabled={enviando}
              className={`${T.labelLg} mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#ff8c42] px-6 py-3.5 shadow-sm transition-all duration-200 hover:bg-[#9b4500] hover:shadow-lg active:scale-[0.98] disabled:cursor-wait disabled:opacity-80`}
              style={{ color: C.onPrimary }}
            >
              <span>{enviando ? "Entrando..." : "Entrar"}</span>
              <ArrowRight className="h-[18px] w-[18px]" />
            </button>

            {/* Divisor */}
            <div className="relative my-6 flex items-center justify-center">
              <div
                className="h-px w-full"
                style={{ backgroundColor: C.surfaceHighest }}
              />
              <span
                className={`${T.labelSm} absolute px-4 font-medium uppercase tracking-wider`}
                style={{
                  backgroundColor: C.surfaceLowest,
                  color: C.onSurfaceVariant,
                }}
              >
                ou continue com
              </span>
            </div>

            {/* Login social (ainda não configurado) */}
            <button
              type="button"
              disabled
              title="Login com Google ainda não está configurado."
              className={`${T.labelMd} flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg px-6 py-3.5 opacity-60 shadow-sm`}
              style={{ backgroundColor: C.surfaceLow, color: C.onSurface }}
            >
              <IconeGoogle />
              <span>Continuar com o Google</span>
            </button>
          </form>

          {/* Cadastro */}
          <p
            className={`${T.bodySm} mt-8 text-center`}
            style={{ color: C.onSurfaceVariant }}
          >
            Ainda não tem uma conta?
            <Link
              to="/cadastro"
              className={`${T.labelSm} ml-1 font-bold transition-colors hover:text-[#6a2d00] focus:underline`}
              style={{ color: C.primary }}
            >
              Cadastre-se gratuitamente
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
