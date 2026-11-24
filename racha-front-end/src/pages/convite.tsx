import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/app-shell";
import Icon from "../components/icon";
import Overlay from "../components/overlay";
import { useAuth } from "../auth/auth-context";

const cover = "/images/florianopolis-cover.jpg";

const GRUPO = "Viagem Florianópolis 2025";

const MEMBROS = [
  { iniciais: "RM", nome: "Rodrigo M.", detalhe: "Organizador principal", admin: true, cor: "bg-primary text-on-primary" },
  { iniciais: "MS", nome: "Mariana Silveira", detalhe: "Enviou seu convite", cor: "bg-primary-fixed text-on-primary-fixed" },
  { iniciais: "CP", nome: "Camila", detalhe: "Aguardando sua confirmação", cor: "bg-secondary-fixed text-on-secondary-fixed" },
  { iniciais: "TF", nome: "Thiago", detalhe: "Aguardando sua confirmação", cor: "bg-tertiary-fixed text-on-tertiary-fixed" },
];

const OUTROS = [
  { iniciais: "PA", cor: "bg-primary-fixed-dim text-on-primary-fixed-variant" },
  { iniciais: "LN", cor: "bg-surface-container-highest text-on-surface" },
];

const RECURSOS = [
  { icone: "pie_chart", titulo: "Divisão justa por tarefa", texto: "Cada despesa é dividida só entre quem participou." },
  { icone: "receipt_long", titulo: "Comprovantes transparentes", texto: "Todo pagamento fica registrado com comprovante." },
  { icone: "qr_code_2", titulo: "Pix direto", texto: "Pagamentos entre amigos, sem intermediação." },
];

const PASSOS = [
  { titulo: "Zero cobrança inicial", texto: "Você só paga quando houver lançamentos onde você estiver incluído." },
  { titulo: "Adicione suas compras", texto: "Comprou gasolina ou mercado? Lance o comprovante em 5 segundos." },
  { titulo: "Fechamento simplificado", texto: "O algoritmo calcula a menor quantidade possível de transferências via Pix." },
];

type Estado = "received" | "accepted" | "declined" | "expired" | "invalid" | "member";

const RESULTADO: Record<Exclude<Estado, "received">, { icone: string; cor: string; texto: string }> = {
  accepted: {
    icone: "check_circle",
    cor: "bg-tertiary text-on-tertiary",
    texto: "Sua participação foi confirmada na demonstração. Agora você pode acompanhar as tarefas e suas cotas.",
  },
  declined: {
    icone: "block",
    cor: "bg-surface-container-high text-on-surface-variant",
    texto: "Você recusou este convite. Nenhum acesso ao grupo foi concedido.",
  },
  expired: {
    icone: "schedule",
    cor: "bg-secondary-fixed text-secondary",
    texto: "Peça ao administrador um novo link de convite para continuar.",
  },
  invalid: {
    icone: "link_off",
    cor: "bg-secondary-fixed text-secondary",
    texto: "Peça ao administrador um novo link de convite para continuar.",
  },
  member: {
    icone: "group",
    cor: "bg-primary-fixed text-primary",
    texto: "Você já tem acesso às tarefas e informações deste grupo.",
  },
};

export default function Convite() {
  const { token } = useParams();
  const { user } = useAuth();
  const [state, setState] = useState<Estado>(
    token === "expirado" ? "expired" : token === "demo" ? "received" : token === "membro" ? "member" : "invalid",
  );
  const [confirmarRecusa, setConfirmarRecusa] = useState(false);
  const titles: Record<Estado, string> = {
    received: "Você foi convidado para um grupo!",
    accepted: "Convite aceito!",
    declined: "Convite recusado",
    expired: "Este convite expirou",
    invalid: "Convite inválido",
    member: "Você já participa deste grupo",
  };

  return (
    <AppShell title={titles[state]} bare>
      <div className="flex w-full flex-col">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-space-lg px-gutter-mobile py-space-md sm:px-gutter sm:py-space-lg">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
            <Link to="/meus-grupos" className="flex items-center gap-1 transition-colors hover:text-primary">
              <Icon name="home" size={16} />
              <span>Início</span>
            </Link>
            <span className="select-none text-outline-variant">/</span>
            <span>Convites</span>
            <span className="select-none text-outline-variant">/</span>
            <span className="max-w-[220px] truncate font-label-md text-label-md text-on-surface sm:max-w-none">
              {state === "received" ? GRUPO : titles[state]}
            </span>
          </nav>

          {state === "received" ? (
            <div className="grid w-full grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
              {/* Cartão principal do convite */}
              <section className="flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_1px_3px_0_rgba(31,41,55,0.04),0_1px_2px_-1px_rgba(31,41,55,0.02)] lg:col-span-8">
                <div
                  className="relative h-52 w-full overflow-hidden bg-cover bg-center sm:h-64"
                  style={{ backgroundImage: `url(${cover})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-on-surface/30 to-black/20" />
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-surface-container-lowest/95 px-3 py-1.5 text-on-surface shadow-md backdrop-blur-md sm:left-6">
                    <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-primary-container" />
                    <span className="font-label-sm text-label-sm tracking-wide">Convite Exclusivo • 6 membros participando</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex flex-col justify-between gap-2 text-surface-container-lowest sm:left-6 sm:right-6 sm:flex-row sm:items-end">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container/90 text-on-primary shadow-lg backdrop-blur">
                        <Icon name="flight" size={26} />
                      </div>
                      <div>
                        <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-surface-container-low">
                          Grupo de Viagem
                        </span>
                        <h1 className="font-headline-md text-headline-md leading-tight text-surface-container-lowest drop-shadow-sm sm:font-headline-lg sm:text-headline-lg">
                          {GRUPO}
                        </h1>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-space-lg p-space-md sm:p-space-lg">
                  {/* Quem convidou */}
                  <div className="flex flex-col items-start gap-space-md rounded-xl bg-surface-container-low p-space-md sm:flex-row">
                    <div className="relative shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed font-label-md text-label-md font-bold text-on-primary-fixed shadow-sm ring-2 ring-primary-container">
                        MS
                      </div>
                      <div className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-primary p-0.5 text-on-primary">
                        <Icon name="verified" size={12} />
                      </div>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="font-label-md text-label-md text-on-surface">
                        Convite de Mariana Silveira{" "}
                        <span className="font-body-sm text-body-sm text-on-surface-variant">(membro do grupo)</span>
                      </span>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        <strong className="font-semibold text-on-surface">Mariana Silveira</strong> convidou você para participar
                        do racha <strong className="font-semibold text-on-surface">{GRUPO}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Resumo do grupo */}
                  <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-3">
                    <Estatistica rotulo="Período" icone="calendar_month" cor="text-primary" valor="14–19 Nov 2025" detalhe="6 dias de viagem" />
                    <Estatistica rotulo="Membros" icone="groups" cor="text-tertiary-container" valor="6 membros" detalhe="Criado por Rodrigo M." destaque />
                    <Estatistica rotulo="Destino" icone="explore" cor="text-secondary" valor="Florianópolis" detalhe="Santa Catarina, BR" />
                  </div>

                  {/* Membros */}
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-label-md text-label-md text-on-surface">Membros já no grupo (6 participantes)</span>
                      <span className="hidden font-label-sm text-label-sm font-medium text-primary sm:inline">
                        Aguardando sua confirmação
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
                      {MEMBROS.map((membro) => (
                        <div key={membro.nome} className="flex items-center gap-3 rounded-lg bg-surface-container-low p-2">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${membro.cor}`}>
                            {membro.iniciais}
                          </span>
                          <div className="flex min-w-0 flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate font-label-md text-label-md text-on-surface">{membro.nome}</span>
                              {membro.admin && (
                                <span className="rounded bg-primary-fixed px-1.5 py-0.5 text-[10px] font-bold uppercase text-on-primary-fixed">
                                  Admin
                                </span>
                              )}
                            </div>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">{membro.detalhe}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 px-1 pt-1">
                      <div className="flex -space-x-2 overflow-hidden">
                        {OUTROS.map((outro) => (
                          <span
                            key={outro.iniciais}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-surface-container-lowest ${outro.cor}`}
                          >
                            {outro.iniciais}
                          </span>
                        ))}
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Mariana, Camila, Thiago, Pedro e Lucas estão aguardando sua confirmação.
                      </span>
                    </div>
                  </div>

                  {/* Transparência */}
                  <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-low/70 p-space-md">
                    <h2 className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                      <Icon name="security" size={18} className="text-primary" />
                      Recursos ativos e transparência neste grupo
                    </h2>
                    <div className="grid grid-cols-1 gap-space-sm text-on-surface-variant sm:grid-cols-3">
                      {RECURSOS.map((recurso) => (
                        <div key={recurso.titulo} className="flex items-start gap-2 rounded-lg bg-surface-container-lowest p-2.5 shadow-sm">
                          <Icon name={recurso.icone} size={20} className="mt-0.5 shrink-0 text-primary-container" />
                          <div className="flex flex-col">
                            <span className="font-label-sm text-label-sm font-semibold text-on-surface">{recurso.titulo}</span>
                            <span className="font-body-sm text-body-sm">{recurso.texto}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col items-center gap-space-md pt-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setState("accepted")}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-6 py-3.5 font-label-lg text-label-lg text-surface-container-lowest shadow-[0_8px_20px_-4px_rgba(255,140,66,0.45)] transition-all hover:bg-primary hover:shadow-lg active:scale-[0.99] sm:flex-1"
                    >
                      <span>Entrar no Grupo Agora</span>
                      <Icon name="arrow_forward" size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmarRecusa(true)}
                      className="w-full rounded-lg bg-surface-container px-6 py-3.5 text-center font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high sm:w-auto"
                    >
                      Recusar Convite
                    </button>
                  </div>

                  {/* Rodapé do cartão */}
                  <div className="flex flex-col items-center justify-between gap-2 pt-2 text-center font-body-sm text-body-sm text-on-surface-variant sm:flex-row sm:text-left">
                    {user ? (
                      <div className="flex items-center justify-center gap-1.5 sm:justify-start">
                        <Icon name="account_circle" size={16} className="text-outline" />
                        <span>
                          Você está conectado como <strong className="font-medium text-on-surface">{user.email}</strong>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 sm:justify-start">
                        <Icon name="chat" size={16} className="text-outline" />
                        <span>Dúvidas sobre o funcionamento do grupo?</span>
                      </div>
                    )}
                    <Link className="font-label-sm text-label-sm text-primary hover:underline" to="/faq">
                      Fale com o criador
                    </Link>
                  </div>
                  <small className="text-center font-label-sm text-label-sm text-outline">
                    Convite de demonstração · nenhuma participação real é alterada.
                  </small>
                </div>
              </section>

              {/* Coluna lateral */}
              <aside className="flex flex-col gap-space-md lg:col-span-4">
                <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-[0_1px_3px_0_rgba(31,41,55,0.04)]">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-on-surface">Destino Confirmado</span>
                    <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm text-on-surface">
                      SC, BR
                    </span>
                  </div>
                  <div
                    className="relative h-36 w-full overflow-hidden rounded-lg bg-cover bg-center shadow-inner"
                    style={{ backgroundImage: `url(${cover})` }}
                  >
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-on-surface/80 px-2.5 py-1 font-label-sm text-[11px] text-surface-container-lowest backdrop-blur-md">
                      <Icon name="pin_drop" size={14} className="text-primary-container" />
                      <span>Florianópolis, SC</span>
                    </div>
                  </div>
                  <p className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
                    <Icon name="calendar_month" size={16} className="text-outline" />
                    14–19 Nov 2025
                  </p>
                </div>

                <div className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-space-md shadow-[0_1px_3px_0_rgba(31,41,55,0.04)]">
                  <span className="font-label-md text-label-md text-on-surface">Como funciona entrar no grupo?</span>
                  {PASSOS.map((passo, indice) => (
                    <div key={passo.titulo} className="flex gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-[12px] font-bold text-on-primary-fixed">
                        {indice + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm font-semibold text-on-surface">{passo.titulo}</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{passo.texto}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-surface-container-high/60 p-space-md">
                  <Icon name="verified_user" size={24} className="text-outline" />
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm font-semibold text-on-surface">Grupo Privado e Protegido</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Apenas pessoas com link de convite oficial podem visualizar gastos.
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <Resultado
              estado={state}
              titulo={titles[state]}
            />
          )}
        </div>
      </div>

      {confirmarRecusa && (
        <Overlay
          title="Recusar convite?"
          description={`Tem certeza que deseja recusar o convite de Mariana Silveira para ${GRUPO}?`}
          onClose={() => setConfirmarRecusa(false)}
          footer={
            <div className="flex w-full flex-col-reverse gap-space-sm sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmarRecusa(false)}
                className="rounded-lg bg-surface-container px-5 py-2.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmarRecusa(false);
                  setState("declined");
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-secondary px-5 py-2.5 font-label-md text-label-md text-on-secondary transition-colors hover:bg-on-secondary-fixed-variant"
              >
                <Icon name="close" size={18} />
                Recusar convite
              </button>
            </div>
          }
        >
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Nenhum acesso ao grupo será concedido. Você poderá pedir um novo convite ao administrador.
          </p>
        </Overlay>
      )}
    </AppShell>
  );
}

function Estatistica({
  rotulo,
  icone,
  cor,
  valor,
  detalhe,
  destaque = false,
}: {
  rotulo: string;
  icone: string;
  cor: string;
  valor: string;
  detalhe: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between rounded-lg bg-surface-container p-space-md">
      <div className="mb-1 flex items-center justify-between text-on-surface-variant">
        <span className="font-label-sm text-label-sm uppercase tracking-wider">{rotulo}</span>
        <Icon name={icone} size={18} className={cor} />
      </div>
      <span
        className={
          destaque
            ? "font-numeric-stat text-numeric-stat text-primary-container"
            : "font-label-lg text-label-lg font-semibold text-on-surface"
        }
      >
        {valor}
      </span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{detalhe}</span>
    </div>
  );
}

function Resultado({ estado, titulo }: { estado: Exclude<Estado, "received">; titulo: string }) {
  const info = RESULTADO[estado];
  const acessar = estado === "accepted" || estado === "member";
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col items-center gap-space-md rounded-xl bg-surface-container-lowest p-space-lg text-center shadow-[0_1px_3px_0_rgba(31,41,55,0.04),0_1px_2px_-1px_rgba(31,41,55,0.02)] sm:p-space-xl">
      <div className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm ${info.cor}`}>
        <Icon name={info.icone} size={28} filled={estado === "accepted"} />
      </div>
      <div className="flex flex-col gap-space-xs">
        <h1 className="font-headline-md text-headline-md text-on-surface">{titulo}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">{info.texto}</p>
      </div>
      <Link
        to={acessar ? "/grupo" : "/meus-grupos"}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-6 py-3 font-label-lg text-label-lg text-on-primary shadow-[0_8px_20px_-4px_rgba(255,140,66,0.45)] transition-all hover:bg-primary active:scale-[0.99] sm:w-auto"
      >
        {acessar ? "Acessar o grupo" : "Voltar aos meus grupos"}
        <Icon name="arrow_forward" size={20} />
      </Link>
      <small className="font-label-sm text-label-sm text-outline">
        Convite de demonstração · nenhuma participação real é alterada.
      </small>
    </section>
  );
}
