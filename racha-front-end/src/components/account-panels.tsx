import { Banknote, Check, Copy, CreditCard, Download, FileText, LockKeyhole, Plus, QrCode, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/auth-context";
import { ApiError, apiRequest } from "../lib/api";
import { ENDPOINTS, type ChavePixApi, type TipoChavePix } from "../lib/endpoints";
import Link from "./app-link";
import Overlay from "./overlay";
import PixPreview from "./pix-preview";

const TIPO_LABELS: Record<TipoChavePix, string> = {
  telefone: "Celular",
  email: "E-mail",
  cpf: "CPF",
  aleatoria: "Aleatória",
};

export default function AccountPanels({ panel }: { panel: "pix" | "security" }) {
  const { user, changePassword } = useAuth();
  const [message, setMessage] = useState("");
  const [chaves, setChaves] = useState<ChavePixApi[]>([]);
  const [key, setKey] = useState("(11) 98765-4321");
  const [keyType, setKeyType] = useState<TipoChavePix>("telefone");
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const principal = chaves[0];
  const saved = principal?.chave ?? "(11) 98765-4321";
  const titular = user?.name || "Rodrigo M.";

  useEffect(() => {
    if (panel !== "pix" || !user) return;
    let ativo = true;
    apiRequest<ChavePixApi[]>(`${ENDPOINTS.chavesPix.base}?idUser=${encodeURIComponent(user.id)}`)
      .then((lista) => {
        if (!ativo) return;
        setChaves(lista);
        if (lista[0]) {
          setKey(lista[0].chave);
          setKeyType(lista[0].tipoChave);
        }
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [panel, user]);

  async function salvarChave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!user) {
      setEditing(false);
      setMessage("Chave atualizada na demonstração.");
      return;
    }
    try {
      const alvoId = editingId ?? principal?.id;
      if (alvoId) {
        const atualizada = await apiRequest<ChavePixApi>(ENDPOINTS.chavesPix.byId(alvoId), {
          method: "PATCH",
          body: { tipoChave: keyType, chave: key.trim() },
        });
        setChaves((ant) => ant.map((c) => (c.id === atualizada.id ? atualizada : c)));
      } else {
        const criada = await apiRequest<ChavePixApi>(ENDPOINTS.chavesPix.base, {
          method: "POST",
          body: { tipoChave: keyType, chave: key.trim() },
        });
        setChaves((ant) => [criada, ...ant]);
      }
      setEditing(false);
      setEditingId(null);
      setMessage("Chave Pix salva com sucesso.");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Não foi possível salvar a chave Pix.");
    }
  }

  async function excluirChave(id: string) {
    setMessage("");
    try {
      await apiRequest<void>(ENDPOINTS.chavesPix.byId(id), { method: "DELETE" });
      setChaves((ant) => ant.filter((c) => c.id !== id));
      setMessage("Chave Pix removida.");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Não foi possível remover a chave Pix.");
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(saved);
      setMessage("Chave copiada.");
    } catch {
      setMessage("Selecione a chave exibida para copiar.");
    }
  }

  async function salvarSenha(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const oldPass = String(data.get("old") ?? "");
    const newPass = String(data.get("new") ?? "");
    const confirmPass = String(data.get("confirm") ?? "");
    if (newPass !== confirmPass) {
      setMessage("As novas senhas devem ser iguais.");
      return;
    }
    if (!user) {
      setMessage("Alteração de senha simulada. Nenhuma credencial real foi modificada.");
      form.reset();
      return;
    }
    try {
      await changePassword(oldPass, newPass);
      setMessage("Senha atualizada com sucesso.");
      form.reset();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Não foi possível alterar a senha.");
    }
  }

  return (
    <div className="racha-account-panels">
      {message && <p className="racha-notice" role="status">{message}</p>}
      {panel === "pix" ? (
        <>
          <div className="racha-account-columns">
            <div>
              <section className="racha-card racha-account-pix-card">
                <div className="racha-card-intro">
                  <span className="racha-eyebrow"><QrCode size={12}/>LIQUIDAÇÃO INSTANTÂNEA</span>
                  <h2>Pagamentos & Chaves Pix</h2>
                  <p>Gerencie suas chaves para recebimento de rateios e suas formas de pagamento para acertos automáticos.</p>
                </div>
                <div className="racha-card-heading">
                  <h3>Chave Pix para Recebimento</h3>
                  <span className="racha-verified"><ShieldCheck size={10}/>{principal ? `Chave (${TIPO_LABELS[principal.tipoChave]}) Ativa` : "Chave Principal Ativa"}</span>
                </div>
                <div className="racha-saved-key">
                  <span className="racha-soft-icon"><Smartphone size={22}/></span>
                  <div>
                    <small>Titular: {titular}</small>
                    <strong>{saved}</strong>
                    <small>Recebimento direto via Pix</small>
                  </div>
                  <div>
                    <button onClick={() => { setEditingId(principal?.id ?? null); setKey(principal?.chave ?? ""); setKeyType(principal?.tipoChave ?? "telefone"); setEditing(!editing); }}><FileText size={11}/>{principal ? "Alterar" : "Cadastrar"}</button>
                    <button onClick={copy}><Copy size={10}/>Copiar chave</button>
                    {principal && <button onClick={() => void excluirChave(principal.id)}><Trash2 size={10}/>Remover</button>}
                  </div>
                </div>
                {editing && (
                  <form className="racha-edit-key-form" onSubmit={salvarChave}>
                    <label className="racha-label">
                      Tipo de chave
                      <select value={keyType} onChange={event => setKeyType(event.target.value as TipoChavePix)} className="ui-control">
                        <option value="telefone">Celular</option>
                        <option value="email">E-mail</option>
                        <option value="cpf">CPF</option>
                        <option value="aleatoria">Aleatória</option>
                      </select>
                    </label>
                    <label className="racha-label">
                      Chave para recebimento
                      <input type={keyType === "email" ? "email" : "text"} required minLength={3} value={key} onChange={event => setKey(event.target.value)} className="ui-control"/>
                    </label>
                    <button className="racha-primary">Salvar chave</button>
                    <button className="racha-secondary" type="button" onClick={() => { setEditing(false); setEditingId(null); }}>Cancelar</button>
                  </form>
                )}
                <div className="racha-warning racha-account-tip">
                  <ShieldCheck size={14}/>
                  <p>Quando alguém pagar sua cota através de um grupo, o QR Code gerado utilizará esta chave automaticamente, creditando o valor diretamente na conta do recebedor.</p>
                </div>
                <span className="racha-feature-label">ADICIONAR CHAVE ALTERNATIVA</span>
                <div className="racha-key-types">
                  {([
                    [Smartphone, "CPF", "cpf"],
                    [FileText, "E-mail", "email"],
                    [Smartphone, "Celular", "telefone"],
                    [QrCode, "Aleatória", "aleatoria"],
                  ] as const).map(([Icon, label, value]) => (
                    <button key={value} onClick={() => { setEditingId(null); setKey(""); setKeyType(value); setEditing(true); }}>
                      <Icon size={14}/>{label}
                    </button>
                  ))}
                </div>
              </section>
              <section className="racha-card">
                <div className="racha-card-heading">
                  <div>
                    <h2>Formas de Pagamento Salvas</h2>
                    <p className="racha-muted">Para assinaturas do Racha+ Pro e cobranças automáticas de cotas.</p>
                  </div>
                  <button className="racha-primary" onClick={() => setMessage("O cadastro real de cartões será disponibilizado com a integração de pagamentos.")}><Plus size={12}/>Adicionar novo cartão</button>
                </div>
                <div className="racha-saved-cards">
                  <div className="racha-bank-card"><span><i className="racha-mastercard"/>Mastercard Black <b>Padrão</b></span><strong>•••• •••• •••• 4821</strong><small>VALIDADE</small><div>08/29 <LockKeyhole size={11}/></div></div>
                  <div className="racha-bank-card"><span><CreditCard size={16}/>Visa Infinite <b>Secundário</b></span><strong>•••• •••• •••• 1904</strong><small>VALIDADE</small><div>11/27 <span>Exemplo visual</span></div></div>
                </div>
              </section>
            </div>
            <div>
              <section className="racha-card racha-qr-card">
                <div className="racha-card-heading"><h3><QrCode size={12}/>Prévia do QR Code de Cobrança</h3><span className="racha-verified">Pix Direto</span></div>
                <PixPreview size={158}/>
                <strong>Racha Fácil · {titular}</strong>
                <p>Este código é anexado a qualquer cobrança que você disparar via WhatsApp ou link direto.</p>
                <div className="racha-actions">
                  <button className="racha-secondary" onClick={() => setMessage("QR Code ilustrativo. Não há um código de pagamento real para baixar.")}><Download size={11}/>Baixar Placa QR</button>
                  <button className="racha-secondary" onClick={copy}><Copy size={11}/>Copiar chave</button>
                </div>
                <small className="racha-demo-caption">QR Code demonstrativo, sem valor financeiro.</small>
              </section>
              <section className="racha-card racha-liquidity">
                <div className="racha-card-heading"><span>Volume Liquidado no Mês</span><span className="racha-verified">Dados ilustrativos</span></div>
                <strong>R$ 2.418,90</strong>
                <p>Total recebido e dividido com sucesso entre os grupos ativos.</p>
                <div className="racha-volume-bar"><i/><i/><i/></div>
                <small>● Pessoal  ● Casa (Pix)  ● Churrasco</small>
              </section>
            </div>
          </div>
          <section className="racha-card racha-transactions">
            <div className="racha-card-heading">
              <div><h2>Histórico de Transações Recentes</h2><p className="racha-muted">Extrato unificado de recebimentos e pagamentos dos seus rateios.</p></div>
              <button className="racha-secondary" onClick={() => setMessage("A exportação depende dos registros reais de pagamentos.")}><Download size={12}/>Exportar Extrato (CSV/PDF)</button>
            </div>
            <div className="racha-table-scroll">
              <table>
                <thead><tr><th>DATA</th><th>DESCRIÇÃO E PARTICIPANTE</th><th>MÉTODO</th><th>VALOR</th><th>STATUS</th><th>COMPROVANTE</th></tr></thead>
                <tbody>
                  {[
                    { date: "Hoje, 14:32", title: "Recebimento Rateio Churrasco – Mariana", group: "Grupo: Amigos da Faculdade", value: "+ R$ 112,50", income: true },
                    { date: "22 Mai, 09:15", title: "Assinatura Plano Pro – Anual", group: "Racha+ · plano demonstrativo", value: "− R$ 80,00", income: false },
                    { date: "18 Mai, 11:40", title: "Pagamento Aluguel Casa – Camila", group: "Grupo: Viagem Florianópolis", value: "− R$ 300,00", income: false },
                    { date: "12 Mai, 21:05", title: "Recebimento Pizza Sexta – Lucas", group: "Grupo: Amigos da Faculdade", value: "+ R$ 45,00", income: true },
                  ].map(row => (
                    <tr key={row.title}>
                      <td>{row.date}</td>
                      <td><div className="racha-transaction-title"><span className={row.income ? "income" : "outcome"}><Banknote size={13}/></span><div><strong>{row.title}</strong><small>{row.group}</small></div></div></td>
                      <td><span className="racha-badge">Pix</span></td>
                      <td className={row.income ? "racha-income" : ""}>{row.value}</td>
                      <td><span className="racha-badge confirmado">● Concluído</span></td>
                      <td><span className="racha-muted">—</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <small className="racha-demo-caption">Transações ilustrativas para revisão do layout.</small>
          </section>
          <div className="racha-financial-footer">
            <LockKeyhole size={19}/>
            <div><strong>Criptografia de Ponta a Ponta & Conformidade</strong><p>O Pix é destinado diretamente ao recebedor. A prévia não realiza movimentações financeiras.</p></div>
            <Link to="/faq">Termos de uso e segurança →</Link>
          </div>
        </>
      ) : (
        <div className="racha-account-columns">
          <section className="racha-card">
            <div className="racha-card-intro">
              <span className="racha-eyebrow"><LockKeyhole size={12}/>ACESSO PROTEGIDO</span>
              <h2>Segurança e Conta</h2>
              <p>Atualize suas credenciais e mantenha sua conta protegida.</p>
            </div>
            <form onSubmit={salvarSenha}>
              <h3>Alterar senha</h3>
              <label className="racha-label">Senha atual<input name="old" type="password" required autoComplete="off" className="ui-control"/></label>
              <div className="racha-two-col">
                <label className="racha-label">Nova senha<input name="new" type="password" minLength={8} required autoComplete="off" className="ui-control"/></label>
                <label className="racha-label">Confirmar nova senha<input name="confirm" type="password" minLength={8} required autoComplete="off" className="ui-control"/></label>
              </div>
              <button className="racha-primary"><Check size={14}/>Salvar alterações</button>
            </form>
          </section>
          <div>
            <section className="racha-card racha-benefits">
              <ShieldCheck size={24}/>
              <h2>Sua conta em segurança</h2>
              <p>Escolha uma senha exclusiva e confira suas informações pessoais com frequência.</p>
              <Link to="/gerenciar-assinatura">Gerenciar assinatura →</Link>
            </section>
            <section className="racha-card">
              <h2>Excluir conta</h2>
              <p className="racha-muted">Transfira a administração dos grupos e resolva suas pendências antes de solicitar a exclusão.</p>
              <button className="racha-danger" onClick={() => { setRemove(true); setRemoved(false); }}>Revisar exclusão de conta</button>
            </section>
          </div>
        </div>
      )}
      {remove && (
        <Overlay
          title={removed ? "Conta excluída · prévia" : "Confirmar exclusão de conta?"}
          onClose={() => setRemove(false)}
          footer={!removed && (
            <>
              <button className="racha-secondary" onClick={() => setRemove(false)}>Cancelar</button>
              <button className="racha-danger" disabled={confirmation !== "EXCLUIR"} onClick={() => setRemoved(true)}>Confirmar exclusão</button>
            </>
          )}
        >
          {removed ? (
            <p className="racha-success" role="status">Estado de sucesso da demonstração. Nenhuma conta real foi excluída.</p>
          ) : (
            <>
              <p>O histórico financeiro compartilhado será preservado. Digite EXCLUIR para revisar esta confirmação.</p>
              <label className="racha-label">Confirmação<input value={confirmation} onChange={event => setConfirmation(event.target.value)} className="ui-control"/></label>
            </>
          )}
        </Overlay>
      )}
    </div>
  );
}
