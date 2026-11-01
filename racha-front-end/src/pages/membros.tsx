import { useEffect, useState, type FormEvent } from "react";
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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <Link
          to="/meus-grupos"
          className="text-sm font-semibold text-orange-700 hover:underline"
        >
          Voltar aos grupos
        </Link>
        <h1 className="mt-5 text-ui-page-title font-bold">Membros do grupo</h1>
        <p className="mt-1 break-all text-sm text-slate-600">
          Grupo: {typeof nomeGrupo === "string" ? nomeGrupo : idGrupo ?? "não informado"}
        </p>

        {erro && (
          <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {erro}
          </p>
        )}
        {mensagem && (
          <p role="status" className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-800">
            {mensagem}
          </p>
        )}

        <form onSubmit={adicionarMembro} className="mt-7 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="membro-email">
            E-mail do usuário cadastrado
          </label>
          <input
            id="membro-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-mail de um usuário já cadastrado"
            className="ui-control min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={enviando || !idGrupo}
            className="ui-button ui-button--md rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? "Adicionando..." : "Adicionar membro"}
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          Somente o dono pode adicionar membros. A pessoa precisa ter cadastro.
        </p>

        <h2 className="mt-9 text-ui-section-title font-semibold">Participantes</h2>
        {carregando ? (
          <p className="mt-4 text-sm text-slate-600">Carregando membros...</p>
        ) : membros.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            Nenhum membro encontrado ou você não tem acesso a este grupo.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200">
            {membros.map((membro) => (
              <li
                key={membro.idUser}
                className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {membro.user.image ? (
                    <img
                      src={membro.user.image}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-800">
                      {membro.user.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium">{membro.user.name}</p>
                    <p className="text-xs text-slate-500">ID: {membro.idUser}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                    {membro.funcao}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void alternarFuncao(membro)}
                    className="ui-button ui-button--md rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                  >
                    {membro.funcao === "dono" ? "Tornar membro" : "Promover a dono"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void removerMembro(membro)}
                    className="ui-button ui-button--md rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Remover / sair
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
