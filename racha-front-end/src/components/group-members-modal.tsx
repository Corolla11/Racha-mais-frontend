import { useState, type Dispatch, type SetStateAction } from "react";
import { ApiError, apiRequest } from "../lib/api";
import { ENDPOINTS } from "../lib/endpoints";
import { money } from "../lib/finance";
import Icon from "./icon";

export type Member = {
  id: string;
  nome: string;
  admin: boolean;
  active: boolean;
  email?: string;
};

export function GroupMembersModal({
  idGrupo,
  currentUserId,
  memberMode,
  closed,
  members,
  setMembers,
  entries,
  onLog,
  onMessage,
}: {
  idGrupo?: string;
  currentUserId: string;
  memberMode: boolean;
  closed: boolean;
  members: Member[];
  setMembers: Dispatch<SetStateAction<Member[]>>;
  entries: { person: { id: string }; amount: number; payment: { status: string } }[];
  onLog: (text: string) => void;
  onMessage: (msg: string) => void;
}) {
  const [memberTab, setMemberTab] = useState("members");
  const [invite, setInvite] = useState("");
  const [invites, setInvites] = useState<string[]>([]);
  const [remove, setRemove] = useState<Member | null>(null);
  const activeMembers = members.filter((member) => member.active);

  async function alterarPermissao(member: Member, isAdmin: boolean) {
    if (idGrupo) {
      try {
        await apiRequest(ENDPOINTS.grupos.membroById(idGrupo, member.id), {
          method: "PATCH",
          body: { funcao: isAdmin ? "dono" : "membro" },
        });
      } catch (err) {
        onMessage(err instanceof ApiError ? err.message : "Não foi possível alterar a permissão.");
        return;
      }
    }
    setMembers((old) =>
      old.map((item) => (item.id === member.id ? { ...item, admin: isAdmin } : item)),
    );
    onLog(`Permissão atualizada · ${member.nome}`);
  }

  async function enviarConvite(emailRaw: string) {
    const emailLimpo = emailRaw.trim().toLowerCase();
    if (!emailLimpo) return;
    if (invites.includes(emailLimpo)) {
      onMessage("Já existe um convite pendente para este e-mail.");
      return;
    }
    if (idGrupo) {
      try {
        const novo = await apiRequest<{
          idUser: string;
          funcao: "dono" | "membro";
          user?: { name?: string };
        }>(ENDPOINTS.grupos.membros(idGrupo), {
          method: "POST",
          body: { email: emailLimpo },
        });
        setMembers((old) => [
          ...old,
          {
            id: novo.idUser,
            nome: novo.user?.name || emailLimpo.split("@")[0],
            admin: novo.funcao === "dono",
            active: true,
            email: emailLimpo,
          },
        ]);
        onLog(`Membro adicionado · ${emailLimpo}`);
        setInvite("");
        onMessage("Participante adicionado ao grupo.");
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          try {
            await apiRequest(ENDPOINTS.grupos.convites(idGrupo), {
              method: "POST",
              body: { email: emailLimpo },
            });
            setInvites((old) => [...old, emailLimpo]);
            onLog(`Convite enviado por e-mail · ${emailLimpo}`);
            setInvite("");
            onMessage("Convite enviado por e-mail.");
          } catch (inviteErr) {
            onMessage(
              inviteErr instanceof ApiError
                ? inviteErr.message
                : "Não foi possível enviar o convite.",
            );
          }
          return;
        }
        onMessage(
          err instanceof ApiError ? err.message : "Não foi possível adicionar o participante.",
        );
      }
      return;
    }
    setInvites((old) => [...old, emailLimpo]);
    onLog(`Convite preparado · ${emailLimpo}`);
    setInvite("");
    onMessage("Convite preparado na demonstração.");
  }

  async function confirmarRemocao() {
    if (!remove) return;
    if (idGrupo) {
      try {
        await apiRequest(ENDPOINTS.grupos.membroById(idGrupo, remove.id), {
          method: "DELETE",
        });
      } catch (err) {
        onMessage(
          err instanceof ApiError ? err.message : "Não foi possível remover o participante.",
        );
        setRemove(null);
        return;
      }
    }
    setMembers((old) =>
      old.map((member) => (member.id === remove.id ? { ...member, active: false } : member)),
    );
    onLog(`Participante removido · ${remove.nome}`);
    setRemove(null);
  }

  return (
    <>
      <div className="flex w-fit items-center gap-1 rounded-xl bg-surface-container-low p-1" role="group" aria-label="Seções de membros">
        <button
          type="button"
          aria-pressed={memberTab === "members"}
          onClick={() => setMemberTab("members")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-space-md py-1.5 font-label-md text-label-md transition-all ${memberTab === "members" ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
        >
          <Icon name="group" size={18} />
          Membros Atuais
          <span className="rounded-full bg-surface-container px-2 py-0.5 font-label-sm text-label-sm">
            {activeMembers.length}
          </span>
        </button>
        {!memberMode && !closed && (
          <button
            type="button"
            aria-pressed={memberTab === "invite"}
            onClick={() => setMemberTab("invite")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-space-md py-1.5 font-label-md text-label-md transition-all ${memberTab === "invite" ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <Icon name="person_add" size={18} />
            Convidar Novos
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-sm font-label-sm text-label-sm text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <Icon name="shield_person" size={16} className="text-primary" />
          Apenas administradores podem gerenciar integrantes.
        </span>
        <span className="font-semibold text-on-surface">{activeMembers.length}/15 Membros</span>
      </div>

      {memberTab === "members" ? (
        <div className="flex flex-col divide-y divide-surface-container-low overflow-hidden rounded-xl bg-surface-container-lowest">
          {members.map((member) => (
            <div
              key={member.id}
              className={`flex flex-col items-start justify-between gap-space-sm py-space-md sm:flex-row sm:items-center ${!member.active ? "opacity-60" : ""}`}
            >
              <div className="flex min-w-0 items-center gap-space-md">
                <div className="relative shrink-0">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-full font-label-lg text-label-lg font-bold shadow-sm ${member.admin ? "bg-primary-fixed text-on-primary-fixed-variant ring-2 ring-primary-container" : "bg-secondary-container text-on-secondary"}`}
                  >
                    {member.nome
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  {member.admin && (
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-primary p-0.5 text-on-primary" title="Administrador">
                      <Icon name="shield_person" size={14} className="block" />
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-label-lg text-label-lg font-bold text-on-surface">{member.nome}</span>
                    {member.id === currentUserId && (
                      <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">
                        Você
                      </span>
                    )}
                    {!member.active && (
                      <span className="rounded-full bg-error-container px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-error-container">
                        Saiu do grupo
                      </span>
                    )}
                  </div>
                  <span className="truncate font-body-sm text-body-sm text-on-surface-variant">
                    {member.email || (member.admin ? "Administrador do grupo" : "Participante")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-space-sm self-end sm:self-auto">
                {member.id === currentUserId ? (
                  <>
                    <span className="rounded-full bg-primary-fixed px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-on-primary-fixed-variant">
                      {member.admin ? "Admin · Criador" : "Membro"}
                    </span>
                    <Icon name="lock" size={18} className="text-outline" title="Permissão fixa" />
                  </>
                ) : !closed && !memberMode && member.active ? (
                  <>
                    <div className="relative flex items-center">
                      <select
                        aria-label={`Permissão de ${member.nome}`}
                        value={member.admin ? "admin" : "member"}
                        onChange={(event) => void alterarPermissao(member, event.target.value === "admin")}
                        className="appearance-none rounded-lg bg-surface-container-low py-2 pl-3 pr-9 font-label-sm text-label-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                      >
                        <option value="member">Membro</option>
                        <option value="admin">Administrador</option>
                      </select>
                      <Icon name="expand_more" size={18} className="pointer-events-none absolute right-2 text-on-surface-variant" />
                    </div>
                    <button
                      type="button"
                      aria-label={`Remover ${member.nome}`}
                      onClick={() => setRemove(member)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-error transition-colors hover:bg-error-container/30"
                    >
                      <Icon name="person_remove" size={20} />
                    </button>
                  </>
                ) : (
                  <span className="rounded-full bg-surface-container px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">
                    {member.admin ? "Administrador" : "Membro"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <form
          className="flex flex-col items-center gap-space-md rounded-xl bg-surface-container-low p-space-lg text-center"
          onSubmit={(event) => {
            event.preventDefault();
            void enviarConvite(invite);
          }}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
            <Icon name="mail" size={24} />
          </span>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Chame seus amigos para o racha</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Compartilhe as tarefas e acompanhe cada acerto em um só lugar.
            </p>
          </div>
          <div className="flex w-full flex-col gap-1.5 text-left">
            <label htmlFor="invite-email" className="font-label-md text-label-md text-on-surface">
              E-mail do participante
            </label>
            <div className="relative flex items-center">
              <Icon name="alternate_email" size={18} className="pointer-events-none absolute left-3 text-outline" />
              <input
                id="invite-email"
                type="email"
                required
                placeholder="amigo@exemplo.com"
                value={invite}
                onChange={(event) => setInvite(event.target.value)}
                className="w-full rounded-lg bg-surface-container-lowest py-2.5 pl-10 pr-4 font-body-md text-body-md text-on-surface shadow-sm outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex w-full flex-col gap-space-sm sm:flex-row sm:justify-center">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-space-xs rounded-lg bg-primary-container px-space-lg py-2.5 font-label-md text-label-md font-bold text-on-primary shadow-[0_8px_20px_-4px_rgba(255,140,66,0.35)] transition-all hover:opacity-95 active:scale-[0.98]"
            >
              <Icon name="person_add" size={18} />
              Preparar convite
            </button>
          </div>
          {invites.length > 0 && (
            <ul className="flex w-full flex-col gap-space-xs text-left">
              {invites.map((email) => (
                <li
                  key={email}
                  className="flex items-center justify-between gap-space-sm rounded-lg bg-surface-container-lowest px-space-md py-space-sm font-body-sm text-body-sm text-on-surface"
                >
                  <span className="truncate">{email}</span>
                  <span className="shrink-0 font-label-sm text-label-sm text-tertiary">aguardando aceite</span>
                </li>
              ))}
            </ul>
          )}
        </form>
      )}

      {remove && (
        <div className="flex flex-col gap-space-sm rounded-xl bg-error-container/30 p-space-md" role="alertdialog" aria-label={`Remover ${remove.nome}`}>
          <div className="flex items-center gap-space-xs text-error">
            <Icon name="warning" size={20} />
            <h3 className="font-label-lg text-label-lg font-bold">Remover {remove.nome}?</h3>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            O acesso será revogado; as obrigações e o histórico financeiro serão preservados.
          </p>
          <p className="font-label-md text-label-md text-on-error-container">
            Pendências:{" "}
            {money(
              entries
                .filter((entry) => entry.person.id === remove.id && entry.payment.status !== "confirmado")
                .reduce((sum, entry) => sum + entry.amount, 0),
            )}
          </p>
          <div className="flex flex-wrap items-center gap-space-sm pt-1">
            <button
              type="button"
              className="rounded-lg bg-surface-container-lowest px-3.5 py-2 font-label-sm text-label-sm text-on-surface shadow-sm transition-colors hover:bg-surface-container"
              onClick={() => setRemove(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-error px-3.5 py-2 font-label-sm text-label-sm text-on-error shadow-sm transition-colors hover:bg-error/90"
              onClick={() => void confirmarRemocao()}
            >
              <Icon name="delete_forever" size={16} />
              Confirmar remoção
            </button>
          </div>
        </div>
      )}
    </>
  );
}
