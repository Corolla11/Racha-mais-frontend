import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Circle,
  CircleCheckBig,
  Eye,
  EyeOff,
  Lock,
  LockKeyhole,
  RotateCcw,
} from "lucide-react";
import RecuperacaoLayout, { BannerErro } from "../components/recuperacao-layout";
import { ApiError, apiRequest } from "../lib/api";
import { CR } from "../lib/recuperacao-tokens";

const REQUISITOS = [
  { texto: "Mínimo 8 caracteres", teste: (s: string) => s.length >= 8 },
  { texto: "1 letra maiúscula", teste: (s: string) => /[A-Z]/.test(s) },
  { texto: "1 número", teste: (s: string) => /\d/.test(s) },
  { texto: "1 caractere especial", teste: (s: string) => /[^A-Za-z0-9]/.test(s) },
];

function nivelForca(senha: string) {
  const pontos = REQUISITOS.filter((r) => r.teste(senha)).length;
  if (pontos <= 1) return { texto: "Fraca", cor: CR.secondary, barras: 1 };
  if (pontos <= 3) return { texto: "Média", cor: CR.tertiaryContainer, barras: 2 };
  return { texto: "Excelente", cor: "#10b981", barras: 3 };
}

export default function RedefinirSenha() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const tokenError = params.get("error");

  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  const forca = nivelForca(senha);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (senha !== confirmacao) {
      setErro("As senhas precisam ser iguais.");
      return;
    }
    if (!token) {
      setErro("O link de recuperação está inválido ou expirou. Solicite outro e-mail.");
      return;
    }

    setErro("");
    setSalvando(true);
    try {
      await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: { newPassword: senha, token },
      });
      setConcluido(true);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível atualizar a senha agora.",
      );
    } finally {
      setSalvando(false);
    }
  }

  // Estado de sucesso
  if (concluido) {
    return (
      <RecuperacaoLayout etapa={3}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
            <CircleCheckBig className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold">Senha atualizada!</h2>
          <p className="text-sm" style={{ color: CR.onSurfaceVariant }}>
            Tudo pronto! Agora você já pode entrar e continuar organizando seus rachas.
          </p>
          <Link
            to="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff8c42] px-6 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#9b4500] hover:shadow-lg"
          >
            Ir para o Login
            <ArrowRight className="h-[18px] w-[18px]" />
          </Link>
        </div>
      </RecuperacaoLayout>
    );
  }

  // Link inválido ou expirado
  if (tokenError || !token) {
    return (
      <RecuperacaoLayout etapa={3}>
        <div className="flex flex-col gap-6">
          <BannerErro
            titulo="Link inválido ou expirado"
            descricao="O link de recuperação acessado não é válido ou já expirou. Solicite um novo link para continuar."
          />
          <Link
            to="/esqueceu-senha"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff8c42] px-6 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#9b4500] hover:shadow-lg active:scale-[0.98]"
          >
            Solicitar novo link
            <ArrowRight className="h-[18px] w-[18px]" />
          </Link>
          <div className="flex items-center justify-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-[#121c2a]"
              style={{ color: CR.onSurfaceVariant }}
            >
              Voltar para o Login
            </Link>
          </div>
        </div>
      </RecuperacaoLayout>
    );
  }

  return (
    <RecuperacaoLayout etapa={3}>
      <div className="flex flex-col gap-6">
        {erro && (
          <BannerErro
            titulo="Não foi possível atualizar a senha"
            descricao={erro}
            onFechar={() => setErro("")}
          />
        )}

        <div className="space-y-2">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <BadgeCheck className="h-3.5 w-3.5" />
            Link validado
          </span>
          <h2 className="text-2xl font-bold tracking-tight">Crie sua nova senha</h2>
          <p className="text-sm" style={{ color: CR.onSurfaceVariant }}>
            Escolha uma senha forte que você não use em outros serviços para
            garantir a integridade dos seus pagamentos.
          </p>
        </div>

        <form className="space-y-4" onSubmit={salvar}>
          {/* Nova senha */}
          <div className="space-y-1.5">
            <label htmlFor="nova-senha" className="block text-xs font-bold">
              Nova senha
            </label>
            <CampoSenha
              id="nova-senha"
              icone={Lock}
              valor={senha}
              onChange={setSenha}
              visivel={mostrarSenha}
              onAlternar={() => setMostrarSenha((v) => !v)}
              placeholder="Digite sua nova senha"
            />

            <div className="mt-2 space-y-2.5 rounded-xl p-3" style={{ backgroundColor: CR.surfaceLow }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold">Força da senha:</span>
                <span className="text-[11px] font-bold" style={{ color: senha ? forca.cor : CR.onSurfaceVariant }}>
                  {senha ? forca.texto : "—"}
                </span>
              </div>
              <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full">
                {[1, 2, 3].map((barra) => (
                  <div
                    key={barra}
                    className="h-full w-1/3 transition-all duration-300"
                    style={{
                      backgroundColor: senha && barra <= forca.barras ? forca.cor : CR.surfaceHighest,
                    }}
                  />
                ))}
              </div>
              <ul className="grid grid-cols-2 gap-1.5 pt-1">
                {REQUISITOS.map((requisito) => {
                  const ok = requisito.teste(senha);
                  return (
                    <li
                      key={requisito.texto}
                      className={`flex items-center gap-1 text-[11px] ${ok ? "font-medium text-emerald-700" : ""}`}
                      style={ok ? undefined : { color: CR.onSurfaceVariant }}
                    >
                      {ok ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Circle className="h-3 w-3 opacity-40" />
                      )}
                      {requisito.texto}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Confirmação */}
          <div className="space-y-1.5">
            <label htmlFor="confirmar-senha" className="block text-xs font-bold">
              Confirmar nova senha
            </label>
            <CampoSenha
              id="confirmar-senha"
              icone={LockKeyhole}
              valor={confirmacao}
              onChange={(valor) => {
                setConfirmacao(valor);
                if (erro) setErro("");
              }}
              visivel={mostrarConfirmacao}
              onAlternar={() => setMostrarConfirmacao((v) => !v)}
              placeholder="Repita sua nova senha"
              invalido={!!erro}
            />
          </div>

          <button
            type="submit"
            disabled={salvando}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#ff8c42] px-6 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#9b4500] hover:shadow-lg active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
          >
            {salvando ? "Salvando..." : "Salvar nova senha"}
            <CircleCheckBig className="h-[18px] w-[18px]" />
          </button>
        </form>

        <div className="flex items-center justify-center pt-2">
          <Link
            to="/esqueceu-senha"
            className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-[#121c2a]"
            style={{ color: CR.onSurfaceVariant }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reiniciar processo de solicitação
          </Link>
        </div>
      </div>
    </RecuperacaoLayout>
  );
}

function CampoSenha({
  id,
  icone: Icone,
  valor,
  onChange,
  visivel,
  onAlternar,
  placeholder,
  invalido = false,
}: {
  id: string;
  icone: typeof Lock;
  valor: string;
  onChange: (valor: string) => void;
  visivel: boolean;
  onAlternar: () => void;
  placeholder: string;
  invalido?: boolean;
}) {
  return (
    <div className="relative flex items-center">
      <Icone
        className="pointer-events-none absolute left-3.5 h-5 w-5"
        style={{ color: `${CR.onSurfaceVariant}99` }}
      />
      <input
        id={id}
        type={visivel ? "text" : "password"}
        required
        minLength={8}
        autoComplete="new-password"
        value={valor}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={invalido}
        className={`w-full rounded-xl bg-[#eff4ff] py-3 pl-11 pr-11 text-sm outline-none transition-all duration-200 placeholder:text-[#56433866] focus:bg-white focus:shadow-md focus:ring-2 ${
          invalido ? "ring-2 ring-[#ba1a1a] focus:ring-[#ba1a1a]" : "focus:ring-[#ff8c42]"
        }`}
      />
      <button
        type="button"
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        onClick={onAlternar}
        className="absolute right-3.5 cursor-pointer hover:text-[#121c2a]"
        style={{ color: `${CR.onSurfaceVariant}99` }}
      >
        {visivel ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
      </button>
    </div>
  );
}