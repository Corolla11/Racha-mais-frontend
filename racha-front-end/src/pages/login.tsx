import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  PieChart,
  ShieldCheck,
  Star,
  TrendingUp,
  User,
} from "lucide-react";

/* =====================================================
   TOKENS DO DESIGN

   Ficam aqui dentro (e não no tema do Tailwind) para que
   esta tela não interfira nas demais páginas do projeto.
====================================================== */

// Paleta
const C = {
  primary: "#865300",
  primaryContainer: "#f2a541",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#663e00",

  secondary: "#386188",
  secondaryContainer: "#aad3ff",

  tertiary: "#8e4e00",
  tertiaryContainer: "#ff9e3e",

  surface: "#f7f9ff",
  surfaceLowest: "#ffffff",
  surfaceLow: "#ecf4ff",
  surfaceContainer: "#e4effc",
  surfaceHigh: "#dee9f6",

  onSurface: "#121d26",
  onSurfaceVariant: "#524436",

  outline: "#857464",
  outlineVariant: "#d7c3b0",
};

// Escala tipográfica
const T = {
  headlineXl: "text-[36px] leading-[44px] tracking-[-0.02em] font-bold",
  headlineLg: "text-[28px] leading-9 tracking-[-0.015em] font-semibold",
  headlineMd: "text-[22px] leading-7 tracking-[-0.01em] font-semibold",
  headlineSm: "text-[18px] leading-6 font-semibold",
  bodyMd: "text-sm leading-5 font-normal",
  bodySm: "text-[13px] leading-[18px] font-normal",
  labelLg: "text-sm leading-5 font-semibold",
  labelMd: "text-xs leading-4 tracking-[0.02em] font-semibold",
  labelSm: "text-[11px] leading-[14px] tracking-[0.04em] font-semibold",
};

// Logo do Google usado no botão de login social
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

// Selos exibidos no painel lateral
const FUNCIONALIDADES = [
  { emoji: "⚡", cor: C.primary, texto: "Divisão com IA" },
  { emoji: "📱", cor: C.secondary, texto: "Pix Copia e Cola" },
  { emoji: "✅", cor: C.tertiary, texto: "Confiabilidade coletiva" },
];

export default function Login() {
  // Controla se a senha está visível
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Destaca visualmente o campo em foco
  const [campoFocado, setCampoFocado] = useState<string | null>(null);

  // Dados do formulário
  const [formulario, setFormulario] = useState({
    email: "",
    senha: "",
    lembrar: false,
  });

  // Altera os dados do formulário
  function handleChange(
    campo: keyof typeof formulario,
    valor: string | boolean
  ) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  // Envia o formulário
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log("Dados do login:", formulario);
  }

  // Estilo compartilhado pelos campos de texto
  function estiloCampo(campo: string) {
    const focado = campoFocado === campo;

    return {
      backgroundColor: focado ? C.surfaceLowest : C.surfaceLow,
      color: C.onSurface,
      boxShadow: focado ? `0 0 0 2px ${C.primaryContainer}` : undefined,
    };
  }

  return (
    <div
      className="flex min-h-screen flex-col justify-between font-jakarta"
      style={{ backgroundColor: C.surface, color: C.onSurface }}
    >

      {/* =====================================================
          CABEÇALHO
      ====================================================== */}

      <header
        className="fixed top-0 z-50 w-full shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl"
        style={{ backgroundColor: `${C.surface}cc` }}
      >
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">

          {/* Marca */}
          <a
            href="#"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm"
              style={{ backgroundColor: C.primary }}
            >
              <PieChart className="h-5 w-5" style={{ color: C.onPrimary }} />
            </div>
            <div className="flex flex-col">
              <span className={`${T.headlineSm} leading-none tracking-tight`}>
                Racha<span style={{ color: C.primary }}>+</span>
              </span>
              <span
                className="hidden text-[11px] leading-tight tracking-[0.04em] sm:inline-block"
                style={{ color: C.onSurfaceVariant }}
              >
                Você combina. O Racha+ organiza.
              </span>
            </div>
          </a>

          {/* Navegação */}
          <nav className="flex items-center gap-4">
            <a
              href="#"
              className={`${T.labelLg} flex items-center gap-1 rounded-lg px-3 py-2 transition-colors hover:bg-[#ecf4ff] hover:text-[#121d26]`}
              style={{ color: C.onSurfaceVariant }}
            >
              <ArrowLeft className="h-[18px] w-[18px]" />
              Voltar à Landing Page
            </a>
            <a
              href="#"
              className={`${T.labelLg} rounded-lg px-3 py-2 transition-colors hover:bg-[#ecf4ff] hover:text-[#121d26]`}
              style={{ color: C.onSurfaceVariant }}
            >
              Criar Conta
            </a>
          </nav>

          {/* Ações */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className={`${T.labelLg} hidden items-center justify-center rounded-xl px-5 py-2 transition-all hover:brightness-95 md:inline-flex`}
              style={{
                backgroundColor: C.primaryContainer,
                color: C.onPrimaryContainer,
              }}
            >
              Começar grátis
            </a>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: C.primary }}
            >
              <User
                className="h-[18px] w-[18px]"
                style={{ color: C.onPrimary }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTEÚDO PRINCIPAL
      ====================================================== */}

      <main
        className="flex w-full flex-1 flex-col justify-center pt-16"
        style={{ backgroundColor: C.surface }}
      >
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-[1280px] items-center justify-center px-6 py-8 lg:py-12">
          <div
            className="grid w-full max-w-[1080px] grid-cols-1 overflow-hidden rounded-xl shadow-xl lg:grid-cols-12"
            style={{ backgroundColor: C.surfaceLowest }}
          >

            {/* ---------------------------------------------
                COLUNA ESQUERDA — FORMULÁRIO
            ---------------------------------------------- */}

            <div className="flex flex-col justify-between p-8 sm:p-10 lg:col-span-7 lg:p-12">
              <div>

                {/* Título */}
                <div className="mb-6">
                  <span
                    className={`${T.labelSm} mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1`}
                    style={{
                      backgroundColor: C.surfaceContainer,
                      color: C.secondary,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 animate-pulse rounded-full"
                      style={{ backgroundColor: C.primaryContainer }}
                    />
                    Acesso Seguro
                  </span>
                  <h1 className={T.headlineXl}>Bem-vindo de volta!</h1>
                  <p
                    className={`${T.bodyMd} mt-1`}
                    style={{ color: C.onSurfaceVariant }}
                  >
                    Acesse seus grupos, contas divididas e compromissos
                    combinados.
                  </p>
                </div>

                {/* Login social */}
                <button
                  type="button"
                  className={`${T.labelMd} mb-6 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl px-4 py-3 shadow-sm transition-all duration-200 hover:brightness-95`}
                  style={{
                    backgroundColor: C.surfaceLow,
                    color: C.onSurface,
                  }}
                >
                  <IconeGoogle />
                  <span>Google</span>
                </button>

                {/* Divisor */}
                <div className="relative my-6 flex items-center justify-center">
                  <div
                    className="h-px w-full"
                    style={{ backgroundColor: C.surfaceHigh }}
                  />
                  <span
                    className={`${T.labelSm} absolute px-3 uppercase`}
                    style={{
                      backgroundColor: C.surfaceLowest,
                      color: C.onSurfaceVariant,
                    }}
                  >
                    ou entre com seu e-mail
                  </span>
                </div>

                {/* Formulário */}
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

                  {/* E-mail */}
                  <div>
                    <label htmlFor="email" className={`${T.labelMd} mb-1.5 block`}>
                      E-mail
                    </label>
                    <div className="relative flex items-center">
                      <Mail
                        className="pointer-events-none absolute left-3.5 h-5 w-5"
                        style={{ color: C.onSurfaceVariant }}
                      />
                      <input
                        id="email"
                        type="email"
                        required
                        value={formulario.email}
                        onChange={(event) =>
                          handleChange("email", event.target.value)
                        }
                        onFocus={() => setCampoFocado("email")}
                        onBlur={() => setCampoFocado(null)}
                        placeholder="ex: mariana@email.com"
                        className={`${T.bodyMd} h-11 w-full rounded-lg pl-11 pr-4 transition-all placeholder:text-[#857464] focus:outline-none`}
                        style={estiloCampo("email")}
                      />
                    </div>
                  </div>

                  {/* Senha */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label htmlFor="senha" className={`${T.labelMd} block`}>
                        Sua senha
                      </label>
                      <a
                        href="#"
                        className={`${T.labelSm} transition-opacity hover:opacity-70`}
                        style={{ color: C.primary }}
                      >
                        Esqueceu sua senha?
                      </a>
                    </div>
                    <div className="relative flex items-center">
                      <Lock
                        className="pointer-events-none absolute left-3.5 h-5 w-5"
                        style={{ color: C.onSurfaceVariant }}
                      />
                      <input
                        id="senha"
                        type={mostrarSenha ? "text" : "password"}
                        required
                        value={formulario.senha}
                        onChange={(event) =>
                          handleChange("senha", event.target.value)
                        }
                        onFocus={() => setCampoFocado("senha")}
                        onBlur={() => setCampoFocado(null)}
                        placeholder="••••••••"
                        className={`${T.bodyMd} h-11 w-full rounded-lg pl-11 pr-11 transition-all placeholder:text-[#857464] focus:outline-none`}
                        style={estiloCampo("senha")}
                      />
                      <button
                        type="button"
                        aria-label="Exibir ou ocultar senha"
                        onClick={() => setMostrarSenha((atual) => !atual)}
                        className="absolute right-3 flex cursor-pointer items-center justify-center p-1 transition-opacity hover:opacity-70"
                        style={{ color: C.onSurfaceVariant }}
                      >
                        {mostrarSenha ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Lembrar de mim */}
                  <div className="mt-1 flex items-center gap-2.5">
                    <input
                      id="lembrar"
                      type="checkbox"
                      checked={formulario.lembrar}
                      onChange={(event) =>
                        handleChange("lembrar", event.target.checked)
                      }
                      className="h-4 w-4 cursor-pointer rounded"
                      style={{ accentColor: C.primaryContainer }}
                    />
                    <label
                      htmlFor="lembrar"
                      className={`${T.bodySm} cursor-pointer select-none`}
                      style={{ color: C.onSurfaceVariant }}
                    >
                      Lembrar de mim por 30 dias
                    </label>
                  </div>

                  {/* Botão principal */}
                  <button
                    type="submit"
                    className={`${T.labelLg} mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 shadow-md transition-all hover:shadow-lg hover:brightness-95`}
                    style={{
                      backgroundColor: C.primaryContainer,
                      color: C.onPrimary,
                    }}
                  >
                    <span>Entrar na minha conta</span>
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </button>
                </form>
              </div>

              {/* Rodapé do formulário */}
              <div className="mt-8 flex flex-col gap-4 pt-6">
                <div
                  className={`${T.bodySm} text-center`}
                  style={{ color: C.onSurfaceVariant }}
                >
                  Ainda não tem uma conta no Racha+?
                  <a
                    href="#"
                    className="ml-1 font-semibold transition-opacity hover:opacity-70"
                    style={{ color: C.primary }}
                  >
                    Cadastre-se gratuitamente
                  </a>
                </div>
                <div
                  className={`${T.labelSm} flex items-center justify-center gap-2 rounded-lg px-3 py-2 normal-case`}
                  style={{
                    backgroundColor: C.surfaceLow,
                    color: C.onSurfaceVariant,
                  }}
                >
                  <ShieldCheck
                    className="h-4 w-4 shrink-0"
                    style={{ color: C.secondary }}
                  />
                  <span>
                    Ambiente seguro com criptografia de ponta a ponta e
                    conciliação Pix protegida.
                  </span>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------
                COLUNA DIREITA — PROVA SOCIAL
            ---------------------------------------------- */}

            <div
              className="relative flex flex-col justify-between overflow-hidden p-8 sm:p-10 lg:col-span-5"
              style={{ backgroundColor: C.surfaceLow }}
            >

              {/* Brilhos decorativos */}
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
                style={{ backgroundColor: `${C.primaryContainer}1a` }}
              />
              <div
                className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full blur-3xl"
                style={{ backgroundColor: `${C.secondaryContainer}33` }}
              />

              <div className="relative z-10">

                {/* Chamada institucional */}
                <div className="mb-6">
                  <span
                    className={`${T.labelSm} mb-3 inline-block rounded px-3 py-1 uppercase`}
                    style={{
                      backgroundColor: C.surfaceHigh,
                      color: C.secondary,
                    }}
                  >
                    Racha+ Coletivo
                  </span>
                  <h2 className={`${T.headlineLg} leading-snug`}>
                    Você combina.
                    <br />
                    <span className="font-bold" style={{ color: C.primary }}>
                      O Racha+ organiza.
                    </span>
                  </h2>
                  <p
                    className={`${T.bodyMd} mt-2`}
                    style={{ color: C.onSurfaceVariant }}
                  >
                    Controle automático de contas em grupo, despesas divididas e
                    tarefas compartilhadas sem constrangimentos.
                  </p>
                </div>

                {/* Selos */}
                <div className="mb-8 flex flex-wrap gap-2">
                  {FUNCIONALIDADES.map((funcionalidade) => (
                    <span
                      key={funcionalidade.texto}
                      className={`${T.labelSm} inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 shadow-sm`}
                      style={{
                        backgroundColor: C.surfaceLowest,
                        color: C.onSurface,
                      }}
                    >
                      <span style={{ color: funcionalidade.cor }}>
                        {funcionalidade.emoji}
                      </span>
                      {funcionalidade.texto}
                    </span>
                  ))}
                </div>

                {/* Depoimento */}
                <div
                  className="mb-6 rounded-xl p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
                  style={{ backgroundColor: C.surfaceLowest }}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrQsGV169WMYsh8I6JGggrw6gJXiLa1Wd36wm5Vf_iQmAus2-d0TEXhJBj_1ZWmbGg_8Sp2fIPxJCL_IUtwP3wtCsjhtNCdJs7SoqNJEhpJw3UnCKy3dCw3-IdLXT9nxwPyTU_K_At6lbzlgHyjw44bI4jlTfuBStvtSczzuXpRTuHeG1zErYwEOFr7_k8Df2U5AnnUGC0wZB4i5ST8NcF2X-2X9sZahqGh8GKkOC8z31TQp6meDBN"
                      alt="Foto de Mariana Silva"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className={`${T.labelMd} truncate`}>
                        Mariana Silva
                      </div>
                      <div
                        className={`${T.labelSm} truncate`}
                        style={{ color: C.onSurfaceVariant }}
                      >
                        República Pinheiros &amp; Viagens
                      </div>
                    </div>
                    <div
                      className="flex"
                      style={{ color: C.primaryContainer }}
                      aria-label="Avaliação: 5 de 5 estrelas"
                    >
                      {Array.from({ length: 5 }).map((_, indice) => (
                        <Star
                          key={indice}
                          className="h-[18px] w-[18px] fill-current"
                        />
                      ))}
                    </div>
                  </div>
                  <p className={`${T.bodySm} italic`}>
                    "Nunca mais precisei cobrar ninguém no WhatsApp. O Racha+
                    avisa quem tem que pagar e quem cumpriu a tarefa sem gerar
                    clima ruim."
                  </p>
                </div>
              </div>

              {/* Métricas */}
              <div
                className="relative z-10 rounded-xl p-5 shadow-sm"
                style={{ backgroundColor: C.surfaceLowest }}
              >
                <div
                  className={`${T.labelSm} mb-3 flex items-center justify-between uppercase`}
                  style={{ color: C.onSurfaceVariant }}
                >
                  <span>Métricas da plataforma</span>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: C.secondary }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="rounded-lg p-3"
                    style={{ backgroundColor: C.surfaceLow }}
                  >
                    <div
                      className={`${T.headlineMd} font-bold`}
                      style={{ color: C.primary }}
                    >
                      R$ 480k+
                    </div>
                    <div
                      className={`${T.labelSm} mt-0.5`}
                      style={{ color: C.onSurfaceVariant }}
                    >
                      divididos sem atritos
                    </div>
                  </div>
                  <div
                    className="rounded-lg p-3"
                    style={{ backgroundColor: C.surfaceLow }}
                  >
                    <div
                      className={`${T.headlineMd} font-bold`}
                      style={{ color: C.secondary }}
                    >
                      98.4%
                    </div>
                    <div
                      className={`${T.labelSm} mt-0.5`}
                      style={{ color: C.onSurfaceVariant }}
                    >
                      pagos e cumpridos no prazo
                    </div>
                  </div>
                </div>

                {/* Tendência */}
                <div
                  className={`${T.labelSm} mt-3 flex items-center justify-between pt-2`}
                  style={{ color: C.onSurfaceVariant }}
                >
                  <span
                    className="flex items-center gap-1"
                    style={{ color: C.tertiary }}
                  >
                    <TrendingUp className="h-4 w-4" />
                    +14% novos grupos este mês
                  </span>
                  <svg
                    className="h-6 w-20"
                    fill="none"
                    viewBox="0 0 100 24"
                    style={{ color: C.primary }}
                    aria-hidden="true"
                  >
                    <path
                      d="M0 20 L20 16 L40 18 L60 8 L80 12 L100 2"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================
          RODAPÉ
      ====================================================== */}

      <footer className="w-full py-6" style={{ backgroundColor: C.surfaceLow }}>
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-6 text-center sm:flex-row sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            <span className={T.bodySm} style={{ color: C.onSurfaceVariant }}>
              © 2024 Racha+. Todos os direitos reservados.
            </span>
            <span
              className={`${T.bodySm} hidden sm:inline`}
              style={{ color: C.outlineVariant }}
            >
              •
            </span>
            <span className={T.bodySm} style={{ color: C.onSurfaceVariant }}>
              Gestão inteligente de despesas conjuntas.
            </span>
          </div>
          <div className="flex items-center gap-6">
            {["Termos de Uso", "Privacidade", "Suporte"].map((item) => (
              <a
                key={item}
                href="#"
                className={`${T.bodySm} transition-opacity hover:opacity-70`}
                style={{ color: C.onSurfaceVariant }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
