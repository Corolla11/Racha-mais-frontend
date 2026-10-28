import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError, apiRequest } from "../lib/api";

type StatusParte =
  | "AGENDADA"
  | "EM_ANDAMENTO"
  | "FINALIZADA"
  | "ATRASADA"
  | "CANCELADA";

type Parte = {
  id: string;
  idUser: string;
  idTarefa: string;
  descricao: string;
  valor: string;
  status: StatusParte;
  user: { id: string; name: string; image: string | null };
};

type AtualizacaoParte = {
  descricao?: string;
  valor?: string;
  status?: StatusParte;
};

const statusDisponiveis: StatusParte[] = [
  "AGENDADA",
  "EM_ANDAMENTO",
  "FINALIZADA",
  "ATRASADA",
  "CANCELADA",
];

export default function Partes() {
  const { idTarefa } = useParams<{ idTarefa: string }>();
  const [partes, setPartes] = useState<Parte[]>([]);
  const [idUser, setIdUser] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (!idTarefa) return;
    let ativo = true;

    apiRequest<Parte[]>(`/tarefas/${encodeURIComponent(idTarefa)}/partes`)
      .then((resultado) => {
        if (ativo) setPartes(resultado);
      })
      .catch((error: unknown) => {
        if (!ativo) return;
        setErro(
          error instanceof ApiError
            ? error.message
            : "Não foi possível carregar as partes.",
        );
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [idTarefa]);

  async function atualizarLista() {
    if (!idTarefa) return;
    setPartes(
      await apiRequest<Parte[]>(
        `/tarefas/${encodeURIComponent(idTarefa)}/partes`,
      ),
    );
  }

  async function criarParte(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!idTarefa) return;
    setErro("");
    setMensagem("");
    setEnviando(true);
    try {
      await apiRequest<Parte>(
        `/tarefas/${encodeURIComponent(idTarefa)}/partes`,
        {
          method: "POST",
          body: {
            idUser: idUser.trim(),
            descricao: descricao.trim(),
            valor,
          },
        },
      );
      setIdUser("");
      setDescricao("");
      setValor("");
      setMensagem("Parte criada.");
      await atualizarLista();
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível criar a parte.",
      );
    } finally {
      setEnviando(false);
    }
  }

  async function atualizarParte(id: string, dados: AtualizacaoParte) {
    if (!idTarefa) return;
    setErro("");
    setMensagem("");
    try {
      await apiRequest<Parte>(`/partes/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: dados,
      });
      setMensagem("Parte atualizada.");
      await atualizarLista();
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível atualizar a parte.",
      );
    }
  }

  async function removerParte(id: string) {
    setErro("");
    setMensagem("");
    try {
      await apiRequest<void>(`/partes/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setMensagem("Parte removida.");
      await atualizarLista();
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível remover a parte.",
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
          Voltar
        </Link>
        <h1 className="mt-5 text-2xl font-bold">Rateio da tarefa</h1>
        <p className="mt-1 break-all text-sm text-slate-600">
          Tarefa: {idTarefa ?? "não informada"}
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

        <form onSubmit={criarParte} className="mt-7 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="parte-usuario" className="mb-1 block text-sm font-medium">
              ID do membro responsável
            </label>
            <input
              id="parte-usuario"
              required
              value={idUser}
              onChange={(event) => setIdUser(event.target.value)}
              placeholder="ID de um membro do grupo"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label htmlFor="parte-valor" className="mb-1 block text-sm font-medium">
              Valor (R$)
            </label>
            <input
              id="parte-valor"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={valor}
              onChange={(event) => setValor(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label htmlFor="parte-descricao" className="mb-1 block text-sm font-medium">
              Descrição
            </label>
            <input
              id="parte-descricao"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Ex.: cota da hospedagem"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>
          <button
            type="submit"
            disabled={enviando || !idTarefa}
            className="rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
          >
            {enviando ? "Salvando..." : "Adicionar parte"}
          </button>
          <p className="text-xs text-slate-500 sm:col-span-2">
            A pessoa precisa ser membro do grupo. O backend valida permissões e
            impede que o rateio ultrapasse o total da tarefa.
          </p>
        </form>

        <h2 className="mt-9 text-lg font-semibold">Partes cadastradas</h2>
        {carregando ? (
          <p className="mt-4 text-sm text-slate-600">Carregando partes...</p>
        ) : partes.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">Ainda não há partes nesta tarefa.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {partes.map((parte) => (
              <li key={parte.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{parte.user.name}</p>
                    <p className="text-sm text-slate-600">
                      {parte.descricao || "Sem descrição"} · R${" "}
                      {Number(parte.valor).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="mt-1 break-all text-xs text-slate-500">
                      ID da parte: {parte.id}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removerParte(parte.id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Remover
                  </button>
                </div>
                <label
                  htmlFor={`status-${parte.id}`}
                  className="mt-4 block text-xs font-medium text-slate-600"
                >
                  Status
                </label>
                <select
                  id={`status-${parte.id}`}
                  value={parte.status}
                  onChange={(event) =>
                    void atualizarParte(parte.id, {
                      status: event.target.value as StatusParte,
                    })
                  }
                  className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {statusDisponiveis.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
