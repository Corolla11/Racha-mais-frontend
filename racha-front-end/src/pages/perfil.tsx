import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  UserRound,
  Headphones,
  ShieldCheck,
  Camera,
  Pencil,
  Mail,
  MessageCircle,
  WalletCards,
  Eye,
  SlidersHorizontal,
  MessageSquare,
  Moon,
  Sun,
  Info,
  LockKeyhole,
  CheckCircle2,
  CreditCard,
} from "lucide-react";

import Aba from "../components/aba-perfil";

function Perfil() {
  const navigate = useNavigate();

  const [abaAberta, setAbaAberta] = useState(false);

  const [lembreteWhatsApp, setLembreteWhatsApp] = useState(true);
  const [notificarDespesas, setNotificarDespesas] = useState(true);
  const [resumoSemanal, setResumoSemanal] = useState(false);

  function handleLogout() {
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#F5F8FE] text-[#111827]">
      {/* HEADER */}
      <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F6FA]">
            <span className="text-xs font-bold text-[#1D4ED8]">
              R+
            </span>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#111827]">
              Racha+
            </p>

            <p className="text-[9px] text-gray-500">
              Divisão Inteligente
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="hidden items-center gap-2 text-xs text-gray-400 md:flex">
          <span>Dashboard</span>

          <ChevronRight size={13} />

          <span>Visão Geral</span>

          <ChevronRight size={13} />

          <span className="font-medium text-gray-700">
            Configurações
          </span>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-4">
          <button className="rounded-lg bg-[#F5A623] px-4 py-2 text-xs font-medium text-[#111827] transition hover:brightness-95">
            + Novo Grupo
          </button>

          <button className="relative text-gray-600">
            <Bell size={17} />

            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#F5A623]" />
          </button>

          {/* Perfil */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAbaAberta(!abaAberta)}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-gray-50"
            >
              {/* Avatar padrão */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                <UserRound
                  size={19}
                  strokeWidth={1.7}
                  className="text-gray-400"
                />
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold">
                  Mariana S.
                </p>

                <p className="text-[9px] text-gray-500">
                  Ativa agora
                </p>
              </div>

              <ChevronDown
                size={15}
                className={`text-gray-500 transition-transform ${
                  abaAberta ? "rotate-180" : ""
                }`}
              />
            </button>

            {abaAberta && (
              <Aba onLogout={handleLogout} />
            )}
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* CABEÇALHO CONFIGURAÇÕES */}
        <section className="mb-5 flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
              <UserRound
                size={21}
                className="text-[#F97316]"
              />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase text-[#F97316]">
                Painel do usuário
              </p>

              <h1 className="text-xl font-semibold">
                Configurações da Conta
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-[#F5F8FE] px-3 py-2">
            <ShieldCheck
              size={14}
              className="text-[#F5A623]"
            />

            <span className="text-[10px] font-medium">
              Conta protegida e sincronizada
            </span>
          </div>
        </section>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-[210px_1fr] items-start gap-5">
          {/* MENU LATERAL */}
          <aside className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <p className="mb-2 px-3 text-[9px] font-semibold uppercase text-gray-500">
              Menu geral
            </p>

            {/* Meu Perfil */}
            <button className="flex w-full items-center justify-between rounded-lg bg-[#EEF4FF] px-3 py-3 text-left">
              <div className="flex items-center gap-3">
                <UserRound
                  size={15}
                  className="text-[#F97316]"
                />

                <span className="text-[11px] font-semibold">
                  Meu Perfil
                </span>
              </div>

              <ChevronRight
                size={14}
                className="text-[#F97316]"
              />
            </button>

            {/* Notificações */}
            <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-gray-50">
              <Bell size={15} />

              <span className="text-[11px]">
                Notificações e Avisos
              </span>
            </button>

            {/* Pagamentos */}
            <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-gray-50">
              <CreditCard size={15} />

              <span className="text-[11px]">
                Pagamentos & Pix
              </span>
            </button>

            {/* Segurança */}
            <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-gray-50">
              <ShieldCheck size={15} />

              <span className="text-[11px]">
                Segurança e Conta
              </span>
            </button>

            {/* SUPORTE */}
            <div className="mt-4 rounded-xl bg-[#F5F8FE] p-3">
              <div className="mb-2 flex items-center gap-2">
                <Headphones
                  size={15}
                  className="text-[#F97316]"
                />

                <p className="text-[10px] font-semibold">
                  Central de Suporte
                </p>
              </div>

              <p className="text-[10px] leading-4 text-gray-500">
                Precisa de ajuda com alguma funcionalidade?
              </p>

              <button className="mt-2 text-[10px] font-semibold text-[#F97316]">
                Falar com o suporte →
              </button>
            </div>
          </aside>

          {/* PERFIL */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* CABEÇALHO DO PERFIL */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Meu Perfil
                  </h2>

                  <p className="mt-1 max-w-xl text-xs leading-5 text-gray-500">
                    Gerencie suas informações pessoais, chave Pix cadastrada
                    e dados de contato para a divisão automática de contas.
                  </p>
                </div>

                <span className="rounded-lg bg-[#F5F8FE] px-3 py-1.5 text-[9px] text-gray-600">
                  <span className="mr-1 text-[#F97316]">
                    ●
                  </span>
                  ID: #RC-90214
                </span>
              </div>

              {/* CARD DO USUÁRIO */}
              <div className="mt-5 flex items-center justify-between rounded-xl bg-[#EEF4FF] p-4">
                <div className="flex items-center gap-3">
                  {/* Avatar padrão circular */}
                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
                      <UserRound
                        size={28}
                        strokeWidth={1.7}
                        className="text-gray-400"
                      />
                    </div>

                    {/* Ícone de câmera */}
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#EEF4FF] bg-[#F97316] text-white">
                      <Camera size={10} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">
                        Mariana Souza
                      </h3>

                      <CheckCircle2
                        size={14}
                        className="fill-[#F97316] text-[#F97316]"
                      />
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-full bg-orange-100 px-2 py-1 text-[8px] font-semibold text-[#B45309]">
                        Organizadora verificada
                      </span>

                      <span className="text-[9px] text-gray-500">
                        Membro desde Nov 2025
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[10px] font-medium transition hover:bg-gray-50">
                    Alterar foto
                  </button>

                  <button className="text-[10px] font-medium text-red-500">
                    Remover
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* DADOS PESSOAIS */}
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserRound
                    size={17}
                    className="text-[#F97316]"
                  />

                  <h3 className="text-sm font-semibold">
                    Dados Pessoais
                  </h3>
                </div>

                <button className="flex items-center gap-2 rounded-lg border border-[#F97316] px-3 py-2 text-[10px] font-medium text-[#F97316] transition hover:bg-orange-50">
                  <Pencil size={12} />
                  Editar
                </button>
              </div>

              {/* CAMPOS */}
              <div className="grid grid-cols-2 gap-4">
                {/* Nome */}
                <div>
                  <label className="mb-1.5 block text-[9px] font-medium">
                    Nome Completo
                  </label>

                  <div className="rounded-lg border border-gray-200 px-3 py-2.5 text-[10px]">
                    Mariana Souza
                  </div>
                </div>

                {/* Email */}
                <div>
                  <div className="mb-1.5 flex justify-between">
                    <label className="text-[9px] font-medium">
                      E-mail Principal
                    </label>

                    <span className="text-[8px] font-medium text-[#B7791F]">
                      ✓ Verificado
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
                    <span className="text-[10px]">
                      mariana@exemplo.com
                    </span>

                    <Mail size={13} />
                  </div>
                </div>

                {/* Telefone */}
                <div className="col-span-2">
                  <label className="mb-1.5 block text-[9px] font-medium">
                    Telefone / WhatsApp
                  </label>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
                    <span className="text-[10px]">
                      (11) 98765-4321
                    </span>

                    <MessageCircle size={13} />
                  </div>

                  <p className="mt-1.5 text-[8px] text-gray-500">
                    Usado para avisos de recebimentos pendentes e lembretes
                    automáticos entre os membros dos grupos.
                  </p>
                </div>
              </div>

              {/* CHAVE PIX */}
              <div className="mt-6 rounded-xl bg-[#EEF4FF] p-4">
                {/* Cabeçalho Pix */}
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F97316]">
                      <WalletCards
                        size={15}
                        className="text-white"
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold">
                        Chave Pix Padrão para Reembolsos
                      </h3>

                      <p className="mt-1 text-[9px] text-gray-500">
                        Os amigos do grupo enviarão o dinheiro diretamente
                        para esta chave ao quitar saldos.
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-[8px] font-medium text-green-600">
                    ● Padrão Ativa
                  </span>
                </div>

                {/* Dados Pix */}
                <div className="mt-4 grid grid-cols-[170px_1fr_auto] gap-3">
                  {/* Tipo de chave */}
                  <div>
                    <label className="mb-1.5 block text-[9px] font-medium">
                      Tipo de Chave
                    </label>

                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 text-[10px]">
                      CPF

                      <ChevronDown size={12} />
                    </div>
                  </div>

                  {/* Chave */}
                  <div>
                    <label className="mb-1.5 block text-[9px] font-medium">
                      Chave Pix Cadastrada
                    </label>

                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5">
                      <span className="text-[10px] font-semibold">
                        ***.456.789-**
                      </span>

                      <Eye size={13} />
                    </div>
                  </div>

                  {/* Editar Pix */}
                  <button className="mt-[20px] flex h-[36px] items-center gap-2 rounded-lg bg-white px-3 text-[10px] font-medium transition hover:bg-gray-50">
                    <Pencil size={12} />
                    Editar
                  </button>
                </div>

                {/* Instituição */}
                <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <div>
                    <p className="text-[9px] font-semibold">
                      Instituição validada
                    </p>

                    <p className="text-[8px] text-gray-500">
                      Nu Pagamentos S.A. - Nubank (260)
                    </p>
                  </div>

                  <span className="text-[8px] font-medium text-[#B7791F]">
                    ⚡ Pronto para receber PIX
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* PREFERÊNCIAS */}
            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <SlidersHorizontal
                  size={16}
                  className="text-[#F97316]"
                />

                <h3 className="text-sm font-semibold">
                  Preferências de Cobrança e Notificações
                </h3>
              </div>

              <div className="space-y-3">
                <PreferenceItem
                  icon={<MessageSquare size={16} />}
                  title="Lembretes automáticos amigáveis via WhatsApp"
                  description="Envia uma mensagem simpática 24 horas antes do vencimento do rateio para evitar cobranças manuais constrangedoras."
                  active={lembreteWhatsApp}
                  onClick={() =>
                    setLembreteWhatsApp(!lembreteWhatsApp)
                  }
                />

                <PreferenceItem
                  icon={<Bell size={16} />}
                  title="Notificar novas despesas no meu nome"
                  description="Receba alerta push e notificação em tempo real quando algum amigo adicionar um gasto incluindo sua cota."
                  active={notificarDespesas}
                  onClick={() =>
                    setNotificarDespesas(!notificarDespesas)
                  }
                />

                <PreferenceItem
                  icon={<Mail size={16} />}
                  title="Resumo semanal financeiro por e-mail"
                  description="Balanço consolidado toda segunda-feira com quem lhe deve e o que você ainda precisa reembolsar."
                  active={resumoSemanal}
                  onClick={() =>
                    setResumoSemanal(!resumoSemanal)
                  }
                />
              </div>

              {/* TEMA */}
              <div className="mt-5 flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Moon
                    size={19}
                    className="text-[#F97316]"
                  />

                  <div>
                    <p className="text-xs font-semibold">
                      Tema
                    </p>

                    <p className="mt-1 text-[9px] text-gray-500">
                      Altere a aparência do aplicativo entre modo claro e
                      escuro.
                    </p>
                  </div>
                </div>

                {/* Switch apenas visual */}
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
                  <Sun
                    size={14}
                    className="text-[#F5A623]"
                  />

                  <span className="text-[9px] font-medium">
                    Modo Claro
                  </span>

                  <div className="relative h-5 w-9 rounded-full bg-gray-300">
                    <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm" />
                  </div>

                  <Moon
                    size={14}
                    className="text-gray-500"
                  />
                </div>
              </div>

              {/* SEGURANÇA */}
              <div className="mt-5 flex items-center justify-between rounded-xl bg-[#EEF4FF] p-4">
                <div className="flex items-center gap-3">
                  <LockKeyhole
                    size={17}
                    className="text-[#F97316]"
                  />

                  <div>
                    <p className="text-[10px] font-semibold">
                      Segurança de Acesso
                    </p>

                    <p className="mt-1 text-[8px] text-gray-500">
                      Última troca de senha realizada há 3 meses
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button className="rounded-md bg-white px-3 py-1.5 text-[9px] font-medium transition hover:bg-gray-50">
                    Alterar senha
                  </button>

                  <button className="text-[8px] font-medium text-red-500">
                    Encerrar sessões ativas
                  </button>
                </div>
              </div>
            </div>

            {/* RODAPÉ */}
            <div className="flex items-center justify-between border-t border-gray-100 bg-[#F7F9FD] px-6 py-4">
              <div className="flex max-w-xs items-center gap-2">
                <Info
                  size={14}
                  className="shrink-0 text-gray-500"
                />

                <p className="text-[9px] leading-4 text-gray-500">
                  Suas alterações são aplicadas a todos os seus grupos do
                  Racha+.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[10px] font-medium transition hover:bg-gray-50">
                  Descartar alterações
                </button>

                <button className="rounded-lg bg-[#F97316] px-4 py-2.5 text-[10px] font-semibold text-white transition hover:bg-[#EA580C]">
                  Salvar alterações
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   COMPONENTE DE PREFERÊNCIA
========================================================= */

interface PreferenceItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

function PreferenceItem({
  icon,
  title,
  description,
  active,
  onClick,
}: PreferenceItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#EEF4FF] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#F97316]">
          {icon}
        </div>

        <div>
          <p className="text-[10px] font-semibold">
            {title}
          </p>

          <p className="mt-1 max-w-xl text-[9px] leading-4 text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClick}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          active
            ? "bg-[#F97316]"
            : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            active
              ? "left-[18px]"
              : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default Perfil;