import type { ReactNode } from "react";

// Os IDs da API Java são texto ("1", "2"...), porque as chaves do banco são VARCHAR2.
export type Identificador = string;

// ======================================================================
// Respostas da API Java (mesmos nomes de campos do back-end)
// ======================================================================

export type Usuario = {
  id: Identificador;
  nome: string;
  sobrenome: string;
  email?: string | null; // só vem no "meu perfil" (GET /usuarios/{id}?usuarioId={id})
  fotoUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mediaEstrelas?: number | null;
  totalAvaliacoes?: number;
};

export type LoginResposta = Usuario;

export type Categoria = {
  id: Identificador;
  nome: string;
};

export type TipoPublicacao = "AJUDA" | "OFERTA";

// Valores iguais aos CHECKs do documento de banco
// AJUDA: ABERTO -> EM_ANDAMENTO (candidato aceito) -> CONCLUIDO | OFERTA: ABERTO -> CONCLUIDO
export type PedidoStatus = "ABERTO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";

// O pagamento acontece fora do app: só a confirmação de quem recebeu fica registrada
export type StatusPagamento = "NAO_APLICAVEL" | "PENDENTE" | "CONFIRMADO";

export type Pedido = {
  id: Identificador;
  titulo: string;
  descricao: string;
  tipoPublicacao: TipoPublicacao;
  idCategoria: Identificador;
  nomeCategoria: string;
  idSolicitante: Identificador; // quem publicou
  nomeSolicitante: string;
  status: PedidoStatus;
  dtInicio: string;
  dtFinal?: string | null;
  valor?: number | null; // nulo quando é sem pagamento
  naoIncluirPagamento: boolean;
  recompensa?: string | null;
  caixinha?: number | null;
  total?: number | null;
  fotoUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  idCandidaturaAceita?: Identificador | null; // só em AJUDA
  idPrestador?: Identificador | null; // candidato aceito (só em AJUDA)
  nomePrestador?: string | null;
  idAjudante?: Identificador | null; // quem faz o serviço / oferece
  idAjudado?: Identificador | null; // quem recebe a ajuda (nulo em OFERTA: são vários)
  totalAceitas?: number;
  statusPagamento?: StatusPagamento | null; // da candidatura aceita (AJUDA)
  dtRecompensa?: string | null;
  dtConfirmacaoPagamento?: string | null;
  emailSolicitante?: string | null; // só para os participantes
  emailPrestador?: string | null;
};

export type PapelPedido = "SOLICITANTE" | "PRESTADOR";

export type StatusCandidatura = "PENDENTE" | "ACEITA" | "RECUSADA" | "CANCELADA";

export type Candidatura = {
  id: Identificador;
  idPedido: Identificador;
  tituloPedido: string;
  statusPedido: PedidoStatus;
  idSolicitante: Identificador;
  idPrestador: Identificador;
  nomePrestador: string;
  fotoPrestador?: string | null;
  emailPrestador?: string | null; // só para o dono, nas candidaturas aceitas
  mediaEstrelasPrestador?: number | null;
  totalAvaliacoesPrestador?: number;
  status: StatusCandidatura;
  statusPagamento: StatusPagamento;
  dtOferta: string;
  dtConfirmacaoPagamento?: string | null;
};

export type Feedback = {
  id: Identificador;
  idCandidatura: Identificador;
  idPedido: Identificador;
  tituloPedido: string;
  idAjudante: Identificador;
  nomeAjudante: string;
  idAjudado: Identificador;
  nomeAjudado: string;
  estrelasAjudante?: number | null; // nota SOBRE quem ajudou
  feedbackAjudante?: string | null;
  dtAvaliacaoAjudante?: string | null;
  estrelasAjudado?: number | null; // nota SOBRE quem recebeu a ajuda
  feedbackAjudado?: string | null;
  dtAvaliacaoAjudado?: string | null;
};

export type Notificacao = {
  id: Identificador;
  idUsuario: Identificador;
  idCandidatura: Identificador;
  idPedido: Identificador;
  tipo: string;
  mensagem: string;
  lida: boolean;
  dtCriacao: string;
};

// ======================================================================
// Corpos enviados para a API Java
// ======================================================================

export type DadosCadastro = {
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
  fotoUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type DadosLogin = {
  email: string;
  senha: string;
};

export type DadosAtualizacaoUsuario = {
  nome: string;
  sobrenome: string;
  fotoUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type DadosCategoria = {
  nome: string;
};

export type DadosPedido = {
  idSolicitante: Identificador;
  titulo: string;
  descricao: string;
  tipoPublicacao: TipoPublicacao;
  idCategoria: Identificador;
  valor?: number | null;
  naoIncluirPagamento: boolean;
  recompensa?: string | null;
  dtInicio: string; // "2026-12-20T14:00:00"
  dtFinal?: string | null;
  fotoUrl?: string | null; // link, até 200 caracteres
  latitude: number;
  longitude: number;
};

export type FiltrosPedidos = {
  tipo?: TipoPublicacao | "";
  idCategoria?: Identificador;
  valorMin?: number | string;
  valorMax?: number | string;
  data?: string; // "2026-12-20"
};

export type DadosStatusPedido = {
  usuarioId: Identificador;
  status: "CONCLUIDO" | "CANCELADO";
  caixinha?: number; // só ao concluir uma AJUDA com pagamento
};

// Quem recebeu confirma o pagamento (ou a recompensa)
export type DadosConfirmacaoPagamento = {
  usuarioId: Identificador;
  idCandidatura?: Identificador; // OFERTA com mais de um aceito
};

export type DadosRespostaCandidatura = {
  usuarioId: Identificador;
  status: "ACEITA" | "RECUSADA";
};

export type DadosFeedback = {
  usuarioId: Identificador;
  estrelas: number; // 1 a 5
  texto?: string;
  idCandidatura?: Identificador; // OFERTA com mais de um aceito (quem publicou avaliando)
};

export type DadosLembrete = {
  usuarioId: Identificador;
  idCandidatura: Identificador;
  mensagem: string;
};

// ======================================================================
// Admin e denúncias: ficam na API Python (services/apiPython.ts)
// ======================================================================

export type Denuncia = {
  id: Identificador;
  usuarioId?: Identificador;
  pedidoId?: Identificador;
  motivo?: string;
  mensagem?: string;
  status?: string;
  [chave: string]: unknown;
};

export type DadosDenuncia = Record<string, unknown>;

export type DadosStatusDenuncia = {
  status: string;
};

export type DadosStatusUsuario = {
  status: string;
};

// ======================================================================
// Interface
// ======================================================================

export type ItemMenu = {
  nome: string;
  caminho: string;
  icone: ReactNode;
};
