import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import RecuperacaoLayout, { BannerErro } from "../components/recuperacao-layout";
import Icon from "../components/icon";
import { CR } from "../lib/recuperacao-tokens";

const REQUISITOS = [
  { texto: "Mínimo 8 caracteres", teste: (s: string) => s.length >= 8 },
  { texto: "1 letra maiúscula", teste: (s: string) => /[A-Z]/.test(s) },
  { texto: "1 número", teste: (s: string) => /\d/.test(s) },
  { texto: "1 caractere especial", teste: (s: string) => /[^A-Za-z0-9]/.test(s) },
];

function nivelForca(senha: string) {
  const pontos = REQUISITOS.filter((r) => r.teste(senha)).length;
  if (pontos <= 1) return { texto: "Fraca", corTexto: "text-secondary", barra: "bg-secondary", barras: 1 };
  if (pontos <= 3) return { texto: "Média", corTexto: "text-tertiary-container", barra: "bg-tertiary-container", barras: 2 };
  return { texto: "Excelente", corTexto: "text-emerald-600", barra: "bg-emerald-500", barras: 3 };
}

export default function RedefinirSenha() {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [erro, setErro] = useState(false);
  const [concluido, setConcluido] = useState(false);

  const forca = nivelForca(senha);

  // Prévia: a troca de senha ainda não é enviada ao backend
  function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (senha !== confirmacao) {
      setErro(true);
      return;
    }
    setErro(false);
    setConcluido(true);
  }

  if (concluido) {
    return (
      <RecuperacaoLayout etapa={3}>
        <div className="flex flex-col space-y-6">
          <div className="p-6 rounded-2xl bg-surface-container-low flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
              <Icon name="task_alt" size={30} />
            </div>
            <div className="space-y-1.5">
              <h2 className={CR.titulo}>Senha atualizada!</h2>
              <p className={CR.descricao}>
                Tudo pronto! Agora você já pode entrar e continuar organizando
                seus rachas.
              </p>
            </div>
          </div>
          <p className={CR.aviso}>
            <Icon name="science" size={16} className="shrink-0" />
            Prévia: nenhuma credencial real foi alterada.
          </p>
          <Link to="/login" className={CR.botaoPrimario}>
            <span>Ir para o Login</span>
            <Icon name="arrow_forward" size={18} />
          </Link>
        </div>
      </RecuperacaoLayout>
    );
  }

  return (
    <RecuperacaoLayout etapa={3}>
      <div className="flex flex-col space-y-6">
        {erro && (
          <BannerErro
            titulo="As senhas não coincidem"
            descricao="A confirmação de senha deve ser idêntica à nova senha digitada."
            onFechar={() => setErro(false)}
          />
        )}

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-xs font-bold w-fit">
            <Icon name="verified" size={14} />
            Token Validado com Sucesso
          </span>
          <h2 className={CR.titulo}>Crie sua nova senha</h2>
          <p className={CR.descricao}>
            Escolha uma senha forte que você não use em outros serviços para
            garantir a integridade dos seus pagamentos.
          </p>
        </div>

        <form className="space-y-4" onSubmit={salvar}>
          {/* Nova senha */}
          <div className="space-y-1.5">
            <label htmlFor="nova-senha" className={CR.rotulo}>
              Nova senha
            </label>
            <CampoSenha
              id="nova-senha"
              icone="lock"
              valor={senha}
              onChange={setSenha}
              visivel={mostrarSenha}
              onAlternar={() => setMostrarSenha((v) => !v)}
              placeholder="Digite sua nova senha"
            />

            <div className="p-3 bg-surface-container-low rounded-xl space-y-2.5 mt-2" aria-live="polite">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[11px] font-semibold text-on-surface">Força da senha:</span>
                <span className={`font-label-sm text-[11px] font-bold ${senha ? forca.corTexto : "text-on-surface-variant"}`}>
                  {senha ? forca.texto : "—"}
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3].map((barra) => (
                  <div
                    key={barra}
                    className={`h-full w-1/3 transition-all duration-300 ${
                      senha && barra <= forca.barras ? forca.barra : "bg-surface-container-highest"
                    }`}
                  />
                ))}
              </div>
              <ul className="grid grid-cols-2 gap-1.5 pt-1">
                {REQUISITOS.map((requisito) => {
                  const ok = requisito.teste(senha);
                  return (
                    <li
                      key={requisito.texto}
                      className={`flex items-center gap-1 font-body-sm text-[11px] ${ok ? "text-emerald-700 font-medium" : "text-on-surface-variant"}`}
                    >
                      <Icon
                        name={ok ? "check_circle" : "radio_button_unchecked"}
                        size={12}
                        className={ok ? "text-emerald-600" : "text-on-surface-variant/40"}
                      />
                      {requisito.texto}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Confirmação */}
          <div className="space-y-1.5">
            <label htmlFor="confirmar-senha" className={CR.rotulo}>
              Confirmar nova senha
            </label>
            <CampoSenha
              id="confirmar-senha"
              icone="lock_clock"
              valor={confirmacao}
              onChange={(valor) => {
                setConfirmacao(valor);
                if (erro) setErro(false);
              }}
              visivel={mostrarConfirmacao}
              onAlternar={() => setMostrarConfirmacao((v) => !v)}
              placeholder="Repita sua nova senha"
              invalido={erro}
            />
          </div>

          <button type="submit" className={`${CR.botaoPrimario} mt-2`}>
            <span>Salvar nova senha</span>
            <Icon name="task_alt" size={18} />
          </button>
        </form>

        <div className="pt-2 flex items-center justify-center">
          <Link
            to="/esqueceu-senha"
            className="inline-flex items-center gap-1.5 font-label-md text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Icon name="restart_alt" size={14} />
            Reiniciar processo de solicitação
          </Link>
        </div>
      </div>
    </RecuperacaoLayout>
  );
}

function CampoSenha({
  id,
  icone,
  valor,
  onChange,
  visivel,
  onAlternar,
  placeholder,
  invalido = false,
}: {
  id: string;
  icone: string;
  valor: string;
  onChange: (valor: string) => void;
  visivel: boolean;
  onAlternar: () => void;
  placeholder: string;
  invalido?: boolean;
}) {
  return (
    <div className="relative flex items-center">
      <Icon name={icone} size={20} className={CR.iconeCampo} />
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
        className={`${CR.campo} pl-11 pr-11 ${
          invalido ? "ring-2 ring-error focus:ring-error" : "focus:ring-primary-container/60"
        }`}
      />
      <button
        type="button"
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        onClick={onAlternar}
        className="absolute right-3.5 flex text-on-surface-variant/60 hover:text-on-surface cursor-pointer"
      >
        <Icon name={visivel ? "visibility_off" : "visibility"} size={18} />
      </button>
    </div>
  );
}
