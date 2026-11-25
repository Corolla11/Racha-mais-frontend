import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/auth-context";
import Aba from "../components/aba-perfil";
import BrandLogo from "../components/brand-logo";
import Icon from "../components/icon";

const NAVEGACAO = [
  { href: "#como-funciona", rotulo: "Como Funciona" },
  { href: "#recursos", rotulo: "Recursos" },
];

const DESTAQUES_HERO = [
  "Planos em um só lugar",
  "Tarefas compartilhadas",
  "Despesas organizadas",
];

const INTEGRANTES = [
  { iniciais: "OR", nome: "Organizador", fundo: "bg-primary-fixed text-on-primary-fixed" },
  { iniciais: "M1", nome: "Membro 1", fundo: "bg-secondary-fixed text-on-secondary-fixed" },
  { iniciais: "M2", nome: "Membro 2", fundo: "bg-tertiary-fixed text-on-tertiary-fixed" },
];

const BENEFICIOS = [
  {
    icone: "calculate",
    titulo: "Rateio Instantâneo",
    texto:
      "Cálculo automatizado de quem deve a quem pelo menor número de transações. Nada de matemática complexa ou constrangimento no final do evento.",
    caixa: "bg-primary-fixed text-primary",
    destaqueIcone: "sync_alt",
    destaqueTexto: "Algoritmo de compensação",
    destaqueStatus: "Otimizado",
    cor: "text-primary",
  },
  {
    icone: "checklist_rtl",
    titulo: "Tarefas e Responsáveis",
    texto:
      "Cada um sabe exatamente o que precisa levar, comprar ou reservar. Notificações inteligentes garantem que ninguém esqueça nada no dia da viagem.",
    caixa: "bg-tertiary-fixed text-tertiary",
    destaqueIcone: "verified_user",
    destaqueTexto: "Checklist colaborativo",
    destaqueStatus: "100% Sincronizado",
    cor: "text-tertiary",
  },
  {
    icone: "payments",
    titulo: "Integração via Pix",
    texto:
      "QR Code dinâmico e chave copia-e-cola com valor exato de cada um. Pague com 1 toque no app do seu banco e dê baixa instantânea na hora.",
    caixa: "bg-secondary-fixed text-secondary",
    destaqueIcone: "bolt",
    destaqueTexto: "Baixa automática Pix",
    destaqueStatus: "Sem taxas",
    cor: "text-secondary",
  },
];

function Home() {
  const { user } = useAuth();
  const [abaAberta, setAbaAberta] = useState(false);

  // Sem sessão, os convites levam ao cadastro; com sessão, direto à criação de grupo.
  const destinoCriar = user ? "/criar-grupo" : "/cadastro";

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* Cabeçalho público */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-space-md">
          <Link
            to={user ? "/home" : "/apresentacao"}
            className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-container"
            aria-label="Ir para o início do Racha+"
          >
            <BrandLogo />
          </Link>

          <nav className="hidden md:flex items-center gap-space-lg" aria-label="Navegação principal">
            {NAVEGACAO.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center min-h-11 px-2 font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
              >
                {item.rotulo}
              </a>
            ))}
            <a
              href="#precos"
              className="inline-flex items-center min-h-11 px-2 font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Preços
            </a>
          </nav>

          <div className="flex items-center gap-space-sm sm:gap-space-md">
            {user ? (
              <>
                <Link
                  to="/meus-grupos"
                  className="hidden sm:inline-flex font-label-md text-label-md text-on-surface px-space-md py-space-sm hover:bg-surface-container-high rounded-lg transition-colors"
                >
                  Meus Grupos
                </Link>
                <Link
                  to="/criar-grupo"
                  className="inline-flex items-center gap-space-xs font-label-md text-label-md bg-primary-container text-on-primary font-semibold px-space-md py-space-sm rounded-lg shadow-sm hover:bg-primary transition-all active:scale-[0.98]"
                >
                  <Icon name="add" size={18} />
                  <span>Criar grupo</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setAbaAberta((aberta) => !aberta)}
                  aria-expanded={abaAberta}
                  aria-label="Abrir opções do perfil"
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden cursor-pointer ring-2 ring-transparent hover:ring-primary-container/40 transition"
                >
                  {user.image ? (
                    <img src={user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Icon name="person" size={18} className="text-on-primary" />
                  )}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center min-h-11 font-label-md text-label-md text-on-surface px-space-sm sm:px-space-md hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  className="inline-flex items-center min-h-11 font-label-md text-label-md bg-primary-container text-on-primary font-semibold px-space-md rounded-lg shadow-sm hover:bg-primary transition-all active:scale-[0.98]"
                >
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      {abaAberta && <Aba onClose={() => setAbaAberta(false)} />}

      <main className="w-full pt-16 bg-surface flex-1">
        {/* HERO */}
        <section className="relative w-full overflow-hidden bg-surface py-12 md:py-20 lg:py-28">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[520px] max-w-[160vw] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary-fixed/30 via-tertiary-fixed/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-secondary-fixed/20 blur-2xl" />

          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Coluna de texto */}
              <div className="lg:col-span-6 flex flex-col items-start space-y-6">
                <div className="inline-flex items-center gap-space-xs px-3.5 py-1.5 rounded-full bg-surface-container-high text-primary">
                  <Icon name="auto_awesome" size={18} />
                  <span className="font-label-sm text-label-sm font-semibold tracking-wide text-on-surface">
                    Organização inteligente de despesas e tarefas em grupo
                  </span>
                </div>

                <div className="space-y-3">
                  <h1 className="font-display text-display-mobile sm:text-display text-on-surface font-extrabold tracking-tight">
                    Você combina.
                    <br />
                    <span className="text-primary">O Racha+ organiza.</span>
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                    Divida despesas de viagens, repúblicas, churrascos e eventos
                    com amigos sem dor de cabeça. Transparência total em tempo
                    real com rateio automático via Pix.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md w-full pt-2">
                  <Link
                    to={destinoCriar}
                    className="inline-flex items-center justify-center gap-space-xs px-8 py-4 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-lg shadow-primary-container/25 hover:bg-primary transition-all duration-200 active:scale-[0.98]"
                  >
                    <span>Criar meu primeiro grupo</span>
                    <Icon name="arrow_forward" size={20} />
                  </Link>
                  <a
                    href="#como-funciona"
                    className="inline-flex items-center justify-center gap-space-xs px-6 py-4 rounded-xl bg-surface-container-low text-on-surface font-label-lg text-label-lg font-semibold hover:bg-surface-container transition-all active:scale-[0.98]"
                  >
                    <Icon name="play_circle" size={22} filled className="text-primary" />
                    <span>Ver como funciona</span>
                  </a>
                </div>

                <ul className="pt-4 flex flex-wrap items-center gap-x-space-lg gap-y-space-sm">
                  {DESTAQUES_HERO.map((texto) => (
                    <li key={texto} className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant font-medium">
                      <Icon name="check_circle" size={16} filled className="text-tertiary-container" />
                      {texto}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Coluna do mockup */}
              <div id="recursos" className="lg:col-span-6 relative scroll-mt-24" aria-hidden="true">
                <div className="absolute inset-0 bg-gradient-to-tr from-surface-container to-surface-container-highest rounded-2xl rotate-2 scale-95 opacity-60" />
                <div className="relative bg-surface-container-lowest rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 shrink-0 rounded-xl bg-primary-fixed flex items-center justify-center text-2xl">
                        🏖️
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-headline-sm text-headline-sm font-bold text-on-surface">Viagem em Grupo</p>
                          <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm">Ativo</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">5 amigos • 12 despesas registradas</p>
                      </div>
                    </div>
                    <span className="w-8 h-8 shrink-0 rounded-lg bg-surface-container-low text-on-surface flex items-center justify-center">
                      <Icon name="more_vert" size={20} />
                    </span>
                  </div>

                  <div className="bg-surface-container-low rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">Integrantes:</span>
                      <div className="flex -space-x-2 items-center">
                        {INTEGRANTES.map((pessoa) => (
                          <span
                            key={pessoa.iniciais}
                            title={pessoa.nome}
                            className={`w-8 h-8 rounded-full ring-2 ring-surface-container-low flex items-center justify-center font-label-sm text-label-sm font-bold ${pessoa.fundo}`}
                          >
                            {pessoa.iniciais}
                          </span>
                        ))}
                        <span className="w-8 h-8 rounded-full ring-2 ring-surface-container-low bg-surface-container-highest text-on-surface font-label-sm text-label-sm flex items-center justify-center font-bold">
                          +2
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-secondary font-label-sm text-label-sm font-medium">
                      <Icon name="qr_code_2" size={16} />
                      <span>Pix Rateado</span>
                    </div>
                  </div>

                  <div className="bg-surface-container rounded-xl p-5 space-y-3">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <span className="font-label-sm text-label-sm font-medium text-on-surface-variant block">Total do grupo</span>
                        <span className="font-numeric-stat text-numeric-stat text-on-surface font-extrabold tabular-nums whitespace-nowrap">R$ 2.450,00</span>
                      </div>
                      <div className="text-right">
                        <span className="font-label-sm text-label-sm font-semibold text-primary block">Sua parte</span>
                        <span className="font-numeric-stat text-numeric-stat text-primary font-extrabold tabular-nums whitespace-nowrap">R$ 490,00</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="w-full bg-surface-container-highest rounded-full h-2.5 overflow-hidden">
                        <div className="bg-primary-container h-full rounded-full w-[78%]" />
                      </div>
                      <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant tabular-nums">
                        <span>78% quitado</span>
                        <span className="whitespace-nowrap">R$ 540,00 pendentes</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="font-label-md text-label-md font-bold text-on-surface">Tarefas do Grupo</p>
                      <span className="font-label-sm text-label-sm text-primary font-semibold">Ver todas (8)</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-surface-container-low">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-5 h-5 shrink-0 rounded bg-primary-container text-on-primary flex items-center justify-center">
                            <Icon name="check" size={14} />
                          </span>
                          <span className="font-body-sm text-body-sm font-medium text-on-surface line-through opacity-75">Comprar carvão e carnes</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 pl-8 sm:pl-0">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container-highest text-on-surface-variant">Organizador</span>
                          <Icon name="check_circle" size={18} className="text-tertiary" />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-surface-container-low">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-5 h-5 shrink-0 rounded bg-surface-container-highest" />
                          <span className="font-body-sm text-body-sm font-medium text-on-surface">Aluguel da Van executiva</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 pl-8 sm:pl-0">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-secondary-fixed text-on-secondary-fixed">Membro</span>
                          <Icon name="pending" size={18} className="text-secondary" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold shadow-md">
                      <Icon name="add_circle" size={18} />
                      <span>Nova Despesa ou Tarefa</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFÍCIOS */}
        <section id="como-funciona" className="w-full bg-surface-container-low py-16 lg:py-24 scroll-mt-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="font-label-sm text-label-sm font-bold tracking-widest text-primary uppercase">
                Simples • Rápido • Confiável
              </span>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg font-bold text-on-surface">
                Chega de planilhas confusas e cobranças chatas
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                O Racha+ foi desenhado para eliminar qualquer atrito financeiro
                ou logístico entre amigos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {BENEFICIOS.map((beneficio) => (
                <article
                  key={beneficio.titulo}
                  className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="space-y-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${beneficio.caixa}`}>
                      <Icon name={beneficio.icone} size={32} />
                    </div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{beneficio.titulo}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{beneficio.texto}</p>
                  </div>
                  <div className="pt-2">
                    <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon name={beneficio.destaqueIcone} size={18} className={beneficio.cor} />
                        <span className="font-label-sm text-label-sm font-semibold text-on-surface">{beneficio.destaqueTexto}</span>
                      </div>
                      <span className={`font-label-sm text-label-sm font-bold text-right ${beneficio.cor}`}>{beneficio.destaqueStatus}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PLANOS PÚBLICOS (#precos) */}
        <section id="precos" className="w-full bg-surface py-16 lg:py-20 scroll-mt-16">
          <div className="max-w-5xl mx-auto px-6 lg:px-12 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="font-label-sm text-label-sm font-bold tracking-widest text-primary uppercase">
                Planos transparentes
              </span>
              <h2 className="font-headline-lg-mobile sm:font-headline-lg font-bold text-on-surface">
                Comece grátis e evolua quando precisar
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-sm flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Gratuito</h3>
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm font-semibold">Para sempre</span>
                  </div>
                  <p className="font-numeric-stat text-numeric-stat text-on-surface font-extrabold tabular-nums">R$ 0<span className="font-body-sm text-on-surface-variant font-normal"> /mês</span></p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Até 3 grupos gratuitos ativos com divisão por tarefas e histórico de rateio.</p>
                </div>
                <Link to={destinoCriar} className="min-h-11 inline-flex items-center justify-center rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md font-semibold transition-colors">
                  Começar grátis
                </Link>
              </div>
              <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-md ring-2 ring-primary-container/25 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Racha+ Pro</h3>
                    <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">Mais grupos</span>
                  </div>
                  <p className="font-numeric-stat text-numeric-stat text-primary font-extrabold tabular-nums">Plano Pro<span className="font-body-sm text-on-surface-variant font-normal"> • mensal ou anual</span></p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Grupos ilimitados por assinatura do grupo, comprovantes e automações completas.</p>
                </div>
                <Link to={user ? "/assinatura" : "/cadastro"} className="min-h-11 inline-flex items-center justify-center rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md font-bold transition-colors">
                  {user ? "Ver planos Pro" : "Criar conta e conhecer"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="w-full bg-surface py-12 lg:py-16">
          <div className="max-w-5xl mx-auto px-6 lg:px-12">
            <div className="relative overflow-hidden rounded-3xl bg-inverse-surface text-inverse-on-surface p-8 sm:p-12 lg:p-16 text-center space-y-8 shadow-2xl">
              <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary-container/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl" />
              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <span className="inline-block px-3.5 py-1.5 rounded-full bg-surface-container/10 font-label-sm text-label-sm font-medium tracking-wide text-primary-fixed-dim">
                  Comece em menos de 1 minuto
                </span>
                <h2 className="font-display text-headline-lg lg:text-display font-extrabold tracking-tight">
                  Pronto para o próximo rolê sem estresse de dinheiro?
                </h2>
                <p className="font-body-lg text-body-lg text-inverse-on-surface/90">
                  {user
                    ? "Crie um novo grupo agora e compartilhe o link direto no WhatsApp dos seus amigos."
                    : "Crie sua conta gratuita agora e compartilhe o link do grupo direto no WhatsApp dos seus amigos."}
                </p>
              </div>
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={destinoCriar}
                  className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-lg hover:bg-primary transition-all active:scale-[0.98]"
                >
                  <span>{user ? "Criar novo grupo" : "Criar conta gratuita"}</span>
                  <Icon name="rocket_launch" size={20} />
                </Link>
                <span className="text-inverse-on-surface/90 font-label-sm text-label-sm">
                  Sem cartão de crédito necessário
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="w-full bg-surface-container-low py-space-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-space-md text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-space-sm">
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Racha+</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">— Gestão social de despesas e tarefas em grupo</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-space-md font-body-sm text-body-sm text-on-surface-variant">
            <Link className="inline-flex items-center min-h-11 px-2 hover:text-primary transition-colors" to="/faq#termos">Termos</Link>
            <Link className="inline-flex items-center min-h-11 px-2 hover:text-primary transition-colors" to="/faq#privacidade">Privacidade</Link>
            <Link className="inline-flex items-center min-h-11 px-2 hover:text-primary transition-colors" to="/faq">Ajuda</Link>
            <span>© {new Date().getFullYear()} Racha+. Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
