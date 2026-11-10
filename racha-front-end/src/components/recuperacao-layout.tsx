import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CR } from "../lib/recuperacao-tokens";
import { Headset, LockKeyhole, PieChart, RotateCcwKey, Shield, ShieldCheck, Star, Zap } from "lucide-react";

const ETAPAS = ["Solicitar", "Confirmado", "Nova Senha"];

export default function RecuperacaoLayout({
  etapa,
  children,
}: {
  etapa: 1 | 2 | 3;
  children: ReactNode;
}) {
  return (
    <main
      className="grid min-h-screen w-full grid-cols-1 font-jakarta lg:grid-cols-12"
      style={{ backgroundColor: CR.surfaceLowest, color: CR.onSurface }}
    >
      {/* =====================================================
          PAINEL ESQUERDO
      ====================================================== */}

      <aside
        className="relative flex flex-col justify-between overflow-hidden p-8 text-white lg:col-span-5 lg:p-14"
        style={{
          background: `linear-gradient(to bottom right, ${CR.primaryContainer}, ${CR.primary}, ${CR.onPrimaryFixedVariant})`,
        }}
      >
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div
          className="pointer-events-none absolute -right-20 bottom-10 h-96 w-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${CR.tertiaryContainer}33` }}
        />

        {/* Marca */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <Link to="/login" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 shadow-sm backdrop-blur-md">
              <PieChart className="h-6 w-6" strokeWidth={2.5} />
            </span>
            <span className="flex flex-col">
              <span className="text-xl font-semibold leading-none tracking-tight">
                Racha<span style={{ color: CR.tertiaryFixed }}>+</span>
              </span>
              <span className="mt-0.5 text-[10px] uppercase tracking-widest text-white/80">
                Finanças Compartilhadas
              </span>
            </span>
          </Link>
          <span className="hidden items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] backdrop-blur-md sm:flex">
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: CR.tertiaryFixed }} />
            Conexão protegida
          </span>
        </div>

        {/* Chamada */}
        <div className="relative z-10 my-12 flex flex-col gap-6 lg:my-0">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-medium backdrop-blur-md">
            <RotateCcwKey className="h-3.5 w-3.5" style={{ color: CR.tertiaryFixed }} />
            Recuperação Segura de Acesso
          </span>
          <h1 className="text-[2.25rem] font-bold leading-tight tracking-tight lg:text-[2rem]">
            Recupere seu acesso e volte a rachar sem estresse.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-white/90">
            Esqueceu sua senha? Acontece! Em poucos passos você redefine sua
            credencial e mantém seus grupos, churrascos, viagens e despesas
            domésticas 100% equilibrados.
          </p>
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            {[
              { icone: Zap, titulo: "Sem Complicação", texto: "Link instantâneo enviado ao seu e-mail" },
              { icone: Shield, titulo: "Criptografia Forte", texto: "Seus dados e saldos nunca são expostos" },
            ].map(({ icone: Icone, titulo, texto }) => (
              <div key={titulo} className="flex items-start gap-3 rounded-xl bg-white/10 p-3.5 backdrop-blur-md">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
                  <Icone className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-xs font-semibold">{titulo}</span>
                  <span className="block text-[11px] text-white/70">{texto}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Depoimento */}
        <figure className="relative z-10 flex flex-col gap-3 rounded-2xl bg-white/10 p-5 shadow-sm backdrop-blur-lg">
          <div className="flex items-center gap-1" style={{ color: CR.tertiaryFixed }} aria-label="Avaliação 4,9 de 5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className="h-3.5 w-3.5" fill="currentColor" />
            ))}
            <span className="ml-1.5 text-xs font-bold text-white/90">4.9/5</span>
          </div>
          <blockquote className="text-xs italic leading-relaxed text-white/90">
            “Troquei de telefone, esqueci a senha e em menos de 2 minutos já
            estava conferindo o fechamento do aluguel do apê. O fluxo é limpo e
            direto ao ponto!”
          </blockquote>
          <figcaption className="flex items-center gap-3 pt-1">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/25 text-[11px] font-bold">
              CD
            </span>
            <span>
              <span className="block text-xs font-semibold leading-none">Camila Duarte</span>
              <span className="block text-[10px] text-white/70">Organiza 4 grupos no Racha+</span>
            </span>
          </figcaption>
        </figure>
      </aside>

      {/* =====================================================
          PAINEL DIREITO
      ====================================================== */}

      <section className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-7 lg:p-14">
        <ol
          aria-label="Etapas da recuperação"
          className="flex max-w-full items-center gap-1.5 self-start overflow-x-auto rounded-xl p-1 pb-1"
          style={{ backgroundColor: CR.surfaceLow }}
        >
          {ETAPAS.map((nome, indice) => {
            const numero = indice + 1;
            const atual = numero === etapa;
            return (
              <li
                key={nome}
                aria-current={atual ? "step" : undefined}
                className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  atual ? "bg-white shadow-sm" : ""
                }`}
                style={{ color: atual ? CR.primaryContainer : CR.onSurfaceVariant }}
              >
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
                  style={
                    atual
                      ? { backgroundColor: CR.primaryContainer, color: "#fff" }
                      : { backgroundColor: CR.surfaceHighest, color: CR.onSurfaceVariant }
                  }
                >
                  {numero}
                </span>
                {nome}
              </li>
            );
          })}
        </ol>

        <div className="mx-auto my-auto w-full max-w-md py-10">{children}</div>

        <footer
          className="flex flex-col items-center justify-between gap-3 text-xs sm:flex-row"
          style={{ color: CR.onSurfaceVariant }}
        >
          <span className="flex items-center gap-2">
            <Headset className="h-4 w-4" style={{ color: CR.primaryContainer }} />
            <span>
              Dúvidas?{" "}
              <a
                href="mailto:suporte@plusracha.com.br"
                className="font-semibold hover:underline"
                style={{ color: CR.primary }}
              >
                Fale com o suporte
              </a>
            </span>
          </span>
          <span className="flex items-center gap-2">
            <LockKeyhole className="h-3.5 w-3.5" />
            Termos de Uso • Privacidade
          </span>
        </footer>
      </section>
    </main>
  );
}

// Bloco de erro exibido acima dos formulários
export function BannerErro({
  titulo,
  descricao,
  onFechar,
}: {
  titulo: string;
  descricao: string;
  onFechar: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl p-4"
      style={{ backgroundColor: `${CR.errorContainer}99`, color: CR.onErrorContainer }}
    >
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: CR.error }}
        aria-hidden="true"
      >
        !
      </span>
      <div className="flex-1">
        <p className="text-xs font-bold">{titulo}</p>
        <p className="mt-0.5 text-xs opacity-90">{descricao}</p>
      </div>
      <button
        type="button"
        aria-label="Fechar aviso"
        onClick={onFechar}
        className="cursor-pointer text-sm opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
