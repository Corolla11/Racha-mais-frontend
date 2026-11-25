import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import AppShell from "../components/app-shell";
import Icon from "../components/icon";
import { ApiError, apiRequest } from "../lib/api";
import { ENDPOINTS } from "../lib/endpoints";

type DetalhesConvite = {
  idGrupo: string;
  nomeGrupo: string;
  nomeConvidante: string;
  emailMascarado: string;
  expiresAt: string;
};

export default function Convite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [convite, setConvite] = useState<DetalhesConvite | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(Boolean(token));
  const [aceitando, setAceitando] = useState(false);

  useEffect(() => {
    if (!token) return;
    let ativo = true;
    apiRequest<DetalhesConvite>(ENDPOINTS.convites.porToken(token))
      .then((dados) => {
        if (ativo) {
          setConvite(dados);
          setErro("");
        }
      })
      .catch((err) => {
        if (ativo) {
          setConvite(null);
          setErro(
            err instanceof ApiError
              ? err.message
              : "Não foi possível carregar este convite.",
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [token]);

  async function aceitarConvite() {
    if (!token) return;
    setErro("");
    setAceitando(true);
    try {
      const res = await apiRequest<{ idGrupo: string; nomeGrupo: string }>(
        ENDPOINTS.convites.aceitar(token),
        { method: "POST" },
      );
      navigate(`/grupo/${encodeURIComponent(res.idGrupo)}`, {
        state: { nomeGrupo: res.nomeGrupo },
        replace: true,
      });
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível aceitar o convite.",
      );
    } finally {
      setAceitando(false);
    }
  }

  return (
    <AppShell title="Convite de grupo" bare>
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-space-md px-gutter-mobile py-space-xl text-center sm:px-gutter">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-primary shadow-sm">
          <Icon name="mail" size={30} />
        </div>

        {!token ? (
          <>
            <h1 className="font-headline-md text-headline-md text-on-surface">
              Link de convite inválido
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Peça ao administrador do grupo para enviar um novo convite para o seu e-mail.
            </p>
          </>
        ) : carregando || authLoading ? (
          <>
            <h1 className="font-headline-md text-headline-md text-on-surface">
              Verificando convite...
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Aguarde um instante enquanto validamos o link.
            </p>
          </>
        ) : erro && !convite ? (
          <>
            <h1 className="font-headline-md text-headline-md text-on-surface">
              Convite indisponível
            </h1>
            <p role="alert" className="font-body-md text-body-md text-error">
              {erro}
            </p>
            <Link
              to={user ? "/meus-grupos" : "/login"}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary-container px-6 py-3 font-label-lg text-label-lg text-on-primary shadow-md transition-all hover:bg-primary"
            >
              <span>{user ? "Ir para Meus Grupos" : "Entrar na minha conta"}</span>
              <Icon name="arrow_forward" size={20} />
            </Link>
          </>
        ) : convite ? (
          <>
            <span className="rounded-full bg-primary-fixed px-3 py-1 font-label-sm text-label-sm font-semibold text-on-primary-fixed">
              Convite para grupo
            </span>
            <h1 className="font-headline-md text-headline-md text-on-surface">
              {convite.nomeGrupo}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              <strong className="text-on-surface">{convite.nomeConvidante}</strong>{" "}
              convidou o e-mail{" "}
              <strong className="text-on-surface">{convite.emailMascarado}</strong>{" "}
              para participar deste grupo no Racha+.
            </p>

            {erro && (
              <p role="alert" className="flex items-center gap-1.5 rounded-xl bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container">
                <Icon name="error" size={18} />
                <span>{erro}</span>
              </p>
            )}

            {user ? (
              <button
                type="button"
                disabled={aceitando}
                onClick={() => void aceitarConvite()}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary-container px-6 py-3 font-label-lg text-label-lg text-on-primary shadow-md transition-all hover:bg-primary disabled:opacity-60"
              >
                <Icon name="check_circle" size={20} />
                <span>{aceitando ? "Entrando no grupo..." : "Aceitar convite"}</span>
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-space-sm pt-space-xs">
                <Link
                  to="/login"
                  state={{ from: { pathname: `/convite/${token}` } }}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary-container px-6 py-3 font-label-lg text-label-lg text-on-primary shadow-md transition-all hover:bg-primary"
                >
                  <span>Entrar para aceitar</span>
                  <Icon name="arrow_forward" size={20} />
                </Link>
                <Link
                  to="/cadastro"
                  state={{ from: { pathname: `/convite/${token}` } }}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-surface-container-low px-6 py-3 font-label-md text-label-md text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <span>Criar conta</span>
                </Link>
              </div>
            )}
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
