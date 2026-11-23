import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon from "./icon";

const ETAPAS = ["Solicitar", "Confirmado", "Nova Senha"];

const DESTAQUES = [
  { icone: "bolt", titulo: "Sem Complicação", texto: "Link instantâneo enviado ao seu e-mail" },
  { icone: "security", titulo: "Criptografia Forte", texto: "Seus dados e saldos nunca são expostos" },
];

/**
 * Estrutura das telas de recuperação de senha — tela
 * "2.1 Recuperação de Senha" do Stitch: painel de marca à
 * esquerda e área de trabalho com as etapas à direita.
 */
export default function RecuperacaoLayout({
  etapa,
  children,
}: {
  etapa: 1 | 2 | 3;
  children: ReactNode;
}) {
  return (
    <main className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-surface-container-lowest font-body-md text-on-surface antialiased">
      {/* PAINEL ESQUERDO — marca e confiança */}
      <aside className="lg:col-span-5 bg-gradient-to-br from-primary-container via-primary to-on-primary-fixed-variant p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden text-on-primary">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-20 w-96 h-96 rounded-full bg-tertiary-container/20 blur-3xl pointer-events-none" />

        {/* Marca */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <Link to="/login" className="flex items-center gap-3" aria-label="Racha+, voltar para o login">
            <span className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-sm">
              <Icon name="pie_chart" size={24} className="text-white font-bold" />
            </span>
            <span className="flex flex-col">
              <span className="font-display text-headline-sm text-white tracking-tight leading-none">
                Racha<span className="text-tertiary-fixed">+</span>
              </span>
              <span className="font-label-sm text-white/80 uppercase tracking-widest text-[10px] mt-0.5">
                Finanças Compartilhadas
              </span>
            </span>
          </Link>
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white font-label-sm text-[11px]">
            <Icon name="verified_user" size={14} className="text-tertiary-fixed" />
            Proteção SSL 256-bit
          </span>
        </div>

        {/* Narrativa central */}
        <div className="relative z-10 my-12 lg:my-0 flex flex-col space-y-6">
          <span className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-label-md text-xs font-medium">
            <Icon name="lock_reset" size={14} className="text-tertiary-fixed" />
            Recuperação Segura de Acesso
          </span>
          <h1 className="font-display text-display-mobile lg:text-headline-lg text-white font-bold leading-tight tracking-tight">
            Recupere seu acesso e volte a rachar sem estresse.
          </h1>
          <p className="font-body-md text-white/90 text-sm leading-relaxed max-w-md">
            Esqueceu sua senha? Acontece! Em poucos passos você redefine sua
            credencial e mantém seus grupos, churrascos, viagens e despesas
            domésticas 100% equilibrados.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {DESTAQUES.map(({ icone, titulo, texto }) => (
              <div key={titulo} className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Icon name={icone} size={16} className="text-white" />
                </span>
                <span>
                  <span className="block font-label-md text-white text-xs font-semibold">{titulo}</span>
                  <span className="block font-body-sm text-white/70 text-[11px]">{texto}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Depoimento */}
        <figure className="relative z-10 p-5 rounded-2xl bg-white/10 backdrop-blur-lg shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-1 text-tertiary-fixed" role="img" aria-label="Avaliação 4,9 de 5">
            {Array.from({ length: 5 }, (_, i) => (
              <Icon key={i} name="star" size={14} filled />
            ))}
            <span className="font-label-sm text-xs text-white/90 ml-1.5 font-bold">4.9/5</span>
          </div>
          <blockquote className="font-body-sm text-white/90 text-xs italic leading-relaxed">
            “Troquei de telefone, esqueci a chave e em menos de 2 minutos já
            estava conferindo o fechamento do aluguel do apê. O fluxo é limpo e
            direto ao ponto!”
          </blockquote>
          <figcaption className="flex items-center gap-3 pt-1">
            <span className="w-8 h-8 rounded-full shrink-0 bg-white/25 flex items-center justify-center font-label-sm text-[11px] font-bold text-white" aria-hidden="true">
              CD
            </span>
            <span>
              <span className="block font-label-md text-white text-xs font-semibold leading-none">Camila Duarte</span>
              <span className="block font-body-sm text-white/70 text-[10px]">Organiza 4 grupos no Racha+</span>
            </span>
          </figcaption>
        </figure>
      </aside>

      {/* PAINEL DIREITO — etapas */}
      <section className="lg:col-span-7 bg-surface-container-lowest p-6 sm:p-10 lg:p-14 flex flex-col justify-between">
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
          <ol
            aria-label="Etapas da recuperação"
            className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container-low max-w-full overflow-x-auto self-start"
          >
            {ETAPAS.map((nome, indice) => {
              const numero = indice + 1;
              const atual = numero === etapa;
              return (
                <li
                  key={nome}
                  aria-current={atual ? "step" : undefined}
                  className={`px-3 py-1.5 rounded-lg text-xs font-label-md font-semibold transition-all duration-200 flex items-center gap-1 shrink-0 ${
                    atual ? "bg-surface-container-lowest text-primary-container shadow-sm" : "text-on-surface-variant"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      atual ? "bg-primary-container text-white" : "bg-surface-container-highest text-on-surface-variant"
                    }`}
                  >
                    {numero}
                  </span>
                  {nome}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-4">{children}</div>

        <footer className="pt-6 flex flex-col sm:flex-row items-center justify-between text-on-surface-variant font-label-sm text-xs gap-3">
          <span className="flex items-center gap-2">
            <Icon name="support_agent" size={16} className="text-primary-container" />
            <span>
              Dúvidas?{" "}
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
    <div role="alert" className="p-4 rounded-xl bg-error-container/60 text-on-error-container flex items-start gap-3">
      <Icon name="error" size={20} className="text-error shrink-0" />
      <div className="flex-1">
        <p className="font-label-md text-xs font-bold text-on-error-container">{titulo}</p>
        <p className="font-body-sm text-xs text-on-error-container/90 mt-0.5">{descricao}</p>
      </div>
      <button
        type="button"
        aria-label="Fechar aviso"
        onClick={onFechar}
        className="text-on-error-container/70 hover:text-on-error-container cursor-pointer flex"
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
