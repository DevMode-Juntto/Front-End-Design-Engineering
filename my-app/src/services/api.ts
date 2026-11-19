// Serviço da API Java (Spring Boot). Contrato completo no ENDPOINTS.md do back-end.
import type {
  Candidatura,
  Categoria,
  DadosAtualizacaoUsuario,
  DadosCadastro,
  DadosCategoria,
  DadosConfirmacaoPagamento,
  DadosFeedback,
  DadosLembrete,
  DadosLogin,
  DadosRespostaCandidatura,
  DadosPedido,
  DadosStatusPedido,
  Feedback,
  FiltrosPedidos,
  Identificador,
  LoginResposta,
  Notificacao,
  PapelPedido,
  Pedido,
  Usuario,
} from "../types/types";
import { consulta, corpo, criarCliente, URL_API_JAVA } from "./http";

const requisicao = criarCliente(URL_API_JAVA);

export const api = {
  // ---------------- usuários ----------------
  cadastrar: (dados: DadosCadastro) => requisicao<Usuario>("/usuarios", corpo("POST", dados)),
  login: (dados: DadosLogin) => requisicao<LoginResposta>("/login", corpo("POST", dados)),
  listarUsuarios: () => requisicao<Usuario[]>("/usuarios"),
  // meuPerfil = true traz e-mail e localização (só para o próprio usuário)
  buscarUsuario: (id: Identificador, meuPerfil = false) =>
    requisicao<Usuario>(`/usuarios/${id}${meuPerfil ? consulta({ usuarioId: id }) : ""}`),
  atualizarUsuario: (id: Identificador, dados: DadosAtualizacaoUsuario) =>
    requisicao<Usuario>(`/usuarios/${id}`, corpo("PUT", { ...dados, usuarioId: id })),
  excluirUsuario: (id: Identificador) =>
    requisicao<void>(`/usuarios/${id}${consulta({ usuarioId: id })}`, { method: "DELETE" }),
  listarAtividades: (id: Identificador, papel: PapelPedido) =>
    requisicao<Pedido[]>(`/usuarios/${id}/pedidos${consulta({ papel })}`),
  listarTags: (id: Identificador) => requisicao<Categoria[]>(`/usuarios/${id}/tags`),
  salvarTags: (id: Identificador, idsCategorias: Identificador[]) =>
    requisicao<Categoria[]>(`/usuarios/${id}/tags`, corpo("PUT", { usuarioId: id, idsCategorias })),

  // ---------------- categorias ----------------
  listarCategorias: () => requisicao<Categoria[]>("/categorias"),
  buscarCategoria: (id: Identificador) => requisicao<Categoria>(`/categorias/${id}`),
  criarCategoria: (dados: DadosCategoria) => requisicao<Categoria>("/categorias", corpo("POST", dados)),
  atualizarCategoria: (id: Identificador, dados: DadosCategoria) =>
    requisicao<Categoria>(`/categorias/${id}`, corpo("PUT", dados)),
  excluirCategoria: (id: Identificador) => requisicao<void>(`/categorias/${id}`, { method: "DELETE" }),

  // ---------------- pedidos ----------------
  criarPedido: (dados: DadosPedido) => requisicao<Pedido>("/pedidos", corpo("POST", dados)),
  // oportunidades: só pedidos ABERTOS
  listarPedidos: (filtros: FiltrosPedidos = {}) => requisicao<Pedido[]>(`/pedidos${consulta(filtros)}`),
  // com usuarioId de um participante, os e-mails de contato aparecem
  buscarPedido: (id: Identificador, usuarioId?: Identificador) =>
    requisicao<Pedido>(`/pedidos/${id}${consulta({ usuarioId })}`),
  atualizarPedido: (id: Identificador, dados: DadosPedido) =>
    requisicao<Pedido>(`/pedidos/${id}`, corpo("PUT", dados)),
  excluirPedido: (id: Identificador, usuarioId: Identificador) =>
    requisicao<void>(`/pedidos/${id}${consulta({ usuarioId })}`, { method: "DELETE" }),
  atualizarStatusPedido: (id: Identificador, dados: DadosStatusPedido) =>
    requisicao<Pedido>(`/pedidos/${id}/status`, corpo("PATCH", dados)),
  // o pagamento acontece fora do app: quem RECEBEU confirma (idCandidatura em OFERTA com vários aceitos)
  confirmarPagamento: (id: Identificador, dados: DadosConfirmacaoPagamento) =>
    requisicao<Pedido>(`/pedidos/${id}/pagamento/confirmacao`, corpo("PATCH", dados)),

  // ---------------- candidaturas ----------------
  candidatar: (pedidoId: Identificador, usuarioId: Identificador) =>
    requisicao<Candidatura>(`/pedidos/${pedidoId}/candidaturas`, corpo("POST", { usuarioId })),
  // só o dono do pedido vê os candidatos
  listarCandidaturasPedido: (pedidoId: Identificador, usuarioId: Identificador) =>
    requisicao<Candidatura[]>(`/pedidos/${pedidoId}/candidaturas${consulta({ usuarioId })}`),
  listarMinhasCandidaturas: (usuarioId: Identificador) =>
    requisicao<Candidatura[]>(`/candidaturas${consulta({ usuarioId })}`),
  buscarCandidatura: (id: Identificador, usuarioId: Identificador) =>
    requisicao<Candidatura>(`/candidaturas/${id}${consulta({ usuarioId })}`),
  // dono do pedido aceita (ACEITA) ou recusa (RECUSADA)
  responderCandidatura: (id: Identificador, dados: DadosRespostaCandidatura) =>
    requisicao<Candidatura>(`/candidaturas/${id}`, corpo("PUT", dados)),
  // candidato desiste (precisa confirmar: não pode se candidatar de novo)
  desistirCandidatura: (id: Identificador, usuarioId: Identificador) =>
    requisicao<void>(`/candidaturas/${id}${consulta({ usuarioId, confirmar: true })}`, { method: "DELETE" }),

  // ---------------- avaliações (feedbacks) ----------------
  avaliar: (pedidoId: Identificador, dados: DadosFeedback) =>
    requisicao<Feedback>(`/pedidos/${pedidoId}/feedbacks`, corpo("POST", dados)),
  listarFeedbacksPedido: (pedidoId: Identificador) => requisicao<Feedback[]>(`/pedidos/${pedidoId}/feedbacks`),
  // avaliações RECEBIDAS pelo usuário
  listarFeedbacksUsuario: (usuarioId: Identificador) =>
    requisicao<Feedback[]>(`/feedbacks${consulta({ usuarioId })}`),
  buscarFeedback: (id: Identificador) => requisicao<Feedback>(`/feedbacks/${id}`),
  editarFeedback: (id: Identificador, dados: DadosFeedback) =>
    requisicao<Feedback>(`/feedbacks/${id}`, corpo("PUT", dados)),
  excluirFeedback: (id: Identificador, usuarioId: Identificador) =>
    requisicao<void>(`/feedbacks/${id}${consulta({ usuarioId })}`, { method: "DELETE" }),

  // ---------------- notificações ----------------
  listarNotificacoes: (usuarioId: Identificador, somenteNaoLidas = false) =>
    requisicao<Notificacao[]>(`/notificacoes${consulta({ usuarioId, lida: somenteNaoLidas ? false : undefined })}`),
  buscarNotificacao: (id: Identificador) => requisicao<Notificacao>(`/notificacoes/${id}`),
  // a API só deixa o destinatário (usuarioId) alterar ou apagar a notificação
  marcarNotificacaoLida: (id: Identificador, usuarioId: Identificador) =>
    requisicao<Notificacao>(`/notificacoes/${id}`, corpo("PUT", { usuarioId, lida: true })),
  excluirNotificacao: (id: Identificador, usuarioId: Identificador) =>
    requisicao<void>(`/notificacoes/${id}${consulta({ usuarioId })}`, { method: "DELETE" }),
  enviarLembrete: (dados: DadosLembrete) => requisicao<Notificacao>("/notificacoes", corpo("POST", dados)),
};

// ---------------- sessão (usuário logado) ----------------

const CHAVE_SESSAO = "junttô_usuario";

export function salvarSessao(usuario: LoginResposta) {
  sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario));
}

export function obterSessao(): LoginResposta | null {
  const valor = sessionStorage.getItem(CHAVE_SESSAO);
  if (!valor) return null;
  try {
    return JSON.parse(valor) as LoginResposta;
  } catch {
    sessionStorage.removeItem(CHAVE_SESSAO);
    return null;
  }
}

export function encerrarSessao() {
  sessionStorage.removeItem(CHAVE_SESSAO);
}

// ---------------- utilidades de exibição ----------------

export function nomeCompleto(usuario?: Pick<Usuario, "nome" | "sobrenome"> | null) {
  if (!usuario) return "";
  return [usuario.nome, usuario.sobrenome].filter(Boolean).join(" ");
}

export function formatarValor(pedido: Pick<Pedido, "valor" | "naoIncluirPagamento" | "recompensa">) {
  if (pedido.naoIncluirPagamento || pedido.valor == null) {
    return pedido.recompensa ? `Sem pagamento · ${pedido.recompensa}` : "Sem pagamento";
  }
  return `R$ ${pedido.valor.toFixed(2).replace(".", ",")}`;
}

export function formatarData(data?: string | null) {
  if (!data) return "Data não informada";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return data;
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export const NOMES_STATUS: Record<string, string> = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

export const NOMES_STATUS_CANDIDATURA: Record<string, string> = {
  PENDENTE: "Pendente",
  ACEITA: "Aceita",
  RECUSADA: "Recusada",
  CANCELADA: "Cancelada",
};

export const NOMES_STATUS_PAGAMENTO: Record<string, string> = {
  NAO_APLICAVEL: "Sem pagamento",
  PENDENTE: "Aguardando confirmação",
  CONFIRMADO: "Confirmado",
};
