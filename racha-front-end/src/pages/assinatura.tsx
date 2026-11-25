import { useEffect, useId, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SettingsBreadcrumb, SettingsTabs, StatusToast } from "../components/account-panels";
import AppShell from "../components/app-shell";
import Icon from "../components/icon";
import Overlay from "../components/overlay";
import { PageHeading } from "../components/ui";
import { ApiError, apiRequest } from "../lib/api";
import { ENDPOINTS, type AssinaturaGrupoApi, type PlanoApi } from "../lib/endpoints";
import { money } from "../lib/finance";

type GrupoResumoApi = {
  id: string;
  nome: string;
};

const plans = [
  {
    name: "Grátis",
    month: 0,
    year: 0,
    description: "Ideal para quem quer dividir contas esporádicas com poucos amigos.",
    features: [
      "Até 2 grupos ativos simultâneos",
      "Até 10 membros por grupo",
      "Divisão igualitária de despesas",
      "Geração de QR Code Pix básico",
      "Comprovantes em baixa resolução",
    ],
  },
  {
    name: "Pro",
    month: 4.9,
    year: 49.9,
    description: "Perfeito para viagens longas, repúblicas e turmas ativas de amigos.",
    features: [
      "+3 grupos adicionais (5 grupos no total)",
      "+5 membros adicionais (até 15 membros por grupo)",
      "Divisão por participantes selecionados",
      "Organização de tarefas e compras em equipe",
      "Comprovantes em alta resolução",
      "Lembretes automáticos de pagamento",
    ],
  },
];

const questions = [
  {
    icon: "event_repeat",
    question: "Posso cancelar a assinatura quando quiser?",
    answer: "Sim. Você pode cancelar a assinatura do grupo em Minha assinatura quando desejar.",
  },
  {
    icon: "groups_2",
    question: "Todos do meu grupo precisam assinar o plano Pro?",
    answer: "Não. Os benefícios do plano Pro são contratados por grupo pelo administrador e valem para todos os membros dele.",
  },
  {
    icon: "payments",
    question: "Quais são as formas de pagamento aceitas?",
    answer: "Você pode escolher entre cobrança mensal ou anual e concluir o pagamento no checkout seguro da AbacatePay.",
  },
  {
    icon: "swap_vert",
    question: "O que acontece se eu cancelar o checkout pendente?",
    answer: "O checkout pendente é cancelado imediatamente e o grupo continua operando normalmente no plano Grátis.",
  },
];

const statusLabels: Record<NonNullable<AssinaturaGrupoApi["assinatura"]>["status"], string> = {
  ATIVA: "Ativa",
  PENDENTE: "Aguardando pagamento",
  CANCELADA: "Cancelada",
  FALHOU: "Falhou",
};

const primaryCta = "bg-primary-container hover:bg-primary text-on-primary shadow-[0_8px_20px_-4px_rgba(255,140,66,0.35)] active:scale-[0.98] transition-all";

export default function Assinatura({ manage = false }: { manage?: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [annual, setAnnual] = useState(false);
  const [planosBackend, setPlanosBackend] = useState<PlanoApi[]>([]);
  const [grupos, setGrupos] = useState<GrupoResumoApi[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState(() => searchParams.get("grupo") ?? "");
  const [estadoAssinatura, setEstadoAssinatura] = useState<{
    idGrupo: string;
    dados: AssinaturaGrupoApi;
  } | null>(null);
  const [carregandoGrupos, setCarregandoGrupos] = useState(true);
  const [carregandoId, setCarregandoId] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [message, setMessage] = useState("");
  const [erro, setErro] = useState("");
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const selectId = useId();

  useEffect(() => {
    let ativo = true;
    apiRequest<{ planos: PlanoApi[] }>(ENDPOINTS.planos.base)
      .then((res) => {
        if (ativo && Array.isArray(res.planos)) setPlanosBackend(res.planos);
      })
      .catch(() => {});

    apiRequest<GrupoResumoApi[]>(ENDPOINTS.grupos.base)
      .then((lista) => {
        if (!ativo || !Array.isArray(lista)) return;
        setGrupos(lista);
        setGrupoSelecionado((atual) => {
          if (atual && lista.some((g) => g.id === atual)) return atual;
          return lista[0]?.id ?? "";
        });
      })
      .catch(() => {})
      .finally(() => {
        if (ativo) setCarregandoGrupos(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!grupoSelecionado) return;
    let ativo = true;
    apiRequest<AssinaturaGrupoApi>(ENDPOINTS.assinaturas.doGrupo(grupoSelecionado))
      .then((dados) => {
        if (ativo) {
          setEstadoAssinatura({ idGrupo: grupoSelecionado, dados });
          setErro("");
          setCarregandoId(null);
        }
      })
      .catch((err) => {
        if (ativo) {
          setEstadoAssinatura(null);
          setErro(err instanceof ApiError ? err.message : "Não foi possível consultar a assinatura do grupo.");
          setCarregandoId(null);
        }
      });
    return () => {
      ativo = false;
    };
  }, [grupoSelecionado]);

  function trocarGrupo(novoId: string) {
    setCarregandoId(novoId || null);
    setErro("");
    setGrupoSelecionado(novoId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (novoId) next.set("grupo", novoId);
      else next.delete("grupo");
      return next;
    }, { replace: true });
  }

  async function iniciarUpgradePro() {
    if (!grupoSelecionado) {
      setErro("Selecione ou crie um grupo antes de contratar o plano Pro.");
      return;
    }
    setErro("");
    setMessage("");
    setProcessando(true);
    try {
      const res = await apiRequest<{
        checkoutUrl: string;
        status: "PENDENTE" | "ATIVA" | "CANCELADA" | "FALHOU";
        ciclo: "mensal" | "anual";
        valorCentavos: number;
      }>(ENDPOINTS.assinaturas.checkoutPro(grupoSelecionado), {
        method: "POST",
        body: { ciclo: annual ? "anual" : "mensal" },
      });
      const atualizada = await apiRequest<AssinaturaGrupoApi>(
        ENDPOINTS.assinaturas.doGrupo(grupoSelecionado),
      ).catch(() => null);
      if (atualizada) setEstadoAssinatura({ idGrupo: grupoSelecionado, dados: atualizada });
      if (res.checkoutUrl) {
        window.open(res.checkoutUrl, "_blank", "noopener,noreferrer");
        setMessage("Checkout aberto em uma nova aba. Conclua o pagamento para ativar o plano Pro.");
      }
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível iniciar o checkout Pro.");
    } finally {
      setProcessando(false);
    }
  }

  async function cancelarAssinatura() {
    if (!grupoSelecionado) return;
    setErro("");
    setMessage("");
    setProcessando(true);
    try {
      await apiRequest<{ status: string }>(ENDPOINTS.assinaturas.cancelar(grupoSelecionado), {
        method: "POST",
      });
      const atualizada = await apiRequest<AssinaturaGrupoApi>(
        ENDPOINTS.assinaturas.doGrupo(grupoSelecionado),
      );
      setEstadoAssinatura({ idGrupo: grupoSelecionado, dados: atualizada });
      setCancel(false);
      setMessage("Assinatura cancelada com sucesso.");
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível cancelar a assinatura.");
      setCancel(false);
    } finally {
      setProcessando(false);
    }
  }

  const planosVisiveis = plans.map((plano, index) => {
    if (index !== 1 || planosBackend.length === 0) return plano;
    const mensal = planosBackend.find((p) => p.ciclo === "mensal");
    const anual = planosBackend.find((p) => p.ciclo === "anual");
    return {
      ...plano,
      month: mensal ? mensal.valorCentavos / 100 : plano.month,
      year: anual ? anual.valorCentavos / 100 : plano.year,
    };
  });

  const dadosGrupo =
    grupoSelecionado && estadoAssinatura?.idGrupo === grupoSelecionado
      ? estadoAssinatura.dados
      : null;
  const carregandoAssinatura = Boolean(
    grupoSelecionado && carregandoId === grupoSelecionado && !dadosGrupo,
  );
  const assinaturaAtual = dadosGrupo?.assinatura ?? null;
  const isPro = Boolean(dadosGrupo?.isPro);
  const podeCancelar =
    assinaturaAtual?.status === "ATIVA" || assinaturaAtual?.status === "PENDENTE";

  const seletorGrupo = (
    <div className="mb-space-lg rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
      <div className="space-y-0.5">
        <label htmlFor={selectId} className="font-label-md text-label-md font-semibold text-on-surface block">
          Grupo da assinatura
        </label>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          No Racha+, o plano Pro é vinculado individualmente a cada grupo.
        </p>
      </div>
      {carregandoGrupos ? (
        <span className="font-body-sm text-body-sm text-on-surface-variant">Carregando grupos...</span>
      ) : grupos.length === 0 ? (
        <Link
          to="/criar-grupo"
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-primary-container px-space-md font-label-md text-label-md text-on-primary hover:bg-primary transition-colors"
        >
          <Icon name="add_circle" size={18} />
          <span>Criar meu primeiro grupo</span>
        </Link>
      ) : (
        <select
          id={selectId}
          value={grupoSelecionado}
          onChange={(e) => trocarGrupo(e.target.value)}
          className="min-h-11 rounded-lg bg-surface-container-low px-space-md py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
        >
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>{g.nome}</option>
          ))}
        </select>
      )}
    </div>
  );

  return (
    <AppShell title={manage ? "Configurações da conta" : "Planos e Assinaturas"} bare>
      {manage ? (
        <div className="max-w-5xl mx-auto px-gutter-mobile sm:px-gutter py-space-lg md:py-space-xl">
          <SettingsBreadcrumb trail={[{ label: "Configurações", to: "/perfil" }, { label: "Planos & Assinaturas" }]} />
          <div className="mb-space-xl">
            <PageHeading title="Configurações" eyebrow="Sua assinatura" description="Consulte o plano do grupo selecionado e gerencie a assinatura Pro." />
          </div>
          <SettingsTabs active="plans" />
          <StatusToast message={message} onDone={() => setMessage("")} />
          {erro && (
            <div role="alert" className="mb-space-md flex items-center gap-2 rounded-xl bg-error-container p-space-md font-body-sm text-body-sm text-on-error-container">
              <Icon name="error" size={18} />
              <span>{erro}</span>
            </div>
          )}
          {seletorGrupo}
          <div className="flex flex-col gap-space-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
              <section className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-md mb-space-lg">
                  <div className="flex items-start gap-space-md">
                    <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0 text-on-primary-fixed shadow-sm">
                      <Icon name="workspace_premium" size={24} />
                    </div>
                    <div>
                      <span className="font-label-sm text-label-sm font-semibold tracking-wider uppercase text-primary">Assinatura do Grupo</span>
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        {carregandoAssinatura ? "Consultando..." : isPro ? "Plano Pro" : "Plano Grátis"}
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Mais organização para dividir bons momentos.</p>
                    </div>
                  </div>
                  <span className={`self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold whitespace-nowrap ${assinaturaAtual?.status === "CANCELADA" || assinaturaAtual?.status === "FALHOU" ? "bg-surface-container-high text-on-surface-variant" : "bg-primary-fixed text-on-primary-fixed"}`}>
                    <span className={`w-2 h-2 rounded-full ${assinaturaAtual?.status === "CANCELADA" || assinaturaAtual?.status === "FALHOU" ? "bg-outline" : "bg-primary-container"}`} />
                    {assinaturaAtual ? statusLabels[assinaturaAtual.status] : "Plano atual"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                  {[
                    ["Valor do ciclo", assinaturaAtual ? money(assinaturaAtual.valorCentavos / 100) : money(0)],
                    ["Periodicidade", assinaturaAtual ? (assinaturaAtual.ciclo === "anual" ? "Anual" : "Mensal") : "Sem cobrança"],
                    ["Última atualização", assinaturaAtual ? new Date(assinaturaAtual.updatedAt).toLocaleDateString("pt-BR") : "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="p-space-md rounded-lg bg-surface-container-low">
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{label}</p>
                      <p className="font-headline-sm text-headline-sm font-bold text-on-surface">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-space-sm mt-space-lg">
                  <Link
                    to={grupoSelecionado ? `/assinatura?grupo=${encodeURIComponent(grupoSelecionado)}` : "/assinatura"}
                    className={`inline-flex items-center justify-center gap-space-xs px-space-lg h-11 rounded-lg font-label-md text-label-md ${primaryCta}`}
                  >
                    Ver planos <Icon name="arrow_forward" size={18} />
                  </Link>
                  {assinaturaAtual?.status === "PENDENTE" && assinaturaAtual.checkoutUrl && (
                    <a
                      href={assinaturaAtual.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-space-xs px-space-lg h-11 rounded-lg bg-primary-fixed text-on-primary-fixed font-label-md text-label-md hover:bg-primary-fixed-dim transition-colors"
                    >
                      <Icon name="open_in_new" size={18} />
                      Retomar pagamento
                    </a>
                  )}
                  {podeCancelar && (
                    <button
                      type="button"
                      disabled={processando}
                      onClick={() => setCancel(true)}
                      className="inline-flex items-center justify-center gap-space-xs px-space-lg h-11 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Icon name="event_busy" size={18} />
                      Cancelar assinatura
                    </button>
                  )}
                </div>
              </section>
              <section className="lg:col-span-4 bg-surface-container-low rounded-xl p-space-lg shadow-sm space-y-space-sm">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container">
                  <Icon name="verified_user" size={28} />
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Você tem o controle</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Cancele a assinatura do grupo quando quiser. Seus grupos e o histórico financeiro serão preservados.</p>
                <Link to="/faq" className="inline-flex items-center gap-1 text-primary font-label-md text-label-md hover:underline">
                  Entenda como funcionam os planos <Icon name="arrow_outward" size={16} />
                </Link>
              </section>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <div aria-hidden="true" className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-primary-fixed/30 via-tertiary-fixed/15 to-transparent blur-3xl pointer-events-none" />
          <div aria-hidden="true" className="absolute top-96 right-10 w-80 h-80 bg-primary-container/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-gutter-mobile sm:px-gutter py-space-lg md:py-space-xl">
            <SettingsBreadcrumb trail={[{ label: "Configurações", to: "/perfil" }, { label: "Planos e Assinaturas" }]} />
            <StatusToast message={message} onDone={() => setMessage("")} />
            <div className="text-center max-w-3xl mx-auto mb-space-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm shadow-sm mb-space-sm">
                <Icon name="verified" size={16} /><span>Transparência total sem letras miúdas</span>
              </div>
              <h1 className="font-headline-lg md:font-display text-headline-lg md:text-display text-on-surface tracking-tight mb-space-sm">Planos e Assinaturas</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Escolha o melhor plano para organizar suas despesas em grupo. Cancele quando quiser.
              </p>
              <div className="inline-flex items-center justify-center mt-space-lg p-1.5 rounded-full bg-surface-container-lowest shadow-sm gap-2" role="group" aria-label="Periodicidade da cobrança">
                <button type="button" aria-pressed={!annual} onClick={() => setAnnual(false)} className={`px-5 py-2 min-h-11 rounded-full font-label-md text-label-md transition-all duration-200 cursor-pointer ${!annual ? "text-on-primary bg-primary-container shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}>Mensal</button>
                <button type="button" aria-pressed={annual} onClick={() => setAnnual(true)} className={`px-5 py-2 min-h-11 rounded-full font-label-md text-label-md transition-all duration-200 flex items-center gap-2 cursor-pointer ${annual ? "text-on-primary bg-primary-container shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}>
                  <span>Anual</span>
                  {planosVisiveis[1]?.month > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-label-sm">
                      {Math.round((1 - planosVisiveis[1].year / (planosVisiveis[1].month * 12)) * 100)}% off
                    </span>
                  )}
                </button>
              </div>
            </div>

            {erro && (
              <div role="alert" className="max-w-4xl mx-auto mb-space-md flex items-center gap-2 rounded-xl bg-error-container p-space-md font-body-sm text-body-sm text-on-error-container">
                <Icon name="error" size={18} />
                <span>{erro}</span>
              </div>
            )}

            <div className="max-w-4xl mx-auto">{seletorGrupo}</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg items-stretch max-w-4xl mx-auto mb-space-xl pt-space-sm">
              {planosVisiveis.map((plan, index) => {
                const featured = index === 1;
                const price = annual ? plan.year / 12 : plan.month;
                const pendenteUrl = featured && assinaturaAtual?.status === "PENDENTE" ? assinaturaAtual.checkoutUrl : null;
                return (
                  <section key={plan.name} className={`relative bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between transition-all duration-300 ${featured ? "shadow-xl hover:shadow-2xl ring-2 ring-primary-container/20" : "shadow-sm hover:shadow-md"}`}>
                    {featured && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="px-4 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm shadow-md flex items-center gap-1.5 whitespace-nowrap">
                          <Icon name="star" size={16} filled /><span>Mais Escolhido pelos Grupos</span>
                        </span>
                      </div>
                    )}
                    <div>
                      <div className={`flex items-center justify-between gap-2 mb-space-md ${featured ? "pt-space-xs" : ""}`}>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-1.5">
                          <span>{index === 0 ? plan.name : `Racha+ ${plan.name}`}</span>
                          {featured && <Icon name="bolt" size={20} filled className="text-primary-container" />}
                        </h2>
                        {index === 0 && !isPro && <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap">Plano Atual</span>}
                        {featured && isPro && <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold">Ativo no grupo</span>}
                        {featured && !isPro && <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold">Recomendado</span>}
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md min-h-[40px]">{plan.description}</p>
                      <div className="py-space-md mb-space-md">
                        <div className="flex items-baseline gap-1">
                          <span className={`font-numeric-stat text-numeric-stat ${featured ? "text-primary-container font-extrabold" : "text-on-surface"}`}>{money(price)}</span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">/ mês</span>
                        </div>
                        <p className="font-label-sm text-label-sm text-outline mt-0.5">
                          {index === 0 ? "Sem taxas ocultas" : annual ? `Faturado anualmente (${money(plan.year)}/ano)` : "Cobrança mensal flexível"}
                        </p>
                      </div>
                      <div className={`h-px w-full mb-space-md ${featured ? "bg-primary-fixed/40" : "bg-surface-container"}`} />
                      <p className={`font-label-sm text-label-sm font-bold uppercase tracking-wider mb-space-sm ${featured ? "text-primary" : "text-on-surface"}`}>
                        {index === 0 ? "Incluso no plano:" : "Tudo do Grátis, mais:"}
                      </p>
                      <ul className={`space-y-3 font-body-sm text-body-sm mb-space-lg ${featured ? "text-on-surface" : "text-on-surface-variant"}`}>
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2.5">
                            <Icon name="check_circle" size={18} filled={featured} className={`shrink-0 ${featured ? "text-primary-container" : "text-outline"}`} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {index === 0 ? (
                      <button type="button" disabled className="w-full min-h-11 py-3 px-4 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md cursor-not-allowed opacity-80 flex items-center justify-center gap-1.5">
                        <Icon name="check_circle" size={18} />
                        <span>{isPro ? "Plano Base" : "Plano em Uso"}</span>
                      </button>
                    ) : isPro ? (
                      <Link
                        to={grupoSelecionado ? `/gerenciar-assinatura?grupo=${encodeURIComponent(grupoSelecionado)}` : "/gerenciar-assinatura"}
                        className="w-full min-h-11 py-3.5 px-5 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md transition-all flex items-center justify-center gap-2"
                      >
                        <span>Gerenciar assinatura do grupo</span>
                        <Icon name="settings" size={18} />
                      </Link>
                    ) : pendenteUrl ? (
                      <a
                        href={pendenteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full min-h-11 py-3.5 px-5 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 ${primaryCta}`}
                      >
                        <span>Concluir pagamento pendente</span>
                        <Icon name="open_in_new" size={18} />
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled={!grupoSelecionado || processando || carregandoAssinatura}
                        onClick={() => void iniciarUpgradePro()}
                        className={`w-full min-h-11 py-3.5 px-5 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${primaryCta}`}
                      >
                        <span>{processando ? "Abrindo checkout..." : "Fazer Upgrade para Pro"}</span>
                        <Icon name="arrow_forward" size={18} />
                      </button>
                    )}
                  </section>
                );
              })}
            </div>

            <div className="max-w-3xl mx-auto mb-space-xl">
              <div className="text-center mb-space-lg">
                <div className="inline-flex items-center gap-1.5 text-primary-container font-label-sm text-label-sm font-bold mb-1">
                  <Icon name="help" size={18} /><span>Tire suas dúvidas</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Perguntas Frequentes</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Tudo o que você precisa saber antes de fazer seu upgrade.</p>
              </div>
              <div className="space-y-space-sm">
                {questions.map(({ icon, question, answer }, index) => {
                  const open = openQuestion === index;
                  return (
                    <div key={question} className="rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-200 overflow-hidden">
                      <button type="button" aria-expanded={open} aria-controls={`faq-plano-${index}`} onClick={() => setOpenQuestion(open ? null : index)} className="w-full p-space-md flex items-center justify-between gap-space-md text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container rounded-xl cursor-pointer">
                        <span className="font-headline-sm text-[18px] leading-6 text-on-surface flex items-center gap-2">
                          <Icon name={icon} size={20} className="text-primary-container shrink-0" /><span>{question}</span>
                        </span>
                        <Icon name="expand_more" className={`text-on-surface-variant transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`} />
                      </button>
                      <div id={`faq-plano-${index}`} hidden={!open} className="px-space-md pb-space-md text-on-surface-variant font-body-sm text-body-sm leading-relaxed"><p>{answer}</p></div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center pb-space-lg space-y-space-sm">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Ainda ficou com alguma dúvida sobre o plano ideal para você?
                <Link to="/faq" className="text-primary font-semibold hover:underline inline-flex items-center gap-1 ml-1">
                  <span>Fale com nosso time de atendimento</span><Icon name="arrow_outward" size={16} />
                </Link>
              </p>
              <p className="font-label-sm text-label-sm text-outline">
                <Link to={grupoSelecionado ? `/gerenciar-assinatura?grupo=${encodeURIComponent(grupoSelecionado)}` : "/gerenciar-assinatura"} className="text-primary font-semibold hover:underline">
                  Gerenciar minha assinatura →
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
      {cancel && (
        <Overlay
          title="Cancelar assinatura?"
          onClose={() => !processando && setCancel(false)}
          description="Revise antes de continuar."
          footer={
            <>
              <button
                type="button"
                disabled={processando}
                className="px-space-md h-11 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors cursor-pointer disabled:opacity-60"
                onClick={() => setCancel(false)}
              >
                Manter assinatura
              </button>
              <button
                type="button"
                disabled={processando}
                className="px-space-md h-11 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-colors cursor-pointer disabled:opacity-60"
                onClick={() => void cancelarAssinatura()}
              >
                {processando ? "Cancelando..." : "Confirmar cancelamento"}
              </button>
            </>
          }
        >
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            A assinatura Pro deste grupo será cancelada e os registros financeiros existentes permanecerão preservados.
          </p>
        </Overlay>
      )}
    </AppShell>
  );
}
