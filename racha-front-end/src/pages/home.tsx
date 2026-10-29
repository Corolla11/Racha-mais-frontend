import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ClipboardList,
  Menu,
  Plus,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import Aba from "../components/aba-perfil";
import BrandLogo from "../components/brand-logo";

function Home() {
  const navigate = useNavigate();
  const [abaAberta, setAbaAberta] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  function irPara(caminho: string) {
    setMenuMobileAberto(false);
    navigate(caminho);
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() => irPara("/home")}
            className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            aria-label="Ir para o início do Racha+"
          >
            <BrandLogo />
          </button>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
            <button
              type="button"
              onClick={() => irPara("/meus-grupos")}
              className="text-sm font-semibold text-secondary transition hover:text-tertiary"
            >
              Meus grupos
            </button>
            <button
              type="button"
              onClick={() => irPara("/perfil")}
              className="text-sm font-medium text-text-secondary transition hover:text-secondary"
            >
              Meu perfil
            </button>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => irPara("/criar-grupo")}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-secondary shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Plus size={17} />
              Criar grupo
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setAbaAberta((aberta) => !aberta)}
                aria-expanded={abaAberta}
                aria-label="Abrir opções do perfil"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white ring-4 ring-background transition hover:ring-primary/20"
              >
                M
                <span className="sr-only">Abrir perfil</span>
              </button>
              {abaAberta && (
                <div className="absolute right-0 top-14 z-40">
                  <Aba />
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMenuMobileAberto((aberto) => !aberto)}
            aria-expanded={menuMobileAberto}
            aria-label={menuMobileAberto ? "Fechar menu" : "Abrir menu"}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-secondary md:hidden"
          >
            {menuMobileAberto ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {menuMobileAberto && (
          <nav className="border-t border-slate-100 bg-white px-5 py-4 md:hidden" aria-label="Navegação móvel">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              <button
                type="button"
                onClick={() => irPara("/meus-grupos")}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold text-secondary hover:bg-background"
              >
                Meus grupos <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => irPara("/perfil")}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold text-secondary hover:bg-background"
              >
                Meu perfil <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => irPara("/criar-grupo")}
                className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-secondary"
              >
                <Plus size={17} /> Criar grupo
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-secondary px-6 py-10 text-white shadow-xl shadow-secondary/10 sm:px-10 sm:py-14 lg:px-16">
          <div aria-hidden="true" className="absolute -right-20 -top-32 -z-10 h-96 w-96 rounded-full border-[50px] border-white/5" />
          <div aria-hidden="true" className="absolute -bottom-28 right-1/4 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-white/80">
              <span className="h-2 w-2 rounded-full bg-primary" />
              ORGANIZE SEM COMPLICAÇÃO
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Bons momentos ficam melhores quando <span className="text-primary">todo mundo combina.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
              Reúna pessoas, organize tarefas e deixe as despesas mais claras para o grupo inteiro.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => irPara("/criar-grupo")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-extrabold text-secondary transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Criar meu grupo <ArrowRight size={17} />
              </button>
              <button
                type="button"
                onClick={() => irPara("/meus-grupos")}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 px-6 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Explorar meus grupos
              </button>
            </div>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 border-t border-white/10 pt-6 text-sm text-white/75 sm:grid-cols-3">
            <span className="flex items-center gap-2"><Check size={16} className="text-primary" /> Planos em um só lugar</span>
            <span className="flex items-center gap-2"><Check size={16} className="text-primary" /> Tarefas compartilhadas</span>
            <span className="flex items-center gap-2"><Check size={16} className="text-primary" /> Despesas organizadas</span>
          </div>
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="atalhos-titulo">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-tertiary">Seu próximo passo</p>
              <h2 id="atalhos-titulo" className="mt-2 text-2xl font-extrabold tracking-tight text-secondary sm:text-3xl">
                O que vamos organizar?
              </h2>
            </div>
            <button
              type="button"
              onClick={() => irPara("/meus-grupos")}
              className="inline-flex items-center gap-1 self-start text-sm font-bold text-secondary hover:text-tertiary sm:self-auto"
            >
              Ver meus grupos <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <button
              type="button"
              onClick={() => irPara("/criar-grupo")}
              className="group rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-tertiary transition group-hover:bg-primary group-hover:text-secondary">
                <UsersRound size={22} />
              </span>
              <span className="mt-5 block text-lg font-extrabold text-secondary">Planejar um encontro</span>
              <span className="mt-2 block text-sm leading-6 text-text-secondary">Crie um grupo para uma viagem, festa, jogo ou qualquer plano compartilhado.</span>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-secondary">Criar grupo <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
            </button>

            <button
              type="button"
              onClick={() => irPara("/meus-grupos")}
              className="group rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary transition group-hover:bg-secondary group-hover:text-white">
                <ClipboardList size={22} />
              </span>
              <span className="mt-5 block text-lg font-extrabold text-secondary">Acompanhar meus grupos</span>
              <span className="mt-2 block text-sm leading-6 text-text-secondary">Acesse os grupos, tarefas e informações que você já compartilha.</span>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-secondary">Abrir grupos <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
            </button>

            <button
              type="button"
              onClick={() => irPara("/perfil")}
              className="group rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-tertiary transition group-hover:bg-primary group-hover:text-secondary">
                <UserRound size={22} />
              </span>
              <span className="mt-5 block text-lg font-extrabold text-secondary">Revisar meu perfil</span>
              <span className="mt-2 block text-sm leading-6 text-text-secondary">Mantenha seus dados atualizados para participar dos próximos planos.</span>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-secondary">Ver meu perfil <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
            </button>
          </div>
        </section>

        <section className="mt-8 flex flex-col items-start justify-between gap-5 rounded-3xl border border-primary/20 bg-primary/10 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-sm font-extrabold text-secondary">Cada pessoa sabe o que combinar.</p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">Comece pelo grupo e ajuste os detalhes conforme o plano de vocês.</p>
          </div>
          <button
            type="button"
            onClick={() => irPara("/criar-grupo")}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-secondary px-5 text-sm font-bold text-white transition hover:bg-secondary/90"
          >
            Começar agora <ArrowRight size={16} />
          </button>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <BrandLogo compact />
          <p className="text-xs text-text-secondary">Racha+ · Mais leve juntos.</p>
          <button
            type="button"
            onClick={() => irPara("/perfil")}
            className="self-start text-xs font-bold text-secondary hover:text-tertiary sm:self-auto"
          >
            Minha conta
          </button>
        </div>
      </footer>
    </div>
  );
}

export default Home;
