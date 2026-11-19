import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  FaArrowRight,
  FaBell,
  FaBoxOpen,
  FaCheck,
  FaHandsHelping,
  FaPlus,
  FaTag,
  FaTimes,
  FaTrash,
  FaUserCheck,
} from "react-icons/fa";
import { api, obterSessao } from "../../services/api";
import type { Categoria, Notificacao, Pedido } from "../../types/types";

// encontra a categoria usada pelo pedido
function categoria(pedido: Pedido, categorias: Categoria[] = []) {
  if (typeof pedido.categoria === "string") return pedido.categoria;
  if (pedido.categoria && typeof pedido.categoria === "object")
    return pedido.categoria.nome;
  const categoriaEncontrada = categorias.find(
    (item) => String(item.id) === String(pedido.categoriaId),
  );
  if (categoriaEncontrada) return categoriaEncontrada.nome;
  return "Outros";
}

// formata o valor do pedido
function valor(pedido: Pedido) {
  return pedido.valor === undefined
    ? "Valor a combinar"
    : `R$ ${pedido.valor.toFixed(2).replace(".", ",")}`;
}

// mostra o status do pedido de forma simples
function nomeStatus(status?: string) {
  const nomes: Record<string, string> = {
    ABERTO: "Aguardando prestador",
    ESCOLHIDO: "Prestador escolhido",
    ACEITO: "Prestador escolhido",
    EM_ANDAMENTO: "Ajuda em andamento",
    AGUARDANDO_CONFIRMACAO: "Aguardando confirmação",
    CONCLUIDO: "Serviço concluído",
    FINALIZADO: "Ajuda finalizada",
    CANCELADO: "Ajuda cancelada",
  };
  return nomes[String(status || "").toUpperCase()] || "Em andamento";
}

// confere se o pedido foi feito pelo usuário
function ehPedidoDoUsuario(pedido: Pedido, usuarioId?: string | number) {
  if (usuarioId === undefined) return false;
  const pedidoComCamposExtras = pedido as Pedido & {
    solicitanteId?: string | number;
    usuarioId?: string | number;
    donoId?: string | number;
  };
  const solicitanteId =
    pedido.solicitante?.id ??
    pedidoComCamposExtras.solicitanteId ??
    pedidoComCamposExtras.usuarioId ??
    pedidoComCamposExtras.donoId;
  return (
    solicitanteId !== undefined && String(solicitanteId) === String(usuarioId)
  );
}

// confere se o pedido combina com as categorias
function pertenceAsCategorias(
  pedido: Pedido,
  tags: string[],
  categorias: Categoria[],
) {
  if (!tags.length) return true;
  const nomeCategoria = categoria(pedido, categorias).toLowerCase();
  const idCategoria = String(pedido.categoriaId ?? "");
  return tags.some(
    (tag) =>
      String(tag) === idCategoria ||
      nomeCategoria.includes(String(tag).toLowerCase()) ||
      String(tag).toLowerCase().includes(nomeCategoria),
  );
}

// pega os dados da pessoa que se candidatou
function dadosCandidato(notificacao: Notificacao) {
  const candidato = notificacao.prestador || notificacao.usuario;
  const id =
    candidato?.id ||
    notificacao.prestadorId ||
    notificacao.usuarioId ||
    notificacao.remetenteId;
  const nome =
    candidato?.nome ||
    String(
      notificacao.nomePrestador ||
        notificacao.nomeUsuario ||
        "Pessoa interessada",
    );
  return { id, nome };
}

// confere se a notificação é de candidatura
function ehCandidato(notificacao: Notificacao) {
  if (notificacao.tipo)
    return ["NOVA_SOLICITACAO", "NOVA_CANDIDATURA"].includes(
      notificacao.tipo.toUpperCase(),
    );
  const texto =
    `${notificacao.tipo || ""} ${notificacao.mensagem || ""}`.toLowerCase();
  if (
    texto.includes("pagamento") ||
    texto.includes("sua solicitação foi aceita") ||
    texto.includes("sua solicitacao foi aceita") ||
    texto.includes("nova conversa") ||
    texto.includes("+1")
  )
    return false;
  return (
    texto.includes("aceitou") ||
    texto.includes("quer ajudar") ||
    texto.includes("se ofereceu") ||
    texto.includes("prestador")
  );
}

// filtra as candidaturas ainda disponíveis
async function notificacoesDeCandidatosAtuais(
  lista: Notificacao[],
  usuarioId: string | number,
) {
  const pedidosComCandidatos = [
    ...new Set(
      lista
        .filter(ehCandidato)
        .map((notificacao) => notificacao.pedidoId || notificacao.pedido?.id)
        .filter((id): id is string | number => id !== undefined),
    ),
  ];
  const escolhidos = new Map<string, string>();
  await Promise.all(
    pedidosComCandidatos.map(async (pedidoId) => {
      try {
        const pedido = await api.buscarPedido(pedidoId);
        if (pedido.tipoPublicacao === "OFERTA") return;
        const solicitacaoAceita = (
          await api.listarSolicitacoesPedido(pedidoId, usuarioId)
        ).find((item) =>
          ["ACEITA", "ESCOLHIDO"].includes(String(item.status).toUpperCase()),
        );
        if (solicitacaoAceita)
          escolhidos.set(String(pedidoId), String(solicitacaoAceita.id));
      } catch {
        // mantém as notificações caso o endpoint de solicitações não esteja disponível
      }
    }),
  );
  return lista.filter((notificacao) => {
    if (!ehCandidato(notificacao)) return true;
    const pedidoId = notificacao.pedidoId || notificacao.pedido?.id;
    const solicitacaoAceita =
      pedidoId === undefined ? undefined : escolhidos.get(String(pedidoId));
    return (
      !solicitacaoAceita ||
      String(notificacao.solicitacaoId) === solicitacaoAceita
    );
  });
}

// reúne as áreas e ações da home de protótipo
export default function HomePrototipo() {
  const sessao = obterSessao();
  const navegar = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [solicitados, setSolicitados] = useState<Pedido[]>([]);
  const [aceitos, setAceitos] = useState<Pedido[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [candidatosEscolhidos, setCandidatosEscolhidos] = useState<
    Record<string, string | number>
  >({});
  const [mensagem, setMensagem] = useState("");

  // busca pedidos, notificações e dados da home
  const carregar = useCallback(async () => {
    let oportunidades: Pedido[] = [];
    try {
      oportunidades = await api.listarPedidos();
      setPedidos(oportunidades);
    } catch {
      setPedidos([]);
      setMensagem("Não foi possível carregar as oportunidades agora.");
    }
    if (!sessao?.id) return;

    const resultados = await Promise.allSettled([
      api.listarTags(sessao.id),
      api.listarCategorias(),
      api.listarAtividades(sessao.id, "SOLICITANTE"),
      api.listarAtividades(sessao.id, "PRESTADOR"),
      api.listarNotificacoes(sessao.id),
    ]);
    const [
      resultadoTags,
      resultadoCategorias,
      resultadoSolicitados,
      resultadoAceitos,
      resultadoNotificacoes,
    ] = resultados;
    const minhasTags =
      resultadoTags.status === "fulfilled" ? resultadoTags.value : [];
    const listaCategorias =
      resultadoCategorias.status === "fulfilled"
        ? resultadoCategorias.value
        : [];
    const pedidosSolicitados =
      resultadoSolicitados.status === "fulfilled"
        ? resultadoSolicitados.value
        : [];
    const pedidosAceitos =
      resultadoAceitos.status === "fulfilled" ? resultadoAceitos.value : [];
    const listaNotificacoes =
      resultadoNotificacoes.status === "fulfilled"
        ? resultadoNotificacoes.value
        : [];
    setTags(minhasTags);
    setCategorias(listaCategorias);
    setSolicitados(
      pedidosSolicitados.filter(
        (pedido) =>
          pedido.status !== "CONCLUIDO" &&
          pedido.status !== "FINALIZADO" &&
          pedido.status !== "CANCELADO",
      ),
    );
    setAceitos(
      pedidosAceitos.filter(
        (pedido) =>
          pedido.status !== "CONCLUIDO" &&
          pedido.status !== "FINALIZADO" &&
          pedido.status !== "CANCELADO",
      ),
    );
    const notificacoesAtuais = await notificacoesDeCandidatosAtuais(
      listaNotificacoes,
      sessao.id,
    );
    try {
      const notificacoesComPedido = await Promise.all(
        notificacoesAtuais.map(async (notificacao) => {
          const pedidoId = notificacao.pedidoId || notificacao.pedido?.id;
          const candidaturaId = notificacao.solicitacaoId;
          let atualizada = notificacao;
          if (pedidoId !== undefined && candidaturaId !== undefined) {
            try {
              const candidatura = await api.buscarSolicitacaoPedido(
                pedidoId,
                candidaturaId,
                sessao.id,
              );
              atualizada = {
                ...atualizada,
                prestadorId: candidatura.prestadorId,
                prestador: candidatura.prestador,
              };
            } catch {
              // mantém a notificação mesmo se os dados da candidatura falharem
            }
          }
          if (pedidoId === undefined || atualizada.pedido?.titulo)
            return atualizada;
          try {
            return {
              ...atualizada,
              pedido: await api.buscarPedido(pedidoId),
            };
          } catch {
            return atualizada;
          }
        }),
      );
      setNotificacoes(notificacoesComPedido);
    } catch {
      setNotificacoes(notificacoesAtuais);
    }
  }, [sessao?.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => void carregar(), 0);
    return () => window.clearTimeout(timer);
  }, [carregar]);

  useEffect(() => {
    const atualizarNotificacoes = () => void carregar();
    window.addEventListener(
      "junttô:notificacoes-atualizadas",
      atualizarNotificacoes,
    );
    return () =>
      window.removeEventListener(
        "junttô:notificacoes-atualizadas",
        atualizarNotificacoes,
      );
  }, [carregar]);

  const oportunidades = useMemo(
    () =>
      pedidos
        .filter((pedido) => !ehPedidoDoUsuario(pedido, sessao?.id))
        .filter((pedido) => pertenceAsCategorias(pedido, tags, categorias)),
    [pedidos, sessao?.id, tags, categorias],
  );
  const recomendadaDisponivel = oportunidades[0];
  const naoLidas = notificacoes.filter(
    (notificacao) => !notificacao.lida,
  ).length;

  // envia uma candidatura para o pedido
  async function aceitar(id: string | number) {
    try {
      if (!sessao?.id) {
        setMensagem("Faça login para aceitar uma oportunidade de ajuda.");
        return;
      }
      const pedido = await api.buscarPedido(id);
      if (ehPedidoDoUsuario(pedido, sessao?.id)) {
        setMensagem("Você não pode aceitar o próprio pedido de ajuda.");
        return;
      }
      await api.aceitarPedido(
        id,
        sessao.id,
        "Tenho interesse em realizar esta ajuda.",
      );
      setMensagem(
        `Solicitação enviada para a ajuda “${pedido.titulo}”. Aguarde o solicitante escolher o prestador.`,
      );
      await carregar();
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível aceitar esta oportunidade.",
      );
    }
  }

  // marca uma notificação como lida
  async function marcarComoLida(notificacao: Notificacao) {
    if (notificacao.lida) return;
    await api.marcarNotificacaoLida(notificacao.id);
    setNotificacoes((anteriores) =>
      anteriores.map((item) =>
        item.id === notificacao.id ? { ...item, lida: true } : item,
      ),
    );
  }

  // exclui uma notificação escolhida
  async function excluirNotificacao(notificacao: Notificacao) {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir esta notificação? Essa ação não pode ser desfeita.",
      )
    )
      return;
    try {
      await api.excluirNotificacao(notificacao.id);
      setNotificacoes((anteriores) =>
        anteriores.filter((item) => item.id !== notificacao.id),
      );
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível excluir a notificação.",
      );
    }
  }

  // limpa todas as notificações depois de confirmar
  async function limparNotificacoes() {
    if (!notificacoes.length) return;
    if (
      !window.confirm(
        "Tem certeza que deseja excluir todas as notificações? Essa ação não pode ser desfeita.",
      )
    )
      return;
    try {
      await Promise.all(
        notificacoes.map((notificacao) =>
          api.excluirNotificacao(notificacao.id),
        ),
      );
      setNotificacoes([]);
      setNotificacoesAbertas(false);
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível limpar as notificações.",
      );
    }
  }

  // escolhe quem vai realizar a ajuda
  async function escolherCandidato(notificacao: Notificacao) {
    const pedidoId = notificacao.pedidoId || notificacao.pedido?.id;
    const nomePedido =
      notificacao.pedido?.titulo || `Pedido #${pedidoId ?? "não identificado"}`;
    const candidato = dadosCandidato(notificacao);
    if (pedidoId === undefined || candidato.id === undefined) {
      setMensagem(
        "Não foi possível identificar o pedido e o prestador desta solicitação.",
      );
      return;
    }
    if (!sessao?.id) {
      setMensagem("Faça login para escolher um prestador.");
      return;
    }
    try {
      const solicitacoes = await api.listarSolicitacoesPedido(
        pedidoId,
        sessao.id,
      );
      const pedido = await api.buscarPedido(pedidoId);
      const outraSolicitacaoAceita = solicitacoes.find(
        (item) =>
          String(item.status).toUpperCase() === "ACEITA" &&
          String(item.id) !== String(notificacao.solicitacaoId),
      );
      if (pedido.tipoPublicacao !== "OFERTA" && outraSolicitacaoAceita) {
        setMensagem("Você já escolheu um prestador para esta ajuda.");
        return;
      }
      const solicitacaoId =
        notificacao.solicitacaoId ||
        solicitacoes.find(
          (item) =>
            String(item.prestadorId || item.prestador?.id) ===
            String(candidato.id),
        )?.id;
      if (solicitacaoId === undefined) {
        setMensagem(
          "Não foi possível identificar a solicitação deste prestador.",
        );
        return;
      }
      await api.buscarSolicitacaoPedido(pedidoId, solicitacaoId, sessao.id);
      await api.atualizarSolicitacaoPedido(pedidoId, solicitacaoId, {
        usuarioId: sessao.id,
        status: "ACEITA",
        observacao: "Prestador escolhido pelo solicitante.",
      });
      await marcarComoLida(notificacao);
      setCandidatosEscolhidos((anteriores) => ({
        ...anteriores,
        [String(pedidoId)]: candidato.id as string | number,
      }));
      if (pedido.tipoPublicacao !== "OFERTA") {
        setNotificacoes((anteriores) =>
          anteriores.filter(
            (item) =>
              !ehCandidato(item) ||
              String(item.pedidoId || item.pedido?.id) !== String(pedidoId) ||
              item.id === notificacao.id,
          ),
        );
      }
      setMensagem(
        `${candidato.nome} foi escolhido para a ajuda “${nomePedido}”. Os demais candidatos foram removidos desta lista.`,
      );
      await carregar();
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível escolher este prestador.",
      );
    }
  }

  // abre a ação ligada à notificação
  async function abrirNotificacao(notificacao: Notificacao) {
    let notificacaoAberta = notificacao;
    try {
      notificacaoAberta = await api.buscarNotificacao(notificacao.id);
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível abrir a notificação.",
      );
    }
    await marcarComoLida(notificacaoAberta);
    if (ehCandidato(notificacaoAberta)) return;
    const pedidoId =
      "pedidoId" in notificacaoAberta ? notificacaoAberta.pedidoId : undefined;
    const texto = String(notificacaoAberta.mensagem || "").toLowerCase();
    if (
      pedidoId !== undefined ||
      texto.includes("pagamento") ||
      texto.includes("recebeu")
    ) {
      navegar(
        pedidoId === undefined
          ? "/confirmacao-recebimento"
          : `/confirmacao-recebimento?pedidoId=${String(pedidoId)}`,
      );
    } else {
      setNotificacoesAbertas(false);
    }
  }

  // exclui um pedido publicado ainda aberto
  async function excluirPedidoPublicado(id: string | number) {
    if (!sessao?.id) return;
    if (
      !window.confirm(
        "Tem certeza que deseja excluir esta ajuda publicada? Ela deixará de aparecer para outras pessoas.",
      )
    )
      return;
    try {
      await api.excluirPedido(id, sessao.id);
      setMensagem("Ajuda publicada excluída.");
      await carregar();
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível excluir a ajuda publicada.",
      );
    }
  }

  // monta o card de ajuda em andamento
  function cardProcesso(pedido: Pedido, papel: "SOLICITANTE" | "PRESTADOR") {
    const solicitante = papel === "SOLICITANTE";
    const podeExcluir =
      solicitante && String(pedido.status).toUpperCase() === "ABERTO";
    return (
      <article
        key={`${papel}-${pedido.id}`}
        className={`rounded-2xl border-l-4 bg-white p-5 shadow-sm ${solicitante ? "border-[var(--laranja)]" : "border-[var(--verde)]"}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${solicitante ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}`}
            >
              {solicitante ? "Você pediu ajuda" : "Você está ajudando"}
            </span>
            <Link
              to={`/pedido/${pedido.id}`}
              className="mt-3 block font-bold text-[var(--azul)] hover:underline"
            >
              {pedido.titulo}
            </Link>
            <p className="mt-1 text-sm text-gray-600">
              <span className="mr-2 inline-block size-2 rounded-full bg-green-500" />
              {nomeStatus(pedido.status)} · {valor(pedido)}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              navegar(
                solicitante
                  ? `/finalizacao?pedidoId=${pedido.id}`
                  : `/confirmacao-recebimento?pedidoId=${pedido.id}`,
              )
            }
            className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${solicitante ? "bg-[var(--laranja)]" : "bg-[var(--verde)]"}`}
          >
            {solicitante ? "Finalizar ajuda" : "Confirmar recebimento"}
          </button>
        </div>
        {podeExcluir && (
          <button
            type="button"
            onClick={() => void excluirPedidoPublicado(pedido.id)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--coral)] px-3 py-2 text-xs font-bold text-[var(--coral)] transition hover:bg-red-50"
          >
            <FaTrash /> Excluir ajuda publicada
          </button>
        )}
        <p className="mt-4 text-sm text-gray-500">
          {solicitante
            ? "Após a ajuda, registre o pagamento e deixe seu feedback para quem ajudou."
            : "Após realizar a ajuda, confirme o valor recebido e deixe seu feedback para o solicitante."}
        </p>
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
                    const candidato = ehCandidato(notificacao)
                      ? dadosCandidato(notificacao)
                      : null;
                    const pedidoId =
                      notificacao.pedidoId || notificacao.pedido?.id;
                    const escolhido =
                      pedidoId !== undefined &&
                      candidatosEscolhidos[String(pedidoId)] === candidato?.id;
                    return candidato ? (
                      <article
                        key={notificacao.id}
                        className={`rounded-xl p-4 ${notificacao.lida ? "bg-gray-50" : "bg-[var(--verde)]/10"}`}
                      >
                        <div className="flex items-start gap-3">
                          <FaUserCheck className="mt-1 shrink-0 text-[var(--verde)]" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-[var(--azul)]">
                              {candidato.nome} quer ajudar
                            </p>
                            <p className="mt-1 text-xs font-bold text-[var(--laranja)]">
                              Ajuda:{" "}
                              {notificacao.pedido?.titulo ||
                                `Pedido #${pedidoId}`}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              {String(
                                notificacao.mensagem ||
                                  "Esta pessoa aceitou sua solicitação de ajuda.",
                              )}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Link
                                to={`/perfil/${candidato.id}`}
                                onClick={() => void marcarComoLida(notificacao)}
                                className="rounded-lg border border-[var(--azul)] px-3 py-2 text-sm font-semibold text-[var(--azul)]"
                              >
                                Ver perfil
                              </Link>
                              <button
                                type="button"
                                disabled={escolhido}
                                onClick={() =>
                                  void escolherCandidato(notificacao)
                                }
                                className="rounded-lg bg-[var(--verde)] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {escolhido
                                  ? "Prestador escolhido"
                                  : "Escolher prestador"}
                              </button>
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
                            {notificacao.pedidoId || notificacao.pedido?.id ? (
                              <>
                                <strong className="block text-[var(--laranja)]">
                                  Ajuda:{" "}
                                  {notificacao.pedido?.titulo ||
                                    `Pedido #${notificacao.pedidoId || notificacao.pedido?.id}`}
                                </strong>
                                <span className="mt-1 block">
                                  {String(
                                    notificacao.mensagem || "Nova notificação",
                                  )}
                                </span>
                              </>
                            ) : (
                              String(notificacao.mensagem || "Nova notificação")
                            )}
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
                Sou solicitante
              </p>
              <h2 className="mt-1 text-2xl font-bold">Preciso de ajuda</h2>
              <p className="mt-2 text-sm">
                Publique um pedido para outras pessoas ajudarem
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
                Sou prestador
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
                    {valor(recomendadaDisponivel)} ·{" "}
                    {recomendadaDisponivel.bairro || "Bairro não informado"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Categoria: {categoria(recomendadaDisponivel, categorias)} ·{" "}
                    Publicado por:{" "}
                    {recomendadaDisponivel.solicitante?.nome || "outro usuário"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void aceitar(recomendadaDisponivel.id)}
                className="rounded-xl bg-[var(--laranja)] px-5 py-3 font-bold text-white"
              >
                Aceitar esta ajuda
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
                <span
                  key={tag}
                  className="rounded-full bg-[var(--creme)] px-4 py-2 text-sm font-semibold"
                >
                  {categorias.find((item) => String(item.id) === String(tag))
                    ?.nome || tag}
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
                    Ajudas que aceitei
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
                {tags.length
                  ? "Pedidos abertos compatíveis com as categorias que você escolheu."
                  : "Pedidos abertos de outros usuários. Escolha categorias no perfil para receber sugestões mais específicas."}
              </p>
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
                  {valor(pedido)} · {pedido.bairro || "Bairro não informado"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/pedido/${pedido.id}`}
                    className="rounded-xl border border-[var(--azul)] px-4 py-2 text-sm font-bold text-[var(--azul)] hover:bg-[var(--azul)] hover:text-white"
                  >
                    Ver detalhes do pedido
                  </Link>
                  <button
                    type="button"
                    onClick={() => void aceitar(pedido.id)}
                    className="rounded-xl bg-[var(--laranja)] px-4 py-2 text-sm font-bold text-white"
                  >
                    Aceitar pedido
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!oportunidades.length && (
            <div className="rounded-2xl bg-white p-5 text-sm text-gray-600">
              <p className="font-semibold text-[var(--azul)]">
                {pedidos.length
                  ? "Nenhuma oportunidade combina com seu perfil agora."
                  : "Ainda não há pedidos publicados por outros usuários."}
              </p>
              <p className="mt-1">
                {pedidos.length
                  ? "Confira suas categorias no perfil ou aguarde novas oportunidades."
                  : "Quando alguém publicar uma ajuda no Render, ela aparecerá aqui para você ver os detalhes e enviar sua candidatura."}
              </p>
              <Link
                to="/publicar-pedido"
                className="mt-4 inline-flex rounded-xl bg-[var(--laranja)] px-4 py-2 font-bold text-white"
              >
                Publicar o primeiro pedido
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
