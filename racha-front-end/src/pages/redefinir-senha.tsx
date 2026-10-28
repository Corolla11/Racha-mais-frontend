import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError, apiRequest } from "../lib/api";

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const linkInvalido = !token || searchParams.get("error") === "INVALID_TOKEN";
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function redefinir(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || salvando) return;

    if (senha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }

    setSalvando(true);
    setErro("");
    try {
      await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: { newPassword: senha, token },
      });
      navigate("/login?senhaRedefinida=1", { replace: true });
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível redefinir a senha. Solicite um novo link.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-text-primary">
      <section className="w-full max-w-md rounded-2xl bg-surface p-8 shadow-lg">
        <h1 className="text-2xl font-semibold">Redefinir senha</h1>
        {linkInvalido ? (
          <>
            <p className="mt-3 text-sm text-text-secondary">
              Este link está ausente, inválido ou expirou. Solicite uma nova
              redefinição de senha.
            </p>
            <Link
              to="/esqueceu-senha"
              className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-text-primary"
            >
              Solicitar novo link
            </Link>
          </>
        ) : (
          <form onSubmit={redefinir} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Nova senha
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Confirmar nova senha
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmacao}
                onChange={(event) => setConfirmacao(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2"
              />
            </label>
            {erro && (
              <p role="alert" className="text-sm text-red-700">
                {erro}
              </p>
            )}
            <button
              type="submit"
              disabled={salvando}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-text-primary disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
