import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import { ApiError } from "../lib/api";
import Icon from "../components/icon";

// Logo do Google usado no botão de cadastro social
function IconeGoogle() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Requisitos exibidos abaixo do campo de senha
const REQUISITOS = [
  { texto: "8+ caracteres", teste: (s: string) => s.length >= 8 },
  { texto: "Número", teste: (s: string) => /\d/.test(s) },
  { texto: "Símbolo (@, #, !)", teste: (s: string) => /[^A-Za-z0-9]/.test(s) },
];

// Força da senha de 0 a 4 (uma barra por ponto)
function calcularForcaSenha(senha: string) {
  if (!senha) return 0;
  let pontos = REQUISITOS.filter((r) => r.teste(senha)).length;
  if (senha.length >= 12 && /[a-z]/.test(senha) && /[A-Z]/.test(senha)) {
    pontos++;
  }
  return Math.max(1, pontos);
}

const NIVEIS_FORCA = {
  1: { texto: "Senha fraca", barra: "bg-error", selo: "bg-error-container text-on-error-container", ponto: "bg-error" },
  2: { texto: "Senha média", barra: "bg-tertiary-container", selo: "bg-tertiary-fixed text-on-tertiary-fixed-variant", ponto: "bg-tertiary" },
  3: { texto: "Senha forte", barra: "bg-green-500", selo: "bg-green-100 text-green-700", ponto: "bg-green-600" },
  4: { texto: "Senha muito forte", barra: "bg-green-500", selo: "bg-green-100 text-green-700", ponto: "bg-green-600" },
} as const;

const classeCampo =
  "w-full px-4 py-3 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline/70 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container/60 transition-all shadow-sm pl-11";

export default function Cadastro() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    senha: "",
    termos: false,
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

  const forcaSenha = calcularForcaSenha(formulario.senha);
  const nivel = forcaSenha > 0 ? NIVEIS_FORCA[forcaSenha as 1 | 2 | 3 | 4] : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (!formulario.nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }
    if (!formulario.termos) {
      setErro("Você precisa aceitar os termos de uso.");
      return;
    }

    setEnviando(true);
    try {
      await signUp(
        formulario.nome.trim(),
        formulario.email.trim(),
        formulario.senha,
      );
      navigate("/home", { replace: true });
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível criar a conta. Tente novamente.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="font-body-md text-on-surface antialiased min-h-screen w-full flex flex-col md:flex-row bg-surface-container-lowest">
      {/* PAINEL ESQUERDO — laranja */}
      <section className="w-full md:w-1/2 bg-primary-container text-on-primary flex flex-col justify-between p-8 md:p-14 lg:p-20 relative overflow-hidden select-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-on-primary-container/10 rounded-full blur-3xl pointer-events-none" />

        {/* Marca */}
        <Link to="/" className="flex items-center gap-3 relative z-10 w-fit" aria-label="Racha+, página inicial">
          <div className="w-11 h-11 rounded-xl bg-on-primary text-primary-container flex items-center justify-center shadow-md">
            <Icon name="pie_chart" size={28} className="font-bold" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-headline-sm text-on-primary tracking-tight font-extrabold flex items-center">
              Racha<span className="text-tertiary-fixed ml-0.5">+</span>
            </span>
            <span className="text-on-primary/80 font-label-sm uppercase tracking-wider text-[10px]">Divisão Inteligente</span>
          </div>
        </Link>

        {/* Chamada principal */}
        <div className="my-auto py-10 relative z-10 flex flex-col gap-8 max-w-lg">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-on-primary/15 text-on-primary text-label-sm backdrop-blur-sm">
              <Icon name="bolt" size={15} />
              Configuração instantânea
            </span>
            <h1 className="font-display text-display-mobile md:text-display text-on-primary leading-tight font-extrabold tracking-tight">
              Comece a organizar em menos de 1 minuto.
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary/90 leading-relaxed font-normal">
              Crie grupos para viagens, república, eventos ou peladas com
              rateio automático e divisão justa.
            </p>
          </div>

          {/* Ilustração: cartões conectados e círculo de equilíbrio */}
          <div className="relative w-full h-64 bg-on-primary/10 rounded-2xl p-6 backdrop-blur-md overflow-hidden flex items-center justify-center shadow-inner" aria-hidden="true">
            <svg className="absolute inset-0 w-full h-full text-on-primary/20 pointer-events-none">
              <path d="M 80 70 C 180 70, 180 180, 290 180" fill="none" stroke="currentColor" strokeDasharray="6 6" strokeWidth="2" />
              <path d="M 120 180 C 180 180, 220 90, 310 90" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="200" cy="125" fill="white" r="4" />
            </svg>

            {/* Cartão 1 — despesa rateada */}
            <div className="absolute left-4 top-5 bg-on-primary text-on-surface p-3.5 rounded-xl shadow-lg flex items-center gap-3 w-56 -rotate-1 hover:rotate-0 transition-transform">
              <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <Icon name="beach_access" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-label-md text-on-surface truncate text-xs font-bold">Praia de Ubatuba</p>
                  <span className="font-label-sm text-[10px] text-primary font-semibold">4x</span>
                </div>
                <p className="font-body-sm text-[11px] text-on-surface-variant font-medium">R$ 145,00 cada</p>
              </div>
            </div>

            {/* Círculo de equilíbrio */}
            <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-on-primary to-surface-container-lowest text-primary shadow-xl flex flex-col items-center justify-center p-2 text-center scale-105">
              <Icon name="balance" size={24} className="text-primary" />
              <span className="font-label-sm text-[11px] font-bold text-on-surface">100% Justo</span>
              <span className="font-label-sm text-[9px] text-on-surface-variant">R$ 0 pendências</span>
            </div>

            {/* Cartão 2 — pagamento concluído */}
            <div className="absolute right-4 bottom-5 bg-on-primary text-on-surface p-3.5 rounded-xl shadow-lg flex items-center gap-3 w-56 rotate-2 hover:rotate-0 transition-transform">
              <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed-variant">
                <Icon name="check_circle" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-label-md text-on-surface truncate text-xs font-bold">Churrasco da República</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <p className="font-body-sm text-[11px] text-on-surface-variant font-medium">Liquidado via Pix</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selo de confiança */}
        <div className="pt-6 border-t border-on-primary/15 flex items-center gap-2.5 relative z-10">
          <Icon name="verified_user" size={20} className="text-on-primary" />
          <p className="font-label-md text-on-primary text-sm font-semibold tracking-wide">
            100% gratuito para começar <span className="opacity-60 mx-1">•</span> Sem taxas ocultas
          </p>
        </div>
      </section>

      {/* PAINEL DIREITO — formulário */}
      <section className="w-full md:w-1/2 bg-surface-container-lowest flex items-center justify-center p-6 sm:p-10 md:p-14 lg:p-16">
        <div className="w-full max-w-[480px] flex flex-col justify-center py-6">
          <div className="mb-7">
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
              Crie sua conta no Racha+
            </h2>
            <p className="font-body-md text-body-md text-outline mt-1.5">
              Preencha seus dados para organizar seus grupos com facilidade.
            </p>
          </div>

          {/* Cadastro social (ainda não configurado) */}
          <button
            type="button"
            disabled
            title="Cadastro com Google ainda não está configurado."
            className="w-full py-3 px-4 rounded-lg bg-surface-container-low transition-colors flex items-center justify-center gap-3 shadow-sm cursor-not-allowed opacity-60"
          >
            <IconeGoogle />
            <span className="font-label-lg text-label-md text-on-surface font-semibold">
              Cadastrar com o Google
            </span>
          </button>

          {/* Divisor */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full h-px bg-surface-container-high" />
            <span className="absolute bg-surface-container-lowest px-3 font-label-sm text-outline text-xs uppercase tracking-wider">
              ou cadastre com seu e-mail
            </span>
          </div>

          {erro && (
            <p
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-lg bg-error-container px-space-md py-space-sm font-body-sm text-body-sm text-on-error-container"
            >
              <Icon name="error" size={18} className="mt-px shrink-0" />
              <span>{erro}</span>
            </p>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Nome */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="nome">
                Nome completo
              </label>
              <div className="relative">
                <input
                  id="nome"
                  type="text"
                  required
                  autoComplete="name"
                  value={formulario.nome}
                  onChange={(event) => handleChange("nome", event.target.value)}
                  placeholder="Ex: Ana Clara Silva"
                  className={classeCampo}
                />
                <Icon name="person" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
              </div>
            </div>

            {/* E-mail */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="email">
                E-mail
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formulario.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  placeholder="ana@exemplo.com"
                  className={classeCampo}
                />
                <Icon name="mail" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
              </div>
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="senha">
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={formulario.senha}
                  onChange={(event) => handleChange("senha", event.target.value)}
                  placeholder="Mínimo de 8 caracteres"
                  className={`${classeCampo} pr-11`}
                />
                <Icon name="lock" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
                <button
                  type="button"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setMostrarSenha((atual) => !atual)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center text-outline hover:text-on-surface transition-colors cursor-pointer"
                >
                  <Icon name={mostrarSenha ? "visibility_off" : "visibility"} size={20} />
                </button>
              </div>

              {/* Indicador de força da senha */}
              {nivel && (
                <div className="mt-2 p-3 bg-surface-container-low/70 rounded-lg flex flex-col gap-2" aria-live="polite">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-xs text-on-surface-variant font-medium">Força da senha:</span>
                    <span className={`font-label-sm text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${nivel.selo}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${nivel.ponto}`} />
                      {nivel.texto}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 w-full">
                    {[1, 2, 3, 4].map((barra) => (
                      <div
                        key={barra}
                        className={`h-1.5 rounded-full ${barra <= forcaSenha ? nivel.barra : "bg-surface-container-highest"}`}
                      />
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-on-surface-variant mt-0.5">
                    {REQUISITOS.map((requisito) => {
                      const ok = requisito.teste(formulario.senha);
                      return (
                        <span
                          key={requisito.texto}
                          className={`flex items-center gap-1 ${ok ? "text-green-700 font-semibold" : ""}`}
                        >
                          <Icon name="check" size={13} className={ok ? "" : "opacity-40"} />
                          {requisito.texto}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Termos */}
            <div className="flex items-start gap-3 mt-1">
              <input
                id="termos"
                type="checkbox"
                required
                checked={formulario.termos}
                onChange={(event) => handleChange("termos", event.target.checked)}
                className="mt-1 w-4 h-4 shrink-0 rounded cursor-pointer accent-primary-container"
              />
              <label
                htmlFor="termos"
                className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer select-none leading-snug"
              >
                Concordo com os{" "}
                <a
                  href="#"
                  onClick={(event) => event.stopPropagation()}
                  className="font-semibold text-primary hover:underline"
                >
                  Termos de Uso
                </a>{" "}
                e a{" "}
                <a
                  href="#"
                  onClick={(event) => event.stopPropagation()}
                  className="font-semibold text-primary hover:underline"
                >
                  Política de Privacidade
                </a>
                .
              </label>
            </div>

            {/* Botão principal */}
            <button
              type="submit"
              disabled={enviando}
              className="w-full mt-3 py-3.5 px-6 rounded-lg bg-primary-container hover:bg-on-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:shadow-lg transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-wait disabled:opacity-80"
            >
              <span>{enviando ? "Criando conta..." : "Criar conta"}</span>
              <Icon name="arrow_forward" size={20} />
            </button>
          </form>

          {/* Link para login */}
          <div className="mt-6 text-center">
            <p className="font-body-md text-body-sm text-on-surface-variant">
              Já possui uma conta?
              <Link
                to="/login"
                className="font-semibold text-primary hover:text-on-primary-container underline underline-offset-4 ml-1 transition-colors"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
