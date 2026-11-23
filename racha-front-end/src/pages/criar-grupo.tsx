import EditarTarefa, { type DadosTarefa } from "./editar-tarefa";
import { useMemo, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { useAppNavigate as useNavigate } from "../lib/navigation";
import { useLocation } from "react-router-dom";
import { salvarRascunho, type GrupoRascunho } from "../lib/grupo-rascunho";

import AppShell from "../components/app-shell";
import Link from "../components/app-link";
import Icon from "../components/icon";

interface Membro {
  id: number;
  nome: string;
  contato: string;
  iniciais: string;
  etiqueta: string;
  admin: boolean;
  adiantado: number;
}

type TipoItem = "tarefa";

interface Item {
  id: number;
  titulo: string;
  tipo: TipoItem;
  responsavel: string;
  detalhe: string;
  valor: number;
  pago: boolean;
  participantesIds?: string[];
  dataLimite?: string;
  descricao?: string;
}

// Os ids são usados também no modal de Meus Grupos e na confirmação
const categorias = [
  { id: "viagem", nome: "Viagem & Lazer", emoji: "✈️", icone: "beach_access" },
  { id: "evento", nome: "Churrascos & Eventos", emoji: "🍖", icone: "outdoor_grill" },
  { id: "republica", nome: "Casa & República", emoji: "🏠", icone: "home" },
  { id: "academico", nome: "Trabalho Acadêmico", emoji: "🎓", icone: "school" },
  { id: "outro", nome: "Outro", emoji: "✨", icone: "category" },
];

const modelosRateio = [
  {
    id: "igual",
    nome: "Divisão Igualitária",
    icone: "balance",
    descricao:
      "Soma todas as despesas e reparte igualmente por cabeça. Ideal para churrascos e festas.",
  },
];

const membrosIniciais: Membro[] = [
  {
    id: 1,
    nome: "Mariana Silva",
    contato: "Chave Pix vinculada: mariana.silva@pix.me",
    iniciais: "MS",
    etiqueta: "Você (Admin)",
    admin: true,
    adiantado: 0,
  },
  {
    id: 2,
    nome: "Pedro Alves",
    contato: "pedro.alves@banco.com.br",
    iniciais: "PA",
    etiqueta: "Adiantou R$ 240,00",
    admin: false,
    adiantado: 240,
  },
  {
    id: 3,
    nome: "Lucas Mendes",
    contato: "WhatsApp: (11) 98722-1044",
    iniciais: "LM",
    etiqueta: "1 Tarefa",
    admin: false,
    adiantado: 0,
  },
  {
    id: 4,
    nome: "Beatriz Lima",
    contato: "WhatsApp: (11) 99318-4420",
    iniciais: "BL",
    etiqueta: "Convidado",
    admin: false,
    adiantado: 0,
  },
];

const itensIniciais: Item[] = [
  {
    id: 1,
    titulo: "Aluguel do Quiosque 04",
    tipo: "tarefa",
    responsavel: "Pedro Alves",
    detalhe: "com comprovante em PDF anexo",
    valor: 240,
    pago: true,
  },
  {
    id: 2,
    titulo: "Carnes Nobres, Espetos e Bebidas",
    tipo: "tarefa",
    responsavel: "Mariana Silva",
    detalhe: "(no mercado na sexta-feira)",
    valor: 400,
    pago: false,
  },
  {
    id: 3,
    titulo: "Comprar 3 sacos de gelo e 2 de carvão",
    tipo: "tarefa",
    responsavel: "Lucas Mendes",
    detalhe: "• Prazo: Sábado até 11:30",
    valor: 0,
    pago: false,
  },
];

const etiquetasItem: Record<TipoItem, { rotulo: string; icone: string }> = {
  tarefa: { rotulo: "Tarefa com despesa opcional", icone: "task_alt" },
};

// Cores dos avatares dos participantes (o organizador usa a cor principal)
const coresAvatar = [
  "bg-secondary-container text-on-primary",
  "bg-tertiary text-on-tertiary",
  "bg-surface-variant text-on-surface-variant",
];

const campoClasse =
  "h-12 w-full rounded-lg bg-surface-container-low pl-11 pr-space-md font-body-md text-body-md text-on-surface shadow-inner transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function gerarIniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default function CriarGrupo() {
  const navigate = useNavigate();

  // Nome e categoria podem vir do modal "Criar novo grupo";
  // o rascunho completo volta da tela de confirmação ("Editar detalhes")
  const estadoInicial = useLocation().state as
    | { nome?: unknown; categoria?: unknown; rascunho?: GrupoRascunho }
    | null;
  const rascunho = estadoInicial?.rascunho;
  const nomeInicial =
    rascunho?.nome ??
    (typeof estadoInicial?.nome === "string" && estadoInicial.nome
      ? estadoInicial.nome
      : "Churrasco de Boas-Vindas da Turma");
  const categoriaPedida = rascunho?.categoria ?? estadoInicial?.categoria;
  const categoriaInicial =
    typeof categoriaPedida === "string" &&
    categorias.some((item) => item.id === categoriaPedida)
      ? categoriaPedida
      : "evento";

  // DADOS DO GRUPO
  const [nomeGrupo, setNomeGrupo] = useState(nomeInicial);
  const [categoria, setCategoria] = useState(categoriaInicial);
  const [dataEvento, setDataEvento] = useState(rascunho?.data ?? "Próximo Sábado, 12:30");
  const [moeda, setMoeda] = useState(rascunho?.moeda ?? "BRL");
  const [descricao, setDescricao] = useState(
    rascunho?.descricao ??
      "Quiosque 04 reservado no nome do Pedro. Trazer toalha de banho individual. A cerveja já está calculada no valor coletivo."
  );

  // PARTICIPANTES
  const [membros, setMembros] = useState<Membro[]>(rascunho?.membros ?? membrosIniciais);
  const [novoNome, setNovoNome] = useState("");
  const [novoContato, setNovoContato] = useState("");
  const [rateio, setRateio] = useState(rascunho?.rateio ?? "igual");

  // DESPESAS E TAREFAS
  const [itens, setItens] = useState<Item[]>(rascunho?.itens ?? itensIniciais);
  const [modalAberto, setModalAberto] = useState(false);

  const totalCadastrado = useMemo(
    () => itens.reduce((soma, item) => soma + item.valor, 0),
    [itens]
  );

  const cotaIndividual = membros.length ? totalCadastrado / membros.length : 0;

  const itensComValor = itens.filter((item) => item.valor > 0);

  const adiantadores = membros.filter((membro) => membro.adiantado > 0);

  const iconeNome = categorias.find((item) => item.id === categoria)?.icone ?? "groups";

  function adicionarMembro() {
    const nome = novoNome.trim();

    if (!nome) {
      return;
    }

    setMembros((anteriores) => [
      ...anteriores,
      {
        id: Date.now(),
        nome,
        contato: novoContato.trim() || "Sem contato",
        iniciais: gerarIniciais(nome),
        etiqueta: "Novo",
        admin: false,
        adiantado: 0,
      },
    ]);

    setNovoNome("");
    setNovoContato("");
  }

  // Enter nos campos de participante adiciona a pessoa (sem enviar o formulário)
  function aoTeclarMembro(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      adicionarMembro();
    }
  }

  function removerMembro(id: number) {
    setMembros((anteriores) => anteriores.filter((membro) => membro.id !== id));
  }

  function abrirModalItem() { setModalAberto(true); }
  function adicionarItem(task: DadosTarefa) {
    setItens(old => [...old, { id: Date.now(), titulo: task.titulo, tipo: "tarefa", responsavel: membros.find(m => String(m.id) === task.responsavelId)?.nome ?? "", detalhe: task.descricao, descricao: task.descricao, dataLimite: task.dataLimite, participantesIds: task.participantes.filter(p => p.selecionado).map(p => p.id), valor: task.possuiDespesa ? task.valorTotal : 0, pago: false }]);
    setModalAberto(false);
  }

  function removerItem(id: number) {
    setItens((anteriores) => anteriores.filter((item) => item.id !== id));
  }

  function criarGrupo() {
    const grupo: GrupoRascunho = {
      nome: nomeGrupo,
      categoria,
      data: dataEvento,
      moeda,
      descricao,
      membros,
      rateio,
      itens,
      total: totalCadastrado,
      cota: cotaIndividual,
    };

    if (!nomeGrupo.trim()) { window.alert("Informe o nome do grupo."); return; }
    salvarRascunho(grupo);

    navigate("/criar-grupo/confirmar", { state: { grupo } });
  }

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    criarGrupo();
  }

  return (
    <AppShell title="Criar grupo">
      <div className="relative isolate mx-auto w-full max-w-4xl py-space-md sm:py-space-lg">
        <div className="pointer-events-none absolute -top-12 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-fixed/35 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-1/3 -z-10 h-80 w-80 rounded-full bg-surface-container-high/60 blur-3xl" />

        {/* Caminho */}
        <nav aria-label="Navegação estrutural" className="mb-space-lg">
          <ol className="flex flex-wrap items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
            <li>
              <Link to="/meus-grupos" className="flex items-center gap-1 transition-colors hover:text-primary">
                <Icon name="groups" size={16} />
                <span>Meus Grupos</span>
              </Link>
            </li>
            <li className="flex items-center text-outline-variant" aria-hidden="true">
              <Icon name="chevron_right" size={16} />
            </li>
            <li>
              <Link to="/criar-grupo" className="transition-colors hover:text-primary">
                Criar Novo Grupo
              </Link>
            </li>
            <li className="flex items-center text-outline-variant" aria-hidden="true">
              <Icon name="chevron_right" size={16} />
            </li>
            <li aria-current="page" className="rounded-full bg-surface-container-high px-space-sm py-0.5 font-semibold text-on-surface">
              Configuração Manual
            </li>
          </ol>
        </nav>

        {/* Título e progresso */}
        <div className="mb-space-xl flex flex-col gap-space-md md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-space-xs flex items-center gap-space-xs font-label-md text-label-md font-bold uppercase tracking-wider text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary-container" />
              Passo 1 de 2 • Setup Inicial
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tight text-on-surface sm:font-headline-lg sm:text-headline-lg">
              Criar Novo Grupo
            </h1>
            <p className="mt-1 max-w-xl font-body-md text-body-md text-on-surface-variant">
              Informe os dados principais do grupo para organizar tarefas e
              despesas conjuntas sem atrito.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-space-md self-start rounded-xl bg-surface-container-low p-space-sm shadow-sm md:self-auto">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
                <circle className="text-surface-container-high" cx="24" cy="24" fill="none" r="19" stroke="currentColor" strokeWidth="4" />
                <circle className="text-primary-container" cx="24" cy="24" fill="none" r="19" stroke="currentColor" strokeDasharray="119.38" strokeDashoffset="59.69" strokeLinecap="round" strokeWidth="4" />
              </svg>
              <span className="absolute font-label-sm text-label-sm font-bold text-on-surface">50%</span>
            </div>
            <div className="pr-space-xs text-left">
              <p className="font-label-sm text-label-sm font-bold text-on-surface">Etapa Atual</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Dados Básicos &amp; Membros</p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form
          onSubmit={enviar}
          className="flex flex-col gap-space-xl rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-space-xl"
        >
          {/* SEÇÃO 1 — Informações básicas */}
          <section className="flex flex-col gap-space-md">
            <CabecalhoSecao
              icone="edit_note"
              titulo="Informações Básicas"
              descricao="Identifique o grupo com nome, estilo e propósito comum"
            />

            <div className="grid grid-cols-1 gap-space-md pt-space-xs md:grid-cols-2">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="nome-grupo" className="font-label-md text-label-md font-semibold text-on-surface">
                  Nome do Grupo <span className="text-secondary">*</span>
                </label>
                <div className="relative flex items-center">
                  <Icon name={iconeNome} size={20} className="pointer-events-none absolute left-space-md text-outline" />
                  <input
                    id="nome-grupo"
                    type="text"
                    value={nomeGrupo}
                    onChange={(event) => setNomeGrupo(event.target.value)}
                    placeholder="Ex.: Churrasco de Domingo, Apê 304"
                    className={campoClasse}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-space-xs md:col-span-2">
                <span id="rotulo-categoria" className="font-label-md text-label-md font-semibold text-on-surface">
                  Categoria Principal
                </span>
                <div className="flex flex-wrap gap-space-xs pt-1" role="group" aria-labelledby="rotulo-categoria">
                  {categorias.map((opcao) => {
                    const ativa = categoria === opcao.id;
                    return (
                      <button
                        key={opcao.id}
                        type="button"
                        aria-pressed={ativa}
                        onClick={() => setCategoria(opcao.id)}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-full px-space-md py-space-xs font-label-md text-label-md transition-all active:scale-95 ${
                          ativa
                            ? "bg-primary text-on-primary shadow-sm hover:brightness-105"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                      >
                        <span aria-hidden="true">{opcao.emoji}</span>
                        <span>{opcao.nome}</span>
                        {ativa && <Icon name="check_circle" size={16} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="data-grupo" className="font-label-md text-label-md font-semibold text-on-surface">
                  Data do Evento ou Fechamento
                </label>
                <div className="relative flex items-center">
                  <Icon name="calendar_month" size={20} className="pointer-events-none absolute left-space-md text-outline" />
                  <input
                    id="data-grupo"
                    type="text"
                    value={dataEvento}
                    onChange={(event) => setDataEvento(event.target.value)}
                    placeholder="ex: 28 de Outubro às 14:00"
                    className={campoClasse}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="moeda-grupo" className="font-label-md text-label-md font-semibold text-on-surface">
                  Moeda Padrão de Fechamento
                </label>
                <div className="relative flex items-center">
                  <Icon name="payments" size={20} className="pointer-events-none absolute left-space-md text-outline" />
                  <select
                    id="moeda-grupo"
                    value={moeda}
                    onChange={(event) => setMoeda(event.target.value)}
                    className={`${campoClasse} cursor-pointer appearance-none pr-10`}
                  >
                    <option value="BRL">Real Brasileiro (BRL - R$)</option>
                    <option value="USD">Dólar Americano (USD - $)</option>
                    <option value="EUR">Euro (EUR - €)</option>
                  </select>
                  <Icon name="expand_more" size={20} className="pointer-events-none absolute right-space-md text-outline" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="descricao-grupo" className="flex items-center justify-between gap-space-sm font-label-md text-label-md font-semibold text-on-surface">
                  <span>
                    Descrição ou Recado{" "}
                    <span className="font-label-sm text-label-sm font-normal text-on-surface-variant">(Opcional)</span>
                  </span>
                  <span className="font-label-sm text-label-sm font-normal text-on-surface-variant">Visível para convidados</span>
                </label>
                <textarea
                  id="descricao-grupo"
                  rows={3}
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                  placeholder="Adicione orientações gerais sobre as divisões ou regras do grupo..."
                  className="w-full resize-none rounded-lg bg-surface-container-low p-space-md font-body-sm text-body-sm text-on-surface shadow-inner transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>
            </div>
          </section>

          <div className="my-space-xs h-px w-full bg-surface-container-high" />

          {/* SEÇÃO 2 — Participantes */}
          <section className="flex flex-col gap-space-md">
            <CabecalhoSecao
              icone="group_add"
              titulo="Participantes Iniciais"
              descricao="Convide as pessoas agora ou compartilhe o link depois"
              extra={
                <span className="shrink-0 rounded-full bg-surface-container px-space-sm py-0.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">
                  {membros.length} {membros.length === 1 ? "membro" : "membros"}
                </span>
              }
            />

            <div className="flex flex-col items-stretch gap-space-xs pt-space-xs sm:flex-row">
              <div className="relative flex flex-1 items-center">
                <Icon name="person_search" size={20} className="pointer-events-none absolute left-space-md text-outline" />
                <label htmlFor="novo-membro-nome" className="sr-only">Nome do participante</label>
                <input
                  id="novo-membro-nome"
                  type="text"
                  value={novoNome}
                  onChange={(event) => setNovoNome(event.target.value)}
                  onKeyDown={aoTeclarMembro}
                  placeholder="Nome do participante"
                  className={`${campoClasse} font-body-sm text-body-sm`}
                />
              </div>
              <div className="relative flex flex-1 items-center">
                <Icon name="alternate_email" size={20} className="pointer-events-none absolute left-space-md text-outline" />
                <label htmlFor="novo-membro-contato" className="sr-only">WhatsApp ou e-mail do participante</label>
                <input
                  id="novo-membro-contato"
                  type="text"
                  value={novoContato}
                  onChange={(event) => setNovoContato(event.target.value)}
                  onKeyDown={aoTeclarMembro}
                  placeholder="WhatsApp (DDD) ou E-mail"
                  className={`${campoClasse} font-body-sm text-body-sm`}
                />
              </div>
              <button
                type="button"
                onClick={adicionarMembro}
                className="flex h-12 shrink-0 cursor-pointer items-center justify-center gap-space-xs rounded-lg bg-surface-container-highest px-space-lg font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
              >
                <Icon name="add_circle" size={18} />
                <span>Inserir</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-space-sm pt-space-xs sm:grid-cols-2">
              {membros.map((membro, indice) => (
                <div
                  key={membro.id}
                  className="flex items-center justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-sm transition-all hover:bg-surface-container"
                >
                  <div className="flex min-w-0 items-center gap-space-sm">
                    <div
                      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-label-md text-label-md font-bold shadow-sm ${
                        membro.admin ? "bg-primary-container text-on-primary" : coresAvatar[indice % coresAvatar.length]
                      }`}
                    >
                      {membro.iniciais}
                      {membro.admin && (
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm">
                          <Icon name="shield" size={11} className="text-primary" />
                        </span>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate font-label-md text-label-md font-semibold text-on-surface">
                          {membro.nome}
                        </span>
                        {!membro.admin && (
                          <span className="shrink-0 rounded bg-surface-container-high px-1.5 py-0.5 font-label-sm text-[11px] leading-none text-on-surface-variant">
                            {membro.etiqueta}
                          </span>
                        )}
                      </div>
                      {membro.admin ? (
                        <span className="truncate font-label-sm text-label-sm font-medium text-primary">
                          {membro.etiqueta} • {membro.contato}
                        </span>
                      ) : (
                        <span className="truncate font-label-sm text-label-sm text-on-surface-variant">
                          {membro.contato}
                        </span>
                      )}
                    </div>
                  </div>

                  {membro.admin ? (
                    <span className="shrink-0 rounded bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm font-medium text-on-surface-variant">
                      Fixo
                    </span>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Remover ${membro.nome}`}
                      title="Remover participante"
                      onClick={() => removerMembro(membro.id)}
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-outline transition-colors hover:bg-error-container hover:text-on-error-container"
                    >
                      <Icon name="close" size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="my-space-xs h-px w-full bg-surface-container-high" />

          {/* SEÇÃO 3 — Despesas e tarefas */}
          <section className="flex flex-col gap-space-md">
            <CabecalhoSecao
              icone="checklist"
              titulo="Despesas & Tarefas Iniciais"
              descricao="Cadastre adiantamentos, estimativas e quem fará as compras"
              extra={
                <button
                  type="button"
                  onClick={abrirModalItem}
                  className="flex h-10 shrink-0 cursor-pointer items-center gap-space-xs rounded-lg bg-surface-container-highest px-space-md font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  <Icon name="add_circle" size={18} />
                  <span>Adicionar Item</span>
                </button>
              }
            />

            <div className="flex flex-col gap-space-sm">
              {itens.length === 0 && (
                <p className="rounded-xl bg-surface-container-low p-space-lg text-center font-body-sm text-body-sm text-on-surface-variant">
                  Nenhuma tarefa cadastrada ainda.
                </p>
              )}

              {itens.map((item) => {
                const etiqueta = etiquetasItem[item.tipo];

                return (
                  <div
                    key={item.id}
                    className="flex flex-col items-start justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-md transition-colors hover:bg-surface-container sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 items-start gap-space-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-lowest text-primary shadow-sm">
                        <Icon name={etiqueta.icone} size={20} />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <div className="flex flex-wrap items-center gap-space-xs">
                          <span className="font-label-md text-label-md font-semibold text-on-surface">
                            {item.titulo}
                          </span>
                          <span className="rounded-full bg-surface-container-lowest px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant">
                            {etiqueta.rotulo}
                          </span>
                          {item.valor > 0 && (
                            <span
                              className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm font-semibold ${
                                item.pago ? "bg-tertiary-fixed text-on-tertiary-fixed-variant" : "bg-surface-container-high text-on-surface-variant"
                              }`}
                            >
                              {item.pago ? "Pago Adiantado" : "Estimado"}
                            </span>
                          )}
                        </div>
                        <span className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
                          {item.valor === 0
                            ? "Responsável: "
                            : item.pago
                            ? "Pago integralmente por "
                            : "Responsável pela compra: "}
                          <strong className="font-semibold text-on-surface">{item.responsavel}</strong>
                          {item.detalhe ? ` ${item.detalhe}` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex w-full items-center justify-between gap-space-sm sm:w-auto sm:justify-end">
                      <div className="flex flex-col items-start sm:items-end">
                        <span className={`font-label-lg text-label-lg font-bold ${item.valor > 0 ? "text-on-surface" : "text-outline"}`}>
                          {formatarMoeda(item.valor)}
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {item.valor === 0
                            ? "Apenas incumbência"
                            : item.pago
                            ? "Reembolsável via rateio"
                            : "Valor provisionado"}
                        </span>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remover ${item.titulo}`}
                        title="Remover item"
                        onClick={() => removerItem(item.id)}
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-outline transition-colors hover:bg-error-container hover:text-on-error-container"
                      >
                        <Icon name="delete" size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="my-space-xs h-px w-full bg-surface-container-high" />

          {/* SEÇÃO 4 — Rateio e prévia financeira */}
          <section className="flex flex-col gap-space-md">
            <CabecalhoSecao
              icone="account_balance_wallet"
              titulo="Preferências de Pagamento & Rateio"
              descricao="Configure como as despesas serão divididas para facilitar os acertos"
            />

            <div className="flex flex-col gap-space-sm pt-space-xs" role="radiogroup" aria-label="Modelo de Rateio">
              {modelosRateio.map((modelo) => {
                const ativo = rateio === modelo.id;
                return (
                  <button
                    key={modelo.id}
                    type="button"
                    role="radio"
                    aria-checked={ativo}
                    onClick={() => setRateio(modelo.id)}
                    className={`flex cursor-pointer items-center justify-between gap-space-md rounded-xl p-space-md text-left transition-colors ${
                      ativo ? "bg-primary-fixed/50 ring-2 ring-primary-container" : "bg-surface-container-low hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex items-center gap-space-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-lowest text-primary shadow-sm">
                        <Icon name={modelo.icone} size={22} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-semibold text-on-surface">{modelo.nome}</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">{modelo.descricao}</span>
                      </div>
                    </div>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        ativo ? "bg-primary-container" : "bg-surface-container-lowest ring-1 ring-outline-variant"
                      }`}
                    >
                      {ativo && <span className="h-2 w-2 rounded-full bg-on-primary" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Prévia financeira */}
            <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-low p-space-md">
              <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <span className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface">
                  <Icon name="calculate" size={18} className="text-primary" />
                  Custo total cadastrado
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  {formatarMoeda(totalCadastrado)}
                </span>
              </div>

              <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                {itensComValor.map((item, indice) => (
                  <div
                    key={item.id}
                    title={`${item.titulo} — ${formatarMoeda(item.valor)}`}
                    className={indice % 2 === 0 ? "bg-primary-container" : "bg-tertiary-container"}
                    style={{ width: `${(item.valor / totalCadastrado) * 100}%` }}
                  />
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
                <span>
                  Cota estimada:{" "}
                  <strong className="font-semibold text-on-surface">{formatarMoeda(cotaIndividual)} / membro</strong>
                </span>
                <span className="rounded-full bg-surface-container-lowest px-space-sm py-0.5 font-label-sm text-label-sm shadow-sm">
                  Base: {membros.length} cotistas previstos
                </span>
              </div>

              {adiantadores.map((membro) => (
                <div key={membro.id} className="flex flex-col gap-1 rounded-lg bg-surface-container-lowest p-space-sm shadow-sm">
                  <div className="flex items-center justify-between gap-space-sm font-body-sm text-body-sm">
                    <span className="text-on-surface-variant">Balanço de {membro.nome}:</span>
                    <span className="shrink-0 font-semibold text-tertiary">
                      +{formatarMoeda(membro.adiantado - cotaIndividual)} a receber
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    (Adiantou {formatarMoeda(membro.adiantado)} e a cota própria é{" "}
                    {formatarMoeda(cotaIndividual)})
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Ações */}
          <div className="flex flex-col-reverse items-center justify-between gap-space-md pt-space-lg sm:flex-row">
            <Link
              to="/meus-grupos"
              className="flex h-12 w-full items-center justify-center rounded-lg bg-surface-container-low px-space-lg font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high active:scale-[0.98] sm:w-auto"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-space-sm rounded-lg bg-primary-container px-space-xl font-label-lg text-label-lg text-on-primary shadow-[0_8px_20px_-4px_rgba(255,140,66,0.4)] transition-all hover:bg-primary-container/90 active:scale-[0.98] sm:w-auto"
            >
              <span>Avançar para Confirmação</span>
              <Icon name="arrow_forward" size={20} />
            </button>
          </div>
        </form>

        <div className="mt-space-lg flex items-center justify-center gap-2 text-center font-label-sm text-label-sm text-on-surface-variant">
          <Icon name="lightbulb" size={16} className="shrink-0 text-tertiary" />
          <span>Você poderá convidar mais amigos com link direto do WhatsApp logo após a confirmação.</span>
        </div>
      </div>

      {modalAberto && <EditarTarefa modo="criar" nomeGrupo={nomeGrupo} tarefa={{ id: "rascunho", titulo: "", descricao: "", dataLimite: "", horario: "09:00", responsavelId: String(membros[0]?.id ?? ""), participantes: membros.map(m => ({ id: String(m.id), nome: m.nome, selecionado: true })), possuiDespesa: true, valorTotal: 0, pagadorId: String(membros[0]?.id ?? ""), comprovante: "", concluida: false }} onClose={() => setModalAberto(false)} onSave={adicionarItem}/>}
    </AppShell>
  );
}

/* =====================================================
   COMPONENTES AUXILIARES
====================================================== */

function CabecalhoSecao({
  icone,
  titulo,
  descricao,
  extra,
}: {
  icone: string;
  titulo: string;
  descricao: string;
  extra?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-xs">
      <div className="flex items-center gap-space-sm">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-high font-bold text-primary">
          <Icon name={icone} size={18} />
        </div>
        <div>
          <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">{titulo}</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant">{descricao}</p>
        </div>
      </div>
      {extra}
    </div>
  );
}
