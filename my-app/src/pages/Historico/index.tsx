import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  FaArrowLeft,
  FaClipboardList,
  FaCommentDots,
  FaEdit,
  FaExclamationTriangle,
  FaHistory,
  FaListAlt,
  FaHandsHelping,
  FaPaperPlane,
  FaShieldAlt,
  FaStar,
  FaTrash,
  FaWallet,
} from "react-icons/fa";
import {
  api,
  formatarData,
  formatarValor,
  NOMES_STATUS,
  NOMES_STATUS_CANDIDATURA,
  NOMES_STATUS_PAGAMENTO,
  obterSessao,
} from "../../services/api";
import { API_PYTHON_DISPONIVEL, apiPython } from "../../services/apiPython";
import type { Candidatura, Denuncia, Feedback, Pedido } from "../../types/types";

// uma avaliação escrita pelo usuário (um dos lados de um feedback)
type MinhaAvaliacao = {
  feedback: Feedback;
  estrelas: number;
  texto?: string | null;
  sobre: string;
  data?: string | null;
};

type AbaHistorico =
  | "servicos"
  | "pedidos"
  | "candidaturas"
  | "pagamentos"
  | "comentarios"
  | "comentariosPedido"
  | "denuncias";

const abasHistorico = [
  {
    id: "servicos" as const,
    titulo: "Serviços realizados",
    icone: FaHandsHelping,
  },
  {
    id: "pedidos" as const,
    titulo: "Pedidos publicados",
    icone: FaClipboardList,
  },
  {
    id: "candidaturas" as const,
    titulo: "Minhas candidaturas",
    icone: FaPaperPlane,
  },
  {
    id: "pagamentos" as const,
    titulo: "Pagamentos",
    icone: FaWallet,
  },
  {
    id: "comentarios" as const,
    titulo: "Minhas avaliações",
    icone: FaCommentDots,
  },
  {
    id: "comentariosPedido" as const,
    titulo: "Avaliações por pedido",
    icone: FaCommentDots,
  },
  { id: "denuncias" as const, titulo: "Minhas denúncias", icone: FaShieldAlt },
  // "Minhas denúncias" depende da API Python: só aparece quando ela está configurada
].filter((item) => item.id !== "denuncias" || API_PYTHON_DISPONIVEL);

function ListaPedidos({
  titulo,
  id,
  ativo,
  pedidos,
  editavel,
  aoExcluir,
}: {
  titulo: string;
  id: string;
  ativo: boolean;
  pedidos: Pedido[];
  editavel?: boolean;
  aoExcluir?: (id: string) => void;
}) {
  return (
    <section
      id={id}
      className={`${ativo ? "" : "hidden"} scroll-mt-6 rounded-2xl border-l-4 border-[var(--verde)] bg-white p-5 shadow-sm`}
    >
      <h2 className="flex items-center gap-3 text-lg font-bold text-[var(--azul)]">
        <FaHandsHelping className="text-[var(--verde)]" />
        {titulo}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        {titulo === "Serviços realizados"
          ? "Acompanhe as ajudas que você realizou e concluiu."
          : "Gerencie os pedidos de ajuda que você publicou."}
      </p>
      {pedidos.length ? (
        <div className="mt-4 space-y-3">
          {pedidos.map((pedido) => {
            const aberto =
              String(pedido.status || "").toUpperCase() === "ABERTO";
            return (
              <article
                key={pedido.id}
                className="rounded-xl bg-[var(--creme)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/pedido/${pedido.id}?origem=historico`}
                      className="font-bold text-[var(--azul)] hover:underline"
                    >
                      {pedido.titulo}
                    </Link>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-white px-2.5 py-1 font-bold text-[var(--azul)]">
                        {NOMES_STATUS[pedido.status] || pedido.status}
                      </span>
                      <span className="font-semibold text-[var(--verde)]">{formatarValor(pedido)}</span>
                    </div>
                  </div>
                  {editavel && aberto && (
                    <div className="flex gap-2">
                      <Link
                        to={`/publicar-pedido?pedidoId=${pedido.id}&origem=historico`}
                        className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[var(--azul)]"
                      >
                        <FaEdit /> Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => aoExcluir?.(pedido.id)}
                        className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[var(--coral)]"
                      >
                        <FaTrash /> Excluir
                      </button>
                    </div>
                  )}
                </div>
                <Link
                  to={`/pedido/${pedido.id}?origem=historico`}
                  className="mt-3 inline-block text-xs font-bold text-[var(--azul)] hover:underline"
                >
                  Ver detalhes do pedido →
                </Link>
                {editavel && !aberto && (
                  <p className="mt-3 text-xs text-gray-500">
                    Este pedido não pode mais ser editado ou excluído porque já
                    foi aceito ou concluído.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-[var(--creme)] p-6 text-center">
          <FaHandsHelping className="mx-auto text-2xl text-[var(--verde)]" />
          <p className="mt-3 font-bold text-[var(--azul)]">
            {titulo === "Serviços realizados"
              ? "Você ainda não realizou nenhum serviço."
              : "Você ainda não publicou nenhum pedido."}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {titulo === "Serviços realizados"
              ? "Quando concluir uma ajuda, ela aparecerá aqui."
              : "Quando publicar uma ajuda, ela aparecerá aqui."}
          </p>
        </div>
      )}
    </section>
  );
}

// separa as avaliações que o usuário escreveu (o lado em que ele é o autor)
function avaliacoesEscritas(feedbacks: Feedback[], usuarioId: string): MinhaAvaliacao[] {
  return feedbacks.flatMap((feedback) => {
    const lista: MinhaAvaliacao[] = [];
    // quem recebeu a ajuda escreve o lado do ajudante
    if (feedback.idAjudado === usuarioId && feedback.estrelasAjudante != null)
      lista.push({
        feedback,
        estrelas: feedback.estrelasAjudante,
        texto: feedback.feedbackAjudante,
        sobre: feedback.nomeAjudante,
        data: feedback.dtAvaliacaoAjudante,
      });
    // quem ajudou escreve o lado de quem recebeu
    if (feedback.idAjudante === usuarioId && feedback.estrelasAjudado != null)
      lista.push({
        feedback,
        estrelas: feedback.estrelasAjudado,
        texto: feedback.feedbackAjudado,
        sobre: feedback.nomeAjudado,
        data: feedback.dtAvaliacaoAjudado,
      });
    return lista;
  });
}

// reúne as informações e controla as abas do histórico
export default function Historico() {
  const sessao = obterSessao();
  const idUsuario = sessao?.id;
  const [aba, setAba] = useState<AbaHistorico>("servicos");
  const [servicos, setServicos] = useState<Pedido[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [feedbacksPorPedido, setFeedbacksPorPedido] = useState<Record<string, Feedback[]>>({});
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [avisoDenuncias, setAvisoDenuncias] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [avaliacaoDetalhada, setAvaliacaoDetalhada] = useState<MinhaAvaliacao | null>(null);
  const [erro, setErro] = useState("");

  const minhasAvaliacoes = idUsuario
    ? avaliacoesEscritas(Object.values(feedbacksPorPedido).flat(), idUsuario)
    : [];

  // busca os dados do usuário para preencher o histórico
  async function carregar() {
    if (idUsuario === undefined) return;
    setCarregando(true);
    try {
      const [participacoes, publicados, minhasCandidaturas] = await Promise.all([
        api.listarAtividades(idUsuario, "PRESTADOR"),
        api.listarAtividades(idUsuario, "SOLICITANTE"),
        api.listarMinhasCandidaturas(idUsuario),
      ]);
      const todos = [...participacoes, ...publicados].filter(
        (pedido, indice, lista) => lista.findIndex((item) => item.id === pedido.id) === indice,
      );
      // serviços realizados: onde fui o ajudante e o serviço terminou
      setServicos(
        todos.filter(
          (pedido) =>
            pedido.idAjudante === idUsuario && pedido.status === "CONCLUIDO",
        ),
      );
      setPedidos(publicados);
      setCandidaturas(minhasCandidaturas);
      const concluidos = todos.filter((pedido) => pedido.status === "CONCLUIDO");
      const feedbacks = await Promise.all(
        concluidos.map(async (pedido) => {
          try {
            return [pedido.id, await api.listarFeedbacksPedido(pedido.id)] as const;
          } catch {
            return [pedido.id, [] as Feedback[]] as const;
          }
        }),
      );
      setFeedbacksPorPedido(Object.fromEntries(feedbacks));
    } catch (erroApi) {
      setErro(erroApi instanceof Error ? erroApi.message : "Não foi possível carregar o histórico.");
    } finally {
      setCarregando(false);
    }
    // denúncias ficam na API Python: se ela estiver fora do ar, o resto do histórico continua funcionando
    if (API_PYTHON_DISPONIVEL) try {
      setDenuncias(await apiPython.listarDenuncias(idUsuario));
      setAvisoDenuncias("");
    } catch {
      setDenuncias([]);
      setAvisoDenuncias("Não foi possível carregar as denúncias (serviço de moderação indisponível).");
    }
  }

  useEffect(() => {
    void carregar();
  }, [sessao?.id]);

  // exclui um pedido aberto depois da confirmação
  async function excluirPedido(id: string) {
    if (idUsuario === undefined) return;
    if (!window.confirm("Tem certeza que deseja excluir este pedido?")) return;
    try {
      await api.excluirPedido(id, idUsuario);
      await carregar();
    } catch (erroApi) {
      setErro(erroApi instanceof Error ? erroApi.message : "Não foi possível excluir o pedido");
    }
  }

  // edita a nota e o texto de uma avaliação (até 7 dias)
  async function editarAvaliacao(avaliacao: MinhaAvaliacao) {
    if (idUsuario === undefined) return;
    const nota = window.prompt("Nova nota (1 a 5):", String(avaliacao.estrelas));
    if (nota === null) return;
    const estrelas = Number(nota);
    if (!Number.isInteger(estrelas) || estrelas < 1 || estrelas > 5) {
      setErro("A nota deve ser um número de 1 a 5.");
      return;
    }
    const texto = window.prompt("Edite seu comentário (opcional):", avaliacao.texto || "");
    if (texto === null) return;
    try {
      await api.editarFeedback(avaliacao.feedback.id, {
        usuarioId: idUsuario,
        estrelas,
        texto: texto.trim() || undefined,
      });
      await carregar();
    } catch (erroApi) {
      setErro(erroApi instanceof Error ? erroApi.message : "Não foi possível editar a avaliação.");
    }
  }

  // apaga a avaliação do usuário (o outro lado continua)
  async function excluirAvaliacao(avaliacao: MinhaAvaliacao) {
    if (idUsuario === undefined) return;
    if (!window.confirm("Excluir esta avaliação?")) return;
    try {
      await api.excluirFeedback(avaliacao.feedback.id, idUsuario);
      await carregar();
    } catch (erroApi) {
      setErro(erroApi instanceof Error ? erroApi.message : "Não foi possível excluir a avaliação.");
    }
  }

  // desiste de uma candidatura (não poderá se candidatar de novo ao mesmo pedido)
  async function desistirCandidatura(candidatura: Candidatura) {
    if (idUsuario === undefined) return;
    if (!window.confirm("Desistir desta candidatura? Você não poderá se candidatar a este pedido novamente.")) return;
    try {
      await api.desistirCandidatura(candidatura.id, idUsuario);
      await carregar();
    } catch (erroApi) {
      setErro(erroApi instanceof Error ? erroApi.message : "Não foi possível desistir da candidatura.");
    }
  }

  // altera os dados de uma denúncia que ainda esta aberta
  async function editarDenuncia(denuncia: Denuncia) {
    const motivo = window.prompt(
      "Edite o motivo da denúncia:",
      denuncia.motivo || "",
    );
    if (motivo === null || !motivo.trim()) return;
    const mensagem =
      window.prompt("Edite a descrição:", denuncia.mensagem || "") || "";
    try {
      await apiPython.editarDenuncia(denuncia.id, {
        motivo: motivo.trim(),
        mensagem: mensagem.trim(),
      });
      await carregar();
    } catch (erroApi) {
      setErro(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível editar a denúncia.",
      );
    }
  }

  // retira uma denúncia depois da confirmação
  async function excluirDenuncia(id: string) {
    if (idUsuario === undefined) return;
    if (!window.confirm("Retirar esta denúncia?")) return;
    try {
      await apiPython.excluirDenuncia(id, idUsuario);
      await carregar();
    } catch (erroApi) {
      setErro(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível retirar a denúncia.",
      );
    }
  }


  return (
    <main className="min-h-screen bg-[var(--creme)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/home-prototipo"
              aria-label="Voltar para a HomePrototipo"
              className="flex size-11 items-center justify-center rounded-full bg-white text-xl text-[var(--azul)] shadow-sm"
            >
              <FaArrowLeft />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[var(--azul)]">
                Meu histórico
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Tudo o que você realizou e acompanhou no Junttô, em um só lugar.
              </p>
            </div>
          </div>
        </header>
        {erro && (
          <p className="mb-5 rounded-xl bg-white p-4 text-sm text-[var(--coral)]">
            {erro}
          </p>
        )}
        {carregando ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500">
            Carregando seu histórico...
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[260px_1fr] lg:items-start">
            <aside className="rounded-2xl bg-white p-3 shadow-sm">
              <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                Minhas atividades
              </p>
              <nav className="space-y-1" aria-label="Categorias do histórico">
                {abasHistorico.map((item) => {
                  const Icone = item.icone;
                  const selecionada = aba === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAba(item.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${selecionada ? "bg-[var(--verde)]/15 text-[var(--azul)]" : "text-[var(--azul)] hover:bg-[var(--creme)]"}`}
                    >
                      <span
                        className={`flex size-8 items-center justify-center rounded-lg ${selecionada ? "bg-[var(--verde)] text-white" : "bg-[var(--cinza)] text-[var(--azul)]"}`}
                      >
                        <Icone />
                      </span>
                      <span className="flex-1">{item.titulo}</span>
                      <span className="text-gray-400">›</span>
                    </button>
                  );
                })}
              </nav>
            </aside>
            <div className="flex flex-col gap-5">
              <ListaPedidos
                id="servicos"
                ativo={aba === "servicos"}
                titulo="Serviços realizados"
                pedidos={servicos}
              />
              <ListaPedidos
                id="pedidos"
                ativo={aba === "pedidos"}
                titulo="Pedidos publicados"
                pedidos={pedidos}
                editavel
                aoExcluir={(id) => void excluirPedido(id)}
              />
              <section
                id="candidaturas"
                className={`${aba === "candidaturas" ? "" : "hidden"} scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm`}
              >
                <h2 className="flex items-center gap-3 text-lg font-bold text-[var(--azul)]">
                  <FaHandsHelping className="text-[var(--verde)]" />
                  Minhas candidaturas
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Publicações em que você se candidatou.
                </p>
                {candidaturas.length ? (
                  <div className="mt-4 space-y-3">
                    {candidaturas.map((candidatura) => (
                      <article key={candidatura.id} className="rounded-xl bg-[var(--creme)] p-4">
                        <Link
                          to={`/pedido/${candidatura.idPedido}?origem=historico`}
                          className="font-bold text-[var(--azul)] hover:underline"
                        >
                          {candidatura.tituloPedido}
                        </Link>
                        <p className="mt-1 text-sm text-gray-600">
                          Candidatura: {NOMES_STATUS_CANDIDATURA[candidatura.status] || candidatura.status} ·
                          Pagamento: {NOMES_STATUS_PAGAMENTO[candidatura.statusPagamento] || candidatura.statusPagamento} ·
                          Pedido:{" "}
                          {NOMES_STATUS[candidatura.statusPedido] || candidatura.statusPedido}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">Enviada em {formatarData(candidatura.dtOferta)}</p>
                        {candidatura.status === "PENDENTE" && (
                          <button
                            type="button"
                            onClick={() => void desistirCandidatura(candidatura)}
                            className="mt-3 rounded-lg border border-[var(--coral)] px-3 py-2 text-xs font-bold text-[var(--coral)]"
                          >
                            Desistir da candidatura
                          </button>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl bg-[var(--creme)] p-6 text-center">
                    <FaPaperPlane className="mx-auto text-2xl text-[var(--azul)]" />
                    <p className="mt-3 font-bold text-[var(--azul)]">
                      Você ainda não tem candidaturas.
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Acesse as oportunidades e escolha uma ajuda para realizar.
                    </p>
                  </div>
                )}
              </section>
              <section
                id="pagamentos"
                className={`${aba === "pagamentos" ? "" : "hidden"} scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm`}
              >
                <h2 className="flex items-center gap-3 text-lg font-bold text-[var(--azul)]">
                  <FaListAlt className="text-[var(--laranja)]" />
                  Pagamentos registrados
                </h2>
                <p className="mt-4 text-sm text-gray-500">
                  O pagamento é feito fora do Junttô; aqui aparece a confirmação de quem recebeu.
                </p>
                <div className="mt-4 space-y-3">
                  {[...servicos, ...pedidos]
                    .filter((pedido, indice, lista) => lista.findIndex((item) => item.id === pedido.id) === indice)
                    .filter((pedido) => pedido.status === "CONCLUIDO" && pedido.total != null)
                    .map((pedido) => (
                      <Link
                        key={`pagamento-${pedido.id}`}
                        to={`/pedido/${pedido.id}?origem=historico`}
                        className="block rounded-xl bg-[var(--creme)] p-3 text-sm text-[var(--azul)] transition hover:bg-[var(--verde)]/10"
                      >
                        <span className="block font-bold">{pedido.titulo}</span>
                        <span className="mt-1 block text-[var(--verde)]">
                          {pedido.tipoPublicacao === "OFERTA"
                            ? `Oferta: R$ ${pedido.total?.toFixed(2).replace(".", ",")} por interessado`
                            : `Total: R$ ${pedido.total?.toFixed(2).replace(".", ",")} · ${
                                NOMES_STATUS_PAGAMENTO[pedido.statusPagamento || ""] || pedido.statusPagamento || ""
                              }`}
                        </span>
                      </Link>
                    ))}
                </div>
                {![...servicos, ...pedidos].some((pedido) => pedido.status === "CONCLUIDO" && pedido.total != null) && (
                  <div className="mt-4 rounded-xl bg-[var(--creme)] p-6 text-center">
                    <FaWallet className="mx-auto text-2xl text-[var(--laranja)]" />
                    <p className="mt-3 font-bold text-[var(--azul)]">
                      Nenhum pagamento registrado.
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Os pagamentos aparecerão aqui quando uma ajuda for
                      finalizada.
                    </p>
                  </div>
                )}
              </section>
              <section
                id="comentarios"
                className={`${aba === "comentarios" ? "" : "hidden"} scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm`}
              >
                <h2 className="flex items-center gap-3 text-lg font-bold text-[var(--azul)]">
                  <FaCommentDots className="text-[var(--laranja)]" />
                  Minhas avaliações
                </h2>
                <p className="mt-2 text-sm text-gray-500">Avaliações que você deu para outras pessoas.</p>
                {minhasAvaliacoes.length ? (
                  <div className="mt-4 space-y-3">
                    {minhasAvaliacoes.map((avaliacao) => (
                      <article
                        key={`${avaliacao.feedback.id}-${avaliacao.sobre}`}
                        className="rounded-xl bg-[var(--creme)] p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                              {avaliacao.feedback.tituloPedido}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[var(--azul)]">Sobre: {avaliacao.sobre}</p>
                          </div>
                          <span className="flex items-center gap-1 text-sm font-bold text-[var(--laranja)]">
                            <FaStar /> {avaliacao.estrelas}/5
                          </span>
                        </div>
                        {avaliacao.texto && (
                          <p className="mt-4 rounded-xl bg-white p-3 text-sm leading-relaxed text-[var(--azul)]">
                            “{avaliacao.texto}”
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-gray-500">{formatarData(avaliacao.data)}</span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setAvaliacaoDetalhada(avaliacao)}
                              className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[var(--azul)]"
                            >
                              Ver detalhes
                            </button>
                            <button
                              type="button"
                              onClick={() => void editarAvaliacao(avaliacao)}
                              className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[var(--azul)]"
                            >
                              <FaEdit className="mr-1 inline" />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => void excluirAvaliacao(avaliacao)}
                              className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[var(--coral)]"
                            >
                              <FaTrash className="mr-1 inline" />
                              Excluir
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl bg-[var(--creme)] p-6 text-center">
                    <FaCommentDots className="mx-auto text-2xl text-[var(--laranja)]" />
                    <p className="mt-3 font-bold text-[var(--azul)]">Você ainda não avaliou ninguém.</p>
                    <p className="mt-1 text-sm text-gray-500">Depois de uma ajuda concluída, avalie a experiência.</p>
                  </div>
                )}
              </section>
              <section
                id="comentarios-por-pedido"
                className={`${aba === "comentariosPedido" ? "" : "hidden"} scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm`}
              >
                <h2 className="flex items-center gap-3 text-lg font-bold text-[var(--azul)]">
                  <FaCommentDots className="text-[var(--verde)]" />
                  Avaliações por pedido
                </h2>
                <p className="mt-2 text-sm text-gray-500">As duas avaliações de cada ajuda concluída.</p>
                {Object.values(feedbacksPorPedido).some((itens) => itens.length > 0) ? (
                  <div className="space-y-3">
                    {Object.entries(feedbacksPorPedido).map(([pedidoId, itens]) =>
                      itens.map((feedback) => (
                        <div key={feedback.id} className="mt-4 rounded-xl bg-[var(--creme)] p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-bold text-[var(--azul)]">{feedback.tituloPedido}</p>
                            <Link
                              to={`/pedido/${pedidoId}?origem=historico`}
                              className="text-xs font-bold text-[var(--azul)] hover:underline"
                            >
                              Ver pedido →
                            </Link>
                          </div>
                          {[
                            [feedback.nomeAjudado, feedback.nomeAjudante, feedback.estrelasAjudante, feedback.feedbackAjudante],
                            [feedback.nomeAjudante, feedback.nomeAjudado, feedback.estrelasAjudado, feedback.feedbackAjudado],
                          ].map(([autor, sobre, estrelas, texto]) =>
                            estrelas != null ? (
                              <div key={`${feedback.id}-${autor}`} className="mt-3 rounded-xl bg-white p-3">
                                <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                                  <span>
                                    <span className="font-semibold">{autor}</span> avaliou {sobre}
                                  </span>
                                  <span className="flex items-center gap-1 font-bold text-[var(--laranja)]">
                                    <FaStar /> {estrelas}/5
                                  </span>
                                </div>
                                {texto && <p className="mt-2 text-sm leading-relaxed text-[var(--azul)]">“{texto}”</p>}
                              </div>
                            ) : null,
                          )}
                        </div>
                      )),
                    )}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl bg-[var(--creme)] p-6 text-center">
                    <FaCommentDots className="mx-auto text-2xl text-[var(--verde)]" />
                    <p className="mt-3 font-bold text-[var(--azul)]">Nenhuma avaliação ainda.</p>
                    <p className="mt-1 text-sm text-gray-500">As avaliações das ajudas concluídas aparecerão aqui.</p>
                  </div>
                )}
              </section>
              <section
                id="denuncias"
                className={`${aba === "denuncias" ? "" : "hidden"} scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm`}
              >
                <h2 className="flex items-center gap-3 text-lg font-bold text-[var(--azul)]">
                  <FaExclamationTriangle className="text-[var(--coral)]" />
                  Minhas denúncias
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Edite ou retire denúncias enquanto estiverem abertas.
                </p>
                {avisoDenuncias && <p className="mt-3 text-sm text-[var(--coral)]">{avisoDenuncias}</p>}
                {denuncias.length ? (
                  <div className="mt-4 space-y-3">
                    {denuncias.map((denuncia) => {
                      const aberta =
                        String(denuncia.status || "ABERTA").toUpperCase() ===
                          "ABERTA" ||
                        String(denuncia.status || "").toUpperCase() ===
                          "PENDENTE";
                      return (
                        <article
                          key={denuncia.id}
                          className="rounded-xl bg-[var(--creme)] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-bold text-[var(--azul)]">
                                Denúncia #{denuncia.id}
                              </h3>
                              <p className="mt-1 text-sm text-gray-600">
                                {denuncia.motivo || "Sem motivo"}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {denuncia.mensagem || "Sem descrição"}
                              </p>
                            </div>
                            <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-bold text-orange-800">
                              {denuncia.status || "ABERTA"}
                            </span>
                          </div>
                          {aberta && (
                            <div className="mt-3 flex gap-2">
                              <button
                                type="button"
                                onClick={() => void editarDenuncia(denuncia)}
                                className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-[var(--azul)]"
                              >
                                <FaEdit className="mr-1 inline" />
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void excluirDenuncia(denuncia.id)
                                }
                                className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-[var(--coral)]"
                              >
                                <FaTrash className="mr-1 inline" />
                                Retirar
                              </button>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl bg-[var(--creme)] p-6 text-center">
                    <FaShieldAlt className="mx-auto text-2xl text-[var(--coral)]" />
                    <p className="mt-3 font-bold text-[var(--azul)]">
                      Você não possui denúncias.
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Caso precise relatar um problema, use a página de
                      denúncias.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
        {avaliacaoDetalhada && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
            onClick={() => setAvaliacaoDetalhada(null)}
          >
            <section
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[var(--azul)]">Detalhes da avaliação</h2>
                <button
                  type="button"
                  onClick={() => setAvaliacaoDetalhada(null)}
                  className="font-bold text-[var(--coral)]"
                >
                  Fechar
                </button>
              </div>
              <p className="mt-5 flex items-center gap-1 font-bold text-[var(--laranja)]">
                <FaStar /> {avaliacaoDetalhada.estrelas}/5 · sobre {avaliacaoDetalhada.sobre}
              </p>
              <p className="mt-3 text-sm text-gray-700">{avaliacaoDetalhada.texto || "Sem comentário."}</p>
              <p className="mt-3 text-xs text-gray-500">
                Ajuda: {avaliacaoDetalhada.feedback.tituloPedido} · {formatarData(avaliacaoDetalhada.data)}
              </p>
            </section>
          </div>
        )}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
          <FaHistory /> Histórico atualizado com os registros disponíveis.
        </div>
      </div>
    </main>
  );
}
