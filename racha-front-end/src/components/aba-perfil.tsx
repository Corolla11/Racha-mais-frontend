import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  KeyRound,
  Bell,
  Settings,
  ShieldCheck,
  CircleHelp,
  LogOut,
} from "lucide-react";
import { useAuth } from "../auth/auth-context";

function Aba() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [erroLogout, setErroLogout] = useState("");
  const [saindo, setSaindo] = useState(false);

  async function encerrarSessao() {
    setErroLogout("");
    setSaindo(true);
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch {
      setErroLogout("Não foi possível encerrar a sessão. Tente novamente.");
    } finally {
      setSaindo(false);
    }
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-70 overflow-hidden rounded-xl bg-white shadow-lg">

      {/* Informações do usuário */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {user?.image ? (
              <img
                src={user.image}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
                {user?.name.slice(0, 1).toUpperCase() ?? "?"}
              </span>
            )}

            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#111827]">
              {user?.name ?? "Usuário"}
            </p>

            <p className="text-xs text-gray-500">
              {user?.email ?? ""}
            </p>
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <span className="text-[10px] font-medium text-green-600">
            AUTENTICADO
          </span>
        </div>
      </div>

      {/* Chave Pix */}
      <div className="border-t border-gray-100 px-3 py-3">
        <div className="rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2">
            <KeyRound size={14} className="text-[#1D4ED8]" />

            <span className="text-[9px] font-medium uppercase text-gray-500">
              Chave Pix principal
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-gray-700">
              mariana.silva@pix.me
            </span>

            <span className="rounded bg-blue-50 px-2 py-1 text-[9px] font-medium text-blue-600">
              Verificada
            </span>
          </div>
        </div>

        {/* Informações rápidas */}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-gray-100 p-2 text-center">
            <p className="text-[9px] text-gray-500">
              Grupos Ativos
            </p>

            <p className="text-sm font-semibold text-[#111827]">
              4
            </p>
          </div>

          <div className="rounded-lg border border-gray-100 p-2 text-center">
            <p className="text-[9px] text-gray-500">
              Contabilidade
            </p>

            <p className="text-sm font-semibold text-[#111827]">
              98%
            </p>
          </div>
        </div>
      </div>

      {/* Opções */}
      <div className="border-t border-gray-100 py-1">

        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs text-gray-700 transition hover:bg-gray-50"
        >
          <User size={15} />
          Meu Perfil
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs text-gray-700 transition hover:bg-gray-50"
        >
          <KeyRound size={15} />
          Chaves Pix & Recebimentos
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs text-gray-700 transition hover:bg-gray-50"
        >
          <Bell size={15} />
          Notificações & Alertas

          <span className="ml-auto rounded-full bg-[#F5A623] px-2 py-0.5 text-[9px] font-medium text-white">
            2 novas
          </span>
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs text-gray-700 transition hover:bg-gray-50"
        >
          <Settings size={15} />
          Configurações da Conta
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs text-gray-700 transition hover:bg-gray-50"
        >
          <ShieldCheck size={15} />
          Segurança & Privacidade
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs text-gray-700 transition hover:bg-gray-50"
        >
          <CircleHelp size={15} />
          Ajuda & Suporte
        </button>
      </div>

      {/* Sair */}
      <div className="border-t border-gray-100">
        {erroLogout && (
          <p role="alert" className="px-4 py-2 text-xs text-red-700">
            {erroLogout}
          </p>
        )}
        <button
          type="button"
          onClick={() => void encerrarSessao()}
          disabled={saindo}
          className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut size={15} />
          {saindo ? "Encerrando..." : "Encerrar Sessão"}
        </button>
      </div>

    </div>
  );
}

export default Aba;