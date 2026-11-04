import { typography as T } from "../lib/typography";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  PieChart,
  Scale,
  ShieldCheck,
  TreePalm,
  User,
  Zap,
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
  primaryFixed: "#ffdbc9",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#6a2d00",
  onPrimaryFixedVariant: "#763300",
  tertiaryFixed: "#ffddb8",

  surfaceLowest: "#ffffff",
  surfaceLow: "#eff4ff",
  surfaceHigh: "#dee9fc",
  surfaceHighest: "#d9e3f6",

  onSurface: "#121c2a",
  onSurfaceVariant: "#564338",
  outline: "#897266",
};

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
  1: { texto: "Senha fraca", barra: "bg-red-500", selo: "bg-red-100 text-red-700", ponto: "bg-red-600" },
  2: { texto: "Senha média", barra: "bg-amber-500", selo: "bg-amber-100 text-amber-800", ponto: "bg-amber-600" },
  3: { texto: "Senha forte", barra: "bg-green-500", selo: "bg-green-100 text-green-700", ponto: "bg-green-600" },
  4: { texto: "Senha muito forte", barra: "bg-green-500", selo: "bg-green-100 text-green-700", ponto: "bg-green-600" },
} as const;

export default function Cadastro() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [campoFocado, setCampoFocado] = useState<string | null>(null);

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

  // Estilo compartilhado pelos campos de texto
  function estiloCampo(campo: string) {
    const focado = campoFocado === campo;
    return {
      backgroundColor: focado ? C.surfaceLowest : C.surfaceLow,
      color: C.onSurface,
      boxShadow: focado
        ? `0 0 0 2px ${C.primaryContainer}`
        : "0 1px 2px rgba(0,0,0,0.05)",
    };
  }

  const classeCampo = `${T.bodyMd} w-full rounded-lg py-3 pl-11 outline-none transition-all placeholder:text-[#897266b3]`;

  return (
    <div
      className="flex min-h-screen w-full flex-col font-jakarta md:flex-row"
      style={{ color: C.onSurface, backgroundColor: C.surfaceLowest }}
    >
      {/* =====================================================
          PAINEL ESQUERDO — LARANJA
      ====================================================== */}

      <section
        className="relative flex w-full select-none flex-col justify-between overflow-hidden p-8 text-white md:w-1/2 md:p-14 lg:p-20"
        style={{ backgroundColor: C.primaryContainer }}
      >
        {/* Brilhos decorativos */}
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${C.primaryFixed}33` }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${C.onPrimaryContainer}1a` }}
        />

        {/* Marca */}
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-md"
            style={{ backgroundColor: C.onPrimary }}
          >
            <PieChart
              className="h-7 w-7"
              strokeWidth={2.5}
              style={{ color: C.primaryContainer }}
            />
          </div>
          <div className="flex flex-col">
            <span className={`${T.headlineSm} font-extrabold tracking-tight`}>
              Racha<span className="ml-0.5" style={{ color: C.tertiaryFixed }}>+</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
              Divisão Inteligente
            </span>
          </div>
        </Link>

        {/* Chamada principal */}
        <div className="relative z-10 my-auto flex max-w-lg flex-col gap-8 py-10">
          <div className="flex flex-col gap-4">
            <span
              className={`${T.labelSm} inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm`}
            >
              <Zap className="h-[15px] w-[15px]" />
              Configuração instantânea
            </span>
            <h1 className="text-[2.25rem] font-extrabold leading-tight tracking-tight md:text-[3rem]">
              Comece a organizar em menos de 1 minuto.
            </h1>
            <p className="text-lg leading-relaxed text-white/90">
              Crie grupos para viagens, república, eventos ou peladas com
              rateio automático e divisão justa.
            </p>
          </div>

          {/* Ilustração: cartões conectados e círculo de equilíbrio */}
          <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl bg-white/10 p-6 shadow-inner backdrop-blur-md">
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full text-white/20"
              aria-hidden="true"
            >
              <path
                d="M 80 70 C 180 70, 180 180, 290 180"
                fill="none"
                stroke="currentColor"
                strokeDasharray="6 6"
                strokeWidth="2"
              />
              <path
                d="M 120 180 C 180 180, 220 90, 310 90"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="200" cy="125" fill="white" r="4" />
            </svg>

            {/* Cartão 1 — despesa rateada */}
            <div
              className="absolute left-4 top-5 flex w-56 -rotate-1 items-center gap-3 rounded-xl p-3.5 shadow-lg transition-transform hover:rotate-0"
              style={{ backgroundColor: C.onPrimary, color: C.onSurface }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: C.surfaceHigh, color: C.primary }}
              >
                <TreePalm className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-xs font-bold">Praia de Ubatuba</p>
                  <span className="text-[10px] font-semibold" style={{ color: C.primary }}>
                    4x
                  </span>
                </div>
                <p className="text-[11px] font-medium" style={{ color: C.onSurfaceVariant }}>
                  R$ 145,00 cada
                </p>
              </div>
            </div>

            {/* Círculo de equilíbrio */}
            <div
              className="relative z-10 flex h-24 w-24 scale-105 flex-col items-center justify-center rounded-full p-2 text-center shadow-xl"
              style={{ backgroundColor: C.onPrimary }}
            >
              <Scale className="h-6 w-6" style={{ color: C.primary }} />
              <span className="text-[11px] font-bold" style={{ color: C.onSurface }}>
                100% Justo
              </span>
              <span className="text-[9px]" style={{ color: C.onSurfaceVariant }}>
                R$ 0 pendências
              </span>
            </div>

            {/* Cartão 2 — pagamento concluído */}
            <div
              className="absolute bottom-5 right-4 flex w-56 rotate-2 items-center gap-3 rounded-xl p-3.5 shadow-lg transition-transform hover:rotate-0"
              style={{ backgroundColor: C.onPrimary, color: C.onSurface }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: C.primaryFixed,
                  color: C.onPrimaryFixedVariant,
                }}
              >
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold">Churrasco da República</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <p className="text-[11px] font-medium" style={{ color: C.onSurfaceVariant }}>
                    Liquidado via Pix
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selo de confiança */}
        <div className="relative z-10 flex items-center gap-2.5 border-t border-white/15 pt-6">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <p className="text-sm font-semibold tracking-wide">
            100% gratuito para começar
            <span className="mx-1 opacity-60">•</span>
            Sem taxas ocultas
          </p>
        </div>
      </section>

      {/* =====================================================
          PAINEL DIREITO — FORMULÁRIO
      ====================================================== */}

      <section
        className="flex w-full items-center justify-center p-6 sm:p-10 md:w-1/2 md:p-14 lg:p-16"
        style={{ backgroundColor: C.surfaceLowest }}
      >
        <div className="flex w-full max-w-[480px] flex-col justify-center py-6">
          {/* Cabeçalho */}
          <div className="mb-7">
            <h2 className={`${T.headlineLg} font-extrabold`}>
              Crie sua conta no Racha+
            </h2>
            <p className={`${T.bodyMd} mt-1.5`} style={{ color: C.outline }}>
              Preencha seus dados para organizar seus grupos com facilidade.
            </p>
          </div>

          {/* Cadastro social (ainda não configurado) */}
          <button
            type="button"
            disabled
            title="Cadastro com Google ainda não está configurado."
            className={`${T.labelMd} flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg px-4 py-3 opacity-60 shadow-sm`}
            style={{ backgroundColor: C.surfaceLow, color: C.onSurface }}
          >
            <IconeGoogle />
            <span>Cadastrar com o Google</span>
          </button>

          {/* Divisor */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="h-px w-full" style={{ backgroundColor: C.surfaceHigh }} />
            <span
              className="absolute px-3 text-xs font-semibold uppercase tracking-wider"
              style={{ backgroundColor: C.surfaceLowest, color: C.outline }}
            >
              ou cadastre com seu e-mail
            </span>
          </div>

          {erro && (
            <p
              role="alert"
              className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {erro}
            </p>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Nome */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nome" className={T.labelMd}>
                Nome completo
              </label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2"
                  style={{ color: C.outline }}
                />
                <input
                  id="nome"
                  type="text"
                  required
                  autoComplete="name"
                  value={formulario.nome}
                  onChange={(event) => handleChange("nome", event.target.value)}
                  onFocus={() => setCampoFocado("nome")}
                  onBlur={() => setCampoFocado(null)}
                  placeholder="Ex: Ana Clara Silva"
                  className={`${classeCampo} pr-4`}
                  style={estiloCampo("nome")}
                />
              </div>
            </div>

            {/* E-mail */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className={T.labelMd}>
                E-mail
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2"
                  style={{ color: C.outline }}
                />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formulario.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  onFocus={() => setCampoFocado("email")}
                  onBlur={() => setCampoFocado(null)}
                  placeholder="ana@exemplo.com"
                  className={`${classeCampo} pr-4`}
                  style={estiloCampo("email")}
                />
              </div>
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="senha" className={T.labelMd}>
                Senha
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2"
                  style={{ color: C.outline }}
                />
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={formulario.senha}
                  onChange={(event) => handleChange("senha", event.target.value)}
                  onFocus={() => setCampoFocado("senha")}
                  onBlur={() => setCampoFocado(null)}
                  placeholder="Mínimo de 8 caracteres"
                  className={`${classeCampo} pr-11`}
                  style={estiloCampo("senha")}
                />
                <button
                  type="button"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setMostrarSenha((atual) => !atual)}
                  className="absolute right-3.5 top-1/2 flex -translate-y-1/2 cursor-pointer items-center transition-colors hover:text-[#121c2a]"
                  style={{ color: C.outline }}
                >
                  {mostrarSenha ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Indicador de força da senha */}
              {nivel && (
                <div
                  className="mt-2 flex flex-col gap-2 rounded-lg p-3"
                  style={{ backgroundColor: `${C.surfaceLow}b3` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: C.onSurfaceVariant }}>
                      Força da senha:
                    </span>
                    <span
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${nivel.selo}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${nivel.ponto}`} />
                      {nivel.texto}
                    </span>
                  </div>

                  <div className="grid w-full grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((barra) => (
                      <div
                        key={barra}
                        className={`h-1.5 rounded-full ${barra <= forcaSenha ? nivel.barra : ""}`}
                        style={
                          barra <= forcaSenha
                            ? undefined
                            : { backgroundColor: C.surfaceHighest }
                        }
                      />
                    ))}
                  </div>

                  <div
                    className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]"
                    style={{ color: C.onSurfaceVariant }}
                  >
                    {REQUISITOS.map((requisito) => {
                      const ok = requisito.teste(formulario.senha);
                      return (
                        <span
                          key={requisito.texto}
                          className={`flex items-center gap-1 ${ok ? "font-semibold text-green-700" : ""}`}
                        >
                          <Check className={`h-[13px] w-[13px] ${ok ? "" : "opacity-40"}`} strokeWidth={3} />
                          {requisito.texto}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Termos */}
            <div className="mt-1 flex items-start gap-3">
              <input
                id="termos"
                type="checkbox"
                required
                checked={formulario.termos}
                onChange={(event) => handleChange("termos", event.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded"
                style={{ accentColor: C.primaryContainer }}
              />
              <label
                htmlFor="termos"
                className={`${T.bodySm} cursor-pointer select-none leading-snug`}
                style={{ color: C.onSurfaceVariant }}
              >
                Concordo com os{" "}
                <a
                  href="#"
                  onClick={(event) => event.stopPropagation()}
                  className="font-semibold hover:underline"
                  style={{ color: C.primary }}
                >
                  Termos de Uso
                </a>{" "}
                e a{" "}
                <a
                  href="#"
                  onClick={(event) => event.stopPropagation()}
                  className="font-semibold hover:underline"
                  style={{ color: C.primary }}
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
              className={`${T.labelLg} mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#ff8c42] px-6 py-3.5 font-bold shadow-md transition-all duration-150 hover:bg-[#6a2d00] hover:shadow-lg active:scale-[0.99] disabled:cursor-wait disabled:opacity-80`}
              style={{ color: C.onPrimary }}
            >
              <span>{enviando ? "Criando conta..." : "Criar conta"}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          {/* Link para login */}
          <p
            className={`${T.bodySm} mt-6 text-center`}
            style={{ color: C.onSurfaceVariant }}
          >
            Já possui uma conta?
            <Link
              to="/login"
              className="ml-1 font-semibold underline underline-offset-4 transition-colors hover:text-[#6a2d00]"
              style={{ color: C.primary }}
            >
              Entrar
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
