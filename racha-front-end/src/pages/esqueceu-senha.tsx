import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Mail, MailCheck } from "lucide-react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/auth-layout";
import { Button, Field, Input } from "../components/ui";

export default function EsqueceuSenha() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => { setLoading(false); setSent(true); }, 500);
  }
  return (
    <AuthLayout step={sent ? 2 : 1}>
      <span className="racha-auth-step">← Passo {sent ? "2" : "1"} de 3</span>
      <h1>{sent ? "Confira seu e-mail" : "Esqueceu sua senha?"}</h1>
      <p>{sent ? `Se houver uma conta associada a ${email}, a recuperação poderá continuar pelo link enviado.` : "Sem problemas! Digite seu e-mail cadastrado e enviaremos um link seguro para você redefinir seu código de acesso."}</p>
      {sent ? (
        <>
          <div className="racha-notice"><MailCheck size={22}/><span>Solicitação registrada nesta prévia. Nenhum e-mail real foi enviado.</span></div>
          <Link className="racha-primary" to="/redefinir-senha">Continuar prévia de recuperação<ArrowRight size={16}/></Link>
          <Button variant="ghost" onClick={() => setSent(false)}>Tentar outro e-mail</Button>
        </>
      ) : (
        <form onSubmit={submit}>
          <Field label="E-mail cadastrado" hint="Confira se o endereço corresponde ao usado no seu cadastro.">
            <div className="racha-auth-input"><Mail size={16}/><Input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="rodrigo@exemplo.com"/></div>
          </Field>
          <Button type="submit" fullWidth disabled={loading}>{loading ? "Enviando solicitação…" : "Enviar link de recuperação"}<ArrowRight size={16}/></Button>
        </form>
      )}
      <Link className="racha-back-link" to="/login"><ArrowLeft size={14}/>Voltar para o Login</Link>
      <small className="racha-demo-caption">Prévia visual do fluxo de recuperação.</small>
    </AuthLayout>
  );
}
