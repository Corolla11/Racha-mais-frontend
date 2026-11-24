import { useEffect, useRef, useState, type FormEvent } from "react";
import AppShell from "../components/app-shell";
import Icon from "../components/icon";
import { Link, useLocation, useParams } from "react-router-dom";
import { ApiError, apiRequest } from "../lib/api";

type Membro = {
  idUser: string;
  idGrupo: string;
  funcao: "dono" | "membro";
  user: { id: string; name: string; image: string | null };
};

export default function Membros() {
  const { idGrupo } = useParams<{ idGrupo: string }>();
  const location = useLocation();
  const nomeGrupo = (location.state as { nomeGrupo?: unknown } | null)
    ?.nomeGrupo;
  const [membros, setMembros] = useState<Membro[]>([]);
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [busca, setBusca] = useState("");
  const [menu, setMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    function fechar(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenu(null);
    }
    function teclado(event: KeyboardEvent) {
      if (event.key === "Escape") setMenu(null);
    }
    document.addEventListener("mousedown", fechar);
    document.addEventListener("keydown", teclado);
    return () => {
      document.removeEventListener("mousedown", fechar);
      document.removeEventListener("keydown", teclado);
    };
  }, [menu]);

  useEffect(() => {
    let ativo = true;

    async function carregarMembros() {
      if (!idGrupo) {
        setErro("O identificador do grupo não foi informado.");
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro("");
      try {
        const resultado = await apiRequest<Membro[]>(
          `/grupos/${encodeURIComponent(idGrupo)}/membros`,
        );
        if (ativo) setMembros(resultado);
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof ApiError
              ? error.message
              : "Não foi possível carregar os membros.",
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregarMembros();
    return () => {
      ativo = false;
    };
  }, [idGrupo]);

  async function adicionarMembro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!idGrupo || !email.trim()) return;
    setErro("");
    setMensagem("");
    setEnviando(true);
    try {
      const membroAdicionado = await apiRequest<Membro>(
        `/grupos/${encodeURIComponent(idGrupo)}/membros`,
        { method: "POST", body: { email: email.trim() } },
      );
      setMembros((atuais) => [...atuais, membroAdicionado]);
      setEmail("");
      setMensagem("Membro adicionado ao grupo.");
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível adicionar o membro.",
      );
    } finally {
      setEnviando(false);
    }
  }

  async function alternarFuncao(membro: Membro) {
    if (!idGrupo) return;
    setErro("");
    setMensagem("");
    try {
      const membroAtualizado = await apiRequest<Membro>(
        `/grupos/${encodeURIComponent(idGrupo)}/membros/${encodeURIComponent(membro.idUser)}`,
        {
          method: "PATCH",
          body: { funcao: membro.funcao === "dono" ? "membro" : "dono" },
        },
      );
      setMembros((atuais) =>
        atuais.map((atual) =>
          atual.idUser === membroAtualizado.idUser
            ? membroAtualizado
            : atual,
        ),
      );
      setMensagem("Função do membro atualizada.");
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível alterar a função.",
      );
    }
  }

  async function removerMembro(membro: Membro) {
    if (!idGrupo) return;
    if (
      !window.confirm(
        `Remover ${membro.user.name} do grupo? Caso seja seu próprio usuário, você sairá do grupo.`,
      )
    ) {
      return;
    }
    setErro("");
    setMensagem("");
    try {
      await apiRequest<void>(
        `/grupos/${encodeURIComponent(idGrupo)}/membros/${encodeURIComponent(membro.idUser)}`,
        { method: "DELETE" },
      );
      setMembros((atuais) =>
        atuais.filter((atual) => atual.idUser !== membro.idUser),
      );
      setMensagem("Membro removido do grupo.");
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível remover o membro.",
      );
    }
  }

  const nomeExibido =
    typeof nomeGrupo === "string" ? nomeGrupo : idGrupo ?? "não informado";
  const termo = busca.trim().toLowerCase();
  const membrosVisiveis = termo
    ? membros.filter(
        (membro) =>
          membro.user.name.toLowerCase().includes(termo) ||
          membro.funcao.includes(termo) ||
          (membro.funcao === "dono" ? "administrador" : "membro").includes(termo),
      )
    : membros;
  const totalDonos = membros.filter((membro) => membro.funcao === "dono").length;

  return (
    <AppShell title="Membros do grupo" bare>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-gutter-mobile py-8 sm:px-6 lg:px-12">
        <nav
          aria-label="Navegação estrutural"
          className="flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-on-surface-variant"
        >
          <Link
            to="/meus-grupos"
            className="flex items-center gap-1 transition-colors hover:text-primary"
          >
            <Icon name="groups" size={16} />
            <span>Meus Grupos</span>
          </Link>
          <Icon name="chevron_right" size={14} className="text-outline-variant" />
          <span className="max-w-[16rem] truncate">{nomeExibido}</span>
          <Icon name="chevron_right" size={14} className="text-outline-variant" />
          <span className="font-semibold text-on-surface">Gerenciar Membros</span>
        </nav>

        <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-sm lg:flex-row lg:items-center lg:p-10">
          <div className="relative z-10 flex max-w-2xl flex-col gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-fixed px-3 py-1 font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-primary-fixed-variant">
              <Icon name="groups" size={16} />
              <span className="max-w-[18rem] truncate">{nomeExibido}</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">
              Convidar e Gerenciar Membros
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Controle quem participa do rateio, adicione amigos já cadastrados
              pelo e-mail e defina permissões em tempo real.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-4 rounded-xl bg-surface-container-low px-5 py-4">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Total no Grupo</span>
              <span className="font-numeric-stat text-numeric-stat font-bold text-on-surface">
                {carregando ? "—" : `${membros.length} ${membros.length === 1 ? "Pessoa" : "Pessoas"}`}
              </span>
            </div>
            <div className="h-10 w-px bg-outline-variant/30" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Administradores</span>
              <span className="font-numeric-stat text-numeric-stat font-bold text-primary">
                {carregando ? "—" : totalDonos}
              </span>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-gradient-to-br from-primary-container/20 via-primary/5 to-transparent blur-2xl" />
        </div>

        {erro && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-error-container/50 p-4 font-body-sm text-body-sm text-on-error-container"
          >
            <Icon name="error" size={20} className="shrink-0 text-error" />
            {erro}
          </p>
        )}
        {mensagem && (
          <p
            role="status"
            className="flex items-start gap-2 rounded-xl bg-[#ECFDF5] p-4 font-body-sm text-body-sm text-[#047857]"
          >
            <Icon name="check_circle" size={20} className="shrink-0" />
            {mensagem}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <form
            onSubmit={adicionarMembro}
            className="flex flex-col items-stretch justify-between gap-5 rounded-xl bg-surface-container-lowest p-6 shadow-sm lg:flex-row lg:items-center"
          >
            <div className="flex flex-1 flex-col items-start gap-3 sm:flex-row sm:items-center">
              <label
                htmlFor="membro-email"
                className="flex items-center gap-2 whitespace-nowrap font-label-md text-label-md text-on-surface"
              >
                <Icon name="person_add" size={20} className="text-primary" />
                <span>Adicionar por e-mail:</span>
              </label>
              <div className="relative flex w-full items-center sm:flex-1">
                <Icon name="mail" size={18} className="pointer-events-none absolute left-3 text-outline" />
                <input
                  id="membro-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="E-mail de um usuário já cadastrado"
                  className="w-full rounded-lg bg-surface-container-low py-2.5 pl-10 pr-4 font-body-sm text-body-sm text-on-surface outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={enviando || !idGrupo}
              className="flex items-center justify-center gap-2 self-end rounded-lg bg-primary-container px-5 py-2.5 font-label-md text-label-md text-on-primary shadow-[0_4px_14px_rgba(255,140,66,0.35)] transition-all hover:bg-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 lg:self-center"
            >
              <Icon name="group_add" size={20} />
              <span>{enviando ? "Adicionando..." : "Adicionar membro"}</span>
            </button>
          </form>
          <p className="px-1 font-label-sm text-label-sm text-on-surface-variant">
            Somente o dono pode adicionar membros. A pessoa precisa ter cadastro.
          </p>
        </div>

        <div className="flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="flex flex-col items-stretch justify-between gap-4 bg-surface-container-low/50 p-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Integrantes Registrados
              </h2>
              <span className="rounded-full bg-surface-container px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-on-surface">
                {membros.length}
              </span>
            </div>
            <div className="relative flex-1 sm:w-72 sm:flex-none">
              <Icon name="search" size={20} className="pointer-events-none absolute left-3 top-2.5 text-outline" />
              <label htmlFor="membro-busca" className="sr-only">
                Buscar integrante
              </label>
              <input
                id="membro-busca"
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar integrante por nome ou função..."
                className="w-full rounded-lg bg-surface-container-lowest py-2 pl-10 pr-4 font-body-sm text-body-sm text-on-surface shadow-sm outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {carregando ? (
            <p className="flex items-center gap-2 p-6 font-body-sm text-body-sm text-on-surface-variant lg:px-8">
              <Icon name="progress_activity" size={20} className="animate-spin text-primary" />
              Carregando membros...
            </p>
          ) : membros.length === 0 ? (
            <p className="p-6 font-body-sm text-body-sm text-on-surface-variant lg:px-8">
              Nenhum membro encontrado ou você não tem acesso a este grupo.
            </p>
          ) : membrosVisiveis.length === 0 ? (
            <p className="p-6 font-body-sm text-body-sm text-on-surface-variant lg:px-8">
              Nenhum integrante corresponde à busca.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-surface-container-low">
              {membrosVisiveis.map((membro) => {
                const dono = membro.funcao === "dono";
                const menuAberto = menu === membro.idUser;
                return (
                  <li
                    key={membro.idUser}
                    className="flex flex-col items-start justify-between gap-4 p-5 transition-colors hover:bg-surface-container-low/30 md:flex-row md:items-center lg:px-8"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative shrink-0">
                        {membro.user.image ? (
                          <img
                            src={membro.user.image}
                            alt=""
                            className={`h-12 w-12 rounded-full object-cover shadow-sm ${dono ? "ring-2 ring-primary-container" : ""}`}
                          />
                        ) : (
                          <span
                            className={`flex h-12 w-12 items-center justify-center rounded-full font-headline-sm text-headline-sm font-bold shadow-sm ${dono ? "bg-primary-fixed text-on-primary-fixed-variant ring-2 ring-primary-container" : "bg-secondary-container text-on-secondary"}`}
                          >
                            {iniciais(membro.user.name)}
                          </span>
                        )}
                        {dono && (
                          <span
                            className="absolute -bottom-1 -right-1 rounded-full bg-primary p-0.5 text-on-primary"
                            title="Administrador"
                          >
                            <Icon name="shield_person" size={14} className="block" />
                          </span>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-label-lg text-label-lg font-bold text-on-surface">
                            {membro.user.name}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold ${dono ? "bg-primary-fixed text-on-primary-fixed-variant" : "bg-surface-container text-on-surface-variant"}`}
                          >
                            {dono ? "Administrador" : "Membro"}
                          </span>
                        </div>
                        <div className="mt-0.5 flex min-w-0 items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[#10B981]" />
                          <span className="font-semibold text-[#047857]">Ativo</span>
                          <span>•</span>
                          <span className="truncate">ID: {membro.idUser}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="relative self-end md:self-auto"
                      ref={menuAberto ? menuRef : undefined}
                    >
                      <button
                        type="button"
                        aria-label={`Ações para ${membro.user.name}`}
                        aria-haspopup="menu"
                        aria-expanded={menuAberto}
                        onClick={() => setMenu(menuAberto ? null : membro.idUser)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                      >
                        <Icon name="more_vert" size={20} />
                      </button>
                      {menuAberto && (
                        <div
                          role="menu"
                          className="absolute right-0 top-10 z-30 flex w-56 flex-col gap-0.5 rounded-xl bg-surface-container-lowest p-1.5 shadow-xl"
                        >
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setMenu(null);
                              void alternarFuncao(membro);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-label-sm text-label-sm text-on-surface hover:bg-surface-container"
                          >
                            <Icon name="admin_panel_settings" size={16} className="text-primary" />
                            <span>{dono ? "Tornar membro" : "Tornar Administrador"}</span>
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setMenu(null);
                              void removerMembro(membro);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-label-sm text-label-sm text-error hover:bg-error-container/30"
                          >
                            <Icon name="person_remove" size={16} />
                            <span>Remover do Grupo / sair</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-surface-container-low p-4 text-on-surface-variant lg:p-5">
          <Icon name="info" size={22} className="mt-0.5 text-primary" />
          <div className="flex flex-col gap-0.5">
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              Nota de Segurança e Governança
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Apenas o dono do grupo pode adicionar integrantes e alterar
              permissões. Ao remover o seu próprio usuário, você sai do grupo.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function iniciais(nome: string) {
  return (
    nome
      .split(" ")
      .filter(Boolean)
      .map((parte) => parte[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}
