import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import AuthLayout from "../components/auth-layout";
import { Button, Field, Input } from "../components/ui";

export default function RedefinirSenha() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  return (
    <AuthLayout step={3}>
      <span className="racha-auth-step">← Passo 3 de 3</span>
      {done && <span className="racha-auth-done"><CheckCircle2 size={24}/></span>}
      <h1>{done ? "Senha atualizada!" : "Crie sua nova senha"}</h1>
      <p>{done ? "Tudo pronto! Agora você já pode voltar e continuar organizando suas rachas." : "Escolha uma senha segura para recuperar o acesso aos seus grupos. Use pelo menos 8 caracteres."}</p>
      {done ? (
        <>
          <Link className="racha-primary" to="/login">Voltar para o Login<ArrowRight size={16}/></Link>
          <small className="racha-demo-caption">Confirmação ilustrativa. Nenhuma credencial real foi alterada.</small>
        </>
      ) : (
        <form onSubmit={event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          if (data.get("password") !== data.get("confirmation")) { setError("As senhas precisam ser iguais."); return; }
          setDone(true);
        }}>
          <Field label="Nova senha"><div className="racha-auth-input"><LockKeyhole size={16}/><Input type="password" name="password" required minLength={8} autoComplete="new-password" placeholder="Pelo menos 8 caracteres"/></div></Field>
          <Field label="Confirmar nova senha" error={error}><div className="racha-auth-input"><LockKeyhole size={16}/><Input type="password" name="confirmation" required minLength={8} autoComplete="new-password" placeholder="Digite novamente sua senha" aria-invalid={!!error}/></div></Field>
          <Button type="submit" fullWidth>Salvar nova senha<ArrowRight size={16}/></Button>
          <Link className="racha-back-link" to="/login"><ArrowLeft size={14}/>Voltar para o Login</Link>
          <small className="racha-demo-caption">Prévia visual. Não informe uma senha real.</small>
        </form>
      )}
    </AuthLayout>
  );
}
