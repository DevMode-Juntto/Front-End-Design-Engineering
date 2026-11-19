import type {
  Categoria,
  Comentario,
  DadosAtualizacaoUsuario,
  DadosCadastro,
  DadosCategoria,
  DadosComentario,
  DadosLogin,
  DadosNotificacao,
  DadosPagamento,
  DadosPedido,
  DadosStatusPedido,
  DadosAceite,
  DadosTags,
  FiltrosPedidos,
  LoginResposta,
  Notificacao,
  Pedido,
  PapelPedido,
  SolicitacaoAjuda,
  Usuario,
} from "../types/types";

// usa o proxy da Vercel em produção e o Render direto no desenvolvimento
const API_BASE_URL = import.meta.env.PROD
  ? "/api"
  : "https://juntto-java.onrender.com";

type Registro = Record<string, unknown>;

function texto(valor: unknown) {
  return typeof valor === "string" ? valor : "";
}

function dataApi(valor: unknown) {
  const data = texto(valor);
  return /^\d{4}-\d{2}-\d{2}$/.test(data) ? `${data}T00:00:00` : data;
}

function id(valor: unknown) {
  return typeof valor === "string" || typeof valor === "number"
    ? valor
    : undefined;
}

function normalizarUsuario(valor: unknown): Usuario {
  const item = (valor || {}) as Registro;
  const primeiroNome = texto(item.nome);
  const sobrenome = texto(item.sobrenome);
  return {
    ...item,
    id: id(item.id) ?? "",
    nome: [primeiroNome, sobrenome].filter(Boolean).join(" ") || "Usuário",
    email: texto(item.email) || undefined,
    bairro: texto(item.bairro) || undefined,
    foto: texto(item.fotoUrl) || texto(item.foto) || undefined,
    tags: normalizarTags(item.tags || item.categorias),
  };
}

function normalizarTags(valor: unknown): string[] {
  if (!Array.isArray(valor)) return [];
  return valor
    .map((item) =>
      typeof item === "string" ? item : texto((item as Registro).nome),
    )
    .filter(Boolean);
}

function normalizarCategoria(valor: unknown): Categoria {
  const item = (valor || {}) as Registro;
  return {
    ...item,
    id: id(item.id) ?? "",
    nome: texto(item.nome) || "Sem categoria",
    descricao: texto(item.descricao) || undefined,
  };
}

function usuarioEmPedido(item: Registro, prefixo: "Solicitante" | "Prestador") {
  const chaveId = `id${prefixo}`;
  const chaveNome = `nome${prefixo}`;
  const usuarioId = id(item[chaveId]);
  const nome = texto(item[chaveNome]);
  return usuarioId === undefined && !nome
    ? undefined
    : { id: usuarioId ?? "", nome: nome || "Usuário" };
}

function normalizarPedido(valor: unknown): Pedido {
  const item = (valor || {}) as Registro;
  const categoria = item.categoria
    ? typeof item.categoria === "object"
      ? normalizarCategoria(item.categoria)
      : texto(item.categoria)
    : texto(item.nomeCategoria) || undefined;
  const foto = texto(item.fotoUrl) || texto(item.foto) || undefined;
  return {
    ...item,
    id: id(item.id) ?? "",
    titulo: texto(item.titulo) || "Pedido de ajuda",
    descricao: texto(item.descricao) || undefined,
    categoria,
    categoriaId: id(item.categoriaId) ?? id(item.idCategoria),
    solicitanteId: id(item.solicitanteId) ?? id(item.idSolicitante),
    prestadorId: id(item.prestadorId) ?? id(item.idPrestador),
    bairro: texto(item.bairro) || undefined,
    data: texto(item.data) || texto(item.dtInicio) || undefined,
    valor: typeof item.valor === "number" ? item.valor : undefined,
    tipoPublicacao: texto(item.tipoPublicacao) || undefined,
    idCandidaturaAceita: id(item.idCandidaturaAceita),
    totalAceitas:
      typeof item.totalAceitas === "number" ? item.totalAceitas : undefined,
    statusPagamento: texto(item.statusPagamento) || undefined,
    naoIncluirPagamento: item.naoIncluirPagamento === true,
    status: texto(item.status) || "ABERTO",
    foto,
    fotos: foto ? [foto] : [],
    solicitante: item.solicitante || usuarioEmPedido(item, "Solicitante"),
    prestador: item.prestador || usuarioEmPedido(item, "Prestador"),
  } as Pedido;
}

function normalizarSolicitacao(valor: unknown): SolicitacaoAjuda {
  const item = (valor || {}) as Registro;
  const prestadorId = id(item.prestadorId) ?? id(item.idPrestador);
  return {
    ...item,
    id: id(item.id) ?? id(item.idCandidatura) ?? "",
    pedidoId: id(item.pedidoId) ?? id(item.idPedido),
    prestadorId,
    prestador:
      item.prestador ||
      (prestadorId !== undefined
        ? { id: prestadorId, nome: texto(item.nomePrestador) || "Prestador" }
        : undefined),
    status: texto(item.status) || "PENDENTE",
    tituloPedido: texto(item.tituloPedido) || undefined,
  } as SolicitacaoAjuda;
}

function normalizarNotificacao(valor: unknown): Notificacao {
  const item = (valor || {}) as Registro;
  return {
    ...item,
    id: id(item.id) ?? "",
    mensagem: texto(item.mensagem) || texto(item.descricao) || undefined,
    lida: Boolean(item.lida),
    tipo: texto(item.tipo) || undefined,
    pedidoId: id(item.pedidoId) ?? id(item.idPedido),
    solicitacaoId: id(item.solicitacaoId) ?? id(item.idCandidatura),
    usuarioId: id(item.usuarioId) ?? id(item.idUsuario),
    prestadorId: id(item.prestadorId) ?? id(item.idPrestador),
    usuario: item.usuario ? normalizarUsuario(item.usuario) : undefined,
    prestador: item.prestador ? normalizarUsuario(item.prestador) : undefined,
  } as Notificacao;
}

function normalizarComentario(valor: unknown, autorId?: string | number) {
  const item = (valor || {}) as Registro;
  const idAjudante = id(item.idAjudante);
  const idAjudado = id(item.idAjudado);
  const autorEhAjudante =
    autorId !== undefined && String(autorId) === String(idAjudante);
  const autor = autorEhAjudante ? idAjudante : idAjudado;
  const sobre = autorEhAjudante ? idAjudado : idAjudante;
  const textoComentario = autorEhAjudante
    ? texto(item.feedbackAjudado)
    : texto(item.feedbackAjudante);
  const nota = autorEhAjudante ? item.estrelasAjudado : item.estrelasAjudante;
  return {
    ...item,
    id: id(item.id) ?? "",
    texto: textoComentario || undefined,
    nota: typeof nota === "number" ? nota : undefined,
    autor: {
      id: autor ?? "",
      nome: autorEhAjudante
        ? texto(item.nomeAjudante) || "Usuário"
        : texto(item.nomeAjudado) || "Usuário",
    },
    sobreUsuarioId: sobre,
    pedidoId: id(item.idPedido),
  } as Comentario;
}

function comentariosDoFeedback(valor: unknown) {
  const item = (valor || {}) as Registro;
  const comentarios: Comentario[] = [];
  if (texto(item.feedbackAjudante))
    comentarios.push(normalizarComentario(item, id(item.idAjudante)));
  if (texto(item.feedbackAjudado))
    comentarios.push(normalizarComentario(item, id(item.idAjudado)));
  return comentarios;
}

async function requisicao<T>(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<T> {
  const token = sessionStorage.getItem("junttô_token");
  const headers = new Headers(opcoes.headers);
  if (opcoes.body && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const resposta = await fetch(`${API_BASE_URL}${caminho}`, {
    ...opcoes,
    headers,
  });
  if (!resposta.ok) {
    const textoResposta = await resposta.text();
    let mensagem = textoResposta;
    try {
      const dados = JSON.parse(textoResposta) as Registro;
      const campos = Array.isArray(dados.campos)
        ? ` ${dados.campos.join(" ")}`
        : "";
      mensagem = `${texto(dados.mensagem) || texto(dados.message) || texto(dados.erro) || textoResposta}${campos}`;
    } catch {
      // mantém a resposta como texto quando ela não for um JSON válido
    }
    throw new Error(mensagem || `Erro na API: ${resposta.status}`);
  }
  if (resposta.status === 204) return undefined as T;
  const corpo = await resposta.text();
  return (corpo ? JSON.parse(corpo) : undefined) as T;
}

const json = (metodo: string, corpo: unknown): RequestInit => ({
  method: metodo,
  body: JSON.stringify(corpo),
});

function indisponivel(recurso: string): never {
  throw new Error(`${recurso} ainda não está disponível na API hospedada.`);
}

export const api = {
  cadastrar: async (dados: DadosCadastro) => {
    const partes = dados.nome.trim().split(/\s+/);
    const nome = partes.shift() || dados.nome;
    const sobrenome = dados.sobrenome?.trim() || partes.join(" ") || nome;
    const resposta = await requisicao<unknown>(
      "/usuarios",
      json("POST", { ...dados, nome, sobrenome }),
    );
    return normalizarUsuario(resposta);
  },
  login: async (dados: DadosLogin) =>
    normalizarUsuario(
      await requisicao<unknown>("/login", json("POST", dados)),
    ) as LoginResposta,
  listarUsuarios: async () =>
    (await requisicao<unknown[]>("/usuarios")).map(normalizarUsuario),
  buscarUsuario: async (usuarioId: string | number, meuPerfil = false) =>
    normalizarUsuario(
      await requisicao<unknown>(
        `/usuarios/${usuarioId}${meuPerfil ? `?usuarioId=${usuarioId}` : ""}`,
      ),
    ),
  atualizarUsuario: async (
    usuarioId: string | number,
    dados: DadosAtualizacaoUsuario,
  ) => {
    const partes = texto(dados.nome).trim().split(/\s+/);
    const payload = {
      ...dados,
      ...(partes.length > 1
        ? { nome: partes.shift(), sobrenome: partes.join(" ") }
        : {}),
    };
    return normalizarUsuario(
      await requisicao<unknown>(`/usuarios/${usuarioId}`, json("PUT", payload)),
    );
  },
  desativarUsuario: (_usuarioId: string | number) =>
    indisponivel("A desativação de usuários"),
  excluirUsuario: (usuarioId: string | number) =>
    requisicao<void>(`/usuarios/${usuarioId}`, { method: "DELETE" }),
  alterarStatusUsuario: (..._args: unknown[]) =>
    indisponivel("A alteração de status de usuários"),
  listarAtividades: async (usuarioId: string | number, papel: PapelPedido) =>
    (
      await requisicao<unknown[]>(
        `/usuarios/${usuarioId}/pedidos?papel=${encodeURIComponent(papel)}`,
      )
    ).map(normalizarPedido),
  listarTags: async (usuarioId: string | number) =>
    normalizarTags(await requisicao<unknown>(`/usuarios/${usuarioId}/tags`)),
  salvarTags: async (usuarioId: string | number, tags: DadosTags) => {
    const categorias = await requisicao<unknown[]>("/categorias");
    const idsCategorias = tags
      .map((tag) => {
        const categoria = categorias
          .map(normalizarCategoria)
          .find(
            (item) =>
              String(item.id) === String(tag) ||
              item.nome.toLowerCase() === String(tag).toLowerCase(),
          );
        return categoria?.id;
      })
      .filter((item): item is string | number => item !== undefined);
    return normalizarTags(
      await requisicao<unknown>(
        `/usuarios/${usuarioId}/tags`,
        json("PUT", { idsCategorias }),
      ),
    );
  },
  listarCategorias: async () =>
    (await requisicao<unknown[]>("/categorias")).map(normalizarCategoria),
  buscarCategoria: async (categoriaId: string | number) =>
    normalizarCategoria(
      await requisicao<unknown>(`/categorias/${categoriaId}`),
    ),
  criarCategoria: async (dados: DadosCategoria) =>
    normalizarCategoria(
      await requisicao<unknown>("/categorias", json("POST", dados)),
    ),
  atualizarCategoria: async (
    categoriaId: string | number,
    dados: DadosCategoria,
  ) =>
    normalizarCategoria(
      await requisicao<unknown>(
        `/categorias/${categoriaId}`,
        json("PUT", dados),
      ),
    ),
  excluirCategoria: (
    categoriaId: string | number,
    usuarioId: string | number,
  ) =>
    requisicao<void>(`/categorias/${categoriaId}?usuarioId=${usuarioId}`, {
      method: "DELETE",
    }),
  criarPedido: async (dados: DadosPedido) => {
    const sessao = obterSessao();
    const payload = {
      ...dados,
      idSolicitante: dados.idSolicitante ?? dados.solicitanteId ?? sessao?.id,
      idCategoria: dados.idCategoria ?? dados.categoriaId,
      dtInicio: dataApi(dados.dtInicio ?? dados.data),
      latitude: Number(dados.latitude ?? 0),
      longitude: Number(dados.longitude ?? 0),
      fotoUrl:
        dados.fotoUrl ??
        dados.foto ??
        (Array.isArray(dados.fotos) ? dados.fotos[0] : undefined),
    };
    return normalizarPedido(
      await requisicao<unknown>("/pedidos", json("POST", payload)),
    );
  },
  listarPedidos: async (filtros: FiltrosPedidos = {}) => {
    const parametros = new URLSearchParams();
    Object.entries(filtros).forEach(([chave, valor]) => {
      if (valor !== undefined && valor !== "")
        parametros.set(chave, String(valor));
    });
    const consulta = parametros.toString();
    return (
      await requisicao<unknown[]>(`/pedidos${consulta ? `?${consulta}` : ""}`)
    ).map(normalizarPedido);
  },
  buscarPedido: async (pedidoId: string | number) =>
    normalizarPedido(await requisicao<unknown>(`/pedidos/${pedidoId}`)),
  atualizarPedido: async (pedidoId: string | number, dados: DadosPedido) =>
    normalizarPedido(
      await requisicao<unknown>(
        `/pedidos/${pedidoId}`,
        json("PUT", {
          ...dados,
          idCategoria: dados.idCategoria ?? dados.categoriaId,
          dtInicio: dataApi(dados.dtInicio ?? dados.data),
          latitude: Number(dados.latitude ?? 0),
          longitude: Number(dados.longitude ?? 0),
          fotoUrl:
            dados.fotoUrl ??
            dados.foto ??
            (Array.isArray(dados.fotos) ? dados.fotos[0] : undefined),
        }),
      ),
    ),
  excluirPedido: (pedidoId: string | number, usuarioId: string | number) =>
    requisicao<void>(`/pedidos/${pedidoId}?usuarioId=${usuarioId}`, {
      method: "DELETE",
    }),
  removerPedidoComoAdministrador: (_pedidoId: string | number) =>
    indisponivel("A remoção administrativa de pedidos"),
  aceitarPedido: async (
    pedidoId: string | number,
    usuarioId: string | number,
    _observacao?: string,
  ) =>
    normalizarSolicitacao(
      await requisicao<unknown>(
        `/pedidos/${pedidoId}/candidaturas`,
        json("POST", { usuarioId }),
      ),
    ),
  listarAceites: async (usuarioId: string | number) =>
    (await requisicao<unknown[]>(`/candidaturas?usuarioId=${usuarioId}`)).map(
      normalizarSolicitacao,
    ),
  desistirAceite: (
    candidaturaId: string | number,
    usuarioId: string | number,
  ) =>
    requisicao<void>(
      `/candidaturas/${candidaturaId}?usuarioId=${usuarioId}&confirmar=true`,
      {
        method: "DELETE",
      },
    ),
  atualizarStatusPedido: async (
    pedidoId: string | number,
    dados: DadosStatusPedido,
  ) =>
    normalizarPedido(
      await requisicao<unknown>(
        `/pedidos/${pedidoId}/status`,
        json("PATCH", {
          ...dados,
          usuarioId: dados.usuarioId ?? obterSessao()?.id,
        }),
      ),
    ),
  listarSolicitacoesPedido: async (
    pedidoId: string | number,
    usuarioId?: string | number,
  ) =>
    (
      await requisicao<unknown[]>(
        `/pedidos/${pedidoId}/candidaturas${usuarioId === undefined ? "" : `?usuarioId=${usuarioId}`}`,
      )
    ).map(normalizarSolicitacao),
  buscarSolicitacaoPedido: async (
    _pedidoId: string | number,
    candidaturaId: string | number,
    usuarioId?: string | number,
  ) =>
    normalizarSolicitacao(
      await requisicao<unknown>(
        `/candidaturas/${candidaturaId}${usuarioId === undefined ? "" : `?usuarioId=${usuarioId}`}`,
      ),
    ),
  atualizarSolicitacaoPedido: async (
    _pedidoId: string | number,
    candidaturaId: string | number,
    dados: DadosAceite,
  ) =>
    normalizarSolicitacao(
      await requisicao<unknown>(
        `/candidaturas/${candidaturaId}`,
        json("PUT", dados),
      ),
    ),
  registrarPagamento: async (
    pedidoId: string | number,
    dados: DadosPagamento,
  ) =>
    normalizarPedido(
      await requisicao<unknown>(
        `/pedidos/${pedidoId}/status`,
        json("PATCH", {
          status: "CONCLUIDO",
          caixinha: dados.caixinha,
          usuarioId: dados.usuarioId ?? obterSessao()?.id,
        }),
      ),
    ),
  confirmarPagamento: async (
    pedidoId: string | number,
    idCandidatura?: string | number,
  ) =>
    normalizarPedido(
      await requisicao<unknown>(
        `/pedidos/${pedidoId}/pagamento/confirmacao`,
        json("PATCH", {
          usuarioId: obterSessao()?.id,
          ...(idCandidatura ? { idCandidatura } : {}),
        }),
      ),
    ),
  criarComentario: async (pedidoId: string | number, dados: DadosComentario) =>
    normalizarComentario(
      await requisicao<unknown>(
        `/pedidos/${pedidoId}/feedbacks`,
        json("POST", {
          usuarioId: dados.usuarioId ?? obterSessao()?.id,
          estrelas: Number(dados.estrelas ?? dados.nota ?? 5),
          texto: dados.texto ?? dados.comentario ?? "",
          ...(dados.idCandidatura
            ? { idCandidatura: dados.idCandidatura }
            : {}),
        }),
      ),
      dados.usuarioId ?? obterSessao()?.id,
    ),
  listarComentariosPedido: async (pedidoId: string | number) =>
    (await requisicao<unknown[]>(`/pedidos/${pedidoId}/feedbacks`)).flatMap(
      comentariosDoFeedback,
    ),
  buscarComentario: async (comentarioId: string | number) =>
    normalizarComentario(
      await requisicao<unknown>(`/feedbacks/${comentarioId}`),
      obterSessao()?.id,
    ),
  listarComentariosUsuario: async (usuarioId: string | number) =>
    (await requisicao<unknown[]>(`/feedbacks?usuarioId=${usuarioId}`)).map(
      (item) => normalizarComentario(item, usuarioId),
    ),
  listarComentariosAutor: async (autorId: string | number) =>
    (await requisicao<unknown[]>("/feedbacks"))
      .flatMap(comentariosDoFeedback)
      .filter((item) => String(item.autor?.id) === String(autorId)),
  editarComentario: async (
    comentarioId: string | number,
    dados: DadosComentario,
  ) =>
    normalizarComentario(
      await requisicao<unknown>(
        `/feedbacks/${comentarioId}`,
        json("PUT", {
          usuarioId: dados.usuarioId ?? obterSessao()?.id,
          estrelas: Number(dados.estrelas ?? dados.nota ?? 5),
          texto: dados.texto ?? dados.comentario ?? "",
        }),
      ),
      dados.usuarioId ?? obterSessao()?.id,
    ),
  excluirComentario: (
    comentarioId: string | number,
    usuarioId: string | number,
  ) =>
    requisicao<void>(`/feedbacks/${comentarioId}?usuarioId=${usuarioId}`, {
      method: "DELETE",
    }),
  listarNotificacoes: async (
    usuarioId: string | number,
    somenteNaoLidas = false,
  ) =>
    (
      await requisicao<unknown[]>(
        `/notificacoes?usuarioId=${usuarioId}${somenteNaoLidas ? "&lida=false" : ""}`,
      )
    ).map(normalizarNotificacao),
  buscarNotificacao: async (notificacaoId: string | number) =>
    normalizarNotificacao(
      await requisicao<unknown>(`/notificacoes/${notificacaoId}`),
    ),
  marcarNotificacaoLida: async (notificacaoId: string | number) =>
    normalizarNotificacao(
      await requisicao<unknown>(
        `/notificacoes/${notificacaoId}`,
        json("PUT", { lida: true }),
      ),
    ),
  excluirNotificacao: (notificacaoId: string | number) =>
    requisicao<void>(`/notificacoes/${notificacaoId}`, { method: "DELETE" }),
  criarNotificacao: async (dados: DadosNotificacao) =>
    normalizarNotificacao(
      await requisicao<unknown>("/notificacoes", json("POST", dados)),
    ),
};

export function salvarSessao(usuario: LoginResposta) {
  sessionStorage.setItem("junttô_usuario", JSON.stringify(usuario));
  if (usuario.token) sessionStorage.setItem("junttô_token", usuario.token);
}

export function obterSessao(): LoginResposta | null {
  const valor = sessionStorage.getItem("junttô_usuario");
  if (!valor) return null;
  try {
    return JSON.parse(valor) as LoginResposta;
  } catch {
    sessionStorage.removeItem("junttô_usuario");
    return null;
  }
}
