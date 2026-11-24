import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import { ApiError } from "../lib/api";
import Icon from "../components/icon";

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
  { iniciais: "RM", fundo: "bg-surface-container-lowest" },
  { iniciais: "LP", fundo: "bg-white/90" },
  { iniciais: "CS", fundo: "bg-white/80" },
  { iniciais: "FA", fundo: "bg-white/70" },
];

// Partes da barra de divisão (intensidade de cada fatia)
const FATIAS = [
  "bg-surface-container-lowest",
  "bg-surface-container-lowest/80",
  "bg-surface-container-lowest/60",
  "bg-surface-container-lowest/30",
];

const classeCampo =
  "w-full bg-surface-container-low py-3.5 rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:shadow-md focus:ring-2 focus:ring-primary-container/60 transition-all duration-200 outline-none";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

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

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen w-full flex flex-col md:flex-row">
      {/* PAINEL ESQUERDO — laranja */}
      <section className="w-full md:w-1/2 bg-primary-container text-surface-container-lowest flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />

        {/* Marca */}
        <Link to="/" className="relative z-10 flex items-center space-x-3 w-fit" aria-label="Racha+, página inicial">
          <div className="w-10 h-10 rounded-xl bg-surface-container-lowest text-primary-container flex items-center justify-center shadow-md">
            <Icon name="pie_chart" filled className="text-primary-container" />
          </div>
          <div className="flex items-center tracking-tight">
            <span className="font-display text-headline-md font-extrabold text-surface-container-lowest">Racha</span>
            <span className="font-display text-headline-md font-extrabold text-surface-container-lowest opacity-90">+</span>
          </div>
        </Link>

        {/* Chamada principal */}
        <div className="relative z-10 my-auto py-10 max-w-lg">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-label-sm font-semibold bg-white/20 text-surface-container-lowest backdrop-blur-sm mb-6 uppercase tracking-wider">
            Divisão inteligente de despesas
          </span>
          <h1 className="font-display text-display-mobile lg:text-display font-extrabold leading-tight text-surface-container-lowest mb-6">
            Organize qualquer grupo em minutos.
          </h1>
          <p className="font-body-lg text-body-lg text-white/90 leading-relaxed max-w-md mb-10 font-normal">
            O jeito mais fácil e transparente de dividir contas e organizar
            tarefas coletivas sem atritos ou planilhas confusas.
          </p>

          {/* Cartão ilustrativo */}
          <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-sm" aria-hidden="true">
            <div className="flex items-center justify-between text-label-sm text-white/90 font-medium mb-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-surface-container-lowest" />
                Aluguel da República
              </span>
              <span className="font-numeric-stat text-label-md text-surface-container-lowest">R$ 3.450 / 4</span>
            </div>
            <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden flex gap-1 mb-5">
              {FATIAS.map((fundo) => (
                <div key={fundo} className={`h-full rounded-full w-1/4 ${fundo}`} />
              ))}
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex -space-x-2">
                {MEMBROS.map((membro) => (
                  <div
                    key={membro.iniciais}
                    className={`w-8 h-8 rounded-full ${membro.fundo} text-primary-container font-label-sm text-label-sm flex items-center justify-center font-bold shadow-sm`}
                  >
                    {membro.iniciais}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-label-sm text-surface-container-lowest font-medium">
                <Icon name="check_circle" size={14} filled />
                Tudo equilibrado
              </div>
            </div>
          </div>
        </div>

        {/* Depoimento */}
        <div className="relative z-10 pt-6">
          <div className="flex items-start gap-3">
            <Icon name="format_quote" size={20} className="text-white/70 mt-0.5" />
            <p className="font-body-md text-body-md italic text-white/95">
              “Nunca mais tivemos discussão sobre dinheiro na nossa república.”
              <span className="block not-italic font-label-sm text-label-sm font-semibold text-white/80 mt-1">
                — Rodrigo M., Morador • República Vila Madalena
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* PAINEL DIREITO — formulário */}
      <section className="w-full md:w-1/2 bg-surface-container-lowest flex items-center justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="w-full max-w-[440px] flex flex-col">
          <div className="mb-8">
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Acesse sua conta
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 font-normal">
              Bem-vindo de volta! Insira seus dados para continuar.
            </p>
          </div>

          {erro && (
            <p
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-lg bg-error-container px-space-md py-space-sm font-body-sm text-body-sm text-on-error-container"
            >
              <Icon name="error" size={18} className="mt-px shrink-0" />
              <span>{erro}</span>
            </p>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* E-mail */}
            <div className="flex flex-col space-y-2">
              <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="login-email">
                E-mail
              </label>
              <div className="relative flex items-center">
                <Icon name="mail" size={18} className="absolute left-4 text-outline pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formulario.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className={`${classeCampo} pl-12 pr-4`}
                />
              </div>
            </div>

            {/* Senha */}
            <div className="flex flex-col space-y-2">
              <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="login-password">
                Senha
              </label>
              <div className="relative flex items-center">
                <Icon name="lock" size={18} className="absolute left-4 text-outline pointer-events-none" />
                <input
                  id="login-password"
                  type={mostrarSenha ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="current-password"
                  value={formulario.senha}
                  onChange={(event) => handleChange("senha", event.target.value)}
                  placeholder="••••••••••••"
                  className={`${classeCampo} pl-12 pr-12`}
                />
                <button
                  type="button"
                  aria-label="Alternar visibilidade da senha"
                  aria-pressed={mostrarSenha}
                  onClick={() => setMostrarSenha((atual) => !atual)}
                  className="absolute right-3.5 p-1 rounded text-outline hover:text-on-surface transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Icon name={mostrarSenha ? "visibility_off" : "visibility"} size={18} />
                </button>
              </div>
            </div>

            {/* Lembrar de mim / Esqueci minha senha */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={formulario.lembrar}
                  onChange={(event) => handleChange("lembrar", event.target.checked)}
                  className="w-4 h-4 rounded accent-primary-container cursor-pointer transition-colors"
                />
                <span className="font-body-sm text-body-sm text-on-surface font-normal group-hover:text-primary transition-colors">
                  Lembrar de mim
                </span>
              </label>
              <Link
                to="/esqueceu-senha"
                className="font-label-sm text-label-sm text-primary hover:text-on-primary-container font-semibold transition-colors focus:underline outline-none"
              >
                Esqueci minha senha
              </Link>
            </div>

            {/* Botão principal */}
            <button
              type="submit"
              disabled={enviando}
              className="w-full mt-2 py-3.5 px-6 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg font-semibold shadow-sm hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:cursor-wait disabled:opacity-80"
            >
              <span>{enviando ? "Entrando..." : "Entrar"}</span>
              <Icon name="arrow_forward" size={18} />
            </button>

            {/* Divisor */}
            <div className="relative flex items-center justify-center my-6">
              <div className="w-full h-px bg-surface-container-highest" />
              <span className="absolute bg-surface-container-lowest px-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-medium">
                ou continue com
              </span>
            </div>

            {/* Login social (ainda não configurado) */}
            <button
              type="button"
              disabled
              title="Login com Google ainda não está configurado."
              className="w-full py-3.5 px-6 rounded-lg bg-surface-container-low text-on-surface font-label-lg text-label-md font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-sm cursor-not-allowed opacity-60"
            >
              <IconeGoogle />
              <span>Continuar com o Google</span>
            </button>
          </form>

          {/* Cadastro */}
          <div className="mt-8 text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant font-normal">
              Ainda não tem uma conta?
              <Link
                to="/cadastro"
                className="font-label-sm text-label-sm font-bold text-primary hover:text-on-primary-container transition-colors ml-1 focus:underline outline-none"
              >
                Cadastre-se gratuitamente
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
