import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ListChecks, Sparkles } from "lucide-react";
import Link from "../components/app-link";
import AppShell from "../components/app-shell";
import { Button, Card, Field, Input, PageHeading, Textarea } from "../components/ui";
import { ApiError, apiRequest } from "../lib/api";

type RascunhoGrupo = {
  nome: string;
  descricao: string;
};

export default function EscolherCriacao() {
  const navigate = useNavigate();
  const [assistant, setAssistant] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [rascunho, setRascunho] = useState<RascunhoGrupo | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function gerarRascunho(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const resultado = await apiRequest<RascunhoGrupo>("/ia/grupos/rascunho", {
        method: "POST",
        body: { prompt },
      });
      setRascunho(resultado);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Não foi possível gerar uma sugestão agora.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function criarGrupo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rascunho) return;
    setError("");
    setCreating(true);
    try {
      await apiRequest("/grupos", {
        method: "POST",
        body: rascunho,
      });
      navigate("/meus-grupos");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Não foi possível criar o grupo.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <AppShell title="Criar grupo">
      <div className="racha-choice-page">
        <PageHeading
          align="center"
          eyebrow="UM NOVO PLANO COMEÇA AQUI"
          title="Como vamos organizar seu racha?"
          description="Defina os participantes e organize as despesas compartilhadas."
        />
        <div className="racha-grid">
          <Card className="racha-choice-card">
            <ListChecks />
            <h2>Criar manualmente</h2>
            <p className="racha-muted">
              Escolha nome, categoria, período e participantes. Revise tudo
              antes de criar.
            </p>
            <Link to="/criar-grupo/manual" className="racha-primary">
              Começar do meu jeito →
            </Link>
          </Card>
          <Card className="racha-choice-card">
            <Sparkles />
            <h2>Criar com assistência</h2>
            <p className="racha-muted">
              Descreva seu plano e receba um rascunho editável criado com
              Gemini.
            </p>
            <Button variant="secondary" onClick={() => setAssistant(true)}>
              Experimentar assistente
            </Button>
          </Card>
        </div>

        {assistant && (
          <Card>
            <h2>Conte um pouco sobre o seu plano</h2>
            <p className="racha-muted">
              A IA sugere um nome e uma descrição. Nada será salvo até você
              revisar e confirmar.
            </p>
            <form onSubmit={gerarRascunho}>
              <Field label="O que vocês vão organizar?">
                <Textarea
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Uma viagem com amigos para dividir hospedagem, transporte e alimentação..."
                />
              </Field>
              <Button type="submit" disabled={loading}>
                {loading ? "Gerando rascunho..." : "Gerar sugestão"}
              </Button>
            </form>

            {rascunho && (
              <form className="mt-6" onSubmit={criarGrupo}>
                <h3>Revise e personalize</h3>
                <Field label="Nome do grupo">
                  <Input
                    required
                    maxLength={100}
                    value={rascunho.nome}
                    onChange={(event) =>
                      setRascunho({ ...rascunho, nome: event.target.value })
                    }
                  />
                </Field>
                <Field label="Descrição">
                  <Textarea
                    maxLength={1000}
                    rows={4}
                    value={rascunho.descricao}
                    onChange={(event) =>
                      setRascunho({
                        ...rascunho,
                        descricao: event.target.value,
                      })
                    }
                  />
                </Field>
                <Button type="submit" disabled={creating}>
                  {creating ? "Criando grupo..." : "Aprovar e criar grupo"}
                </Button>
              </form>
            )}

            {error && (
              <p className="ui-field__error" role="alert">
                {error}
              </p>
            )}
          </Card>
        )}
      </div>
    </AppShell>
  );
}
