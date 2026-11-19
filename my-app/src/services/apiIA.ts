// Serviço da API de IA (Flask + scikit-learn). Em produção passa pelo proxy "/ia" do vercel.json;
// no desenvolvimento usa VITE_API_IA_URL do .env (padrão: http://localhost:5000).
// - /prever/valor: sugere um valor para o pedido (regressão Ridge com TF-IDF)
// - /recomendar: ordena os pedidos abertos pela chance de combinar com o usuário (K-Means + Random Forest)
// Se a API de IA estiver desligada, o front continua funcionando normalmente, só sem as sugestões.
import type { Identificador, Pedido } from "../types/types";
import { corpo, criarCliente, URL_API_IA } from "./http";

const requisicao = criarCliente(URL_API_IA);

export type DadosValorSugerido = {
  titulo: string;
  descricao: string;
  idCategoria: Identificador;
  dtInicio: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type ValorSugerido = {
  valorSugerido: number;
  minimo: number;
  maximo: number;
  categoria: string;
  bairroConsiderado?: string | null;
};

export type UsuarioRecomendacao = {
  id: Identificador;
  tags: Identificador[];
  latitude?: number | null;
  longitude?: number | null;
  historicoCategorias?: Identificador[];
};

export type Recomendacao = {
  id: Identificador;
  probabilidade: number; // 0 a 1
};

export const apiIA = {
  sugerirValor: (dados: DadosValorSugerido) => requisicao<ValorSugerido>("/prever/valor", corpo("POST", dados)),
  // manda os pedidos no mesmo formato do GET /pedidos da API Java
  recomendar: (usuario: UsuarioRecomendacao, pedidos: Pedido[]) =>
    requisicao<{ recomendacoes: Recomendacao[] }>("/recomendar", corpo("POST", { usuario, pedidos })).then(
      (resposta) => resposta.recomendacoes,
    ),
};
