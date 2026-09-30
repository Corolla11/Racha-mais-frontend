import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bell,
  Bookmark,
  Building2,
  Calculator,
  CalendarDays,
  ChartColumn,
  ChevronDown,
  ChevronRight,
  CircleCheckBig,
  CirclePlus,
  Ellipsis,
  GraduationCap,
  Link2,
  MessageCircle,
  PartyPopper,
  Percent,
  Plane,
  Plus,
  QrCode,
  ReceiptText,
  Scale,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Tent,
  Trash2,
  Upload,
  UserPlus,
  Users,
  WalletCards,
  WandSparkles,
  X,
} from "lucide-react";

import Aba from "../components/aba-perfil";

interface Membro {
  id: number;
  nome: string;
  contato: string;
  iniciais: string;
  etiqueta: string;
  admin: boolean;
  adiantado: number;
}

type TipoItem = "despesa" | "compra" | "tarefa";

interface Item {
  id: number;
  titulo: string;
  tipo: TipoItem;
  responsavel: string;
  detalhe: string;
  valor: number;
  pago: boolean;
}

const categorias = [
  { id: "evento", nome: "Evento / Churrasco", icon: PartyPopper },
  { id: "republica", nome: "República / Casa", icon: Building2 },
  { id: "viagem", nome: "Viagem", icon: Plane },
  { id: "academico", nome: "Trabalho Acadêmico", icon: GraduationCap },
  { id: "outro", nome: "Outro", icon: Ellipsis },
];

const modelosRateio = [
  {
    id: "igual",
    nome: "Divisão Igualitária",
    icon: Scale,
    descricao:
      "Soma todas as despesas e reparte igualmente por cabeça. Ideal para churrascos e festas.",
  },
  {
    id: "consumo",
    nome: "Por Consumo / Itens",
    icon: ReceiptText,
    descricao:
      "Cada pessoa seleciona exatamente o que consumiu (ex: quem não bebe não paga álcool).",
  },
  {
    id: "pesos",
    nome: "Pesos Personalizados",
    icon: Percent,
    descricao:
      "Atribuição por frações, porcentagens ou diárias (ideal para repúblicas e quartos).",
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
    tipo: "despesa",
    responsavel: "Pedro Alves",
    detalhe: "com comprovante em PDF anexo",
    valor: 240,
    pago: true,
  },
  {
    id: 2,
    titulo: "Carnes Nobres, Espetos e Bebidas",
    tipo: "compra",
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

const etiquetasItem: Record<
  TipoItem,
  { rotulo: string; icon: typeof Tent }
> = {
  despesa: { rotulo: "Despesa Fixa", icon: Tent },
  compra: { rotulo: "Despesa + Compra", icon: ShoppingCart },
  tarefa: { rotulo: "Tarefa Operacional", icon: CircleCheckBig },
};

const COTISTAS_PREVISTOS = 8;

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

  const [abaAberta, setAbaAberta] = useState(false);

  // DADOS DO GRUPO
  const [nomeGrupo, setNomeGrupo] = useState(
    "Churrasco de Boas-Vindas da Turma"
  );
  const [categoria, setCategoria] = useState("evento");
  const [dataEvento, setDataEvento] = useState("Próximo Sábado, 12:30");
  const [moeda, setMoeda] = useState("BRL");
  const [descricao, setDescricao] = useState(
    "Quiosque 04 reservado no nome do Pedro. Trazer toalha de banho individual. A cerveja já está calculada no valor coletivo."
  );

  // PARTICIPANTES
  const [membros, setMembros] = useState<Membro[]>(membrosIniciais);
  const [novoNome, setNovoNome] = useState("");
  const [novoContato, setNovoContato] = useState("");
  const [rateio, setRateio] = useState("igual");

  // DESPESAS E TAREFAS
  const [itens, setItens] = useState<Item[]>(itensIniciais);
  const [modalAberto, setModalAberto] = useState(false);
  const [itemTitulo, setItemTitulo] = useState("");
  const [itemTipo, setItemTipo] = useState<TipoItem>("despesa");
  const [itemValor, setItemValor] = useState("");
  const [itemResponsavel, setItemResponsavel] = useState("Mariana Silva");
  const [itemPago, setItemPago] = useState(false);

  const totalCadastrado = useMemo(
    () => itens.reduce((soma, item) => soma + item.valor, 0),
    [itens]
  );

  const cotaIndividual = totalCadastrado / COTISTAS_PREVISTOS;

  const itensComValor = itens.filter((item) => item.valor > 0);

  const adiantadores = membros.filter((membro) => membro.adiantado > 0);

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

  function removerMembro(id: number) {
    setMembros((anteriores) => anteriores.filter((membro) => membro.id !== id));
  }

  function abrirModalItem() {
    setItemTitulo("");
    setItemTipo("despesa");
    setItemValor("");
    setItemResponsavel(membros[0]?.nome ?? "");
    setItemPago(false);
    setModalAberto(true);
  }

  function adicionarItem() {
    const titulo = itemTitulo.trim();

    if (!titulo) {
      return;
    }

    const valor =
      itemTipo === "tarefa"
        ? 0
        : Number(itemValor.replace(/\./g, "").replace(",", ".")) || 0;

    setItens((anteriores) => [
      ...anteriores,
      {
        id: Date.now(),
        titulo,
        tipo: itemTipo,
        responsavel: itemResponsavel,
        detalhe: "",
        valor,
        pago: itemTipo === "tarefa" ? false : itemPago,
      },
    ]);

    setModalAberto(false);
  }

  function removerItem(id: number) {
    setItens((anteriores) => anteriores.filter((item) => item.id !== id));
  }

  function criarGrupo() {
    const grupo = {
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

    console.log("Novo grupo:", grupo);

    navigate("/grupo");
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* HEADER */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-surface px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F6FA]">
            <span className="text-xs font-bold text-secondary">R+</span>
          </div>

          <div>
            <p className="text-sm font-semibold text-text-primary">Racha+</p>

            <p className="text-[9px] text-text-secondary">
              Divisão Inteligente
            </p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="hidden items-center gap-6 md:flex">
          <button
            type="button"
            onClick={() => navigate("/meus-grupos")}
            className="text-xs text-gray-700 transition hover:text-secondary"
          >
            Meus Grupos
          </button>

          <button
            type="button"
            className="text-xs text-gray-700 transition hover:text-secondary"
          >
            Criar com IA
          </button>

          <button
            type="button"
            className="text-xs text-gray-700 transition hover:text-secondary"
          >
            Histórico &amp; Pix
          </button>

          <button
            type="button"
            onClick={() => navigate("/perfil")}
            className="text-xs text-gray-700 transition hover:text-secondary"
          >
            Perfil
          </button>
        </nav>

        {/* Ações do usuário */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={abrirModalItem}
            className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-text-primary transition hover:bg-tertiary hover:text-white sm:flex"
          >
            <Plus size={14} />
            Novo Item
          </button>

          <button type="button" className="relative text-gray-600">
            <Bell size={17} />

            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
          </button>

          {/* Perfil */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAbaAberta(!abaAberta)}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-gray-50"
            >
              <img
                src="https://i.pravatar.cc/100?img=47"
                alt="Foto de perfil"
                className="h-9 w-9 rounded-full object-cover"
              />

              <div className="hidden text-left xl:block">
                <p className="text-xs font-semibold">Mariana S.</p>

                <p className="text-[9px] text-text-secondary">Ativa agora</p>
              </div>

              <ChevronDown
                size={15}
                className={`text-gray-500 transition-transform ${
                  abaAberta ? "rotate-180" : ""
                }`}
              />
            </button>

            {abaAberta && <Aba onLogout={() => navigate("/login")} />}
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="mx-auto max-w-[1280px] px-6 py-8">
        {/* TÍTULO E CAMINHO */}
        <div className="mb-8 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav
              aria-label="Navegação estrutural"
              className="flex items-center gap-2 text-xs text-text-secondary"
            >
              <button
                type="button"
                onClick={() => navigate("/meus-grupos")}
                className="transition hover:text-secondary"
              >
                Meus Grupos
              </button>

              <ChevronRight size={13} />

              <span>Novo Grupo</span>

              <ChevronRight size={13} />

              <span className="font-semibold text-text-primary">
                Criação Manual
              </span>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-[11px] font-medium text-text-secondary shadow-sm">
              <SlidersHorizontal size={13} className="text-primary" />
              Controle Total &amp; Personalizado
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-secondary">
                Criar grupo passo a passo
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                Defina o nome, convide participantes, adicione despesas iniciais
                e distribua responsabilidades com precisão total.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 self-start rounded-xl bg-surface px-4 py-2.5 text-sm font-semibold text-secondary shadow-sm transition hover:bg-input"
            >
              <Sparkles size={16} className="text-primary" />
              Prefere agilidade? Usar IA
            </button>
          </div>
        </div>

        {/* ESTRUTURA EM DUAS COLUNAS */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* COLUNA ESQUERDA - FORMULÁRIO */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {/* ETAPA 1 - DADOS DO GRUPO */}
            <section className="flex flex-col gap-6 rounded-2xl bg-surface p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-sm font-bold text-secondary">
                    1
                  </span>

                  <div>
                    <h2 className="font-semibold text-secondary">
                      Dados do Grupo
                    </h2>

                    <p className="text-xs text-text-secondary">
                      Informações essenciais para identificar o propósito do
                      racha
                    </p>
                  </div>
                </div>

                <span className="shrink-0 rounded bg-input px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  Obrigatório
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* NOME DO GRUPO */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label
                    htmlFor="nome-grupo"
                    className="text-sm font-semibold text-secondary"
                  >
                    Nome do Grupo
                  </label>

                  <div className="relative flex items-center">
                    <Users
                      size={18}
                      className="pointer-events-none absolute left-4 text-neutral"
                    />

                    <input
                      id="nome-grupo"
                      type="text"
                      value={nomeGrupo}
                      onChange={(event) => setNomeGrupo(event.target.value)}
                      placeholder="ex: Churrasco de Boas-Vindas ou Aluguel República Centro"
                      className="h-12 w-full rounded-xl border border-transparent bg-input pl-12 pr-4 text-sm text-text-primary outline-none transition placeholder:text-neutral focus:border-primary focus:bg-surface"
                    />
                  </div>
                </div>

                {/* CATEGORIA */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-sm font-semibold text-secondary">
                    Categoria / Tipo de Evento
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {categorias.map((opcao) => {
                      const Icone = opcao.icon;
                      const ativa = categoria === opcao.id;

                      return (
                        <button
                          key={opcao.id}
                          type="button"
                          onClick={() => setCategoria(opcao.id)}
                          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                            ativa
                              ? "bg-secondary text-white shadow-sm"
                              : "bg-input text-text-secondary hover:bg-background"
                          }`}
                        >
                          <Icone size={15} />
                          {opcao.nome}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* DATA */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="data-grupo"
                    className="text-sm font-semibold text-secondary"
                  >
                    Data do Evento ou Fechamento
                  </label>

                  <div className="relative flex items-center">
                    <CalendarDays
                      size={18}
                      className="pointer-events-none absolute left-4 text-neutral"
                    />

                    <input
                      id="data-grupo"
                      type="text"
                      value={dataEvento}
                      onChange={(event) => setDataEvento(event.target.value)}
                      placeholder="ex: 28 de Outubro às 14:00"
                      className="h-12 w-full rounded-xl border border-transparent bg-input pl-12 pr-4 text-sm text-text-primary outline-none transition placeholder:text-neutral focus:border-primary focus:bg-surface"
                    />
                  </div>
                </div>

                {/* MOEDA */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="moeda-grupo"
                    className="text-sm font-semibold text-secondary"
                  >
                    Moeda Padrão de Fechamento
                  </label>

                  <div className="relative flex items-center">
                    <Banknote
                      size={18}
                      className="pointer-events-none absolute left-4 text-neutral"
                    />

                    <select
                      id="moeda-grupo"
                      value={moeda}
                      onChange={(event) => setMoeda(event.target.value)}
                      className="h-12 w-full appearance-none rounded-xl border border-transparent bg-input pl-12 pr-10 text-sm text-text-primary outline-none transition focus:border-primary focus:bg-surface"
                    >
                      <option value="BRL">Real Brasileiro (BRL - R$)</option>
                      <option value="USD">Dólar Americano (USD - $)</option>
                      <option value="EUR">Euro (EUR - €)</option>
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 text-neutral"
                    />
                  </div>
                </div>

                {/* DESCRIÇÃO */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label
                    htmlFor="descricao-grupo"
                    className="flex items-center justify-between text-sm font-semibold text-secondary"
                  >
                    Descrição &amp; Orientações
                    <span className="text-[11px] font-normal text-text-secondary">
                      Opcional
                    </span>
                  </label>

                  <textarea
                    id="descricao-grupo"
                    rows={3}
                    value={descricao}
                    onChange={(event) => setDescricao(event.target.value)}
                    placeholder="Ex: Rateio do quiosque da represa com carnes nobres e bebidas inclusas. Quem não beber paga cota reduzida."
                    className="w-full resize-none rounded-xl border border-transparent bg-input px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-neutral focus:border-primary focus:bg-surface"
                  />
                </div>
              </div>
            </section>

            {/* ETAPA 2 - PARTICIPANTES */}
            <section className="flex flex-col gap-6 rounded-2xl bg-surface p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-sm font-bold text-secondary">
                    2
                  </span>

                  <div>
                    <h2 className="font-semibold text-secondary">
                      Participantes &amp; Regra de Divisão
                    </h2>

                    <p className="text-xs text-text-secondary">
                      Convide membros e escolha o método financeiro que faz mais
                      sentido
                    </p>
                  </div>
                </div>

                <span className="shrink-0 text-xs font-semibold text-secondary">
                  {membros.length} membros
                </span>
              </div>

              {/* ADICIONAR MEMBRO */}
              <div className="flex flex-col items-stretch gap-2 rounded-xl bg-background p-3 sm:flex-row">
                <div className="relative flex flex-1 items-center">
                  <UserPlus
                    size={17}
                    className="pointer-events-none absolute left-3.5 text-neutral"
                  />

                  <input
                    type="text"
                    value={novoNome}
                    onChange={(event) => setNovoNome(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        adicionarMembro();
                      }
                    }}
                    placeholder="Nome do participante"
                    className="h-11 w-full rounded-lg border border-transparent bg-surface pl-11 pr-3 text-sm text-text-primary outline-none transition placeholder:text-neutral focus:border-primary"
                  />
                </div>

                <div className="relative flex flex-1 items-center">
                  <MessageCircle
                    size={17}
                    className="pointer-events-none absolute left-3.5 text-neutral"
                  />

                  <input
                    type="text"
                    value={novoContato}
                    onChange={(event) => setNovoContato(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        adicionarMembro();
                      }
                    }}
                    placeholder="WhatsApp (DDD) ou E-mail"
                    className="h-11 w-full rounded-lg border border-transparent bg-surface pl-11 pr-3 text-sm text-text-primary outline-none transition placeholder:text-neutral focus:border-primary"
                  />
                </div>

                <button
                  type="button"
                  onClick={adicionarMembro}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-secondary px-5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                >
                  <Plus size={16} />
                  Adicionar
                </button>
              </div>

              {/* AÇÕES RÁPIDAS */}
              <div className="-mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary hover:underline"
                  >
                    <Upload size={14} />
                    Importar contatos
                  </button>

                  <span className="text-neutral">•</span>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary hover:underline"
                  >
                    <Link2 size={14} />
                    Copiar convite público
                  </button>
                </div>

                <span className="text-xs text-text-secondary">
                  Convites automáticos serão enviados via Pix/Zap
                </span>
              </div>

              {/* LISTA DE MEMBROS */}
              <div className="flex flex-col gap-2">
                {membros.map((membro) => (
                  <div
                    key={membro.id}
                    className={`flex items-center justify-between gap-3 rounded-xl p-3 transition ${
                      membro.admin
                        ? "bg-background"
                        : "bg-surface shadow-sm hover:bg-background"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {/* AVATAR */}
                      <div className="relative shrink-0">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${
                            membro.admin
                              ? "bg-primary text-text-primary"
                              : "bg-input text-secondary"
                          }`}
                        >
                          {membro.iniciais}
                        </div>

                        {membro.admin && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-tertiary text-[9px] font-bold text-white">
                            ★
                          </span>
                        )}
                      </div>

                      <div className="flex min-w-0 flex-col">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-text-primary">
                            {membro.nome}
                          </span>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              membro.admin
                                ? "bg-primary/25 text-tertiary"
                                : "bg-input text-text-secondary"
                            }`}
                          >
                            {membro.etiqueta}
                          </span>
                        </div>

                        <span className="flex items-center gap-1 truncate text-xs text-text-secondary">
                          {membro.admin && (
                            <QrCode size={12} className="text-primary" />
                          )}
                          {membro.contato}
                        </span>
                      </div>
                    </div>

                    {membro.admin ? (
                      <span className="shrink-0 rounded bg-surface px-2.5 py-1 text-[10px] font-medium text-text-secondary">
                        100% Cota
                      </span>
                    ) : (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          aria-label={`Ajustar ${membro.nome}`}
                          className="rounded-lg p-1.5 text-neutral transition hover:bg-input hover:text-text-primary"
                        >
                          <SlidersHorizontal size={16} />
                        </button>

                        <button
                          type="button"
                          aria-label={`Remover ${membro.nome}`}
                          onClick={() => removerMembro(membro.id)}
                          className="rounded-lg p-1.5 text-neutral transition hover:bg-red-50 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* MODELO DE RATEIO */}
              <div className="flex flex-col gap-3 pt-2">
                <span className="text-sm font-semibold text-secondary">
                  Modelo de Rateio
                </span>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {modelosRateio.map((modelo) => {
                    const Icone = modelo.icon;
                    const ativo = rateio === modelo.id;

                    return (
                      <button
                        key={modelo.id}
                        type="button"
                        onClick={() => setRateio(modelo.id)}
                        className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition ${
                          ativo
                            ? "border-primary bg-primary/10"
                            : "border-transparent bg-input hover:bg-background"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icone
                            size={22}
                            className={ativo ? "text-primary" : "text-neutral"}
                          />

                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full ${
                              ativo ? "bg-primary" : "bg-white"
                            }`}
                          >
                            {ativo && (
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </span>
                        </div>

                        <span className="text-sm font-semibold text-secondary">
                          {modelo.nome}
                        </span>

                        <p className="text-xs leading-relaxed text-text-secondary">
                          {modelo.descricao}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ETAPA 3 - DESPESAS E TAREFAS */}
            <section className="flex flex-col gap-6 rounded-2xl bg-surface p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-sm font-bold text-secondary">
                    3
                  </span>

                  <div>
                    <h2 className="font-semibold text-secondary">
                      Despesas &amp; Tarefas Iniciais
                    </h2>

                    <p className="text-xs text-text-secondary">
                      Cadastre adiantamentos, estimativas e quem fará as compras
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={abrirModalItem}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-text-primary shadow-sm transition hover:bg-tertiary hover:text-white"
                >
                  <CirclePlus size={16} />
                  Adicionar Item
                </button>
              </div>

              {/* LISTA DE ITENS */}
              <div className="flex flex-col gap-3">
                {itens.length === 0 && (
                  <p className="rounded-xl bg-background p-6 text-center text-sm text-text-secondary">
                    Nenhuma despesa ou tarefa cadastrada ainda.
                  </p>
                )}

                {itens.map((item) => {
                  const etiqueta = etiquetasItem[item.tipo];
                  const Icone = etiqueta.icon;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col items-start justify-between gap-3 rounded-xl bg-background p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-secondary shadow-sm">
                          <Icone size={20} />
                        </div>

                        <div className="flex min-w-0 flex-col">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-text-primary">
                              {item.titulo}
                            </span>

                            <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                              {etiqueta.rotulo}
                            </span>

                            {item.tipo !== "tarefa" && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  item.pago
                                    ? "bg-primary/25 text-tertiary"
                                    : "bg-input text-text-secondary"
                                }`}
                              >
                                {item.pago ? "Pago Adiantado" : "Estimado"}
                              </span>
                            )}
                          </div>

                          <span className="mt-0.5 text-xs text-text-secondary">
                            {item.tipo === "tarefa"
                              ? "Responsável: "
                              : item.pago
                              ? "Pago integralmente por "
                              : "Responsável pela compra: "}

                            <strong className="font-semibold text-secondary">
                              {item.responsavel}
                            </strong>

                            {item.detalhe ? ` ${item.detalhe}` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                        <div className="flex flex-col items-start sm:items-end">
                          <span
                            className={`text-lg font-bold ${
                              item.valor > 0
                                ? "text-secondary"
                                : "text-text-secondary"
                            }`}
                          >
                            {formatarMoeda(item.valor)}
                          </span>

                          <span className="text-[10px] text-text-secondary">
                            {item.tipo === "tarefa"
                              ? "Apenas incumbência"
                              : item.pago
                              ? "Reembolsável via rateio"
                              : "Valor provisionado"}
                          </span>
                        </div>

                        <button
                          type="button"
                          aria-label={`Remover ${item.titulo}`}
                          onClick={() => removerItem(item.id)}
                          className="rounded-lg p-1.5 text-neutral transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CÁLCULO EM TEMPO REAL */}
              <div className="flex flex-col items-start justify-between gap-3 rounded-xl bg-input p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Calculator size={18} className="shrink-0 text-primary" />

                  <span className="text-sm text-text-primary">
                    Custo total cadastrado:{" "}
                    <strong className="font-bold text-secondary">
                      {formatarMoeda(totalCadastrado)}
                    </strong>{" "}
                    • Cota estimada:{" "}
                    <strong className="font-bold text-secondary">
                      {formatarMoeda(cotaIndividual)} / membro
                    </strong>
                  </span>
                </div>

                <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-[11px] text-text-secondary shadow-sm">
                  Base: {COTISTAS_PREVISTOS} cotistas previstos
                </span>
              </div>
            </section>
          </div>

          {/* COLUNA DIREITA - RESUMO FIXO */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-4">
            {/* RESUMO DA CONFIGURAÇÃO */}
            <div className="flex flex-col gap-6 rounded-2xl bg-surface p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChartColumn size={19} className="text-secondary" />

                  <h3 className="font-semibold text-secondary">
                    Resumo da Configuração
                  </h3>
                </div>

                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
              </div>

              {/* MÉTRICAS */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col rounded-xl bg-background p-3">
                  <span className="text-[11px] text-text-secondary">
                    Membros Atuais
                  </span>

                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-secondary">
                      {membros.length}
                    </span>

                    <span className="text-xs text-text-secondary">
                      de {COTISTAS_PREVISTOS} convidados
                    </span>
                  </div>
                </div>

                <div className="flex flex-col rounded-xl bg-background p-3">
                  <span className="text-[11px] text-text-secondary">
                    Itens Ativos
                  </span>

                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-secondary">
                      {itens.length}
                    </span>

                    <span className="text-xs text-text-secondary">
                      despesas/tarefas
                    </span>
                  </div>
                </div>
              </div>

              {/* PRÉVIA FINANCEIRA */}
              <div className="flex flex-col gap-3 rounded-xl bg-input p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    Custo Total Atual
                  </span>

                  <span className="font-bold text-secondary">
                    {formatarMoeda(totalCadastrado)}
                  </span>
                </div>

                {/* BARRA DE PROPORÇÃO */}
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-background">
                  {itensComValor.map((item, indice) => (
                    <div
                      key={item.id}
                      title={`${item.titulo} — ${formatarMoeda(item.valor)}`}
                      className={indice % 2 === 0 ? "bg-primary" : "bg-secondary"}
                      style={{
                        width: `${(item.valor / totalCadastrado) * 100}%`,
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>Cota individual sugerida:</span>

                  <span className="font-semibold text-secondary">
                    {formatarMoeda(cotaIndividual)}
                  </span>
                </div>

                {/* SALDOS DE QUEM ADIANTOU */}
                {adiantadores.map((membro) => (
                  <div
                    key={membro.id}
                    className="flex flex-col gap-1 rounded-lg bg-surface p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-text-secondary">
                        Balanço de {membro.nome}:
                      </span>

                      <span className="shrink-0 font-semibold text-tertiary">
                        +{formatarMoeda(membro.adiantado - cotaIndividual)} a
                        receber
                      </span>
                    </div>

                    <span className="text-[10px] text-text-secondary">
                      (Adiantou {formatarMoeda(membro.adiantado)} e a cota
                      própria é {formatarMoeda(cotaIndividual)})
                    </span>
                  </div>
                ))}
              </div>

              {/* AÇÕES */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={criarGrupo}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-text-primary shadow-sm transition hover:bg-tertiary hover:text-white active:scale-[0.99]"
                >
                  Criar Grupo e Gerar Convites
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-secondary transition hover:bg-input"
                >
                  <Bookmark size={16} />
                  Salvar como Rascunho
                </button>
              </div>

              <p className="-mt-3 text-center text-[11px] text-text-secondary">
                Ao clicar, as chaves Pix dinâmicas serão criadas de forma
                segura.
              </p>
            </div>

            {/* CARD DE APOIO */}
            <div className="flex flex-col gap-4 rounded-2xl bg-surface p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <BadgeCheck size={18} className="text-primary" />

                <h4 className="text-sm font-semibold text-secondary">
                  Por que usar a criação manual?
                </h4>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                    <WalletCards size={13} />
                  </div>

                  <p className="text-xs leading-relaxed text-text-primary">
                    <strong>Cálculo transparente</strong> de adiantamentos e
                    trocos sem atrito interpessoal.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                    <Bell size={13} />
                  </div>

                  <p className="text-xs leading-relaxed text-text-primary">
                    <strong>Notificação individual</strong> via WhatsApp com
                    código Pix "Copia e Cola" sem exposição em grupo.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/25 text-tertiary">
                    <WandSparkles size={13} />
                  </div>

                  <p className="text-xs leading-relaxed text-text-primary">
                    Mudou de ideia? Você pode pedir para a IA organizar recibos
                    e notas a qualquer instante.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 pt-1 text-xs font-semibold text-tertiary transition hover:text-secondary"
              >
                Alternar para Criar com IA
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* RODAPÉ */}
      <footer className="mt-12 w-full bg-surface py-8">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-secondary">Racha+</span>

            <span className="text-xs text-text-secondary">
              • Organização descomplicada de despesas e tarefas coletivas
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-text-secondary">
            <button type="button" className="transition hover:text-secondary">
              Sobre
            </button>

            <button type="button" className="transition hover:text-secondary">
              Segurança Pix
            </button>

            <button type="button" className="transition hover:text-secondary">
              Privacidade
            </button>

            <span>© 2025 Racha+. Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>

      {/* MODAL - ADICIONAR ITEM */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-[2px]">
          <div className="flex w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl">
            {/* CABEÇALHO */}
            <header className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-secondary">
                  Adicionar Item
                </h2>

                <p className="mt-0.5 text-xs text-text-secondary">
                  Cadastre uma despesa, uma compra prevista ou uma tarefa.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-input text-text-secondary transition hover:bg-background hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </header>

            {/* FORMULÁRIO */}
            <div className="flex flex-col gap-4 px-6 py-5">
              {/* TIPO */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-secondary">
                  Tipo do item
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {(["despesa", "compra", "tarefa"] as TipoItem[]).map(
                    (tipo) => {
                      const Icone = etiquetasItem[tipo].icon;
                      const ativo = itemTipo === tipo;

                      return (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => setItemTipo(tipo)}
                          className={`flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-[11px] font-semibold transition ${
                            ativo
                              ? "bg-secondary text-white"
                              : "bg-input text-text-secondary hover:bg-background"
                          }`}
                        >
                          <Icone size={17} />
                          {etiquetasItem[tipo].rotulo}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* TÍTULO */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="item-titulo"
                  className="text-sm font-semibold text-secondary"
                >
                  Título
                </label>

                <input
                  id="item-titulo"
                  type="text"
                  autoFocus
                  value={itemTitulo}
                  onChange={(event) => setItemTitulo(event.target.value)}
                  placeholder="Ex: Aluguel do quiosque, gelo e carvão"
                  className="h-11 w-full rounded-xl border border-transparent bg-input px-4 text-sm text-text-primary outline-none transition placeholder:text-neutral focus:border-primary focus:bg-surface"
                />
              </div>

              {/* VALOR E RESPONSÁVEL */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {itemTipo !== "tarefa" && (
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="item-valor"
                      className="text-sm font-semibold text-secondary"
                    >
                      Valor (R$)
                    </label>

                    <input
                      id="item-valor"
                      type="text"
                      inputMode="decimal"
                      value={itemValor}
                      onChange={(event) => setItemValor(event.target.value)}
                      placeholder="240,00"
                      className="h-11 w-full rounded-xl border border-transparent bg-input px-4 text-sm text-text-primary outline-none transition placeholder:text-neutral focus:border-primary focus:bg-surface"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="item-responsavel"
                    className="text-sm font-semibold text-secondary"
                  >
                    Responsável
                  </label>

                  <div className="relative flex items-center">
                    <select
                      id="item-responsavel"
                      value={itemResponsavel}
                      onChange={(event) =>
                        setItemResponsavel(event.target.value)
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-transparent bg-input px-4 pr-10 text-sm text-text-primary outline-none transition focus:border-primary focus:bg-surface"
                    >
                      {membros.map((membro) => (
                        <option key={membro.id} value={membro.nome}>
                          {membro.nome}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 text-neutral"
                    />
                  </div>
                </div>
              </div>

              {/* JÁ FOI PAGO */}
              {itemTipo !== "tarefa" && (
                <button
                  type="button"
                  onClick={() => setItemPago(!itemPago)}
                  className="flex items-center justify-between gap-3 rounded-xl bg-background p-3 text-left transition hover:bg-input"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-secondary">
                      Já foi pago adiantado?
                    </span>

                    <span className="text-[11px] text-text-secondary">
                      O valor entra como crédito a receber no rateio.
                    </span>
                  </div>

                  <span
                    className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
                      itemPago ? "bg-primary" : "bg-neutral"
                    }`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${
                        itemPago ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </span>
                </button>
              )}
            </div>

            {/* AÇÕES DO MODAL */}
            <footer className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="h-11 rounded-xl px-5 text-sm font-semibold text-text-secondary transition hover:bg-input"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={adicionarItem}
                className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-text-primary shadow-sm transition hover:bg-tertiary hover:text-white active:scale-[0.99]"
              >
                <Plus size={16} />
                Adicionar ao grupo
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
