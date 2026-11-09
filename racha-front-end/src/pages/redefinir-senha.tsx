import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import AuthLayout from "../components/auth-layout";
import { Button, Field, Input } from "../components/ui";
import { ApiError, apiRequest } from "../lib/api";

export default function RedefinirSenha() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const tokenError = searchParams.get("error");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = data.get("password");
    if (password !== data.get("confirmation")) {
      setError("As senhas precisam ser iguais.");
      return;
    }
    if (!token) {
      setError("O link está inválido ou expirou. Solicite outro e-mail.");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: { newPassword: password, token },
      });
      setDone(true);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Não foi possível atualizar a senha agora.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout step={3}>
      <span className="racha-auth-step">← Passo 3 de 3</span>
      {done && <span className="racha-auth-done"><CheckCircle2 size={24}/></span>}
      <h1>{done ? "Senha atualizada!" : "Crie sua nova senha"}</h1>
      <p>{done ? "Tudo pronto! Agora você já pode voltar e continuar organizando suas rachas." : "Escolha uma senha segura para recuperar o acesso aos seus grupos. Use pelo menos 8 caracteres."}</p>
      {done ? (
        <>
          <Link className="racha-primary" to="/login">Voltar para o Login<ArrowRight size={16}/></Link>
        </>
      ) : tokenError || !token ? (
        <>
          <div className="racha-notice" role="alert">
            O link de recuperação está inválido ou expirou. Solicite um novo e-mail.
          </div>
          <Link className="racha-primary" to="/esqueceu-senha">Solicitar novo link<ArrowRight size={16}/></Link>
        </>
      ) : (
        <form onSubmit={submit}>
          <Field label="Nova senha"><div className="racha-auth-input"><LockKeyhole size={16}/><Input type="password" name="password" required minLength={8} autoComplete="new-password" placeholder="Pelo menos 8 caracteres"/></div></Field>
          <Field label="Confirmar nova senha" error={error}><div className="racha-auth-input"><LockKeyhole size={16}/><Input type="password" name="confirmation" required minLength={8} autoComplete="new-password" placeholder="Digite novamente sua senha" aria-invalid={!!error}/></div></Field>
          <Button type="submit" fullWidth disabled={loading}>{loading ? "Salvando..." : "Salvar nova senha"}<ArrowRight size={16}/></Button>
          <Link className="racha-back-link" to="/login"><ArrowLeft size={14}/>Voltar para o Login</Link>
        </form>
      )}
    </AuthLayout>
  );
}
