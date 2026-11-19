// Função de requisição usada pelas APIs (Java, IA e Python).
// Erros da API voltam como JSON { status, erro, mensagem, campos }: a mensagem vira o texto do Error.

import { iniciarAcao } from "./feedbackBotoes";

type CampoInvalido = { campo?: string; mensagem?: string };

export function criarCliente(urlBase: string) {
  const base = urlBase.replace(/\/$/, "");

  return async function requisicao<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
    // feedback no botão que disparou a requisição (pulsa → ✓ ou ✕)
    const terminar = iniciarAcao();
    try {
      const resultado = await executar<T>(caminho, opcoes);
      terminar(true);
      return resultado;
    } catch (erro) {
      terminar(false);
      throw erro;
    }
  };

  async function executar<T>(caminho: string, opcoes: RequestInit): Promise<T> {
    const headers = new Headers(opcoes.headers);
    if (opcoes.body) headers.set("Content-Type", "application/json");

    let resposta: Response;
    try {
      resposta = await fetch(`${base}${caminho}`, { ...opcoes, headers });
    } catch {
      throw new Error("Não foi possível conectar com o servidor. Verifique se a API está no ar.");
    }

    if (!resposta.ok) {
      const texto = await resposta.text();
      let mensagem = texto;
      try {
        const dados = JSON.parse(texto) as { mensagem?: string; erro?: string; campos?: CampoInvalido[] };
        mensagem = dados.mensagem || dados.erro || texto;
        if (dados.campos?.length) {
          mensagem += " " + dados.campos.map((c) => `${c.campo}: ${c.mensagem}`).join(" · ");
        }
      } catch {
        // resposta não é JSON: mantém o texto
      }
      throw new Error(mensagem || `Erro na API: ${resposta.status}`);
    }
    if (resposta.status === 204) return undefined as T;
    return (await resposta.json()) as T;
  }
}

export const corpo = (metodo: string, dados: unknown): RequestInit => ({
  method: metodo,
  body: JSON.stringify(dados),
});

// Monta "?a=1&b=2" ignorando valores vazios
export function consulta(parametros: Record<string, string | number | boolean | undefined | null>) {
  const p = new URLSearchParams();
  Object.entries(parametros).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") p.set(chave, String(valor));
  });
  const texto = p.toString();
  return texto ? `?${texto}` : "";
}

// Endereço de cada API.
// - Em produção (Vercel), Java e IA passam pelo proxy definido no vercel.json ("/api" e "/ia"):
//   o navegador fala só com o próprio site, então não há problema de CORS.
// - No desenvolvimento (npm run dev), usa as variáveis do .env.
export const URL_API_JAVA = import.meta.env.PROD
  ? "/api"
  : import.meta.env.VITE_API_URL || "http://localhost:8080";

export const URL_API_IA = import.meta.env.PROD
  ? "/ia"
  : import.meta.env.VITE_API_IA_URL || "http://localhost:5000";

// A API Python (administração e denúncias) só é usada quando o endereço dela estiver configurado.
// Em produção, enquanto VITE_API_PYTHON_URL não estiver definida na Vercel, essas funções ficam desativadas.
export const URL_API_PYTHON =
  import.meta.env.VITE_API_PYTHON_URL || (import.meta.env.PROD ? "" : "http://localhost:5001");

export const API_PYTHON_DISPONIVEL = URL_API_PYTHON !== "";
