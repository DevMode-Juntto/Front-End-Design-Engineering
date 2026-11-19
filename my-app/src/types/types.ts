import type { ReactNode } from "react";

export type Identificador = string | number;

export type Usuario = {
  id: Identificador;
  nome: string;
  email?: string;
  foto?: string;
  bairro?: string;
  tags?: string[];
  [chave: string]: unknown;
};

export type Categoria = {
  id: Identificador;
  nome: string;
  descricao?: string;
  [chave: string]: unknown;
};

export type PedidoStatus =
  | "ABERTO"
  | "EM_ANDAMENTO"
  | "AGUARDANDO_CONFIRMACAO"
  | "CONCLUIDO"
  | "CANCELADO";

export type PapelPedido = "SOLICITANTE" | "PRESTADOR";

export type StatusSolicitacao = "PENDENTE" | "ACEITA" | "RECUSADA";

export type SolicitacaoAjuda = {
  id: Identificador;
  pedidoId?: Identificador;
  prestadorId?: Identificador;
  prestador?: Usuario;
  status?: StatusSolicitacao | string;
  [chave: string]: unknown;
};

export type Pedido = {
  id: Identificador;
  titulo: string;
  descricao?: string;
  categoria?: Categoria | string;
  categoriaId?: Identificador;
  bairro?: string;
  data?: string;
  valor?: number;
  tipoPublicacao?: "AJUDA" | "OFERTA" | string;
  idCandidaturaAceita?: Identificador;
  totalAceitas?: number;
  statusPagamento?: string;
  naoIncluirPagamento?: boolean;
  status?: PedidoStatus | string;
  solicitante?: Usuario;
  prestador?: Usuario;
  [chave: string]: unknown;
};

export type Comentario = {
  id: Identificador;
  texto?: string;
  comentario?: string;
  autor?: Usuario;
  sobreUsuarioId?: Identificador;
  nota?: number;
  [chave: string]: unknown;
};

export type Notificacao = {
  id: Identificador;
  mensagem?: string;
  lida?: boolean;
  tipo?: string;
  pedidoId?: Identificador;
  solicitacaoId?: Identificador;
  usuarioId?: Identificador;
  prestadorId?: Identificador;
  remetenteId?: Identificador;
  usuario?: Usuario;
  prestador?: Usuario;
  pedido?: Pedido;
  [chave: string]: unknown;
};

export type Denuncia = {
  id: Identificador;
  usuarioId?: Identificador;
  pedidoId?: Identificador;
  comentarioId?: Identificador;
  motivo?: string;
  mensagem?: string;
  status?: string;
  [chave: string]: unknown;
};

export type LoginResposta = Usuario & { token?: string };

export type DadosCadastro = {
  nome: string;
  sobrenome?: string;
  email: string;
  senha: string;
};

export type DadosLogin = {
  email: string;
  senha: string;
};

export type DadosAtualizacaoUsuario = Partial<Usuario>;

export type DadosStatusUsuario = {
  status: string;
};

export type DadosTags = string[];

export type DadosCategoria = Record<string, unknown>;

export type FiltrosPedidos = {
  categoria?: string | number;
  valor?: string | number;
  data?: string;
  bairro?: string;
  [chave: string]: string | number | undefined;
};

export type DadosPedido = Record<string, unknown>;

export type DadosStatusPedido = Record<string, unknown>;

export type DadosAceite = {
  usuarioId: Identificador;
  observacao?: string;
  status?: string;
};

export type DadosPagamento = {
  usuarioId?: Identificador;
  idCandidatura?: Identificador;
  formaPagamento: string;
  caixinha: number;
  valor?: number;
};

export type DadosComentario = {
  usuarioId?: Identificador;
  idCandidatura?: Identificador;
  estrelas?: number;
  nota?: number;
  texto?: string;
  comentario?: string;
  [chave: string]: unknown;
};

export type DadosNotificacao = {
  usuarioId: Identificador;
  idCandidatura: Identificador;
  mensagem: string;
};

export type DadosDenuncia = Record<string, unknown>;

export type DadosStatusDenuncia = {
  status: string;
};

export type ItemMenu = {
  nome: string;
  caminho: string;
  icone: ReactNode;
};
