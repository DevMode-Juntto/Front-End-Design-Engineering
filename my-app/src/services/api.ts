import type {
  Categoria,
  Comentario,
  Denuncia,
  DadosAtualizacaoUsuario,
  DadosCadastro,
  DadosCategoria,
  DadosComentario,
  DadosDenuncia,
  DadosLogin,
  DadosPagamento,
  DadosPedido,
  DadosStatusDenuncia,
  DadosStatusPedido,
  DadosAceite,
  DadosStatusUsuario,
  DadosTags,
  FiltrosPedidos,
  LoginResposta,
  Notificacao,
  Pedido,
  PapelPedido,
  SolicitacaoAjuda,
  Usuario,
} from "../types/types";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

async function requisicao<T>(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<T> {
  const token = sessionStorage.getItem("junttô_token");
  const headers = new Headers(opcoes.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const resposta = await fetch(`${API_BASE_URL}${caminho}`, {
    ...opcoes,
    headers,
  });
  if (!resposta.ok) {
    const mensagem = await resposta.text();
    throw new Error(mensagem || `Erro na API: ${resposta.status}`);
  }
  if (resposta.status === 204) return undefined as T;
  return (await resposta.json()) as T;
}

const json = (metodo: string, corpo: unknown): RequestInit => ({
  method: metodo,
  body: JSON.stringify(corpo),
});

export const api = {
  cadastrar: (dados: DadosCadastro) =>
    requisicao<Usuario>("/usuarios", json("POST", dados)),
  login: (dados: DadosLogin) =>
    requisicao<LoginResposta>("/login", json("POST", dados)),
  listarUsuarios: () => requisicao<Usuario[]>("/usuarios"),
  buscarUsuario: (id: string | number, meuPerfil = false) =>
    requisicao<Usuario>(
      `/usuarios/${id}${meuPerfil ? `?usuarioId=${id}` : ""}`,
    ),
  atualizarUsuario: (id: string | number, dados: DadosAtualizacaoUsuario) =>
    requisicao<Usuario>(`/usuarios/${id}`, json("PUT", dados)),
  desativarUsuario: (id: string | number) =>
    requisicao<void>(`/usuarios/${id}/desativar`, { method: "PATCH" }),
  excluirUsuario: (id: string | number) =>
    requisicao<void>(`/usuarios/${id}`, { method: "DELETE" }),
  alterarStatusUsuario: (id: string | number, dados: DadosStatusUsuario) =>
    requisicao<Usuario>(`/usuarios/${id}/status`, json("PATCH", dados)),
  listarAtividades: (id: string | number, papel: PapelPedido) =>
    requisicao<Pedido[]>(`/usuarios/${id}/pedidos?papel=${papel}`),
  listarTags: (id: string | number) =>
    requisicao<string[]>(`/usuarios/${id}/tags`),
  salvarTags: (id: string | number, tags: DadosTags) =>
    requisicao<string[]>(`/usuarios/${id}/tags`, json("PUT", tags)),
  listarCategorias: () => requisicao<Categoria[]>("/categorias"),
  buscarCategoria: (id: string | number) =>
    requisicao<Categoria>(`/categorias/${id}`),
  criarCategoria: (dados: DadosCategoria) =>
    requisicao<Categoria>("/categorias", json("POST", dados)),
  atualizarCategoria: (id: string | number, dados: DadosCategoria) =>
    requisicao<Categoria>(`/categorias/${id}`, json("PUT", dados)),
  excluirCategoria: (id: string | number, usuarioId: string | number) =>
    requisicao<void>(`/categorias/${id}?usuarioId=${usuarioId}`, {
      method: "DELETE",
    }),
  criarPedido: (dados: DadosPedido) =>
    requisicao<Pedido>("/pedidos", json("POST", dados)),
  listarPedidos: (filtros: FiltrosPedidos = {}) => {
    const parametros = new URLSearchParams();
    Object.entries(filtros).forEach(([chave, valor]) => {
      if (valor !== undefined && valor !== "")
        parametros.set(chave, String(valor));
    });
    const consulta = parametros.toString();
    return requisicao<Pedido[]>(`/pedidos${consulta ? `?${consulta}` : ""}`);
  },
  buscarPedido: (id: string | number) => requisicao<Pedido>(`/pedidos/${id}`),
  atualizarPedido: (id: string | number, dados: DadosPedido) =>
    requisicao<Pedido>(`/pedidos/${id}`, json("PUT", dados)),
  excluirPedido: (id: string | number, usuarioId: string | number) =>
    requisicao<void>(`/pedidos/${id}?usuarioId=${usuarioId}`, {
      method: "DELETE",
    }),
  removerPedidoComoAdministrador: (id: string | number) =>
    requisicao<void>(`/pedidos/${id}/remover`, { method: "PATCH" }),
  aceitarPedido: (
    id: string | number,
    usuarioId: string | number,
    observacao?: string,
  ) =>
    requisicao<Pedido>(
      `/pedidos/${id}/aceites`,
      json("POST", { usuarioId, ...(observacao ? { observacao } : {}) }),
    ),
  listarAceites: (usuarioId: string | number) =>
    requisicao<SolicitacaoAjuda[]>(`/aceites?usuarioId=${usuarioId}`),
  desistirAceite: (id: string | number, usuarioId: string | number) =>
    requisicao<void>(`/aceites/${id}?usuarioId=${usuarioId}&confirmar=true`, {
      method: "DELETE",
    }),
  atualizarStatusPedido: (id: string | number, dados: DadosStatusPedido) =>
    requisicao<Pedido>(`/pedidos/${id}/status`, json("PATCH", dados)),
  listarSolicitacoesPedido: (
    pedidoId: string | number,
    _usuarioId?: string | number,
  ) => requisicao<SolicitacaoAjuda[]>(`/pedidos/${pedidoId}/aceites`),
  buscarSolicitacaoPedido: (
    _pedidoId: string | number,
    id: string | number,
    _usuarioId?: string | number,
  ) => requisicao<SolicitacaoAjuda>(`/aceites/${id}`),
  atualizarSolicitacaoPedido: (
    _pedidoId: string | number,
    id: string | number,
    dados: DadosAceite,
  ) => requisicao<SolicitacaoAjuda>(`/aceites/${id}`, json("PUT", dados)),
  registrarPagamento: (id: string | number, dados: DadosPagamento) =>
    requisicao<Pedido>(`/pedidos/${id}/pagamento`, json("POST", dados)),
  confirmarPagamento: (id: string | number) =>
    requisicao<Pedido>(`/pedidos/${id}/pagamento/confirmacao`, {
      method: "PATCH",
    }),
  criarComentario: (id: string | number, dados: DadosComentario) =>
    requisicao<Comentario>(`/pedidos/${id}/comentarios`, json("POST", dados)),
  listarComentariosPedido: (id: string | number) =>
    requisicao<Comentario[]>(`/pedidos/${id}/comentarios`),
  buscarComentario: (id: string | number) =>
    requisicao<Comentario>(`/comentarios/${id}`),
  listarComentariosUsuario: (usuarioId: string | number) =>
    requisicao<Comentario[]>(`/comentarios?usuarioId=${usuarioId}`),
  listarComentariosAutor: (autorId: string | number) =>
    requisicao<Comentario[]>(`/comentarios?autorId=${autorId}`),
  editarComentario: (id: string | number, dados: DadosComentario) =>
    requisicao<Comentario>(`/comentarios/${id}`, json("PUT", dados)),
  excluirComentario: (id: string | number, usuarioId: string | number) =>
    requisicao<void>(`/comentarios/${id}?usuarioId=${usuarioId}`, {
      method: "DELETE",
    }),
  listarNotificacoes: (usuarioId: string | number, somenteNaoLidas = false) =>
    requisicao<Notificacao[]>(
      `/notificacoes?usuarioId=${usuarioId}${somenteNaoLidas ? "&lida=false" : ""}`,
    ),
  buscarNotificacao: (id: string | number) =>
    requisicao<Notificacao>(`/notificacoes/${id}`),
  marcarNotificacaoLida: (id: string | number) =>
    requisicao<Notificacao>(`/notificacoes/${id}`, json("PUT", { lida: true })),
  excluirNotificacao: (id: string | number) =>
    requisicao<void>(`/notificacoes/${id}`, { method: "DELETE" }),
  criarNotificacao: (dados: Record<string, unknown>) =>
    requisicao<Notificacao>("/notificacoes", json("POST", dados)),
  criarDenuncia: (dados: DadosDenuncia) =>
    requisicao<void>("/denuncias", json("POST", dados)),
  listarDenuncias: (usuarioId?: string | number) =>
    requisicao<Denuncia[]>(
      `/denuncias${usuarioId === undefined ? "" : `?usuarioId=${usuarioId}`}`,
    ),
  buscarDenuncia: (id: string | number, usuarioId?: string | number) =>
    requisicao<Denuncia>(
      `/denuncias/${id}${usuarioId === undefined ? "" : `?usuarioId=${usuarioId}`}`,
    ),
  editarDenuncia: (id: string | number, dados: DadosDenuncia) =>
    requisicao<Denuncia>(`/denuncias/${id}`, json("PUT", dados)),
  excluirDenuncia: (id: string | number, usuarioId: string | number) =>
    requisicao<void>(`/denuncias/${id}?usuarioId=${usuarioId}`, {
      method: "DELETE",
    }),
  atualizarStatusDenuncia: (id: string | number, dados: DadosStatusDenuncia) =>
    requisicao<Denuncia>(`/denuncias/${id}/status`, json("PATCH", dados)),
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
