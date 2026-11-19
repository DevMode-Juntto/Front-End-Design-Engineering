// Serviço da API Python: administração e denúncias ficam fora da API Java.
// Configure VITE_API_PYTHON_URL (no .env e, para o site publicado, na Vercel).
// Sem esse endereço em produção, as telas que dependem dela mostram um aviso em vez de erro.
import type {
  DadosDenuncia,
  DadosStatusDenuncia,
  Denuncia,
  Identificador,
} from "../types/types";
import {
  API_PYTHON_DISPONIVEL,
  consulta,
  corpo,
  criarCliente,
  URL_API_PYTHON,
} from "./http";

export { API_PYTHON_DISPONIVEL };
export const AVISO_API_PYTHON =
  "Denúncias e ferramentas de administração ficam na API Python, que ainda não está publicada.";

const cliente = criarCliente(URL_API_PYTHON);

function requisicao<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  if (!API_PYTHON_DISPONIVEL)
    return Promise.reject(new Error(AVISO_API_PYTHON));
  return cliente<T>(caminho, opcoes);
}

export const apiPython = {
  // ---------------- denúncias ----------------
  criarDenuncia: (dados: DadosDenuncia) =>
    requisicao<Denuncia>("/denuncias", corpo("POST", dados)),
  listarDenuncias: (usuarioId?: Identificador) =>
    requisicao<Denuncia[]>(`/denuncias${consulta({ usuarioId })}`),
  buscarDenuncia: (id: Identificador, usuarioId?: Identificador) =>
    requisicao<Denuncia>(`/denuncias/${id}${consulta({ usuarioId })}`),
  editarDenuncia: (id: Identificador, dados: DadosDenuncia) =>
    requisicao<Denuncia>(`/denuncias/${id}`, corpo("PUT", dados)),
  excluirDenuncia: (id: Identificador, usuarioId: Identificador) =>
    requisicao<void>(`/denuncias/${id}${consulta({ usuarioId })}`, {
      method: "DELETE",
    }),
  atualizarStatusDenuncia: (id: Identificador, dados: DadosStatusDenuncia) =>
    requisicao<Denuncia>(`/denuncias/${id}/status`, corpo("PATCH", dados)),

  // ---------------- administração ----------------
  enviarAviso: (dados: Record<string, unknown>) =>
    requisicao<unknown>("/admin/avisos", corpo("POST", dados)),
};
