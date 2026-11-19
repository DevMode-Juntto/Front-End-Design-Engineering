import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  FaArrowLeft,
  FaClipboardList,
  FaCommentDots,
  FaEdit,
  FaHistory,
  FaListAlt,
  FaHandsHelping,
  FaPaperPlane,
  FaStar,
  FaTrash,
  FaWallet,
} from "react-icons/fa";
import { api, obterSessao } from "../../services/api";
import type { Comentario, Pedido, SolicitacaoAjuda } from "../../types/types";

type AbaHistorico =
  | "servicos"
  | "pedidos"
  | "candidaturas"
  | "pagamentos"
  | "comentarios"
  | "comentariosPedido";

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
    titulo: "Pagamentos registrados",
    icone: FaWallet,
  },
  {
    id: "comentarios" as const,
    titulo: "Meus comentários",
    icone: FaCommentDots,
  },
  {
    id: "comentariosPedido" as const,
    titulo: "Comentários por pedido",
    icone: FaCommentDots,
  },
];

// mostra os pedidos do histórico e as ações disponíveis
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
  aoExcluir?: (id: string | number) => void;
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
                        {nomeStatus(pedido.status)}
                      </span>
                      {pedido.valor !== undefined && (
                        <span className="font-semibold text-[var(--verde)]">
                          R$ {pedido.valor.toFixed(2).replace(".", ",")}
                        </span>
                      )}
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

// troca o status técnico por um nome mais fácil
function nomeStatus(status?: string) {
  const nomes: Record<string, string> = {
    ABERTO: "Aguardando prestador",
    ACEITO: "Prestador escolhido",
    EM_ANDAMENTO: "Em andamento",
    AGUARDANDO_CONFIRMACAO: "Aguardando confirmação",
    CONCLUIDO: "Concluído",
    FINALIZADO: "Finalizado",
    CANCELADO: "Cancelado",
  };
  return nomes[String(status || "").toUpperCase()] || "Registro de atividade";
}

// pega os dados principais do comentário p mostrar na tela
function metaComentario(comentario: Comentario) {
  const dados = comentario as Comentario & {
    pedidoId?: string | number;
    data?: string;
    criadoEm?: string;
    sobreUsuario?: { nome?: string };
    pedido?: { titulo?: string };
  };
  const pessoa =
    dados.sobreUsuario?.nome ||
    (comentario.sobreUsuarioId !== undefined
      ? `Usuário #${comentario.sobreUsuarioId}`
      : "Pessoa da ajuda");
  const autor = comentario.autor?.nome || "Usuário da ajuda";
  const data = dados.data || dados.criadoEm;
  return {
    pessoa,
    autor,
    pedidoId: dados.pedidoId,
    pedido: dados.pedido?.titulo,
    data,
  };
}

// mostra o nome do pedido ligado à candidatura
function nomeAceite(aceite: SolicitacaoAjuda) {
  const dados = aceite as SolicitacaoAjuda & {
    pedido?: { titulo?: string };
    titulo?: string;
  };
  return (
    dados.pedido?.titulo ||
    dados.titulo ||
    `Pedido #${aceite.pedidoId || aceite.id}`
  );
}

// reúne as informações e controla as abas do histórico
export default function Historico() {
  const sessao = obterSessao();
  const idUsuario = sessao?.id;
  const [aba, setAba] = useState<AbaHistorico>("servicos");
  const [servicos, setServicos] = useState<Pedido[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [aceites, setAceites] = useState<SolicitacaoAjuda[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [comentariosPorPedido, setComentariosPorPedido] = useState<
    Record<string, Comentario[]>
  >({});
  const [carregando, setCarregando] = useState(true);
  const [comentarioDetalhado, setComentarioDetalhado] =
    useState<Comentario | null>(null);
  const [erro, setErro] = useState("");

  // busca os dados do usuário p preencher o histórico
  const carregar = useCallback(async () => {
    if (idUsuario === undefined) return;
    setCarregando(true);
    try {
      const [
        servicosRecebidos,
        pedidosRecebidos,
        aceitesRecebidos,
        comentariosRecebidos,
      ] = await Promise.all([
        api.listarAtividades(idUsuario, "PRESTADOR"),
        api.listarAtividades(idUsuario, "SOLICITANTE"),
        api.listarAceites(idUsuario),
        api.listarComentariosAutor(idUsuario),
      ]);
      setServicos(
        servicosRecebidos.filter((pedido) => pedido.status === "CONCLUIDO"),
      );
      setPedidos(pedidosRecebidos);
      setAceites(aceitesRecebidos);
      setComentarios(comentariosRecebidos);
      const pedidosFinalizados = [
        ...servicosRecebidos,
        ...pedidosRecebidos,
      ].filter(
        (pedido, indice, lista) =>
          lista.findIndex((item) => String(item.id) === String(pedido.id)) ===
          indice,
      );
      const comentariosDosPedidos = await Promise.all(
        pedidosFinalizados.map(async (pedido) => {
          try {
            return [
              String(pedido.id),
              await api.listarComentariosPedido(pedido.id),
            ] as const;
          } catch {
            return [String(pedido.id), []] as const;
          }
        }),
      );
      setComentariosPorPedido(Object.fromEntries(comentariosDosPedidos));
    } catch (erroApi) {
      setErro(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível carregar o histórico.",
      );
    } finally {
      setCarregando(false);
    }
  }, [idUsuario]);

  useEffect(() => {
    const timer = window.setTimeout(() => void carregar(), 0);
    return () => window.clearTimeout(timer);
  }, [carregar]);

  // exclui um pedido aberto depois da confirmação
  async function excluirPedido(id: string | number) {
    if (idUsuario === undefined) return;
    if (!window.confirm("Tem certeza que deseja excluir este pedido?")) return;
    try {
      await api.excluirPedido(id, idUsuario);
      await carregar();
    } catch (erroApi) {
      setErro(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível excluir o pedido.",
      );
    }
  }

  // edita o texto de um comentário já criado
  async function editarComentario(comentario: Comentario) {
    const textoAtual = comentario.texto || comentario.comentario || "";
    const texto = window.prompt("Edite seu comentário:", textoAtual);
    if (texto === null || !texto.trim()) return;
    try {
      await api.editarComentario(comentario.id, { texto: texto.trim() });
      await carregar();
    } catch (erroApi) {
      setErro(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível editar o comentário.",
      );
    }
  }

  // busca e abre os detalhes de um comentário
  async function abrirComentario(comentario: Comentario) {
    try {
      setComentarioDetalhado(await api.buscarComentario(comentario.id));
    } catch (erroApi) {
      setErro(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível abrir o comentário.",
      );
    }
  }

  // exclui um comentário após confirmar a ação
  async function excluirComentario(id: string | number) {
    if (idUsuario === undefined) return;
    if (!window.confirm("Excluir este comentário?")) return;
    try {
      await api.excluirComentario(id, idUsuario);
      await carregar();
    } catch (erroApi) {
      setErro(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível excluir o comentário.",
      );
    }
  }

  // desiste de uma candidatura feita p um pedido
  async function desistirAceite(aceite: SolicitacaoAjuda) {
    if (idUsuario === undefined) return;
    if (
      !window.confirm(
        "Desistir desta candidatura? Você não poderá aceitar este mesmo pedido novamente.",
      )
    )
      return;
    try {
      await api.desistirAceite(aceite.id, idUsuario);
      await carregar();
    } catch (erroApi) {
      setErro(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível desistir da candidatura.",
      );
    }
  }

  // encontra o título do pedido pelo id
  function tituloPedido(id: string | number) {
    const pedido = [...servicos, ...pedidos].find(
      (item) => String(item.id) === String(id),
    );
    return pedido?.titulo || `Pedido #${id}`;
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
                  Pedidos nos quais você se ofereceu para ajudar.
                </p>
                {aceites.length ? (
                  <div className="mt-4 space-y-3">
                    {aceites.map((aceite) => (
                      <article
                        key={aceite.id}
                        className="rounded-xl bg-[var(--creme)] p-4"
                      >
                        {aceite.pedidoId ? (
                          <Link
                            to={`/pedido/${aceite.pedidoId}?origem=historico`}
                            className="font-bold text-[var(--azul)] hover:underline"
                          >
                            {nomeAceite(aceite)}
                          </Link>
                        ) : (
                          <h3 className="font-bold text-[var(--azul)]">
                            {nomeAceite(aceite)}
                          </h3>
                        )}
                        <p className="mt-1 text-sm text-gray-600">
                          Status: {aceite.status || "PENDENTE"}
                        </p>
                        {String(aceite.status).toUpperCase() === "PENDENTE" && (
                          <button
                            type="button"
                            onClick={() => void desistirAceite(aceite)}
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
                  Os pagamentos aparecem associados aos pedidos retornados pelo
                  backend.
                </p>
                <div className="mt-4 space-y-3">
                  {[...servicos, ...pedidos]
                    .filter((pedido) => pedido.valor !== undefined)
                    .map((pedido) => (
                      <Link
                        key={`pagamento-${pedido.id}`}
                        to={`/pedido/${pedido.id}?origem=historico`}
                        className="block rounded-xl bg-[var(--creme)] p-3 text-sm text-[var(--azul)] transition hover:bg-[var(--verde)]/10"
                      >
                        <span className="block font-bold">{pedido.titulo}</span>
                        <span className="mt-1 block text-[var(--verde)]">
                          Valor: R$ {pedido.valor?.toFixed(2).replace(".", ",")}
                        </span>
                      </Link>
                    ))}
                </div>
                {![...servicos, ...pedidos].some(
                  (pedido) => pedido.valor !== undefined,
                ) && (
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
                  Meus comentários
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Comentários que você escreveu sobre outras pessoas.
                </p>
                {comentarios.length ? (
                  <div className="mt-4 space-y-3">
                    {comentarios.map((comentario) => (
                      <article
                        key={comentario.id}
                        className="rounded-xl bg-[var(--creme)] p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                              Comentário #{comentario.id}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[var(--azul)]">
                              Sobre: {metaComentario(comentario).pessoa}
                            </p>
                          </div>
                          {comentario.nota !== undefined && (
                            <span className="flex items-center gap-1 text-sm font-bold text-[var(--laranja)]">
                              <FaStar /> {comentario.nota}/5
                            </span>
                          )}
                        </div>
                        <p className="mt-4 rounded-xl bg-white p-3 text-sm leading-relaxed text-[var(--azul)]">
                          “
                          {comentario.texto ||
                            comentario.comentario ||
                            "Sem texto"}
                          ”
                        </p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-gray-500">
                            {metaComentario(comentario).pedidoId
                              ? `Pedido #${metaComentario(comentario).pedidoId}`
                              : "Comentário da sua atividade"}
                            {metaComentario(comentario).data
                              ? ` · ${metaComentario(comentario).data}`
                              : ""}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => void abrirComentario(comentario)}
                              className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[var(--azul)]"
                            >
                              Ver detalhes
                            </button>
                            <button
                              type="button"
                              onClick={() => void editarComentario(comentario)}
                              className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[var(--azul)]"
                            >
                              <FaEdit className="mr-1 inline" />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void excluirComentario(comentario.id)
                              }
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
                    <p className="mt-3 font-bold text-[var(--azul)]">
                      Você ainda não fez comentários.
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Depois de uma ajuda concluída, avalie a experiência por
                      aqui.
                    </p>
                  </div>
                )}
              </section>
              <section
                id="comentarios-por-pedido"
                className={`${aba === "comentariosPedido" ? "" : "hidden"} scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm`}
              >
                <h2 className="flex items-center gap-3 text-lg font-bold text-[var(--azul)]">
                  <FaCommentDots className="text-[var(--verde)]" />
                  Comentários por pedido
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Veja os comentários agrupados em cada ajuda concluída.
                </p>
                {Object.entries(comentariosPorPedido).some(
                  ([, itens]) => itens.length > 0,
                ) ? (
                  <div className="space-y-3">
                    {Object.entries(comentariosPorPedido).map(
                      ([pedidoId, itens]) =>
                        itens.length ? (
                          <div
                            key={pedidoId}
                            className="mt-4 rounded-xl bg-[var(--creme)] p-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                                  Comentários da ajuda
                                </p>
                                <p className="mt-1 font-bold text-[var(--azul)]">
                                  {tituloPedido(pedidoId)}
                                </p>
                              </div>
                              <Link
                                to={`/pedido/${pedidoId}?origem=historico`}
                                className="text-xs font-bold text-[var(--azul)] hover:underline"
                              >
                                Ver pedido →
                              </Link>
                            </div>
                            {itens.map((comentario) => (
                              <div
                                key={comentario.id}
                                className="mt-3 rounded-xl bg-white p-3"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="text-xs text-gray-500">
                                    <span className="font-semibold">
                                      Autor: {metaComentario(comentario).autor}
                                    </span>
                                    <span className="ml-2">
                                      · Para:{" "}
                                      {metaComentario(comentario).pessoa}
                                    </span>
                                  </div>
                                  {comentario.nota !== undefined && (
                                    <span className="flex items-center gap-1 text-xs font-bold text-[var(--laranja)]">
                                      <FaStar /> {comentario.nota}/5
                                    </span>
                                  )}
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-[var(--azul)]">
                                  “
                                  {comentario.texto ||
                                    comentario.comentario ||
                                    "Sem texto"}
                                  ”
                                </p>
                                {metaComentario(comentario).data && (
                                  <p className="mt-2 text-xs text-gray-500">
                                    {metaComentario(comentario).data}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null,
                    )}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl bg-[var(--creme)] p-6 text-center">
                    <FaCommentDots className="mx-auto text-2xl text-[var(--verde)]" />
                    <p className="mt-3 font-bold text-[var(--azul)]">
                      Nenhum comentário por pedido.
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Os comentários das suas ajudas concluídas aparecerão aqui.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
        {comentarioDetalhado && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
            onClick={() => setComentarioDetalhado(null)}
          >
            <section
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[var(--azul)]">
                  Detalhes do comentário
                </h2>
                <button
                  type="button"
                  onClick={() => setComentarioDetalhado(null)}
                  className="font-bold text-[var(--coral)]"
                >
                  Fechar
                </button>
              </div>
              <p className="mt-5 text-sm text-gray-700">
                {comentarioDetalhado.texto || comentarioDetalhado.comentario}
              </p>
              <p className="mt-3 text-xs text-gray-500">
                ID do comentário: {comentarioDetalhado.id}
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
