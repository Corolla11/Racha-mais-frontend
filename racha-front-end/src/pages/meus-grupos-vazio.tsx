import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/app-shell";
import Icon from "../components/icon";

const METRICAS = [
  {
    rotulo: "Saldo a Receber",
    icone: "south_west",
    corIcone: "text-primary",
    valor: "R$ 0,00",
    legenda: "Nenhum amigo te deve no momento",
    rodape: "Sem pendências ativas",
  },
  {
    rotulo: "Saldo a Pagar",
    icone: "north_east",
    corIcone: "text-secondary",
    valor: "R$ 0,00",
    legenda: "Suas contas estão 100% em dia",
    rodape: "Tudo quitado",
  },
];

const PASSOS = [
  {
    numero: 1,
    titulo: "Crie o grupo",
    descricao:
      "Defina um nome, convide as pessoas por WhatsApp, link ou QR Code e escolha como dividir: igualmente ou por porcentagens.",
    icone: "group_add",
    selo: "bg-primary-fixed text-primary",
    rodape: "Rápido em 30 segundos",
    rodapeIcone: "arrow_forward",
    corRodape: "text-primary",
  },
  {
    numero: 2,
    titulo: "Lance despesas e notas",
    descricao:
      "Fotografe o cupom fiscal ou nota para a IA ler itens sozinhos, ou adicione manualmente quem pagou e quem consumiu.",
    icone: "document_scanner",
    selo: "bg-tertiary-fixed text-tertiary",
    rodape: "Leitura por IA inclusa",
    rodapeIcone: "auto_awesome",
    corRodape: "text-tertiary",
  },
  {
    numero: 3,
    titulo: "Acerto via Pix instantâneo",
    descricao:
      "Nosso algoritmo simplifica o número de transferências ao mínimo. Pague com Pix Copia e Cola em 1 único clique.",
    icone: "payments",
    selo: "bg-surface-container-high text-primary",
    rodape: "Zero confusão de troco",
    rodapeIcone: "check_circle",
    corRodape: "text-on-surface",
  },
];

const USOS = [
  {
    titulo: "Viagens em Grupo",
    descricao: "Hospedagem, pedágios e passeios rateados automaticamente em moeda local.",
    icone: "flight",
  },
  {
    titulo: "Churrascos & Eventos",
    descricao: "Quem não bebe cerveja paga apenas pelas carnes e refrigerantes com facilidade.",
    icone: "outdoor_grill",
  },
  {
    titulo: "Moradia Compartilhada",
    descricao: "Aluguel, contas básicas de luz, gás e compras mensais de supermercado.",
    icone: "home_work",
  },
];

// Os ids batem com as categorias da tela de criação manual
const CATEGORIAS: { id: string; nome: string; icone: string }[] = [
  { id: "viagem", nome: "Viagem", icone: "flight" },
  { id: "evento", nome: "Rolê / Evento", icone: "outdoor_grill" },
  { id: "republica", nome: "Casa / República", icone: "home_work" },
];

export default function MeusGruposVazio() {
  const navigate = useNavigate();
  const campoCodigo = useRef<HTMLInputElement>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [nomeGrupo, setNomeGrupo] = useState("");
  const [categoria, setCategoria] = useState("viagem");
  const [codigo, setCodigo] = useState("");

  // Fecha o modal com Esc
  useEffect(() => {
    if (!modalAberto) return;
    function aoPressionar(event: KeyboardEvent) {
      if (event.key === "Escape") setModalAberto(false);
    }
    window.addEventListener("keydown", aoPressionar);
    return () => window.removeEventListener("keydown", aoPressionar);
  }, [modalAberto]);

  function focarCodigo() {
    campoCodigo.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    campoCodigo.current?.focus({ preventScroll: true });
  }

  function continuarCriacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate("/criar-grupo/manual", {
      state: { nome: nomeGrupo.trim(), categoria },
    });
  }

  // Aceita tanto o código quanto o link completo do convite
  function ingressar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valor = codigo.trim();
    if (!valor) return;
    const token = valor.split("/convite/").pop()?.split(/[?#/]/)[0] ?? valor;
    navigate(`/convite/${encodeURIComponent(token)}`);
  }

  return (
    <AppShell title="Meus grupos">
      <div className="mx-auto w-full max-w-7xl space-y-12 lg:py-space-sm">
        {/* Cabeçalho editorial */}
        <section className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-8 shadow-[0_1px_3px_0_rgba(31,41,55,0.04),0_1px_2px_-1px_rgba(31,41,55,0.02)] lg:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-primary-fixed-dim/20 via-primary-container/10 to-transparent blur-3xl" />
          <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1.5 font-label-sm text-label-sm font-semibold tracking-wide text-primary">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary-container" />
                Painel Financeiro • {new Date().getFullYear()}
              </div>
              <h1 className="font-display-mobile text-display-mobile tracking-tight text-on-surface sm:font-display sm:text-display">
                Visão Geral dos Seus Rachas
              </h1>
              <p className="max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
                Acompanhe saldos pendentes, resolva rateios pendentes e
                gerencie suas despesas conjuntas sem atrito.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-lg bg-surface-container-low px-4 py-2.5 font-label-md text-label-md text-on-surface-variant lg:self-auto">
              <Icon name="verified_user" size={18} />
              <span>Rateio Auditável</span>
            </div>
          </div>
        </section>

        {/* Métricas zeradas */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {METRICAS.map((metrica) => (
            <div
              key={metrica.rotulo}
              className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-[0_1px_3px_0_rgba(31,41,55,0.04)] transition-all duration-300 hover:shadow-[0_10px_25px_-5px_rgba(31,41,55,0.08)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant">{metrica.rotulo}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low ${metrica.corIcone}`}>
                  <Icon name={metrica.icone} size={22} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-numeric-stat text-numeric-stat font-bold text-on-surface">{metrica.valor}</div>
                <p className="font-body-sm text-body-sm text-outline">{metrica.legenda}</p>
              </div>
              <div className="mt-4 flex items-center gap-2 pt-4 font-label-sm text-label-sm text-outline-variant">
                <span className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
                <span>{metrica.rodape}</span>
              </div>
            </div>
          ))}
          <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-[0_1px_3px_0_rgba(31,41,55,0.04)] transition-all duration-300 hover:shadow-[0_10px_25px_-5px_rgba(31,41,55,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant">Grupos Ativos</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low text-on-surface">
                <Icon name="diversity_3" size={22} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-numeric-stat text-numeric-stat font-bold text-on-surface">0</div>
              <p className="font-body-sm text-body-sm text-outline">espaços colaborativos cadastrados</p>
            </div>
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="mt-4 flex cursor-pointer items-center gap-2 pt-4 font-label-sm text-label-sm font-semibold text-primary transition-colors hover:text-primary-container"
            >
              <Icon name="add_circle" size={16} />
              <span>Pronto para iniciar</span>
            </button>
          </div>
        </section>

        {/* Estado vazio */}
        <section className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-8 shadow-[0_1px_3px_0_rgba(31,41,55,0.04),0_1px_2px_-1px_rgba(31,41,55,0.02)] sm:p-14 lg:p-20">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-fixed/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 right-12 h-80 w-80 rounded-full bg-tertiary-fixed/30 blur-3xl" />
          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
            <div className="relative mb-8 flex items-center justify-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-surface-container-low shadow-inner">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-fixed text-primary shadow-[0_8px_20px_-4px_rgba(255,140,66,0.3)]">
                  <Icon name="groups_3" size={42} filled />
                </div>
              </div>
              <div className="absolute -right-1 -top-1 flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest text-primary-container shadow-md">
                <Icon name="auto_awesome" size={20} filled />
              </div>
              <div className="absolute -bottom-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest text-tertiary shadow-md">
                <Icon name="receipt_long" size={18} />
              </div>
            </div>

            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">
              <Icon name="waving_hand" size={15} className="text-primary" />
              <span>Boas-vindas ao Racha+</span>
            </div>
            <h2 className="mb-4 font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tight text-on-surface sm:font-headline-lg sm:text-headline-lg">
              Você ainda não participa de nenhum grupo
            </h2>
            <p className="mb-10 max-w-xl font-body-md text-body-md leading-relaxed text-on-surface-variant">
              Crie um grupo em segundos com nossa IA ou monte manualmente para
              dividir viagens, churrascos, repúblicas ou contas da casa sem dor
              de cabeça.
            </p>

            <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => setModalAberto(true)}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg bg-primary-container px-8 py-3.5 font-label-lg text-label-lg font-semibold text-on-primary shadow-[0_8px_20px_-4px_rgba(255,140,66,0.35)] transition-all duration-200 hover:bg-primary active:scale-[0.98] sm:w-auto"
              >
                <Icon name="add" size={22} />
                <span>Criar Meu Primeiro Grupo</span>
              </button>
              <button
                type="button"
                onClick={focarCodigo}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-surface-container-low px-6 py-3.5 font-label-lg text-label-lg font-semibold text-on-surface transition-all duration-200 hover:bg-surface-container active:scale-[0.98] sm:w-auto"
              >
                <Icon name="key" size={20} className="text-on-surface-variant" />
                <span>Inserir Código ou Link de Convite</span>
              </button>
            </div>

            <div className="mt-8 flex items-center gap-3 font-label-sm text-label-sm text-outline">
              <Icon name="lock" size={16} />
              <span>Sem tarifas bancárias • Divisão inteligente • Pix integrado</span>
            </div>
          </div>
        </section>

        {/* Ingressar com convite */}
        <section className="flex flex-col items-start justify-between gap-6 rounded-xl bg-surface-container-low p-6 md:flex-row md:items-center lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-container-lowest text-primary shadow-sm">
              <Icon name="key" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Foi convidado por alguém?
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Basta colar o link enviado pelo WhatsApp ou o código de 6
                dígitos para ingressar na hora.
              </span>
            </div>
          </div>
          <form onSubmit={ingressar} className="flex w-full items-center gap-2 md:w-auto">
            <label htmlFor="codigo-convite" className="sr-only">
              Link ou código do convite
            </label>
            <input
              ref={campoCodigo}
              id="codigo-convite"
              type="text"
              value={codigo}
              onChange={(event) => setCodigo(event.target.value)}
              placeholder="Ex: RCH-789"
              className="h-12 w-full rounded-lg bg-surface-container-lowest px-space-md font-body-md text-body-md tracking-wider text-on-surface shadow-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container md:w-48"
            />
            <button
              type="submit"
              disabled={!codigo.trim()}
              className="h-12 cursor-pointer whitespace-nowrap rounded-lg bg-primary px-space-lg font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
            >
              Ingressar
            </button>
          </form>
        </section>

        {/* Passo a passo */}
        <section className="rounded-xl bg-surface-container-low p-8 lg:p-12">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary">
                Passo a Passo
              </span>
              <h3 className="mt-1 font-headline-md text-headline-md font-bold text-on-surface">
                Como funciona o Racha+ em 3 passos
              </h3>
            </div>
            <p className="max-w-md font-body-sm text-body-sm text-on-surface-variant">
              Elimine discussões sobre dinheiro entre amigos, familiares ou
              colegas de trabalho com fluxo 100% automatizado.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PASSOS.map((passo) => (
              <div
                key={passo.numero}
                className="relative flex flex-col justify-between rounded-xl bg-surface-container-lowest p-6 shadow-[0_1px_3px_0_rgba(31,41,55,0.03)]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg font-headline-sm text-headline-sm font-bold ${passo.selo}`}>
                      {passo.numero}
                    </div>
                    <Icon name={passo.icone} size={24} className="text-outline" />
                  </div>
                  <div>
                    <h4 className="mb-2 font-headline-sm text-headline-sm font-semibold text-on-surface">
                      {passo.titulo}
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{passo.descricao}</p>
                  </div>
                </div>
                <div className={`mt-6 flex items-center gap-2 pt-4 font-label-sm text-label-sm font-semibold ${passo.corRodape}`}>
                  <span>{passo.rodape}</span>
                  <Icon name={passo.rodapeIcone} size={16} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Casos de uso */}
        <section className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-3">
          {USOS.map((uso) => (
            <div
              key={uso.titulo}
              className="flex items-start gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-[0_1px_3px_0_rgba(31,41,55,0.02)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-primary">
                <Icon name={uso.icone} size={20} />
              </div>
              <div>
                <h5 className="font-headline-sm text-headline-sm font-semibold text-on-surface">{uso.titulo}</h5>
                <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{uso.descricao}</p>
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* Modal — criar novo grupo */}
      {modalAberto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/40 p-space-md backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) setModalAberto(false);
          }}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-grupo"
            onSubmit={continuarCriacao}
            className="relative flex w-full max-w-lg flex-col gap-space-lg rounded-xl bg-surface-container-lowest p-space-lg text-on-surface shadow-2xl sm:p-space-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-fixed text-primary">
                  <Icon name="group_add" size={22} />
                </div>
                <h3 id="titulo-modal-grupo" className="font-headline-sm text-headline-sm text-on-surface">
                  Criar novo grupo
                </h3>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setModalAberto(false)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-high"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nome-grupo" className="font-label-md text-label-md text-on-surface">
                  Nome do grupo
                </label>
                <input
                  id="nome-grupo"
                  type="text"
                  autoFocus
                  value={nomeGrupo}
                  onChange={(event) => setNomeGrupo(event.target.value)}
                  placeholder="Ex: Viagem Florianópolis, Churrasco da Firma..."
                  className="h-12 rounded-lg bg-surface-container-low px-space-md font-body-md text-body-md text-on-surface shadow-inner transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>

              <fieldset className="flex flex-col gap-1.5">
                <legend className="mb-1.5 font-label-md text-label-md text-on-surface">Categoria</legend>
                <div className="grid grid-cols-3 gap-space-sm">
                  {CATEGORIAS.map((item) => {
                    const ativo = categoria === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={ativo}
                        onClick={() => setCategoria(item.id)}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl p-3 font-label-sm text-label-sm transition-colors ${
                          ativo
                            ? "bg-primary-fixed font-semibold text-primary ring-2 ring-primary-container"
                            : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                        }`}
                      >
                        <Icon name={item.icone} size={20} />
                        <span>{item.nome}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <div className="flex flex-col-reverse items-stretch justify-end gap-space-sm sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="h-11 cursor-pointer rounded-lg bg-surface-container-low px-space-lg font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex h-11 cursor-pointer items-center justify-center gap-space-xs rounded-lg bg-primary-container px-space-lg font-label-md text-label-md text-on-primary shadow-[0_8px_20px_-4px_rgba(255,140,66,0.35)] transition-all hover:bg-primary-container/90 active:scale-[0.98]"
              >
                <span>Continuar</span>
                <Icon name="arrow_forward" size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
