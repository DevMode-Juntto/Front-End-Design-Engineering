import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  FaArrowRight,
  FaBell,
  FaBoxOpen,
  FaCheck,
  FaHandsHelping,
  FaPlus,
  FaStar,
  FaTag,
  FaTimes,
  FaTrash,
  FaUserCheck,
} from "react-icons/fa";
import { apiIA } from "../../services/apiIA";
import { api, formatarValor, NOMES_STATUS, NOMES_STATUS_CANDIDATURA, obterSessao } from "../../services/api";
import type { Candidatura, Categoria, Notificacao, Pedido } from "../../types/types";

// notificação com os dados do pedido e, quando é uma nova candidatura, os dados do candidato
type NotificacaoCompleta = Notificacao & { pedido?: Pedido; candidatura?: Candidatura };

const DIAS_PARA_AVALIAR = 14;

// some do painel quando foi cancelado ou concluído há mais de 14 dias (prazo para avaliar e confirmar)
function encerrado(pedido: Pedido) {
  if (pedido.status === "CANCELADO") return true;
  if (pedido.status !== "CONCLUIDO") return false;
  const fim = pedido.dtFinal ? new Date(pedido.dtFinal).getTime() : 0;
  return Date.now() - fim > DIAS_PARA_AVALIAR * 24 * 60 * 60 * 1000;
}

// texto do botão de candidatura: em AJUDA a pessoa quer ajudar; em OFERTA quer receber a ajuda
function textoCandidatar(pedido: Pedido) {
  return pedido.tipoPublicacao === "OFERTA" ? "Tenho interesse" : "Quero ajudar";
}

export default function HomePrototipo() {
  const sessao = obterSessao();
  const navegar = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [tags, setTags] = useState<Categoria[]>([]);
  // ranking da IA: id do pedido -> chance (0 a 1) de combinar com o usuário
  const [rankingIA, setRankingIA] = useState<Record<string, number>>({});
  const [solicitados, setSolicitados] = useState<Pedido[]>([]);
  const [aceitos, setAceitos] = useState<Pedido[]>([]);
  // pedido -> minha candidatura ACEITA nele (para desistir e para saber se participo de uma OFERTA)
  const [minhasAceitas, setMinhasAceitas] = useState<Record<string, string>>({});
  const [notificacoes, setNotificacoes] = useState<NotificacaoCompleta[]>([]);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [candidatosAbertos, setCandidatosAbertos] = useState<Record<string, Candidatura[]>>({});
  const [mensagem, setMensagem] = useState("");
  // com categorias escolhidas, começa filtrando por elas; o usuário pode ver todas
  const [soMinhasCategorias, setSoMinhasCategorias] = useState(true);

  const erroTexto = (erroApi: unknown, padrao: string) => (erroApi instanceof Error ? erroApi.message : padrao);

  // busca pedidos, notificações e dados da home
  async function carregar() {
    try {
      const oportunidades = await api.listarPedidos();
      setPedidos(oportunidades);
      if (!sessao?.id) return;
      const [minhasTags, meusPedidos, minhasParticipacoes, minhasCandidaturas, listaNotificacoes] = await Promise.all([
        api.listarTags(sessao.id),
        api.listarAtividades(sessao.id, "SOLICITANTE"),
        api.listarAtividades(sessao.id, "PRESTADOR"),
        api.listarMinhasCandidaturas(sessao.id),
        api.listarNotificacoes(sessao.id),
      ]);
      setTags(minhasTags);
      setSolicitados(meusPedidos.filter((pedido) => !encerrado(pedido)));
      // pedidos em que fui aceito (as candidaturas ainda pendentes ficam no histórico)
      const aceitas: Record<string, string> = {};
      minhasCandidaturas
        .filter((candidatura) => candidatura.status === "ACEITA")
        .forEach((candidatura) => (aceitas[candidatura.idPedido] = candidatura.id));
      setMinhasAceitas(aceitas);
      setAceitos(minhasParticipacoes.filter((pedido) => aceitas[pedido.id] && !encerrado(pedido)));
      // IA: ordena as oportunidades pela chance de o usuário se interessar (se a API de IA estiver no ar)
      apiIA
        .recomendar(
          {
            id: sessao.id,
            tags: minhasTags.map((tag) => tag.id),
            latitude: sessao.latitude,
            longitude: sessao.longitude,
            historicoCategorias: minhasParticipacoes.map((pedido) => pedido.idCategoria),
          },
          oportunidades.filter((pedido) => pedido.idSolicitante !== sessao.id),
        )
        .then((lista) => {
          const ranking: Record<string, number> = {};
          lista.forEach((item) => (ranking[String(item.id)] = item.probabilidade));
          setRankingIA(ranking);
        })
        .catch(() => setRankingIA({}));
      const completas = await Promise.all(
        listaNotificacoes.map(async (notificacao): Promise<NotificacaoCompleta> => {
          const completa: NotificacaoCompleta = { ...notificacao };
          try {
            completa.pedido = await api.buscarPedido(notificacao.idPedido, sessao.id);
          } catch {
            // pedido pode ter sido excluído
          }
          if (notificacao.tipo === "NOVA_CANDIDATURA") {
            try {
              completa.candidatura = await api.buscarCandidatura(notificacao.idCandidatura, sessao.id);
            } catch {
              // candidatura pode não estar mais disponível
            }
          }
          return completa;
        }),
      );
      setNotificacoes(completas);
    } catch {
      setMensagem("Não foi possível carregar todas as informações do painel.");
    }
  }

  useEffect(() => {
    void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao?.id]);

  useEffect(() => {
    const atualizarNotificacoes = () => void carregar();
    window.addEventListener("junttô:notificacoes-atualizadas", atualizarNotificacoes);
    return () => window.removeEventListener("junttô:notificacoes-atualizadas", atualizarNotificacoes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao?.id]);

  // oportunidades: pedidos abertos de outras pessoas, nas categorias do usuário (ou todas, se ele não tiver)
  const oportunidades = useMemo(
    () =>
      pedidos
        .filter((pedido) => pedido.idSolicitante !== sessao?.id)
        .filter(
          (pedido) => !soMinhasCategorias || !tags.length || tags.some((tag) => tag.id === pedido.idCategoria),
        )
        // com a IA no ar, as mais compatíveis vêm primeiro
        .sort((a, b) => (rankingIA[b.id] ?? -1) - (rankingIA[a.id] ?? -1)),
    [pedidos, sessao?.id, tags, rankingIA, soMinhasCategorias],
  );
  // sugestão principal: a melhor da IA (entre todos os pedidos abertos) ou a primeira oportunidade
  const melhorIA = Object.entries(rankingIA).sort((a, b) => b[1] - a[1])[0];
  const recomendadaDisponivel =
    (melhorIA && pedidos.find((pedido) => pedido.id === melhorIA[0] && pedido.status === "ABERTO")) || oportunidades[0];
  const chanceIA = (pedido: Pedido) =>
    rankingIA[pedido.id] != null ? Math.round(rankingIA[pedido.id] * 100) : null;
  const naoLidas = notificacoes.filter((notificacao) => !notificacao.lida).length;

  // envia uma candidatura para o pedido
  async function candidatar(pedido: Pedido) {
    if (!sessao?.id) {
      setMensagem("Faça login para se candidatar.");
      return;
    }
    try {
      await api.candidatar(pedido.id, sessao.id);
      setMensagem(`Candidatura enviada para “${pedido.titulo}”. Aguarde quem publicou aceitar.`);
      await carregar();
    } catch (erroApi) {
      setMensagem(erroTexto(erroApi, "Não foi possível se candidatar."));
    }
  }

  // marca uma notificação como lida
  async function marcarComoLida(notificacao: Notificacao) {
    if (notificacao.lida) return;
    await api.marcarNotificacaoLida(notificacao.id);
    setNotificacoes((anteriores) =>
      anteriores.map((item) => (item.id === notificacao.id ? { ...item, lida: true } : item)),
    );
  }

  // exclui uma notificação escolhida
  async function excluirNotificacao(notificacao: Notificacao) {
    if (!window.confirm("Tem certeza que deseja excluir esta notificação? Essa ação não pode ser desfeita.")) return;
    try {
      await api.excluirNotificacao(notificacao.id);
      setNotificacoes((anteriores) => anteriores.filter((item) => item.id !== notificacao.id));
    } catch (erroApi) {
      setMensagem(erroTexto(erroApi, "Não foi possível excluir a notificação."));
    }
  }

  // limpa todas as notificações depois de confirmar
  async function limparNotificacoes() {
    if (!notificacoes.length) return;
    if (!window.confirm("Tem certeza que deseja excluir todas as notificações? Essa ação não pode ser desfeita.")) return;
    try {
      await Promise.all(notificacoes.map((notificacao) => api.excluirNotificacao(notificacao.id)));
      setNotificacoes([]);
      setNotificacoesAbertas(false);
    } catch (erroApi) {
      setMensagem(erroTexto(erroApi, "Não foi possível limpar as notificações."));
    }
  }

  // dono do pedido aceita ou recusa um candidato
  // AJUDA: aceita um só (o pedido vai para "Em andamento"); OFERTA: pode aceitar vários interessados
  async function responderCandidato(candidatura: Candidatura, status: "ACEITA" | "RECUSADA", ehOferta = false) {
    if (!sessao?.id) return;
    try {
      await api.responderCandidatura(candidatura.id, { usuarioId: sessao.id, status });
      setMensagem(
        status === "ACEITA"
          ? ehOferta
            ? `${candidatura.nomePrestador} foi aceito em “${candidatura.tituloPedido}”. Você pode aceitar outros interessados.`
            : `${candidatura.nomePrestador} foi aceito para “${candidatura.tituloPedido}”. Os outros candidatos continuam na fila.`
          : `Candidatura de ${candidatura.nomePrestador} recusada.`,
      );
      setCandidatosAbertos({});
      await carregar();
    } catch (erroApi) {
      setMensagem(erroTexto(erroApi, "Não foi possível responder a candidatura."));
    }
  }

  // abre ou fecha a lista de candidatos de um pedido meu
  async function alternarCandidatos(pedido: Pedido) {
    if (!sessao?.id) return;
    if (candidatosAbertos[pedido.id]) {
      setCandidatosAbertos(({ [pedido.id]: _removido, ...resto }) => resto);
      return;
    }
    try {
      const lista = await api.listarCandidaturasPedido(pedido.id, sessao.id);
      setCandidatosAbertos((anteriores) => ({ ...anteriores, [pedido.id]: lista }));
    } catch (erroApi) {
      setMensagem(erroTexto(erroApi, "Não foi possível carregar os candidatos."));
    }
  }

  // abre a ação ligada à notificação
  async function abrirNotificacao(notificacao: NotificacaoCompleta) {
    await marcarComoLida(notificacao);
    // pedido concluído: em AJUDA quem ajudou confirma o recebimento; em OFERTA o interessado avalia
    if (notificacao.tipo === "PEDIDO_CONCLUIDO")
      navegar(
        notificacao.pedido?.tipoPublicacao === "OFERTA"
          ? `/finalizacao?pedidoId=${notificacao.idPedido}`
          : `/confirmacao-recebimento?pedidoId=${notificacao.idPedido}`,
      );
    else navegar(`/pedido/${notificacao.idPedido}`);
  }

  // cancela a publicação ou conclui uma OFERTA (a AJUDA é concluída na tela de finalização)
  async function mudarStatus(pedido: Pedido, status: "CONCLUIDO" | "CANCELADO") {
    if (!sessao?.id) return;
    if (status === "CANCELADO" && !window.confirm("Tem certeza que deseja cancelar esta publicação?")) return;
    if (
      status === "CONCLUIDO" &&
      !window.confirm("Concluir a oferta? Quem ainda está pendente será recusado e os aceitos poderão avaliar.")
    )
      return;
    try {
      await api.atualizarStatusPedido(pedido.id, { usuarioId: sessao.id, status });
      await carregar();
    } catch (erroApi) {
      setMensagem(erroTexto(erroApi, "Não foi possível atualizar o andamento."));
    }
  }

  // candidato aceito desiste (não poderá se candidatar de novo)
  async function desistir(pedido: Pedido) {
    const idCandidatura = minhasAceitas[pedido.id];
    if (!sessao?.id || !idCandidatura) return;
    if (!window.confirm("Ao desistir, você não poderá se candidatar a este pedido de novo. Deseja continuar?")) return;
    try {
      await api.desistirCandidatura(idCandidatura, sessao.id);
      setMensagem("Você desistiu desta ajuda.");
      await carregar();
    } catch (erroApi) {
      setMensagem(erroTexto(erroApi, "Não foi possível desistir."));
    }
  }

  // exclui um pedido publicado ainda aberto
  async function excluirPedidoPublicado(id: string) {
    if (!sessao?.id) return;
    if (!window.confirm("Tem certeza que deseja excluir esta publicação? Ela deixará de aparecer para outras pessoas."))
      return;
    try {
      await api.excluirPedido(id, sessao.id);
      setMensagem("Publicação excluída.");
      await carregar();
    } catch (erroApi) {
      setMensagem(erroTexto(erroApi, "Não foi possível excluir a publicação."));
    }
  }

  // botão principal do card conforme o papel (ajudante x quem recebe) e o status
  function acaoPrincipal(pedido: Pedido) {
    const eu = sessao?.id;
    const ehOferta = pedido.tipoPublicacao === "OFERTA";
    const souDono = pedido.idSolicitante === eu;
    const souAjudante = pedido.idAjudante === eu;
    const botao = (texto: string, aoClicar: () => void, cor = "bg-[var(--verde)]") => (
      <button type="button" onClick={aoClicar} className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${cor}`}>
        {texto}
      </button>
    );
    const confirmacao = () => navegar(`/confirmacao-recebimento?pedidoId=${pedido.id}`);
    const finalizacao = () => navegar(`/finalizacao?pedidoId=${pedido.id}`);

    if (pedido.status === "ABERTO" && souDono)
      return botao("Ver candidatos", () => void alternarCandidatos(pedido), "bg-[var(--azul)]");
    if (ehOferta) {
      if (souDono && pedido.status === "CONCLUIDO") return botao("Pagamentos e avaliações", confirmacao);
      if (!souDono && pedido.status === "CONCLUIDO") return botao("Avaliar", finalizacao, "bg-[var(--laranja)]");
      return null;
    }
    // AJUDA
    if (pedido.status === "EM_ANDAMENTO" && souDono)
      return botao("Finalizar ajuda", finalizacao, "bg-[var(--laranja)]");
    if (pedido.status === "CONCLUIDO" && souAjudante) {
      const recompensaPendente = pedido.naoIncluirPagamento && !!pedido.recompensa && !pedido.dtRecompensa;
      return botao(
        pedido.statusPagamento === "PENDENTE" || recompensaPendente ? "Confirmar recebimento" : "Avaliar",
        confirmacao,
      );
    }
    if (pedido.status === "CONCLUIDO" && souDono) return botao("Avaliar", finalizacao, "bg-[var(--laranja)]");
    return null;
  }

  // monta o card de ajuda em andamento
  function cardProcesso(pedido: Pedido, papel: "SOLICITANTE" | "PRESTADOR") {
    const souDono = papel === "SOLICITANTE";
    const souAjudante = pedido.idAjudante === sessao?.id;
    const candidatos = candidatosAbertos[pedido.id];
    return (
      <article
        key={`${papel}-${pedido.id}`}
        className={`rounded-2xl border-l-4 bg-white p-5 shadow-sm ${souDono ? "border-[var(--laranja)]" : "border-[var(--verde)]"}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${souAjudante ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}
            >
              {souDono && pedido.status === "ABERTO"
                ? pedido.tipoPublicacao === "OFERTA"
                  ? `Você ofereceu${pedido.totalAceitas ? ` · ${pedido.totalAceitas} aceito(s)` : ""}`
                  : "Você pediu ajuda"
                : souAjudante
                  ? "Você está ajudando"
                  : "Você está recebendo ajuda"}
            </span>
            <Link to={`/pedido/${pedido.id}`} className="mt-3 block font-bold text-[var(--azul)] hover:underline">
              {pedido.titulo}
            </Link>
            <p className="mt-1 text-sm text-gray-600">
              <span className="mr-2 inline-block size-2 rounded-full bg-green-500" />
              {NOMES_STATUS[pedido.status] || pedido.status} · {formatarValor(pedido)}
            </p>
          </div>
          {acaoPrincipal(pedido)}
        </div>

        {candidatos && (
          <div className="mt-4 space-y-2 rounded-xl bg-[var(--creme)] p-3">
            {candidatos.length ? (
              candidatos.map((candidatura) => (
                <div key={candidatura.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-3">
                  <div>
                    <Link to={`/perfil/${candidatura.idPrestador}`} className="font-semibold text-[var(--azul)] hover:underline">
                      {candidatura.nomePrestador}
                    </Link>
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <FaStar className="text-[var(--laranja)]" />
                      {candidatura.mediaEstrelasPrestador != null
                        ? `${candidatura.mediaEstrelasPrestador.toFixed(1)} (${candidatura.totalAvaliacoesPrestador})`
                        : "Sem avaliações"}{" "}
                      · {NOMES_STATUS_CANDIDATURA[candidatura.status] || candidatura.status}
                      {candidatura.emailPrestador ? ` · ${candidatura.emailPrestador}` : ""}
                    </p>
                  </div>
                  {candidatura.status === "PENDENTE" && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          void responderCandidato(candidatura, "ACEITA", pedido.tipoPublicacao === "OFERTA")
                        }
                        className="rounded-lg bg-[var(--verde)] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        Aceitar
                      </button>
                      <button
                        type="button"
                        onClick={() => void responderCandidato(candidatura, "RECUSADA")}
                        className="rounded-lg border border-[var(--coral)] px-3 py-1.5 text-xs font-bold text-[var(--coral)]"
                      >
                        Recusar
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Ainda não há candidatos.</p>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {souDono && pedido.tipoPublicacao === "OFERTA" && pedido.status === "ABERTO" && !!pedido.totalAceitas && (
            <>
              <button
                type="button"
                onClick={() => void mudarStatus(pedido, "CONCLUIDO")}
                className="rounded-lg bg-[var(--verde)] px-3 py-2 text-xs font-bold text-white"
              >
                Concluir oferta
              </button>
              <button
                type="button"
                onClick={() => navegar(`/confirmacao-recebimento?pedidoId=${pedido.id}`)}
                className="rounded-lg border border-[var(--verde)] px-3 py-2 text-xs font-bold text-[var(--verde)]"
              >
                Confirmar pagamentos
              </button>
            </>
          )}
          {souDono && pedido.status === "ABERTO" && !pedido.totalAceitas && (
            <button
              type="button"
              onClick={() => void excluirPedidoPublicado(pedido.id)}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--coral)] px-3 py-2 text-xs font-bold text-[var(--coral)] transition hover:bg-red-50"
            >
              <FaTrash /> Excluir publicação
            </button>
          )}
          {souDono && (pedido.status === "ABERTO" || pedido.status === "EM_ANDAMENTO") && (
            <button
              type="button"
              onClick={() => void mudarStatus(pedido, "CANCELADO")}
              className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}
          {!souDono && minhasAceitas[pedido.id] && (pedido.status === "ABERTO" || pedido.status === "EM_ANDAMENTO") && (
            <button
              type="button"
              onClick={() => void desistir(pedido)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
            >
              Desistir
            </button>
          )}
        </div>
      </article>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="relative mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--verde)]">
              Início · Protótipo de ajudas
            </p>
            <h1 className="mt-1 text-3xl font-bold text-[var(--azul)] sm:text-5xl">
              Olá, {sessao?.nome?.split(" ")[0] || "vizinho"}!
              <br />O que você precisa hoje?
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setNotificacoesAbertas(true)}
            aria-label="Abrir notificações"
            className="relative flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[var(--azul)] shadow-sm transition hover:shadow-md"
          >
            <FaBell />
            <span className="hidden sm:inline">Notificações</span>
            <span className="flex size-10 items-center justify-center rounded-full bg-[var(--azul)] font-bold text-white">
              {sessao?.nome?.charAt(0).toUpperCase() || "U"}
            </span>
            {naoLidas > 0 && (
              <span className="absolute right-1 top-0 flex size-5 items-center justify-center rounded-full bg-[var(--coral)] text-xs text-white">
                {naoLidas}
              </span>
            )}
          </button>
        </header>
        {notificacoesAbertas && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 py-16"
            onClick={() => setNotificacoesAbertas(false)}
          >
            <section
              className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[var(--azul)]">
                    Notificações
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Solicitações e atualizações das suas ajudas
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void limparNotificacoes()}
                    aria-label="Limpar notificações"
                    className="rounded-lg p-2 text-[var(--coral)] hover:bg-red-50"
                  >
                    <FaTrash />
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificacoesAbertas(false)}
                    aria-label="Fechar notificações"
                    className="rounded-lg p-2 text-[var(--azul)] hover:bg-gray-100"
                  >
                    <FaTimes />
                  </button>
                </div>
              </header>
              <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
                {notificacoes.length ? (
                  notificacoes.map((notificacao) => {
                    const candidatura = notificacao.candidatura;
                    const pedidoId = notificacao.idPedido;
                    const podeResponder =
                      candidatura?.status === "PENDENTE" && notificacao.pedido?.status === "ABERTO";
                    return candidatura ? (
                      <article
                        key={notificacao.id}
                        className={`rounded-xl p-4 ${notificacao.lida ? "bg-gray-50" : "bg-[var(--verde)]/10"}`}
                      >
                        <div className="flex items-start gap-3">
                          <FaUserCheck className="mt-1 shrink-0 text-[var(--verde)]" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-[var(--azul)]">
                              {candidatura.nomePrestador} se candidatou
                            </p>
                            <p className="mt-1 text-xs font-bold text-[var(--laranja)]">
                              Ajuda:{" "}
                              {notificacao.pedido?.titulo ||
                                `Pedido #${pedidoId}`}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              {notificacao.mensagem} · Situação: {NOMES_STATUS_CANDIDATURA[candidatura.status] || candidatura.status}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Link
                                to={`/perfil/${candidatura.idPrestador}`}
                                onClick={() => void marcarComoLida(notificacao)}
                                className="rounded-lg border border-[var(--azul)] px-3 py-2 text-sm font-semibold text-[var(--azul)]"
                              >
                                Ver perfil
                              </Link>
                              {podeResponder && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      void marcarComoLida(notificacao);
                                      void responderCandidato(
                                        candidatura,
                                        "ACEITA",
                                        notificacao.pedido?.tipoPublicacao === "OFERTA",
                                      );
                                    }}
                                    className="rounded-lg bg-[var(--verde)] px-3 py-2 text-sm font-semibold text-white"
                                  >
                                    Aceitar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      void marcarComoLida(notificacao);
                                      void responderCandidato(candidatura, "RECUSADA");
                                    }}
                                    className="rounded-lg border border-[var(--coral)] px-3 py-2 text-sm font-semibold text-[var(--coral)]"
                                  >
                                    Recusar
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          {notificacao.lida && (
                            <FaCheck className="mt-1 shrink-0 text-[var(--verde)]" />
                          )}
                          <button
                            type="button"
                            onClick={() => void excluirNotificacao(notificacao)}
                            aria-label="Excluir notificação"
                            className="ml-auto shrink-0 rounded-lg p-2 text-[var(--coral)] hover:bg-red-50"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </article>
                    ) : (
                      <div
                        key={notificacao.id}
                        className={`flex items-start gap-2 rounded-xl p-4 ${notificacao.lida ? "bg-gray-50" : "bg-[var(--verde)]/10 font-semibold"}`}
                      >
                        <button
                          type="button"
                          onClick={() => void abrirNotificacao(notificacao)}
                          className="flex min-w-0 flex-1 items-start gap-3 text-left"
                        >
                          <FaBell className="mt-1 shrink-0 text-[var(--verde)]" />
                          <span>
                            <strong className="block text-[var(--laranja)]">
                              Ajuda: {notificacao.pedido?.titulo || `Pedido #${notificacao.idPedido}`}
                            </strong>
                            <span className="mt-1 block">{notificacao.mensagem}</span>
                          </span>
                          {notificacao.lida && (
                            <FaCheck className="ml-auto mt-1 shrink-0 text-[var(--verde)]" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => void excluirNotificacao(notificacao)}
                          aria-label="Excluir notificação"
                          className="shrink-0 rounded-lg p-2 text-[var(--coral)] hover:bg-red-50"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="py-8 text-center text-sm text-gray-500">
                    Você não tem notificações.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
        <section className="mb-6 rounded-2xl border border-[var(--azul)]/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[var(--azul)]">Como funciona?</p>
          <div className="mt-3 grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
            <p>
              <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-[var(--laranja)] text-xs font-bold text-white">
                1
              </span>
              Publique um pedido ou encontre uma oportunidade.
            </p>
            <p>
              <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-[var(--verde)] text-xs font-bold text-white">
                2
              </span>
              Combine a ajuda e acompanhe o andamento.
            </p>
            <p>
              <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-[var(--azul)] text-xs font-bold text-white">
                3
              </span>
              Finalize o pagamento e avalie a experiência.
            </p>
          </div>
        </section>
        <section className="grid gap-5 md:grid-cols-2">
          <Link
            to="/publicar-pedido"
            className="flex min-h-36 items-center justify-between rounded-3xl bg-[var(--laranja)] p-7 text-white shadow-md"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-white/75">
                Preciso de ajuda
              </p>
              <h2 className="mt-1 text-2xl font-bold">Nova publicação</h2>
              <p className="mt-2 text-sm">
                Peça uma ajuda ou ofereça ajuda para a vizinhança
              </p>
            </div>
            <FaPlus className="text-6xl" />
          </Link>
          <a
            href="#oportunidades"
            className="flex min-h-36 items-center justify-between rounded-3xl bg-[var(--azul)] p-7 text-white shadow-md"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-white/75">
                Quero ajudar
              </p>
              <h2 className="mt-1 text-2xl font-bold">Quero ajudar</h2>
              <p className="mt-2 text-sm">Encontre oportunidades disponíveis</p>
            </div>
            <FaHandsHelping className="text-6xl" />
          </a>
        </section>
        {mensagem && (
          <div
            role="status"
            aria-live="polite"
            className="fixed left-1/2 top-5 z-40 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center justify-between gap-4 rounded-2xl border border-[var(--verde)]/20 bg-white px-5 py-4 text-sm font-semibold text-[var(--azul)] shadow-xl"
          >
            <span>{mensagem}</span>
            <button
              type="button"
              onClick={() => setMensagem("")}
              aria-label="Fechar aviso"
              className="shrink-0 rounded-lg p-1 text-[var(--azul)] hover:bg-gray-100"
            >
              <FaTimes />
            </button>
          </div>
        )}
        <section className="mt-10 rounded-3xl border border-[var(--azul)]/10 bg-[var(--creme)] p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-xl font-bold text-[var(--azul)]">
              <span className="flex size-8 items-center justify-center rounded-full bg-[var(--laranja)] text-sm text-white">
                1
              </span>
              <FaHandsHelping className="text-[var(--laranja)]" />
              Sugestão para você
            </h2>
            <a
              href="#oportunidades"
              className="flex items-center gap-2 text-sm font-bold"
            >
              Ver todas <FaArrowRight />
            </a>
          </div>
          {recomendadaDisponivel ? (
            <article className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <FaBoxOpen className="text-4xl text-[var(--azul)]" />
                <div>
                  <Link
                    to={`/pedido/${recomendadaDisponivel.id}`}
                    className="text-lg font-bold text-[var(--azul)] hover:underline"
                  >
                    {recomendadaDisponivel.titulo}
                  </Link>
                  <p className="text-sm text-gray-600">
                    {formatarValor(recomendadaDisponivel)} ·{" "}
                    {recomendadaDisponivel.tipoPublicacao === "OFERTA" ? "Oferta de ajuda" : "Pedido de ajuda"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Categoria: {recomendadaDisponivel.nomeCategoria} · Publicado por:{" "}
                    {recomendadaDisponivel.nomeSolicitante}
                  </p>
                  {chanceIA(recomendadaDisponivel) != null && (
                    <p className="mt-2 inline-block rounded-full bg-[var(--verde)] px-3 py-1 text-xs font-bold text-white">
                      ✨ Recomendado pela IA · {chanceIA(recomendadaDisponivel)}% de compatibilidade
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void candidatar(recomendadaDisponivel)}
                className="rounded-xl bg-[var(--laranja)] px-5 py-3 font-bold text-white"
              >
                {textoCandidatar(recomendadaDisponivel)}
              </button>
            </article>
          ) : (
            <p className="rounded-2xl bg-white p-5 text-sm text-gray-500">
              Nenhuma oportunidade disponível.
            </p>
          )}
        </section>
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-xl font-bold text-[var(--azul)]">
              <FaTag className="text-[var(--laranja)]" />
              Minhas categorias
            </h2>
            <Link to="/perfil" className="text-sm font-bold">
              Editar categorias
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.length ? (
              tags.map((tag) => (
                <span key={tag.id} className="rounded-full bg-[var(--creme)] px-4 py-2 text-sm font-semibold">
                  {tag.nome}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                Sem categorias escolhidas: mostrando todas as oportunidades.
              </p>
            )}
          </div>
        </section>
        <section className="mt-10 rounded-3xl border border-[var(--azul)]/10 bg-[var(--creme)] p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--azul)]">
                <span className="mr-2 inline-flex size-8 items-center justify-center rounded-full bg-[var(--verde)] text-sm text-white">
                  2
                </span>
                Ajudas em processo
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Acompanhe o que você pediu e o que está realizando.
              </p>
            </div>
            <Link
              to="/historico"
              className="flex items-center gap-2 text-sm font-bold"
            >
              Ver histórico <FaArrowRight />
            </Link>
          </div>
          {solicitados.length || aceitos.length ? (
            <div className="space-y-6">
              {solicitados.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--laranja)]">
                    Pedidos que publiquei
                  </h3>
                  <div className="space-y-3">
                    {solicitados.map((pedido) =>
                      cardProcesso(pedido, "SOLICITANTE"),
                    )}
                  </div>
                </div>
              )}
              {aceitos.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--verde)]">
                    Ajudas em que fui escolhido
                  </h3>
                  <div className="space-y-3">
                    {aceitos.map((pedido) => cardProcesso(pedido, "PRESTADOR"))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="rounded-2xl bg-white p-5 text-sm text-gray-500">
              Nenhuma ajuda em processo.
            </p>
          )}
        </section>
        <section
          id="oportunidades"
          className="mt-10 scroll-mt-6 rounded-3xl border border-[var(--azul)]/10 bg-[var(--creme)] p-5 sm:p-6"
        >
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-[var(--azul)]">
                <span className="mr-2 inline-flex size-8 items-center justify-center rounded-full bg-[var(--azul)] text-sm text-white">
                  3
                </span>
                Oportunidades disponíveis
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {tags.length && soMinhasCategorias
                  ? "Publicações abertas nas categorias que você escolheu."
                  : tags.length
                    ? "Todas as publicações abertas de outras pessoas."
                    : "Publicações abertas de outras pessoas. Escolha categorias no perfil para receber sugestões mais específicas."}
                {Object.keys(rankingIA).length > 0 && " A IA coloca as mais compatíveis com você primeiro."}
              </p>
              {tags.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSoMinhasCategorias((atual) => !atual)}
                  className="mt-2 text-sm font-bold text-[var(--verde)] hover:underline"
                >
                  {soMinhasCategorias ? "Ver todas as categorias" : "Ver só as minhas categorias"}
                </button>
              )}
            </div>
            <span className="rounded-full bg-[var(--azul)] px-3 py-1 text-sm font-bold text-white">
              {oportunidades.length}{" "}
              {oportunidades.length === 1 ? "oportunidade" : "oportunidades"}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {oportunidades.map((pedido) => (
              <article
                key={pedido.id}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <Link
                  to={`/pedido/${pedido.id}`}
                  className="text-lg font-bold text-[var(--azul)] hover:underline"
                >
                  {pedido.titulo}
                </Link>
                <p className="mt-2 text-sm text-gray-600">{pedido.descricao}</p>
                <p className="mt-4 text-sm font-semibold text-[var(--verde)]">
                  {formatarValor(pedido)} · {pedido.nomeCategoria} ·{" "}
                  {pedido.tipoPublicacao === "OFERTA" ? "Oferta" : "Pedido de ajuda"}
                </p>
                {chanceIA(pedido) != null && (
                  <p className="mt-2 inline-block rounded-full bg-[var(--creme)] px-3 py-1 text-xs font-bold text-[var(--verde)]">
                    ✨ IA: {chanceIA(pedido)}% de compatibilidade
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/pedido/${pedido.id}`}
                    className="rounded-xl border border-[var(--azul)] px-4 py-2 text-sm font-bold text-[var(--azul)] hover:bg-[var(--azul)] hover:text-white"
                  >
                    Ver detalhes do pedido
                  </Link>
                  <button
                    type="button"
                    onClick={() => void candidatar(pedido)}
                    className="rounded-xl bg-[var(--laranja)] px-4 py-2 text-sm font-bold text-white"
                  >
                    {textoCandidatar(pedido)}
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!oportunidades.length && (
            <p className="rounded-2xl bg-white p-5 text-sm text-gray-500">
              {tags.length && soMinhasCategorias
                ? "Nenhuma oportunidade nas suas categorias no momento. Toque em “Ver todas as categorias” para ver as demais."
                : "Nenhuma oportunidade aberta no momento."}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
