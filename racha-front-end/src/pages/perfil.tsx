import {
Bell,
Camera,
CheckCircle2,
ChevronDown,
CreditCard,
Eye,
Info,
LockKeyhole,
Mail,
MessageCircle,
MessageSquare,
Moon,
Pencil,
ShieldCheck,
SlidersHorizontal,
Sun,
UserRound,
WalletCards
} from "lucide-react";
import { useState } from "react";
import AccountPanels from "../components/account-panels";
import Link from "../components/app-link";


import { useSearchParams } from "react-router-dom";
import AppShell from "../components/app-shell";
import { PageHeading } from "../components/ui";

function Perfil() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("aba");
  const panel = initial === "pix" || initial === "security" || initial === "notifications" ? initial : "profile";
  function setPanel(value: "profile" | "notifications" | "security" | "pix") {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (value === "profile") next.delete("aba"); else next.set("aba", value);
      return next;
    }, { replace: true });
  }
  const [lembreteWhatsApp, setLembreteWhatsApp] = useState(true);
  const [notificarDespesas, setNotificarDespesas] = useState(true);
  const [resumoSemanal, setResumoSemanal] = useState(false);

  return <AppShell title="Configurações da Conta"><div className="racha-settings-page">
    <PageHeading eyebrow="PAINEL DO USUÁRIO" title="Configurações da Conta" description="Personalize preferências, canais de aviso e métodos de transação."/>
    <div className="racha-settings-tabs"><button className={panel === "profile" ? "active" : ""} onClick={() => setPanel("profile")}><UserRound size={13}/>Perfil</button><button className={panel === "notifications" ? "active" : ""} onClick={() => setPanel("notifications")}><Bell size={13}/>Notificações</button><button className={panel === "security" ? "active" : ""} onClick={() => setPanel("security")}><ShieldCheck size={13}/>Segurança e Conta</button><button className={panel === "pix" ? "active" : ""} onClick={() => setPanel("pix")}><CreditCard size={13}/>Pagamentos & Pix</button><Link to="/gerenciar-assinatura">Assinatura</Link></div>
    {(panel === "security" || panel === "pix") && <AccountPanels key={panel} panel={panel}/>}
          <section hidden={panel !== "profile"} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* CABEÇALHO DO PERFIL */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-ui-section-title font-semibold">
                    Meu Perfil
                  </h2>

                  <p className="mt-1 max-w-xl text-xs leading-5 text-gray-500">
                    Gerencie suas informações pessoais, chave Pix cadastrada
                    e dados de contato para a divisão automática de contas.
                  </p>
                </div>

                <span className="rounded-lg bg-[#F5F8FE] px-3 py-1.5 text-ui-caption text-gray-600">
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
                      <span className="rounded-full bg-orange-100 px-2 py-1 text-ui-caption font-semibold text-[#B45309]">
                        Organizadora verificada
                      </span>

                      <span className="text-ui-caption text-gray-500">
                        Membro desde Nov 2025
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="ui-button ui-button--md rounded-lg border border-gray-200 bg-white px-4 py-2 text-ui-caption font-medium transition hover:bg-gray-50">
                    Alterar foto
                  </button>

                  <button className="text-ui-caption font-medium text-red-500">
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

                <button className="ui-button ui-button--md flex items-center gap-2 rounded-lg border border-[#F97316] px-3 py-2 text-ui-caption font-medium text-[#F97316] transition hover:bg-orange-50">
                  <Pencil size={12} />
                  Editar
                </button>
              </div>

              {/* CAMPOS */}
              <div className="grid grid-cols-2 gap-4">
                {/* Nome */}
                <div>
                  <label className="mb-1.5 block text-ui-label font-medium">
                    Nome Completo
                  </label>

                  <div className="rounded-lg border border-gray-200 px-3 py-2.5 text-ui-caption">
                    Mariana Souza
                  </div>
                </div>

                {/* Email */}
                <div>
                  <div className="mb-1.5 flex justify-between">
                    <label className="text-ui-label font-medium">
                      E-mail Principal
                    </label>

                    <span className="text-ui-caption font-medium text-[#B7791F]">
                      ✓ Verificado
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
                    <span className="text-ui-caption">
                      mariana@exemplo.com
                    </span>

                    <Mail size={13} />
                  </div>
                </div>

                {/* Telefone */}
                <div className="col-span-2">
                  <label className="mb-1.5 block text-ui-label font-medium">
                    Telefone / WhatsApp
                  </label>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
                    <span className="text-ui-caption">
                      (11) 98765-4321
                    </span>

                    <MessageCircle size={13} />
                  </div>

                  <p className="mt-1.5 text-ui-caption text-gray-500">
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

                      <p className="mt-1 text-ui-caption text-gray-500">
                        Os amigos do grupo enviarão o dinheiro diretamente
                        para esta chave ao quitar saldos.
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-ui-caption font-medium text-green-600">
                    ● Padrão Ativa
                  </span>
                </div>

                {/* Dados Pix */}
                <div className="mt-4 grid grid-cols-[170px_1fr_auto] gap-3">
                  {/* Tipo de chave */}
                  <div>
                    <label className="mb-1.5 block text-ui-label font-medium">
                      Tipo de Chave
                    </label>

                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 text-ui-caption">
                      CPF

                      <ChevronDown size={12} />
                    </div>
                  </div>

                  {/* Chave */}
                  <div>
                    <label className="mb-1.5 block text-ui-label font-medium">
                      Chave Pix Cadastrada
                    </label>

                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5">
                      <span className="text-ui-caption font-semibold">
                        ***.456.789-**
                      </span>

                      <Eye size={13} />
                    </div>
                  </div>

                  {/* Editar Pix */}
                  <button className="ui-button ui-button--md mt-[20px] flex h-[36px] items-center gap-2 rounded-lg bg-white px-3 text-ui-caption font-medium transition hover:bg-gray-50">
                    <Pencil size={12} />
                    Editar
                  </button>
                </div>

                {/* Instituição */}
                <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <div>
                    <p className="text-ui-caption font-semibold">
                      Instituição validada
                    </p>

                    <p className="text-ui-caption text-gray-500">
                      Nu Pagamentos S.A. - Nubank (260)
                    </p>
                  </div>

                  <span className="text-ui-caption font-medium text-[#B7791F]">
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

                    <p className="mt-1 text-ui-caption text-gray-500">
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

                  <span className="text-ui-caption font-medium">
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
                    <p className="text-ui-caption font-semibold">
                      Segurança de Acesso
                    </p>

                    <p className="mt-1 text-ui-caption text-gray-500">
                      Última troca de senha realizada há 3 meses
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button className="ui-button ui-button--md rounded-md bg-white px-3 py-1.5 text-ui-caption font-medium transition hover:bg-gray-50">
                    Alterar senha
                  </button>

                  <button className="text-ui-caption font-medium text-red-500">
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

                <p className="text-ui-caption leading-4 text-gray-500">
                  Suas alterações são aplicadas a todos os seus grupos do
                  Racha+.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button className="ui-button ui-button--md rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-ui-caption font-medium transition hover:bg-gray-50">
                  Descartar alterações
                </button>

                <button className="ui-button ui-button--md rounded-lg bg-[#F97316] px-4 py-2.5 text-ui-caption font-semibold text-white transition hover:bg-[#EA580C]">
                  Salvar alterações
                </button>
              </div>
            </div>
          </section>
    {panel === "notifications" && <section className="racha-card"><h2>Notificações e Avisos</h2><div className="space-y-3 mt-5"><PreferenceItem icon={<MessageCircle size={15}/>} title="Lembretes por WhatsApp" description="Lembretes sobre vencimentos e acertos." active={lembreteWhatsApp} onClick={() => setLembreteWhatsApp(!lembreteWhatsApp)}/><PreferenceItem icon={<Bell size={15}/>} title="Novas tarefas e despesas" description="Avisos quando você for incluído em uma tarefa." active={notificarDespesas} onClick={() => setNotificarDespesas(!notificarDespesas)}/><PreferenceItem icon={<Mail size={15}/>} title="Resumo semanal" description="Resumo das atividades financeiras dos grupos." active={resumoSemanal} onClick={() => setResumoSemanal(!resumoSemanal)}/></div><small className="racha-demo-caption">Preferências ilustrativas nesta prévia.</small></section>}
  </div></AppShell>;
}

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
          <p className="text-ui-caption font-semibold">
            {title}
          </p>

          <p className="mt-1 max-w-xl text-ui-caption leading-4 text-gray-500">
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
