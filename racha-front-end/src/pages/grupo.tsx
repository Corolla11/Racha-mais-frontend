import { useNavigate } from "react-router-dom";

import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Copy,
  CreditCard,
  MapPin,
  Menu,
  Plus,
  QrCode,
  Settings,
  SlidersHorizontal,
  User,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";

import AbaPerfil from "../components/aba-perfil";
import OrangeButton from "../components/orange-button";

const tarefas = [
  {
    titulo: "Aluguel de Van executivo",
    responsavel: "Lucas M.",
    pessoas: "Todos (6)",
    data: "14 Nov",
    status: "Concluída",
    valor: "R$ 1.200,00",
    pagamentos: "6/6 pagos",
    concluida: true,
  },
  {
    titulo: "Comprar carnes e bebidas para o churrasco",
    responsavel: "Mariana S.",
    pessoas: "4 pessoas",
    data: "Amanhã às 10:00",
    status: "Pendente",
    valor: "R$ 650,00",
    pagamentos: "2/4 pagos",
    concluida: false,
  },
  {
    titulo: "Reservar passeios de barco na ilha",
    responsavel: "Você (Rodrigo)",
    pessoas: "5 pessoas",
    data: "18 Nov",
    status: "Pendente",
    valor: "R$ 190,00",
    pagamentos: "0/5 pagos",
    concluida: false,
  },
  {
    titulo: "Comprar bebidas e gelo para o barco",
    responsavel: "Felipe C.",
    pessoas: "3 pessoas",
    data: "20 Nov",
    status: "Em andamento",
    valor: "R$ 320,00",
    pagamentos: "1/3 pagos",
    concluida: false,
  },
  {
    titulo: "Jantar de confraternização",
    responsavel: "Camila R.",
    pessoas: "6 pessoas",
    data: "22 Nov",
    status: "Pendente",
    valor: "R$ 450,00",
    pagamentos: "0/6 pagos",
    concluida: false,
  },
];

const membros = [
  {
    iniciais: "RM",
    nome: "Rodrigo (Você)",
    status: "Deve R$ 200,00",
    acao: "Acertar",
    pendente: true,
  },
  {
    iniciais: "MS",
    nome: "Mariana S.",
    status: "Tudo pago",
    acao: "Quitado",
    pendente: false,
  },
  {
    iniciais: "LM",
    nome: "Lucas M.",
    status: "Deve R$ 140,00",
    acao: "Lembrar",
    pendente: true,
  },
  {
    iniciais: "BA",
    nome: "Bia A.",
    status: "Deve R$ 220,00",
    acao: "Lembrar",
    pendente: true,
  },
  {
    iniciais: "PH",
    nome: "Pedro H.",
    status: "Tudo pago",
    acao: "Quitado",
    pendente: false,
  },
  {
    iniciais: "CR",
    nome: "Camila R.",
    status: "Tudo pago",
    acao: "Quitado",
    pendente: false,
  },
];

export default function Grupo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-800">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-[235px] border-r border-slate-200 bg-white lg:flex lg:flex-col">
        {/* LOGO */}
        <div className="flex h-[72px] items-center gap-2 border-b border-slate-100 px-7">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">
            R
          </div>

          <span className="text-xl font-bold tracking-tight text-slate-800">
            Racha<span className="text-orange-500">+</span>
          </span>
        </div>

        {/* MENU */}
        <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-orange-500"
          >
            <Users size={18} />
            Meus grupos
          </button>

          <button
            type="button"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-orange-500"
          >
            <Settings size={18} />
            Configurações
          </button>
        </nav>

        {/* PERFIL */}
        <div className="border-t border-slate-100 p-4">
          <AbaPerfil onLogout={() => navigate("/login")} />
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="min-h-screen lg:ml-[235px]">
        {/* HEADER */}
        <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-8">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span>Dashboard</span>

            <ChevronRight size={15} />

            <span className="font-medium text-slate-700">
              Visão Geral
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-slate-500 transition hover:text-orange-500"
            >
              <Menu size={20} />
            </button>

            <button
              type="button"
              className="text-slate-500 transition hover:text-orange-500"
            >
              <Bell size={19} />
            </button>

            <OrangeButton>
              <Plus size={17} />
              Novo Racha
            </OrangeButton>

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white"
            >
              <User size={17} />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1180px] px-5 py-6 lg:px-7">
          {/* TÍTULO DO GRUPO */}
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                <Users size={14} />

                <span>Meus grupos</span>

                <ChevronRight size={13} />

                <span className="text-slate-600">
                  Viagem Florianópolis
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                  <MapPin size={20} />
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Viagem Florianópolis
                </h1>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                  ● Ativo • 6 participantes
                </span>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  Praia & Lazer
                </span>
              </div>
            </div>

            {/* NOVA TAREFA */}
            <div className="flex items-center gap-2">
              <OrangeButton>
                <Plus size={17} />
                Nova tarefa
              </OrangeButton>
            </div>
          </div>

          {/* CARDS DE RESUMO */}
          <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* TOTAL DESPESAS */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Total Despesas
                </span>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                  <WalletCards size={17} />
                </div>
              </div>

              <p className="text-2xl font-bold text-slate-900">
                R$ 3.840,00
              </p>

              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <span className="text-orange-500">↗</span>
                8 lançamentos no grupo
              </p>
            </div>

            {/* SUA PARTE */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Sua Parte
                </span>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
                  <CreditCard size={17} />
                </div>
              </div>

              <p className="text-2xl font-bold text-slate-900">
                R$ 640,00
              </p>

              <span className="mt-1 inline-flex rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-500">
                R$ 200,00 pendentes
              </span>
            </div>

            {/* QUITAÇÃO DO GRUPO */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Quitação do Grupo
                </span>

                <span className="text-sm font-bold text-orange-500">
                  75%
                </span>
              </div>

              <div className="mb-3 h-2 overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{ width: "75%" }}
                />
              </div>

              <p className="text-xs text-slate-600">
                <strong>R$ 2.880</strong> pagos de R$ 3.840
              </p>
            </div>

            {/* AÇÃO RÁPIDA */}
            <div className="rounded-xl border border-orange-100 bg-orange-50 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white">
                  <QrCode size={42} className="text-slate-800" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-600">
                    Ação rápida
                  </p>

                  <p className="truncate text-sm font-semibold text-slate-800">
                    Acessar R$ 200,...
                  </p>

                  <button
                    type="button"
                    className="mt-1 flex items-center gap-1 rounded-md bg-orange-500 px-2 py-1 text-xs font-semibold text-white"
                  >
                    <Copy size={12} />
                    Pagar Pix
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* TAREFAS */}
          <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {/* CABEÇALHO */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                  <SlidersHorizontal size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-800">
                    Tarefas do Grupo
                  </h2>

                  <p className="text-xs text-slate-400">
                    Confira todas as tarefas, despesas e o progresso de cada uma.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
              >
                <Plus size={15} />
                Tarefa
              </button>
            </div>

            {/* FILTROS */}
            <div className="mb-4 flex w-fit flex-wrap items-center gap-1 rounded-lg bg-blue-50 p-1">
              <button
                type="button"
                className="rounded-md bg-white px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
              >
                Todas
              </button>

              <button
                type="button"
                className="rounded-md px-4 py-1.5 text-xs font-medium text-slate-500 hover:bg-white"
              >
                Planejadas
              </button>

              <button
                type="button"
                className="rounded-md px-4 py-1.5 text-xs font-medium text-slate-500 hover:bg-white"
              >
                Em andamento
              </button>

              <button
                type="button"
                className="rounded-md px-4 py-1.5 text-xs font-medium text-slate-500 hover:bg-white"
              >
                Concluídas
              </button>
            </div>

            {/* LISTA DE TAREFAS */}
            <div className="space-y-2">
              {tarefas.map((tarefa, index) => (
                <div
                  key={index}
                  className="group flex flex-col gap-4 rounded-xl bg-[#f4f7fc] p-4 transition hover:bg-blue-50 md:flex-row md:items-center"
                >
                  {/* ÍCONE */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                    {tarefa.concluida ? (
                      <CheckCircle2
                        size={18}
                        className="text-green-500"
                      />
                    ) : (
                      <ClipboardList size={18} />
                    )}
                  </div>

                  {/* INFORMAÇÕES */}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-slate-800">
                      {tarefa.titulo}
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Responsável: {tarefa.responsavel}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users size={13} />
                        {tarefa.pessoas}
                      </span>

                      <span className="flex items-center gap-1">
                        <CalendarDays size={13} />
                        {tarefa.data}
                      </span>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="md:w-28">
                    {tarefa.status === "Concluída" && (
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-[11px] font-medium text-green-600">
                        ● Concluída
                      </span>
                    )}

                    {tarefa.status === "Pendente" && (
                      <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-[11px] font-medium text-orange-600">
                        ● Pendente
                      </span>
                    )}

                    {tarefa.status === "Em andamento" && (
                      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-[11px] font-medium text-blue-600">
                        ● Em andamento
                      </span>
                    )}
                  </div>

                  {/* VALOR */}
                  <div className="text-left md:w-32 md:text-right">
                    <p className="text-sm font-bold text-slate-800">
                      {tarefa.valor}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {tarefa.pagamentos}
                    </p>
                  </div>

                  <ChevronRight
                    size={18}
                    className="hidden text-slate-400 transition group-hover:translate-x-1 md:block"
                  />
                </div>
              ))}
            </div>

            {/* DESTINO */}
            <div className="relative mt-4 h-28 overflow-hidden rounded-xl bg-slate-300">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80"
                alt="Destino da viagem"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

              <div className="absolute bottom-4 left-5 text-white">
                <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide">
                  <MapPin size={12} />
                  Destino confirmado
                </div>

                <p className="text-lg font-bold">
                  Praia da Joaquina & Campeche
                </p>
              </div>
            </div>
          </section>

          {/* MEMBROS */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                  <Users size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-800">
                    Membros do Grupo
                  </h2>

                  <p className="text-xs text-slate-400">
                    Status individual de acerto financeiro
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
              >
                <UserPlus size={15} />
                Convidar mais amigos
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {membros.map((membro, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-[#f0f4fc] p-3 text-center"
                >
                  {/* AVATAR */}
                  <div className="relative mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                    {index === 0 ? (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-orange-500 text-white">
                        {membro.iniciais}
                      </div>
                    ) : (
                      membro.iniciais
                    )}

                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-orange-500" />
                  </div>

                  <p className="truncate text-xs font-semibold text-slate-700">
                    {membro.nome}
                  </p>

                  <p
                    className={`mt-1 text-[10px] ${
                      membro.pendente
                        ? "text-red-500"
                        : "text-slate-400"
                    }`}
                  >
                    {membro.status}
                  </p>

                  <button
                    type="button"
                    className={`mt-2 w-full rounded-md bg-white px-2 py-1.5 text-[10px] font-medium shadow-sm ${
                      membro.pendente
                        ? "text-slate-700 hover:text-orange-500"
                        : "text-slate-400"
                    }`}
                  >
                    {membro.acao}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}