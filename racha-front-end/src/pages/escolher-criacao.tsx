import { useState } from "react";
import { ListChecks, Sparkles } from "lucide-react";
import Link from "../components/app-link";
import AppShell from "../components/app-shell";
import { Button, Card, Field, PageHeading, Textarea } from "../components/ui";

export default function EscolherCriacao() {
  const [assistant, setAssistant] = useState(false);
  const [ready, setReady] = useState(false);
  return (
    <AppShell title="Criar grupo">
      <div className="racha-choice-page">
        <PageHeading align="center" eyebrow="UM NOVO PLANO COMEÇA AQUI" title="Como vamos organizar seu racha?" description="Defina os participantes e organize todas as despesas dentro das tarefas."/>
        <div className="racha-grid">
          <Card className="racha-choice-card"><ListChecks/><h2>Criar manualmente</h2><p className="racha-muted">Escolha nome, categoria, período e participantes. Revise tudo antes de criar.</p><Link to="/criar-grupo/manual" className="racha-primary">Começar do meu jeito →</Link></Card>
          <Card className="racha-choice-card"><Sparkles/><h2>Criar com assistência</h2><p className="racha-muted">Descreva seu evento para visualizar uma sugestão de estrutura.</p><Button variant="secondary" onClick={() => setAssistant(true)}>Experimentar assistente</Button></Card>
        </div>
        {assistant && <Card><h2>Conte um pouco sobre o seu plano</h2><p className="racha-notice">Prévia do assistente com modelo local. A integração com IA ainda não está conectada.</p><form onSubmit={event => { event.preventDefault(); setReady(true); }}><Field label="O que vocês vão fazer?"><Textarea required rows={3} placeholder="Uma viagem com 6 amigos por uma semana…"/></Field><Button type="submit">Visualizar sugestão</Button></form>{ready && <Card><h3>Sugestão inicial</h3><p>Organize tarefas para hospedagem, transporte e alimentação. Selecione os participantes e o valor de cada tarefa na revisão.</p><Link className="racha-primary" to="/criar-grupo/manual">Revisar e personalizar →</Link></Card>}</Card>}
      </div>
    </AppShell>
  );
}
