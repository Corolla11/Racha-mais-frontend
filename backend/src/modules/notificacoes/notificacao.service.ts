import { AppError } from "../../errors/AppError.js";
import { notificacaoRepository } from "./notificacao.repository.js";
import { construirLembretesDePrazo } from "./notificacao.prazo.js";

const HORAS_AVISO_PRAZO = 24;
const HORAS_JANELA_ATRASO = 24;

export const notificacaoService = {
  async listar(
    idUser: string,
    options: { naoLidas: boolean; pagina: number; limite: number },
  ) {
    const [notificacoes, naoLidas] = await notificacaoRepository.listar(
      idUser,
      options,
    );
    const temMais = notificacoes.length > options.limite;
    return {
      notificacoes: notificacoes.slice(0, options.limite),
      naoLidas,
      pagina: options.pagina,
      limite: options.limite,
      temMais,
    };
  },

  async marcarLida(idUser: string, id: string) {
    const resultado = await notificacaoRepository.marcarLida(
      idUser,
      id,
      new Date(),
    );
    if (resultado.count === 0) {
      const notificacao = await notificacaoRepository.existeDoUsuario(
        idUser,
        id,
      );
      if (!notificacao) throw new AppError(404, "Notificação não encontrada");
    }
  },

  marcarTodasLidas(idUser: string) {
    return notificacaoRepository.marcarTodasLidas(idUser, new Date());
  },

  async emitirLembretesDePrazo(agora = new Date()) {
    const inicioProximoPrazo = agora;
    const fimProximoPrazo = new Date(
      agora.getTime() + HORAS_AVISO_PRAZO * 60 * 60 * 1000,
    );
    const inicioAtrasoRecente = new Date(
      agora.getTime() - HORAS_JANELA_ATRASO * 60 * 60 * 1000,
    );
    const partes = await notificacaoRepository.listarPartesComPrazo(
      inicioAtrasoRecente,
      fimProximoPrazo,
    );

    const notificacoes = construirLembretesDePrazo(partes, agora);

    return notificacaoRepository.criar(notificacoes);
  },
};

export function iniciarAgendadorDeNotificacoes(
  intervaloMs = 15 * 60 * 1000,
): () => void {
  let executando = false;
  const executar = async () => {
    if (executando) return;
    executando = true;
    try {
      const resultado = await notificacaoService.emitirLembretesDePrazo();
      if (resultado.count > 0) {
        console.info(`Lembretes de prazo criados: ${resultado.count}`);
      }
    } catch (erro) {
      console.error("Falha ao processar lembretes de prazo", erro);
    } finally {
      executando = false;
    }
  };

  void executar();
  const timer = setInterval(() => void executar(), intervaloMs);
  timer.unref();
  return () => clearInterval(timer);
}
