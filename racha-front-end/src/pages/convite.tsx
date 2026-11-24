import { Link, useParams } from "react-router-dom";
import AppShell from "../components/app-shell";
import Icon from "../components/icon";

export default function Convite() {
  const { token } = useParams();

  return (
    <AppShell title="Convite de grupo" bare>
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-space-md px-gutter-mobile py-space-xl text-center sm:px-gutter">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-primary shadow-sm">
          <Icon name="mail" size={30} />
        </div>
        <h1 className="font-headline-md text-headline-md text-on-surface">
          Convite por link indisponível
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {token
            ? `O código "${token}" não pode ser resgatado por link público. Peça ao administrador do grupo para adicionar você pelo seu e-mail cadastrado.`
            : "Peça ao administrador do grupo para adicionar você diretamente pelo seu e-mail cadastrado."}
        </p>
        <Link
          to="/meus-grupos"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-container px-6 py-3 font-label-lg text-label-lg text-on-primary shadow-md transition-all hover:bg-primary"
        >
          <span>Ir para Meus Grupos</span>
          <Icon name="arrow_forward" size={20} />
        </Link>
      </div>
    </AppShell>
  );
}
